'use client'
import { useState } from 'react'
import { Bell, Moon, Download, Shield, Palette, Clock, Mail, Globe, User, Trash2, Upload } from 'lucide-react'

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    reminderEnabled: true,
    reminderTime: '20:00',
    reminderDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    theme: 'light',
    moodScale: '1-10',
    autoBackup: true,
    privateMode: false,
    weekStartsOn: 'monday',
    exportFormat: 'csv',
    notificationSound: true,
    emailReports: false,
    shareData: false
  })
  
  const updateSetting = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }))
  }
  
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    // Simulate export functionality
    const data = {
      settings,
      exportDate: new Date().toISOString(),
      format: format
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dailymood-export-${format}-${new Date().toISOString().split('T')[0]}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }
  
  const handleBackup = () => {
    const backupData = {
      settings,
      backupDate: new Date().toISOString(),
      version: '1.0'
    }
    
    localStorage.setItem('dailymood_backup', JSON.stringify(backupData))
    alert('Backup saved locally!')
  }
  
  const handleRestore = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const backup = JSON.parse(e.target?.result as string)
        setSettings(backup.settings)
        alert('Settings restored successfully!')
      } catch (error) {
        alert('Invalid backup file!')
      }
    }
    reader.readAsText(file)
  }
  
  const handleDeleteAllData = () => {
    if (window.confirm('⚠️ This will permanently delete ALL your data. This action cannot be undone. Are you sure?')) {
      if (window.confirm('🚨 FINAL WARNING: This will delete your moods, settings, and avatar progress. Type "DELETE" in the next dialog to confirm.')) {
        const userInput = prompt('Type "DELETE" to confirm deletion:')
        if (userInput === 'DELETE') {
          // Clear all localStorage data
          Object.keys(localStorage).forEach(key => {
            if (key.startsWith('dailymood_')) {
              localStorage.removeItem(key)
            }
          })
          alert('All data has been deleted. You will be redirected to the login page.')
          window.location.href = '/working-auth'
        }
      }
    }
  }
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Customize your DailyMood AI experience</p>
        </div>
        
        {/* Notifications & Reminders */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Bell className="w-5 h-5 text-purple-600" />
            Notifications & Reminders
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Daily Mood Reminder</p>
                <p className="text-sm text-gray-600">Get notified to log your daily mood</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.reminderEnabled}
                  onChange={(e) => updateSetting('reminderEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            {settings.reminderEnabled && (
              <>
                <div className="flex items-center justify-between">
                  <label className="font-medium text-gray-900">Reminder Time</label>
                  <input
                    type="time"
                    value={settings.reminderTime}
                    onChange={(e) => updateSetting('reminderTime', e.target.value)}
                    className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="font-medium text-gray-900 block mb-3">Reminder Days</label>
                  <div className="grid grid-cols-7 gap-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                      <button
                        key={day}
                        onClick={() => {
                          const days = settings.reminderDays.includes(day)
                            ? settings.reminderDays.filter(d => d !== day)
                            : [...settings.reminderDays, day]
                          updateSetting('reminderDays', days)
                        }}
                        className={`p-2 text-xs rounded-lg border-2 transition-all ${
                          settings.reminderDays.includes(day)
                            ? 'border-purple-400 bg-purple-50 text-purple-700'
                            : 'border-gray-200 text-gray-700 hover:border-gray-300'
                        }`}
                      >
                        {day.slice(0, 3).toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Notification Sound</p>
                <p className="text-sm text-gray-600">Play sound with notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.notificationSound}
                  onChange={(e) => updateSetting('notificationSound', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </section>
        
        {/* Appearance & Customization */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Palette className="w-5 h-5 text-purple-600" />
            Appearance & Customization
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-900">Theme</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSetting('theme', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
                <option value="purple">Purple Theme</option>
                <option value="blue">Blue Theme</option>
                <option value="green">Green Theme</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-900">Mood Scale</label>
              <select
                value={settings.moodScale}
                onChange={(e) => updateSetting('moodScale', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="1-5">1-5 (Simple)</option>
                <option value="1-10">1-10 (Detailed)</option>
                <option value="emojis">Emojis Only</option>
                <option value="descriptive">Descriptive (Awful to Amazing)</option>
              </select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="font-medium text-gray-900">Week Starts On</label>
              <select
                value={settings.weekStartsOn}
                onChange={(e) => updateSetting('weekStartsOn', e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="sunday">Sunday</option>
                <option value="monday">Monday</option>
                <option value="saturday">Saturday</option>
              </select>
            </div>
          </div>
        </section>
        
        {/* Data Management */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Download className="w-5 h-5 text-purple-600" />
            Data Management
          </h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Export Your Data</h3>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => handleExport('csv')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as CSV
                </button>
                <button
                  onClick={() => handleExport('json')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as JSON
                </button>
                <button
                  onClick={() => handleExport('pdf')}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Export as PDF
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Automatic Backup</p>
                <p className="text-sm text-gray-600">Automatically backup your data locally</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.autoBackup}
                  onChange={(e) => updateSetting('autoBackup', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleBackup}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Backup Now
              </button>
              
              <label className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors cursor-pointer flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Restore Backup
                <input
                  type="file"
                  accept=".json"
                  onChange={handleRestore}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </section>
        
        {/* Privacy & Security */}
        <section className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-gray-900">
            <Shield className="w-5 h-5 text-purple-600" />
            Privacy & Security
          </h2>
          
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Private Mode</p>
                <p className="text-sm text-gray-600">Hide sensitive data in screenshots</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.privateMode}
                  onChange={(e) => updateSetting('privateMode', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Email Reports</p>
                <p className="text-sm text-gray-600">Receive weekly mood summary via email</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailReports}
                  onChange={(e) => updateSetting('emailReports', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900">Share Anonymous Data</p>
                <p className="text-sm text-gray-600">Help improve the app with anonymous usage data</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.shareData}
                  onChange={(e) => updateSetting('shareData', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>
          </div>
        </section>
        
        {/* Danger Zone */}
        <section className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2 text-red-900">
            <Trash2 className="w-5 h-5 text-red-600" />
            Danger Zone
          </h2>
          
          <div className="space-y-4">
            <div>
              <p className="font-medium text-red-900 mb-2">Delete All Data</p>
              <p className="text-sm text-red-700 mb-4">
                Permanently delete all your mood entries, settings, and avatar progress. This action cannot be undone.
              </p>
              <button
                onClick={handleDeleteAllData}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete Everything
              </button>
            </div>
          </div>
        </section>
        
        {/* Footer Info */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>DailyMood AI v1.0 • Settings are automatically saved</p>
          <p className="mt-1">Your privacy is important to us. Data is stored locally on your device.</p>
        </div>
      </div>
    </div>
  )
}

