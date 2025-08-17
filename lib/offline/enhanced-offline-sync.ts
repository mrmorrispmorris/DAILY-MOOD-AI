'use client'

import { useState, useEffect } from 'react'
import { MoodEntry } from '@/types/database'
import { moodService } from '@/lib/supabase/mood-service'

// Enhanced Offline Sync Service for DailyMood AI
export class EnhancedOfflineSyncService {
  private static instance: EnhancedOfflineSyncService
  private syncQueue: Array<{
    id: string
    type: 'create' | 'update' | 'delete'
    data: any
    timestamp: number
    retryCount: number
  }> = []
  private isOnline: boolean = navigator.onLine
  private isSyncing: boolean = false
  private syncProgress: number = 0
  private syncInterval: NodeJS.Timeout | null = null
  private eventListeners: Map<string, Function[]> = new Map()

  private constructor() {
    this.initializeEventListeners()
    this.loadSyncQueue()
    this.startAutoSync()
  }

  static getInstance(): EnhancedOfflineSyncService {
    if (!EnhancedOfflineSyncService.instance) {
      EnhancedOfflineSyncService.instance = new EnhancedOfflineSyncService()
    }
    return EnhancedOfflineSyncService.instance
  }

  // Initialize event listeners for online/offline detection
  private initializeEventListeners(): void {
    window.addEventListener('online', () => {
      this.isOnline = true
      this.emit('online')
      this.syncOfflineData()
    })

    window.addEventListener('offline', () => {
      this.isOnline = false
      this.emit('offline')
    })

    // Listen for visibility changes to sync when tab becomes visible
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden && this.isOnline) {
        this.syncOfflineData()
      }
    })
  }

  // Event emitter for sync status updates
  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event) || []
    listeners.forEach(listener => listener(data))
  }

  // Add event listener
  on(event: string, callback: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, [])
    }
    this.eventListeners.get(event)!.push(callback)
  }

  // Remove event listener
  off(event: string, callback: Function): void {
    const listeners = this.eventListeners.get(event) || []
    const index = listeners.indexOf(callback)
    if (index > -1) {
      listeners.splice(index, 1)
    }
  }

  // Load sync queue from localStorage
  private loadSyncQueue(): void {
    try {
      const stored = localStorage.getItem('dailymood-sync-queue')
      if (stored) {
        this.syncQueue = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load sync queue:', error)
      this.syncQueue = []
    }
  }

  // Save sync queue to localStorage
  private saveSyncQueue(): void {
    try {
      localStorage.setItem('dailymood-sync-queue', JSON.stringify(this.syncQueue))
    } catch (error) {
      console.error('Failed to save sync queue:', error)
    }
  }

  // Start automatic sync process
  private startAutoSync(): void {
    // Sync every 30 seconds when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && this.syncQueue.length > 0) {
        this.syncOfflineData()
      }
    }, 30000)
  }

  // Add item to sync queue
  addToSyncQueue(type: 'create' | 'update' | 'delete', data: any): string {
    const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    
    const queueItem = {
      id,
      type,
      data,
      timestamp: Date.now(),
      retryCount: 0
    }

    this.syncQueue.push(queueItem)
    this.saveSyncQueue()
    
    // Emit event for UI updates
    this.emit('queueUpdated', { queueLength: this.syncQueue.length })
    
    // Try to sync immediately if online
    if (this.isOnline) {
      this.syncOfflineData()
    }

    return id
  }

  // Remove item from sync queue
  removeFromQueue(id: string): boolean {
    const index = this.syncQueue.findIndex(item => item.id === id)
    if (index > -1) {
      this.syncQueue.splice(index, 1)
      this.saveSyncQueue()
      this.emit('queueUpdated', { queueLength: this.syncQueue.length })
      return true
    }
    return false
  }

  // Get current sync queue
  getSyncQueue(): Array<typeof this.syncQueue[0]> {
    return [...this.syncQueue]
  }

  // Get sync status
  getSyncStatus(): {
    isOnline: boolean
    isSyncing: boolean
    queueLength: number
    progress: number
    lastSync: number | null
  } {
    return {
      isOnline: this.isOnline,
      isSyncing: this.isSyncing,
      queueLength: this.syncQueue.length,
      progress: this.syncProgress,
      lastSync: this.getLastSyncTime()
    }
  }

  // Get last sync time
  private getLastSyncTime(): number | null {
    try {
      const stored = localStorage.getItem('dailymood-last-sync')
      return stored ? parseInt(stored) : null
    } catch {
      return null
    }
  }

  // Set last sync time
  private setLastSyncTime(): void {
    try {
      localStorage.setItem('dailymood-last-sync', Date.now().toString())
    } catch (error) {
      console.error('Failed to save last sync time:', error)
    }
  }

  // Sync offline data with progress tracking
  async syncOfflineData(): Promise<boolean> {
    if (this.isSyncing || !this.isOnline || this.syncQueue.length === 0) {
      return false
    }

    this.isSyncing = true
    this.syncProgress = 0
    this.emit('syncStarted', { queueLength: this.syncQueue.length })

    try {
      const totalItems = this.syncQueue.length
      let successCount = 0
      let failedItems: typeof this.syncQueue = []

      // Process queue items
      for (let i = 0; i < this.syncQueue.length; i++) {
        const item = this.syncQueue[i]
        this.syncProgress = ((i + 1) / totalItems) * 100
        this.emit('syncProgress', { progress: this.syncProgress, current: i + 1, total: totalItems })

        try {
          const success = await this.processSyncItem(item)
          if (success) {
            successCount++
            this.removeFromQueue(item.id)
          } else {
            failedItems.push(item)
          }

          // Small delay to prevent overwhelming the server
          await new Promise(resolve => setTimeout(resolve, 100))
        } catch (error) {
          console.error(`Failed to process sync item ${item.id}:`, error)
          failedItems.push(item)
        }
      }

      // Update failed items with retry count
      failedItems.forEach(item => {
        item.retryCount++
        if (item.retryCount >= 3) {
          // Remove items that have failed too many times
          this.removeFromQueue(item.id)
          this.emit('syncItemFailed', { item, reason: 'Max retries exceeded' })
        }
      })

      // Update progress
      this.syncProgress = 100
      this.setLastSyncTime()
      
      this.emit('syncCompleted', { 
        successCount, 
        failedCount: failedItems.length,
        totalProcessed: totalItems 
      })

      return successCount > 0
    } catch (error) {
      console.error('Sync failed:', error)
      this.emit('syncError', { error })
      return false
    } finally {
      this.isSyncing = false
      this.emit('syncEnded')
    }
  }

  // Process individual sync item
  private async processSyncItem(item: typeof this.syncQueue[0]): Promise<boolean> {
    try {
      switch (item.type) {
        case 'create':
          const { data: createdEntry, error: createError } = await moodService.createMoodEntry(item.data)
          if (createError) throw new Error(createError)
          this.emit('syncItemSuccess', { item, result: createdEntry })
          return true

        case 'update':
          const { data: updatedEntry, error: updateError } = await moodService.updateMoodEntry(
            item.data.id, 
            item.data.updates
          )
          if (updateError) throw new Error(updateError)
          this.emit('syncItemSuccess', { item, result: updatedEntry })
          return true

        case 'delete':
          const { error: deleteError } = await moodService.deleteMoodEntry(item.data.id)
          if (deleteError) throw new Error(deleteError)
          this.emit('syncItemSuccess', { item })
          return true

        default:
          console.warn('Unknown sync item type:', item.type)
          return false
      }
    } catch (error) {
      console.error(`Failed to process ${item.type} sync item:`, error)
      return false
    }
  }

  // Force sync (manual trigger)
  async forceSync(): Promise<boolean> {
    return this.syncOfflineData()
  }

  // Clear sync queue
  clearSyncQueue(): void {
    this.syncQueue = []
    this.saveSyncQueue()
    this.emit('queueCleared')
  }

  // Get offline data summary
  getOfflineDataSummary(): {
    pendingSync: number
    lastSync: number | null
    isOnline: boolean
    estimatedSyncTime: number
  } {
    const lastSync = this.getLastSyncTime()
    const estimatedSyncTime = this.syncQueue.length * 0.2 // 200ms per item

    return {
      pendingSync: this.syncQueue.length,
      lastSync,
      isOnline: this.isOnline,
      estimatedSyncTime
    }
  }

  // Check if data is stale and needs refresh
  isDataStale(maxAgeMinutes: number = 30): boolean {
    const lastSync = this.getLastSyncTime()
    if (!lastSync) return true

    const ageMinutes = (Date.now() - lastSync) / (1000 * 60)
    return ageMinutes > maxAgeMinutes
  }

  // Cleanup method
  destroy(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval)
    }
    this.eventListeners.clear()
  }
}

// Export singleton instance
export const enhancedOfflineSyncService = EnhancedOfflineSyncService.getInstance()

// Hook for using offline sync service
export function useOfflineSync() {
  const [syncStatus, setSyncStatus] = useState(enhancedOfflineSyncService.getSyncStatus())
  const [queueLength, setQueueLength] = useState(enhancedOfflineSyncService.getSyncQueue().length)

  useEffect(() => {
    const updateStatus = () => setSyncStatus(enhancedOfflineSyncService.getSyncStatus())
    const updateQueue = () => setQueueLength(enhancedOfflineSyncService.getSyncQueue().length)

    enhancedOfflineSyncService.on('syncStarted', updateStatus)
    enhancedOfflineSyncService.on('syncProgress', updateStatus)
    enhancedOfflineSyncService.on('syncCompleted', updateStatus)
    enhancedOfflineSyncService.on('syncEnded', updateStatus)
    enhancedOfflineSyncService.on('queueUpdated', updateQueue)
    enhancedOfflineSyncService.on('online', updateStatus)
    enhancedOfflineSyncService.on('offline', updateStatus)

    return () => {
      enhancedOfflineSyncService.off('syncStarted', updateStatus)
      enhancedOfflineSyncService.off('syncProgress', updateStatus)
      enhancedOfflineSyncService.off('syncCompleted', updateStatus)
      enhancedOfflineSyncService.off('syncEnded', updateStatus)
      enhancedOfflineSyncService.off('queueUpdated', updateQueue)
      enhancedOfflineSyncService.off('online', updateStatus)
      enhancedOfflineSyncService.off('offline', updateStatus)
    }
  }, [])

  return {
    ...syncStatus,
    queueLength,
    forceSync: () => enhancedOfflineSyncService.forceSync(),
    clearQueue: () => enhancedOfflineSyncService.clearSyncQueue(),
    getSummary: () => enhancedOfflineSyncService.getOfflineDataSummary(),
    isDataStale: (maxAge?: number) => enhancedOfflineSyncService.isDataStale(maxAge)
  }
}
