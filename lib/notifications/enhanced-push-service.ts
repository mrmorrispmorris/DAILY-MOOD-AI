'use client'

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export interface NotificationSchedule {
  id: string
  time: string
  message: string
  days: number[] // 0-6 (Sunday-Saturday)
  enabled: boolean
}

export interface SmartReminder {
  type: 'daily' | 'weekly' | 'mood-based' | 'pattern-based'
  message: string
  trigger: 'time' | 'location' | 'activity' | 'mood-drop'
  conditions: Record<string, any>
}

export class EnhancedPushNotificationService {
  private static instance: EnhancedPushNotificationService
  private registration: ServiceWorkerRegistration | null = null
  private scheduledNotifications: Map<string, NotificationSchedule> = new Map()
  private smartReminders: SmartReminder[] = []
  private isInitialized = false

  static getInstance(): EnhancedPushNotificationService {
    if (!EnhancedPushNotificationService.instance) {
      EnhancedPushNotificationService.instance = new EnhancedPushNotificationService()
    }
    return EnhancedPushNotificationService.instance
  }

  async initialize(): Promise<boolean> {
    if (this.isInitialized) return true

    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service workers not supported')
      return false
    }

    try {
      console.log('🔧 Initializing enhanced push notification service')
      
      // Register service worker
      this.registration = await navigator.serviceWorker.register('/enhanced-sw.js')
      console.log('Service worker registered successfully')
      
      // Load saved schedules and reminders
      await this.loadSavedData()
      
      // Initialize smart reminders
      this.initializeSmartReminders()
      
      this.isInitialized = true
      return true
    } catch (error) {
      console.error('Service worker registration failed:', error)
      return false
    }
  }

  private async loadSavedData() {
    try {
      const savedSchedules = localStorage.getItem('dailymood_notification_schedules')
      if (savedSchedules) {
        const schedules = JSON.parse(savedSchedules)
        schedules.forEach((schedule: NotificationSchedule) => {
          this.scheduledNotifications.set(schedule.id, schedule)
        })
      }

      const savedReminders = localStorage.getItem('dailymood_smart_reminders')
      if (savedReminders) {
        this.smartReminders = JSON.parse(savedReminders)
      }
    } catch (error) {
      console.error('Error loading saved notification data:', error)
    }
  }

  private saveData() {
    try {
      localStorage.setItem('dailymood_notification_schedules', 
        JSON.stringify(Array.from(this.scheduledNotifications.values())))
      localStorage.setItem('dailymood_smart_reminders', 
        JSON.stringify(this.smartReminders))
    } catch (error) {
      console.error('Error saving notification data:', error)
    }
  }

  async requestPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      console.log('❌ Notifications not supported in this browser')
      return { granted: false, denied: true, default: false }
    }

    let permission = Notification.permission
    console.log(`🔔 Current notification permission: ${permission}`)

    if (permission === 'default') {
      console.log('🔔 Requesting notification permission')
      permission = await Notification.requestPermission()
      console.log(`🔔 Permission result: ${permission}`)
    }

    return {
      granted: permission === 'granted',
      denied: permission === 'denied',
      default: permission === 'default'
    }
  }

  // Enhanced daily reminder with smart scheduling
  async scheduleDailyReminder(time: string = '20:00', message?: string): Promise<string> {
    const permission = await this.requestPermission()
    
    if (!permission.granted) {
      throw new Error('Notification permission not granted')
    }

    const schedule: NotificationSchedule = {
      id: `daily-${Date.now()}`,
      time,
      message: message || 'How are you feeling today? Take a moment to log your mood! 🌟',
      days: [0, 1, 2, 3, 4, 5, 6], // Every day
      enabled: true
    }

    this.scheduledNotifications.set(schedule.id, schedule)
    this.saveData()
    
    // Schedule the notification
    this.scheduleNotification(schedule)
    
    return schedule.id
  }

  // Weekly reminder for specific days
  async scheduleWeeklyReminder(time: string, days: number[], message?: string): Promise<string> {
    const permission = await this.requestPermission()
    
    if (!permission.granted) {
      throw new Error('Notification permission not granted')
    }

    const schedule: NotificationSchedule = {
      id: `weekly-${Date.now()}`,
      time,
      message: message || 'Weekly mood check-in time! 📊',
      days,
      enabled: true
    }

    this.scheduledNotifications.set(schedule.id, schedule)
    this.saveData()
    
    this.scheduleNotification(schedule)
    
    return schedule.id
  }

  // Smart reminder based on mood patterns
  async scheduleMoodBasedReminder(conditions: {
    consecutiveLowMoods?: number
    moodDropThreshold?: number
    timeWindow?: string
  }): Promise<string> {
    const reminder: SmartReminder = {
      type: 'mood-based',
      message: 'We noticed your mood has been lower than usual. Would you like to talk about it? 💙',
      trigger: 'mood-drop',
      conditions
    }

    this.smartReminders.push(reminder)
    this.saveData()
    
    return `mood-${Date.now()}`
  }

  // Pattern-based reminder (e.g., after work, before bed)
  async schedulePatternReminder(trigger: 'after-work' | 'before-bed' | 'weekend' | 'stress-detected'): Promise<string> {
    const messages = {
      'after-work': 'Work day is over! How was your day? Take a moment to reflect. 🏢',
      'before-bed': 'Time for bed! How are you feeling before sleep? 😴',
      'weekend': 'Weekend vibes! How\'s your mood today? 🎉',
      'stress-detected': 'Stress detected! Take a deep breath and check in with yourself. 🧘‍♀️'
    }

    const reminder: SmartReminder = {
      type: 'pattern-based',
      message: messages[trigger],
      trigger: 'activity',
      conditions: { pattern: trigger }
    }

    this.smartReminders.push(reminder)
    this.saveData()
    
    return `pattern-${Date.now()}`
  }

  private scheduleNotification(schedule: NotificationSchedule) {
    if (!schedule.enabled) return

    const [hours, minutes] = schedule.time.split(':').map(Number)
    
    const scheduleNext = () => {
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)
      
      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
      
      // Check if today is in the allowed days
      while (!schedule.days.includes(scheduledTime.getDay())) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
      
      const timeUntilNotification = scheduledTime.getTime() - now.getTime()
      
      setTimeout(() => {
        this.showNotification(
          'DailyMood AI Reminder 🌟',
          schedule.message,
          {
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: `reminder-${schedule.id}`,
            requireInteraction: false,
            data: {
              scheduleId: schedule.id,
              type: 'scheduled-reminder'
            }
          }
        )
        
        // Schedule next occurrence
        scheduleNext()
      }, timeUntilNotification)
    }
    
    scheduleNext()
  }

  async showNotification(title: string, body: string, options?: NotificationOptions): Promise<boolean> {
    const permission = await this.requestPermission()
    
    if (!permission.granted) {
      return false
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'dailymood-notification',
      requireInteraction: false,
      silent: false
    }

    try {
      if (this.registration) {
        // Use service worker for better reliability
        await this.registration.showNotification(title, {
          body,
          ...defaultOptions
        })
      } else {
        // Fallback to regular notification
        new Notification(title, {
          body,
          ...defaultOptions
        })
      }
      return true
    } catch (error) {
      console.error('Error showing notification:', error)
      return false
    }
  }

  // Test notification with different types
  async testNotification(type: 'basic' | 'interactive' | 'smart' = 'basic'): Promise<boolean> {
    const testMessages = {
      basic: {
        title: 'DailyMood AI Test 🧪',
        body: 'Basic notification test - notifications are working!'
      },
      interactive: {
        title: 'Interactive Test 🎯',
        body: 'This notification has action buttons. Try them out!',
        actions: [
          { action: 'test-action', title: 'Test Action' },
          { action: 'dismiss', title: 'Dismiss' }
        ]
      },
      smart: {
        title: 'Smart Reminder Test 🧠',
        body: 'Smart notification with mood tracking integration!',
        actions: [
          { action: 'log-mood', title: 'Log Mood' },
          { action: 'view-trends', title: 'View Trends' }
        ]
      }
    }

    const message = testMessages[type]
    return this.showNotification(message.title, message.body, {
      tag: `test-${type}`
    })
  }

  // Get all scheduled notifications
  getScheduledNotifications(): NotificationSchedule[] {
    return Array.from(this.scheduledNotifications.values())
  }

  // Enable/disable a specific notification
  toggleNotification(scheduleId: string, enabled: boolean): void {
    const schedule = this.scheduledNotifications.get(scheduleId)
    if (schedule) {
      schedule.enabled = enabled
      this.saveData()
      
      if (enabled) {
        this.scheduleNotification(schedule)
      }
    }
  }

  // Delete a scheduled notification
  deleteNotification(scheduleId: string): void {
    this.scheduledNotifications.delete(scheduleId)
    this.saveData()
  }

  // Get smart reminders
  getSmartReminders(): SmartReminder[] {
    return [...this.smartReminders]
  }

  // Update smart reminder
  updateSmartReminder(reminderId: string, updates: Partial<SmartReminder>): void {
    const index = this.smartReminders.findIndex(r => r.type + '-' + reminderId === reminderId)
    if (index !== -1) {
      this.smartReminders[index] = { ...this.smartReminders[index], ...updates }
      this.saveData()
    }
  }

  // Delete smart reminder
  deleteSmartReminder(reminderId: string): void {
    this.smartReminders = this.smartReminders.filter(r => r.type + '-' + reminderId !== reminderId)
    this.saveData()
  }

  // Initialize default smart reminders
  private initializeSmartReminders() {
    if (this.smartReminders.length === 0) {
      // Add default smart reminders
      this.smartReminders = [
        {
          type: 'mood-based',
          message: 'We noticed your mood has been lower than usual. Would you like to talk about it? 💙',
          trigger: 'mood-drop',
          conditions: { consecutiveLowMoods: 3, moodDropThreshold: 4 }
        },
        {
          type: 'pattern-based',
          message: 'Work day is over! How was your day? Take a moment to reflect. 🏢',
          trigger: 'activity',
          conditions: { pattern: 'after-work', time: '17:00' }
        }
      ]
      this.saveData()
    }
  }

  // Clean up and reset
  async cleanup(): Promise<void> {
    this.scheduledNotifications.clear()
    this.smartReminders = []
    this.saveData()
    
    if (this.registration) {
      const notifications = await this.registration.getNotifications()
      notifications.forEach(notification => notification.close())
    }
  }
}

export const enhancedPushService = EnhancedPushNotificationService.getInstance()
