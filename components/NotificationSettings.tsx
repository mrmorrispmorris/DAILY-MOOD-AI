'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { 
  Bell, Clock, Smartphone, Mail, Calendar, 
  CheckCircle, AlertCircle, Settings, Zap 
} from 'lucide-react'

interface NotificationSettings {
  dailyReminder: boolean
  reminderTime: string
  pushEnabled: boolean
  emailEnabled: boolean
  weeklyReport: boolean
  achievementNotifications: boolean
  moodStreakReminders: boolean
  lowMoodSupport: boolean
  customReminders: Array<{
    id: string
    time: string
    message: string
    days: string[]
    enabled: boolean
  }>
}

export default function NotificationSettings({ userId }: { userId: string }) {
  const [settings, setSettings] = useState<NotificationSettings>({
    dailyReminder: true,
    reminderTime: '20:00',
    pushEnabled: false,
    emailEnabled: true,
    weeklyReport: true,
    achievementNotifications: true,
    moodStreakReminders: true,
    lowMoodSupport: true,
    customReminders: []
  })
  const [saving, setSaving] = useState(false)
  const [pushSupported, setPushSupported] = useState(false)
  const [pushPermission, setPushPermission] = useState<NotificationPermission>('default')


  useEffect(() => {
    loadSettings()
    checkPushSupport()
  }, [userId])

  const checkPushSupport = () => {
    if ('Notification' in window && 'serviceWorker' in navigator) {
      setPushSupported(true)
      setPushPermission(Notification.permission)
    }
  }

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('notification_settings')
        .eq('user_id', userId)
        .single()

      if (data?.notification_settings) {
        setSettings({ ...settings, ...data.notification_settings })
      }
    } catch (error) {
      console.log('No existing settings found, using defaults')
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    try {
      // Save to database
      await supabase
        .from('user_preferences')
        .upsert({
          user_id: userId,
          notification_settings: settings,
          updated_at: new Date().toISOString()
        })

      // Handle push notification permissions
      if (settings.pushEnabled && pushPermission !== 'granted') {
        await requestPushPermission()
      }

      // Schedule daily notifications
      if (settings.dailyReminder && settings.pushEnabled) {
        scheduleDailyNotification()
      }

      alert('Notification settings saved successfully!')
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Error saving settings. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const requestPushPermission = async () => {
    if (!pushSupported) return

    try {
      const permission = await Notification.requestPermission()
      setPushPermission(permission)

      if (permission === 'granted') {
        // Create test notification
        new Notification('DailyMood AI', {
          body: 'Notifications are now enabled! 🎉',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'test-notification'
        })
      }
    } catch (error) {
      console.error('Error requesting push permission:', error)
    }
  }

  const scheduleDailyNotification = () => {
    if (!settings.dailyReminder || !settings.pushEnabled || pushPermission !== 'granted') {
      return
    }

    const [hours, minutes] = settings.reminderTime.split(':')
    const now = new Date()
    const scheduledTime = new Date()
    scheduledTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    // If time has passed today, schedule for tomorrow
    if (scheduledTime <= now) {
      scheduledTime.setDate(scheduledTime.getDate() + 1)
    }

    const timeUntilNotification = scheduledTime.getTime() - now.getTime()

    setTimeout(() => {
      if (Notification.permission === 'granted') {
        new Notification('DailyMood AI Reminder', {
          body: 'How are you feeling today? Take a moment to log your mood! 😊',
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'daily-reminder',
          requireInteraction: true
          // Note: actions property not supported in current NotificationOptions type
        })
      }
      
      // Reschedule for next day
      scheduleDailyNotification()
    }, timeUntilNotification)
  }

  const addCustomReminder = () => {
    const newReminder = {
      id: Date.now().toString(),
      time: '12:00',
      message: 'Check in with your mood',
      days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      enabled: true
    }
    setSettings({
      ...settings,
      customReminders: [...settings.customReminders, newReminder]
    })
  }

  const updateCustomReminder = (id: string, updates: any) => {
    setSettings({
      ...settings,
      customReminders: settings.customReminders.map(reminder =>
        reminder.id === id ? { ...reminder, ...updates } : reminder
      )
    })
  }

  const removeCustomReminder = (id: string) => {
    setSettings({
      ...settings,
      customReminders: settings.customReminders.filter(r => r.id !== id)
    })
  }

  const getPushStatusColor = () => {
    switch (pushPermission) {
      case 'granted': return 'text-green-600 bg-green-50 border-green-200'
      case 'denied': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getPushStatusIcon = () => {
    switch (pushPermission) {
      case 'granted': return <CheckCircle className="w-4 h-4" />
      case 'denied': return <AlertCircle className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Bell className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Notification Settings</h3>
        <span className="ml-auto bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
          Smart Reminders
        </span>
      </div>

      {/* Push Notification Status */}
      {pushSupported && (
        <div className={`p-4 rounded-lg border mb-6 ${getPushStatusColor()}`}>
          <div className="flex items-center gap-2 mb-2">
            {getPushStatusIcon()}
            <span className="font-medium">
              Push Notifications: {pushPermission === 'granted' ? 'Enabled' : 
                                  pushPermission === 'denied' ? 'Blocked' : 'Not Set'}
            </span>
          </div>
          <p className="text-sm opacity-75">
            {pushPermission === 'granted' 
              ? 'You\'ll receive gentle reminders and achievement notifications'
              : pushPermission === 'denied'
              ? 'Notifications are blocked. Enable them in your browser settings to receive reminders.'
              : 'Enable notifications to receive gentle mood tracking reminders'
            }
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Daily Reminder */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-blue-600" />
            <div>
              <p className="font-medium">Daily Mood Reminder</p>
              <p className="text-sm text-gray-600">Gentle daily prompt to log your mood</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.dailyReminder}
              onChange={(e) => setSettings({...settings, dailyReminder: e.target.checked})}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>

        {/* Reminder Time */}
        {settings.dailyReminder && (
          <div className="ml-8 p-3 bg-purple-50 rounded-lg">
            <label className="block text-sm font-medium text-purple-800 mb-2">
              Reminder Time
            </label>
            <input
              type="time"
              value={settings.reminderTime}
              onChange={(e) => setSettings({...settings, reminderTime: e.target.value})}
              className="px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500 bg-white"
            />
          </div>
        )}

        {/* Push Notifications Toggle */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-3">
            <Smartphone className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium">Push Notifications</p>
              <p className="text-sm text-gray-600">Browser notifications for reminders</p>
            </div>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.pushEnabled}
              onChange={(e) => setSettings({...settings, pushEnabled: e.target.checked})}
              className="sr-only peer"
              disabled={!pushSupported}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-600 disabled:opacity-50"></div>
          </label>
        </div>

        {/* Advanced Notification Settings */}
        <div className="border-t pt-6">
          <h4 className="text-md font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Advanced Settings
          </h4>
          
          <div className="space-y-4">
            {/* Achievement Notifications */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                <div>
                  <p className="text-sm font-medium">Achievement Notifications</p>
                  <p className="text-xs text-gray-600">Celebrate streaks and milestones</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.achievementNotifications}
                  onChange={(e) => setSettings({...settings, achievementNotifications: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-yellow-600"></div>
              </label>
            </div>

            {/* Mood Streak Reminders */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-purple-600" />
                <div>
                  <p className="text-sm font-medium">Streak Reminders</p>
                  <p className="text-xs text-gray-600">Don't break your logging streak</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.moodStreakReminders}
                  onChange={(e) => setSettings({...settings, moodStreakReminders: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Weekly Report */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Weekly Report</p>
                  <p className="text-xs text-gray-600">Summary of your week via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.weeklyReport}
                  onChange={(e) => setSettings({...settings, weeklyReport: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            {/* Low Mood Support */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Low Mood Support</p>
                  <p className="text-xs text-gray-600">Helpful resources during tough times</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.lowMoodSupport}
                  onChange={(e) => setSettings({...settings, lowMoodSupport: e.target.checked})}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t">
          <button
            onClick={saveSettings}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {saving ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving Settings...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Save Notification Settings
              </>
            )}
          </button>
        </div>
      </div>

      {/* Feature Description */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-semibold text-blue-800 mb-2">Smart Notification Features:</h4>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• <strong>Gentle Reminders:</strong> Non-intrusive prompts at your preferred time</li>
          <li>• <strong>Achievement Celebrations:</strong> Get motivated by your progress</li>
          <li>• <strong>Streak Protection:</strong> Notifications to maintain your logging streak</li>
          <li>• <strong>Low Mood Support:</strong> Helpful resources when you need them most</li>
          <li>• <strong>Weekly Insights:</strong> Email summaries of your mood patterns</li>
        </ul>
      </div>
    </div>
  )
}

