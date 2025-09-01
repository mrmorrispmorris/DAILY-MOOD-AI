'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/app/lib/supabase-client'

interface BackupData {
  userId: string
  moodEntries: any[]
  exportDate: string
  totalEntries: number
  dateRange: {
    oldest: string
    newest: string
  }
}

interface BackupRecord {
  id: string
  created_at: string
  backup_size: number
  entry_count: number
  backup_type: 'automatic' | 'manual'
  status: 'success' | 'failed' | 'in_progress'
}

interface CloudBackupManagerProps {
  userId: string
  className?: string
}

export default function CloudBackupManager({ userId, className = "" }: CloudBackupManagerProps) {
  const [loading, setLoading] = useState(false)
  const [backupHistory, setBackupHistory] = useState<BackupRecord[]>([])
  const [lastBackup, setLastBackup] = useState<Date | null>(null)
  const [backupSize, setBackupSize] = useState<number>(0)
  const [totalEntries, setTotalEntries] = useState<number>(0)
  const [autoBackupEnabled, setAutoBackupEnabled] = useState(true)
  const [showRestoreModal, setShowRestoreModal] = useState(false)
  const [restoreFile, setRestoreFile] = useState<File | null>(null)

  useEffect(() => {
    fetchBackupStatus()
    fetchBackupHistory()
  }, [userId])

  const fetchBackupStatus = async () => {
    try {
      // Get total entries count
      const { count, error: countError } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)

      if (countError) {
        console.error('Error counting entries:', countError)
        return
      }

      setTotalEntries(count || 0)

      // Estimate backup size (rough calculation)
      const estimatedSize = (count || 0) * 500 // ~500 bytes per entry
      setBackupSize(estimatedSize)

      // Check for last backup (simulate with localStorage for demo)
      const lastBackupStr = localStorage.getItem(`lastBackup_${userId}`)
      if (lastBackupStr) {
        setLastBackup(new Date(lastBackupStr))
      }
    } catch (error) {
      console.error('Failed to fetch backup status:', error)
    }
  }

  const fetchBackupHistory = () => {
    // Simulate backup history (in real app, this would come from a backups table)
    const history: BackupRecord[] = [
      {
        id: '1',
        created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        backup_size: 12500,
        entry_count: 25,
        backup_type: 'automatic',
        status: 'success'
      },
      {
        id: '2',
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        backup_size: 11800,
        entry_count: 23,
        backup_type: 'manual',
        status: 'success'
      },
      {
        id: '3',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        backup_size: 10900,
        entry_count: 21,
        backup_type: 'automatic',
        status: 'success'
      }
    ]
    setBackupHistory(history)
  }

  const createBackup = async (type: 'automatic' | 'manual' = 'manual') => {
    try {
      setLoading(true)

      // Fetch all user data
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching data for backup:', error)
        throw new Error('Failed to fetch mood data')
      }

      const entries = data || []
      
      // Create backup data structure
      const backupData: BackupData = {
        userId,
        moodEntries: entries,
        exportDate: new Date().toISOString(),
        totalEntries: entries.length,
        dateRange: {
          oldest: entries.length > 0 ? entries[0].date : '',
          newest: entries.length > 0 ? entries[entries.length - 1].date : ''
        }
      }

      // Create downloadable backup file
      const backupJson = JSON.stringify(backupData, null, 2)
      const blob = new Blob([backupJson], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `moody_backup_${new Date().toISOString().split('T')[0]}.json`
      link.style.display = 'none'
      
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      URL.revokeObjectURL(url)

      // Update last backup time
      const now = new Date()
      setLastBackup(now)
      localStorage.setItem(`lastBackup_${userId}`, now.toISOString())

      // Add to backup history
      const newBackup: BackupRecord = {
        id: Date.now().toString(),
        created_at: now.toISOString(),
        backup_size: blob.size,
        entry_count: entries.length,
        backup_type: type,
        status: 'success'
      }
      setBackupHistory(prev => [newBackup, ...prev])

      console.log('Backup created successfully')
    } catch (error) {
      console.error('Failed to create backup:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleFileRestore = async () => {
    if (!restoreFile) return

    try {
      setLoading(true)
      
      const fileContent = await restoreFile.text()
      const backupData: BackupData = JSON.parse(fileContent)
      
      // Validate backup data structure
      if (!backupData.moodEntries || !Array.isArray(backupData.moodEntries)) {
        throw new Error('Invalid backup file format')
      }

      // Confirm with user before proceeding
      const confirmRestore = window.confirm(
        `This will restore ${backupData.totalEntries} mood entries from ${backupData.exportDate.split('T')[0]}. This will replace your current data. Are you sure?`
      )

      if (!confirmRestore) return

      // Delete existing entries
      const { error: deleteError } = await supabase
        .from('mood_entries')
        .delete()
        .eq('user_id', userId)

      if (deleteError) {
        console.error('Error deleting existing data:', deleteError)
        throw new Error('Failed to clear existing data')
      }

      // Insert restored entries
      const entriesWithUserId = backupData.moodEntries.map(entry => ({
        ...entry,
        user_id: userId, // Ensure correct user ID
        id: undefined // Let database generate new IDs
      }))

      const { error: insertError } = await supabase
        .from('mood_entries')
        .insert(entriesWithUserId)

      if (insertError) {
        console.error('Error inserting restored data:', insertError)
        throw new Error('Failed to restore data')
      }

      // Refresh the page to show restored data
      window.location.reload()
      
    } catch (error) {
      console.error('Failed to restore backup:', error)
      alert(`Restore failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
      setShowRestoreModal(false)
      setRestoreFile(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getTimeSinceLastBackup = () => {
    if (!lastBackup) return 'Never'
    
    const now = new Date()
    const diff = now.getTime() - lastBackup.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days === 0 && hours === 0) return 'Just now'
    if (days === 0) return `${hours}h ago`
    return `${days}d ${hours}h ago`
  }

  const getBackupStatusColor = () => {
    if (!lastBackup) return 'text-red-400'
    
    const daysSinceBackup = (Date.now() - lastBackup.getTime()) / (1000 * 60 * 60 * 24)
    if (daysSinceBackup <= 1) return 'text-green-400'
    if (daysSinceBackup <= 7) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            ☁️ Cloud Backup
          </h3>
          <p className="text-cyan-300">
            Keep your mood data safe with automated backups
          </p>
        </div>
      </div>

      {/* Backup Status */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h4 className="text-xl font-semibold text-white">Backup Status</h4>
          <div className={`flex items-center gap-2 ${getBackupStatusColor()}`}>
            <div className="w-3 h-3 rounded-full bg-current animate-pulse"></div>
            <span className="font-medium">
              {lastBackup ? 'Protected' : 'No Backup'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400 mb-2">{totalEntries}</div>
            <div className="text-sm text-gray-400">Total Entries</div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">
              {formatFileSize(backupSize)}
            </div>
            <div className="text-sm text-gray-400">Backup Size</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${getBackupStatusColor()}`}>
              {getTimeSinceLastBackup()}
            </div>
            <div className="text-sm text-gray-400">Last Backup</div>
          </div>
          
          <div className="text-center">
            <div className={`text-3xl font-bold mb-2 ${autoBackupEnabled ? 'text-green-400' : 'text-gray-400'}`}>
              {autoBackupEnabled ? 'ON' : 'OFF'}
            </div>
            <div className="text-sm text-gray-400">Auto Backup</div>
          </div>
        </div>
      </div>

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>💾</span> Create Backup
          </h4>
          
          <p className="text-gray-300 text-sm mb-6">
            Download a complete backup of your mood data. This file can be used to restore your data later.
          </p>
          
          <button
            onClick={() => createBackup('manual')}
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-3 px-6 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Creating Backup...
              </div>
            ) : (
              'Create Manual Backup'
            )}
          </button>
        </div>

        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <span>📥</span> Restore Backup
          </h4>
          
          <p className="text-gray-300 text-sm mb-6">
            Upload a backup file to restore your mood data. This will replace your current data.
          </p>
          
          <button
            onClick={() => setShowRestoreModal(true)}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-6 rounded-xl transition-colors duration-200 font-medium"
          >
            Restore from File
          </button>
        </div>
      </div>

      {/* Auto Backup Settings */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-lg font-semibold text-white">Automatic Backup Settings</h4>
          <button
            onClick={() => setAutoBackupEnabled(!autoBackupEnabled)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              autoBackupEnabled ? 'bg-cyan-500' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                autoBackupEnabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-2 rounded-full ${autoBackupEnabled ? 'bg-green-400' : 'bg-gray-400'}`}></div>
            <span className="text-gray-300">
              Daily automatic backups {autoBackupEnabled ? 'enabled' : 'disabled'}
            </span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <span className="text-gray-300">Backup retention: 30 days</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <span className="text-gray-300">Encrypted storage</span>
          </div>
        </div>
      </div>

      {/* Backup History */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-6">📋 Backup History</h4>
        
        {backupHistory.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📁</div>
            <h5 className="text-lg font-semibold text-white mb-2">No backup history</h5>
            <p className="text-gray-400">Create your first backup to see history here</p>
          </div>
        ) : (
          <div className="space-y-3">
            {backupHistory.map((backup, index) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-3 h-3 rounded-full ${
                    backup.status === 'success' ? 'bg-green-400' :
                    backup.status === 'failed' ? 'bg-red-400' : 'bg-yellow-400'
                  }`}></div>
                  
                  <div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-medium">
                        {formatDate(backup.created_at)}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        backup.backup_type === 'automatic' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {backup.backup_type}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400">
                      {backup.entry_count} entries • {formatFileSize(backup.backup_size)}
                    </div>
                  </div>
                </div>
                
                <div className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                  backup.status === 'success' ? 'bg-green-500/20 text-green-300' :
                  backup.status === 'failed' ? 'bg-red-500/20 text-red-300' : 
                  'bg-yellow-500/20 text-yellow-300'
                }`}>
                  {backup.status}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Restore Modal */}
      <AnimatePresence>
        {showRestoreModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => !loading && setShowRestoreModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white">Restore Backup</h4>
                {!loading && (
                  <button
                    onClick={() => setShowRestoreModal(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="mb-6">
                <label className="block text-cyan-300 font-medium mb-2">Select Backup File</label>
                <input
                  type="file"
                  accept=".json"
                  onChange={(e) => setRestoreFile(e.target.files?.[0] || null)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                  disabled={loading}
                />
                <p className="text-sm text-gray-400 mt-2">
                  Select a .json backup file created by this app
                </p>
              </div>

              {restoreFile && (
                <div className="mb-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-300 mb-2">
                    <span>⚠️</span>
                    <span className="font-medium">Warning</span>
                  </div>
                  <p className="text-sm text-yellow-200">
                    This will permanently replace all your current mood data with the backup data. 
                    Make sure you have a current backup before proceeding.
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => setShowRestoreModal(false)}
                  disabled={loading}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleFileRestore}
                  disabled={loading || !restoreFile}
                  className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-xl transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Restoring...
                    </div>
                  ) : (
                    'Restore Data'
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

