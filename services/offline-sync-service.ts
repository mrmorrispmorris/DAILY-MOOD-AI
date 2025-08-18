'use client'

import { supabase } from '@/lib/supabase/client'

interface SyncItem {
  id: string
  type: 'mood' | 'goal' | 'tag' | 'habit'
  action: 'create' | 'update' | 'delete'
  data: any
  timestamp: number
  retryCount: number
  maxRetries: number
}

interface SyncStatus {
  isOnline: boolean
  isSyncing: boolean
  pendingItems: number
  lastSync: number | null
  syncProgress: number
  errors: string[]
}

class OfflineSyncService {
  private syncQueue: SyncItem[] = []
  private isOnline: boolean = navigator.onLine
  private isSyncing: boolean = false
  private syncInterval: NodeJS.Timeout | null = null
  private maxRetries: number = 3
  private syncDelay: number = 5000 // 5 seconds

  constructor() {
    this.initialize()
  }

  private initialize() {
    // Load existing sync queue from localStorage
    this.loadSyncQueue()
    
    // Set up online/offline detection
    window.addEventListener('online', this.handleOnline.bind(this))
    window.addEventListener('offline', this.handleOffline.bind(this))
    
    // Start sync interval
    this.startSyncInterval()
    
    // Initial sync if online
    if (this.isOnline) {
      this.sync()
    }
  }

  // Add item to sync queue
  async addToSyncQueue(type: SyncItem['type'], action: SyncItem['action'], data: any): Promise<string> {
    const syncItem: SyncItem = {
      id: this.generateId(),
      type,
      action,
      data,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: this.maxRetries
    }

    this.syncQueue.push(syncItem)
    this.saveSyncQueue()

    // Try to sync immediately if online
    if (this.isOnline && !this.isSyncing) {
      this.sync()
    }

    return syncItem.id
  }

  // Get sync status
  getSyncStatus(): SyncStatus {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      pendingItems: this.syncQueue.length,
      lastSync: this.getLastSyncTime(),
      syncProgress: this.calculateSyncProgress(),
      errors: this.getSyncErrors()
    }
  }

  // Force sync
  async forceSync(): Promise<boolean> {
    if (this.isSyncing) {
      return false
    }

    return this.sync()
  }

  // Main sync function
  private async sync(): Promise<boolean> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return false
    }

    this.isSyncing = true
    console.log('Starting offline sync...')

    try {
      const itemsToSync = [...this.syncQueue]
      let successCount = 0
      let errorCount = 0

      for (const item of itemsToSync) {
        try {
          const success = await this.processSyncItem(item)
          if (success) {
            // Remove from queue on success
            this.syncQueue = this.syncQueue.filter(q => q.id !== item.id)
            successCount++
          } else {
            // Increment retry count
            item.retryCount++
            if (item.retryCount >= item.maxRetries) {
              // Remove failed items after max retries
              this.syncQueue = this.syncQueue.filter(q => q.id !== item.id)
              errorCount++
            }
          }
        } catch (error) {
          console.error('Error processing sync item:', error)
          item.retryCount++
          if (item.retryCount >= item.maxRetries) {
            this.syncQueue = this.syncQueue.filter(q => q.id !== item.id)
            errorCount++
          }
        }
      }

      this.saveSyncQueue()
      this.updateLastSyncTime()

      console.log(`Sync completed: ${successCount} successful, ${errorCount} failed`)
      return successCount > 0

    } catch (error) {
      console.error('Sync failed:', error)
      return false
    } finally {
      this.isSyncing = false
    }
  }

  // Process individual sync item
  private async processSyncItem(item: SyncItem): Promise<boolean> {
    try {
      switch (item.type) {
        case 'mood':
          return await this.syncMoodItem(item)
        default:
          console.warn('Unknown sync item type:', item.type)
          return false
      }
    } catch (error) {
      console.error(`Error syncing ${item.type} item:`, error)
      return false
    }
  }

  // Sync mood items
  private async syncMoodItem(item: SyncItem): Promise<boolean> {
    try {
      switch (item.action) {
        case 'create':
          const { error: createError } = await supabase
            .from('mood_entries')
            .insert([item.data])
          return !createError

        case 'update':
          const { error: updateError } = await supabase
            .from('mood_entries')
            .update(item.data)
            .eq('id', item.data.id)
          return !updateError

        case 'delete':
          const { error: deleteError } = await supabase
            .from('mood_entries')
            .delete()
            .eq('id', item.data.id)
          return !deleteError

        default:
          return false
      }
    } catch (error) {
      console.error('Mood sync error:', error)
      return false
    }
  }

  // Handle online event
  private handleOnline() {
    this.isOnline = true
    console.log('Device is online, starting sync...')
    
    // Start sync after a short delay
    setTimeout(() => {
      this.sync()
    }, 1000)
  }

  // Handle offline event
  private handleOffline() {
    this.isOnline = false
    console.log('Device is offline, queuing operations...')
  }

  // Start sync interval
  private startSyncInterval() {
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0 && !this.isSyncing) {
        this.sync()
      }
    }, this.syncDelay)
  }

  // Stop sync interval
  private stopSyncInterval() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
      this.syncInterval = null
    }
  }

  // Load sync queue from localStorage
  private loadSyncQueue() {
    try {
      const saved = localStorage.getItem('dailymood-sync-queue')
      if (saved) {
        this.syncQueue = JSON.parse(saved)
        // Clean up old items (older than 7 days)
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
        this.syncQueue = this.syncQueue.filter(item => item.timestamp > weekAgo)
      }
    } catch (error) {
      console.error('Error loading sync queue:', error)
      this.syncQueue = []
    }
  }

  // Save sync queue to localStorage
  private saveSyncQueue() {
    try {
      localStorage.setItem('dailymood-sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Error saving sync queue:', error)
    }
  }

  // Update last sync time
  private updateLastSyncTime() {
    localStorage.setItem('dailymood-last-sync', Date.now().toString())
  }

  // Get last sync time
  private getLastSyncTime(): number | null {
    const saved = localStorage.getItem('dailymood-last-sync')
    return saved ? parseInt(saved) : null
  }

  // Calculate sync progress
  private calculateSyncProgress(): number {
    if (this.syncQueue.length === 0) return 100
    const processed = this.syncQueue.filter(item => item.retryCount >= item.maxRetries).length
    return Math.round((processed / this.syncQueue.length) * 100)
  }

  // Get sync errors
  private getSyncErrors(): string[] {
    return this.syncQueue
      .filter(item => item.retryCount >= item.maxRetries)
      .map(item => `Failed to sync ${item.type} ${item.action} after ${item.maxRetries} attempts`)
  }

  // Generate unique ID
  private generateId(): string {
    return `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Clean up
  destroy() {
    this.stopSyncInterval()
    window.removeEventListener('online', this.handleOnline.bind(this))
    window.removeEventListener('offline', this.handleOffline.bind(this))
  }

  // Get queue size
  getQueueSize(): number {
    return this.syncQueue.length
  }

  // Clear queue
  clearQueue(): void {
    this.syncQueue = []
    this.saveSyncQueue()
  }

  // Get pending items
  getPendingItems(): SyncItem[] {
    return [...this.syncQueue]
  }
}

// Create singleton instance
export const offlineSyncService = new OfflineSyncService()

export default offlineSyncService