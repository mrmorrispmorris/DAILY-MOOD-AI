'use client'

export interface NotificationPermission {
  granted: boolean
  denied: boolean
  default: boolean
}

export class PushNotificationService {
  private static instance: PushNotificationService
  private registration: ServiceWorkerRegistration | null = null

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  async initialize(): Promise<boolean> {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      console.log('Service workers not supported')
      return false
    }

    try {
      console.log('🔧 Registering service worker for push notifications')
      this.registration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service worker registered successfully')
      return true
    } catch (error) {
      console.error('Service worker registration failed:', error)
      return false
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

  async scheduleDaily(time: string = '20:00'): Promise<boolean> {
    const permission = await this.requestPermission()
    
    if (!permission.granted) {
      console.log('Notification permission not granted')
      return false
    }

    // Schedule daily reminder
    this.scheduleDailyReminder(time)
    return true
  }

  private scheduleDailyReminder(time: string) {
    // Parse time (HH:MM format)
    const [hours, minutes] = time.split(':').map(Number)
    
    const scheduleNext = () => {
      const now = new Date()
      const scheduledTime = new Date()
      scheduledTime.setHours(hours, minutes, 0, 0)
      
      // If time has passed today, schedule for tomorrow
      if (scheduledTime <= now) {
        scheduledTime.setDate(scheduledTime.getDate() + 1)
      }
      
      const timeUntilNotification = scheduledTime.getTime() - now.getTime()
      
      setTimeout(() => {
        this.showNotification(
          'DailyMood AI Reminder 🌟',
          'How are you feeling today? Take a moment to log your mood!',
          {
            icon: '/icon-192x192.png',
            badge: '/icon-192x192.png',
            tag: 'daily-reminder',
            requireInteraction: false
          }
        )
        
        // Schedule next day
        scheduleNext()
      }, timeUntilNotification)
    }
    
    scheduleNext()
  }

  async showNotification(title: string, body: string, options?: NotificationOptions) {
    const permission = await this.requestPermission()
    
    if (!permission.granted) {
      return false
    }

    const defaultOptions: NotificationOptions = {
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'dailymood-notification',
      requireInteraction: false,
      ...options
    }

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
  }

  async testNotification() {
    return this.showNotification(
      'DailyMood AI Test 🧪',
      'Notifications are working! You\'ll receive daily mood reminders.',
      {
        tag: 'test-notification'
      }
    )
  }
}

export const pushService = PushNotificationService.getInstance()