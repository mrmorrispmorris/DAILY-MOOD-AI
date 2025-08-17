'use client'

export interface OfflineMoodEntry {
  id: string
  date: string
  mood_score: number
  emoji: string
  notes: string
  tags: string[]
  sleep_hours?: number
  timestamp: number
  syncStatus: 'pending' | 'syncing' | 'synced' | 'failed'
  retryCount: number
  lastSyncAttempt?: number
  conflicts?: string[]
}

export interface SyncProgress {
  total: number
  completed: number
  failed: number
  inProgress: boolean
  currentOperation?: string
  estimatedTime?: number
}

export interface OfflineConfig {
  maxRetries: number
  retryDelay: number
  maxConflictRetries: number
  autoSyncInterval: number
  maxOfflineDays: number
}

export class RobustOfflineStorage {
  private static STORAGE_KEY = 'dailymood_offline_entries'
  private static CONFIG_KEY = 'dailymood_offline_config'
  private static SYNC_PROGRESS_KEY = 'dailymood_sync_progress'
  
  private static defaultConfig: OfflineConfig = {
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds
    maxConflictRetries: 2,
    autoSyncInterval: 30000, // 30 seconds
    maxOfflineDays: 30
  }

  private static config: OfflineConfig
  private static syncProgress: SyncProgress
  private static autoSyncInterval: NodeJS.Timeout | null = null

  static initialize(): void {
    // Load configuration
    const savedConfig = localStorage.getItem(this.CONFIG_KEY)
    this.config = savedConfig ? { ...this.defaultConfig, ...JSON.parse(savedConfig) } : this.defaultConfig

    // Load sync progress
    const savedProgress = localStorage.getItem(this.SYNC_PROGRESS_KEY)
    this.syncProgress = savedProgress ? JSON.parse(savedProgress) : {
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: false
    }

    // Start auto-sync if online
    if (navigator.onLine) {
      this.startAutoSync()
    }

    // Listen for online/offline events
    window.addEventListener('online', () => this.startAutoSync())
    window.addEventListener('offline', () => this.stopAutoSync())
  }

  static saveEntry(entry: Omit<OfflineMoodEntry, 'id' | 'timestamp' | 'syncStatus' | 'retryCount'>): string {
    const offlineEntry: OfflineMoodEntry = {
      ...entry,
      id: `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      syncStatus: 'pending',
      retryCount: 0
    }

    const entries = this.getEntries()
    entries.push(offlineEntry)
    this.saveEntries(entries)

    // Try to sync immediately if online
    if (navigator.onLine) {
      this.syncEntry(offlineEntry.id)
    }

    return offlineEntry.id
  }

  static getEntries(): OfflineMoodEntry[] {
    if (typeof window === 'undefined') return []

    const stored = localStorage.getItem(this.STORAGE_KEY)
    if (!stored) return []

    const entries: OfflineMoodEntry[] = JSON.parse(stored)
    
    // Clean up old entries beyond maxOfflineDays
    const cutoffTime = Date.now() - (this.config.maxOfflineDays * 24 * 60 * 60 * 1000)
    const filteredEntries = entries.filter(entry => entry.timestamp > cutoffTime)
    
    if (filteredEntries.length !== entries.length) {
      this.saveEntries(filteredEntries)
    }

    return filteredEntries
  }

  static getEntry(id: string): OfflineMoodEntry | undefined {
    const entries = this.getEntries()
    return entries.find(entry => entry.id === id)
  }

  static updateEntry(id: string, updates: Partial<OfflineMoodEntry>): boolean {
    const entries = this.getEntries()
    const index = entries.findIndex(entry => entry.id === id)
    
    if (index === -1) return false

    entries[index] = { ...entries[index], ...updates, syncStatus: 'pending' }
    this.saveEntries(entries)

    // Try to sync if online
    if (navigator.onLine) {
      this.syncEntry(id)
    }

    return true
  }

  static deleteEntry(id: string): boolean {
    const entries = this.getEntries()
    const filteredEntries = entries.filter(entry => entry.id !== id)
    
    if (filteredEntries.length === entries.length) return false

    this.saveEntries(filteredEntries)
    return true
  }

  static hasEntries(): boolean {
    return this.getEntries().length > 0
  }

  static getPendingEntries(): OfflineMoodEntry[] {
    return this.getEntries().filter(entry => entry.syncStatus === 'pending')
  }

  static getFailedEntries(): OfflineMoodEntry[] {
    return this.getEntries().filter(entry => entry.syncStatus === 'failed')
  }

  static getSyncProgress(): SyncProgress {
    return { ...this.syncProgress }
  }

  static async syncAll(): Promise<SyncProgress> {
    if (!navigator.onLine) {
      throw new Error('Cannot sync while offline')
    }

    const pendingEntries = this.getPendingEntries()
    if (pendingEntries.length === 0) {
      return this.syncProgress
    }

    this.syncProgress = {
      total: pendingEntries.length,
      completed: 0,
      failed: 0,
      inProgress: true,
      currentOperation: 'Starting sync...'
    }
    this.saveSyncProgress()

    for (const entry of pendingEntries) {
      try {
        this.syncProgress.currentOperation = `Syncing entry from ${new Date(entry.date).toLocaleDateString()}`
        this.saveSyncProgress()

        await this.syncEntry(entry.id)
        this.syncProgress.completed++
      } catch (error) {
        console.error(`Failed to sync entry ${entry.id}:`, error)
        this.syncProgress.failed++
        
        // Mark entry as failed
        this.updateEntry(entry.id, { 
          syncStatus: 'failed',
          retryCount: entry.retryCount + 1
        })
      }

      this.saveSyncProgress()
      
      // Add delay between syncs to avoid overwhelming the server
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    this.syncProgress.inProgress = false
    this.syncProgress.currentOperation = 'Sync completed'
    this.saveSyncProgress()

    return this.syncProgress
  }

  static async syncEntry(id: string): Promise<boolean> {
    const entry = this.getEntry(id)
    if (!entry) return false

    if (entry.syncStatus === 'synced') return true
    if (entry.retryCount >= this.config.maxRetries) {
      this.updateEntry(id, { syncStatus: 'failed' })
      return false
    }

    try {
      this.updateEntry(id, { syncStatus: 'syncing' })

      // Simulate API call - replace with actual API integration
      await this.simulateApiCall(entry)

      // Mark as synced and remove from offline storage
      this.removeEntry(id)
      return true
    } catch (error) {
      console.error(`Sync failed for entry ${id}:`, error)
      
      // Increment retry count and mark as failed if max retries reached
      if (entry.retryCount >= this.config.maxRetries - 1) {
        this.updateEntry(id, { 
          syncStatus: 'failed',
          retryCount: entry.retryCount + 1
        })
      } else {
        // Schedule retry
        setTimeout(() => {
          if (navigator.onLine) {
            this.syncEntry(id)
          }
        }, this.config.retryDelay)
      }

      return false
    }
  }

  static async resolveConflict(entryId: string, resolution: 'local' | 'remote' | 'merge'): Promise<boolean> {
    const entry = this.getEntry(entryId)
    if (!entry) return false

    try {
      switch (resolution) {
        case 'local':
          // Keep local version and retry sync
          this.updateEntry(entryId, { 
            syncStatus: 'pending',
            retryCount: 0,
            conflicts: undefined
          })
          break
        case 'remote':
          // Remove local version (assume remote is correct)
          this.removeEntry(entryId)
          break
        case 'merge':
          // Merge logic would go here - for now, just retry
          this.updateEntry(entryId, { 
            syncStatus: 'pending',
            retryCount: 0,
            conflicts: undefined
          })
          break
      }

      return true
    } catch (error) {
      console.error('Failed to resolve conflict:', error)
      return false
    }
  }

  static startAutoSync(): void {
    if (this.autoSyncInterval) return

    this.autoSyncInterval = setInterval(async () => {
      if (navigator.onLine && this.hasPendingEntries()) {
        try {
          await this.syncAll()
        } catch (error) {
          console.error('Auto-sync failed:', error)
        }
      }
    }, this.config.autoSyncInterval)
  }

  static stopAutoSync(): void {
    if (this.autoSyncInterval) {
      clearInterval(this.autoSyncInterval)
      this.autoSyncInterval = null
    }
  }

  static updateConfig(newConfig: Partial<OfflineConfig>): void {
    this.config = { ...this.config, ...newConfig }
    localStorage.setItem(this.CONFIG_KEY, JSON.stringify(this.config))
  }

  static getConfig(): OfflineConfig {
    return { ...this.config }
  }

  static clearAll(): void {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.CONFIG_KEY)
    localStorage.removeItem(this.SYNC_PROGRESS_KEY)
    this.stopAutoSync()
  }

  static getStorageStats(): {
    totalEntries: number
    pendingEntries: number
    failedEntries: number
    syncedEntries: number
    storageSize: number
    lastSync: number
  } {
    const entries = this.getEntries()
    const pending = entries.filter(e => e.syncStatus === 'pending').length
    const failed = entries.filter(e => e.syncStatus === 'failed').length
    const synced = entries.filter(e => e.syncStatus === 'synced').length
    
    const storageSize = new Blob([JSON.stringify(entries)]).size
    
    return {
      totalEntries: entries.length,
      pendingEntries: pending,
      failedEntries: failed,
      syncedEntries: synced,
      storageSize,
      lastSync: this.syncProgress.completed > 0 ? Date.now() : 0
    }
  }

  private static saveEntries(entries: OfflineMoodEntry[]): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(entries))
  }

  private static removeEntry(id: string): void {
    const entries = this.getEntries()
    const filteredEntries = entries.filter(entry => entry.id !== id)
    this.saveEntries(filteredEntries)
  }

  private static saveSyncProgress(): void {
    if (typeof window === 'undefined') return
    localStorage.setItem(this.SYNC_PROGRESS_KEY, JSON.stringify(this.syncProgress))
  }

  private static hasPendingEntries(): boolean {
    return this.getPendingEntries().length > 0
  }

  // Simulate API call - replace with actual API integration
  private static async simulateApiCall(entry: OfflineMoodEntry): Promise<void> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000))
    
    // Simulate occasional failures
    if (Math.random() < 0.1) {
      throw new Error('Simulated API failure')
    }
  }
}

// Initialize when module loads
if (typeof window !== 'undefined') {
  RobustOfflineStorage.initialize()
}




