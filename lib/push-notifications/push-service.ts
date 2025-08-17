'use client'

// Push Notification Service for DailyMood AI
export class PushNotificationService {
  private static instance: PushNotificationService
  private swRegistration: ServiceWorkerRegistration | null = null
  private isSupported: boolean = false

  private constructor() {
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
  }

  static getInstance(): PushNotificationService {
    if (!PushNotificationService.instance) {
      PushNotificationService.instance = new PushNotificationService()
    }
    return PushNotificationService.instance
  }

  // Initialize the service
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported in this browser')
      return false
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', this.swRegistration)
      
      // Check if already subscribed
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        console.log('Already subscribed to push notifications')
        return true
      }

      return true
    } catch (error) {
      console.error('Failed to initialize push notifications:', error)
      return false
    }
  }

  // Request notification permission
  async requestPermission(): Promise<NotificationPermission> {
    if (!this.isSupported) {
      return 'denied'
    }

    try {
      const permission = await Notification.requestPermission()
      
      if (permission === 'granted') {
        // Store permission status
        localStorage.setItem('dailymood-push-permission', 'granted')
        console.log('Push notification permission granted')
      } else {
        localStorage.setItem('dailymood-push-permission', permission)
        console.log('Push notification permission denied:', permission)
      }

      return permission
    } catch (error) {
      console.error('Error requesting notification permission:', error)
      return 'denied'
    }
  }

  // Check current permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return 'denied'
    }

    return Notification.permission
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.swRegistration) {
      console.warn('Push notifications not supported or not initialized')
      return null
    }

    try {
      // Check permission first
      if (Notification.permission !== 'granted') {
        const permission = await this.requestPermission()
        if (permission !== 'granted') {
          return null
        }
      }

      // Subscribe to push manager
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '') as BufferSource
      })

      console.log('Push subscription created:', subscription)
      
      // Store subscription locally
      localStorage.setItem('dailymood-push-subscription', JSON.stringify(subscription))
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        localStorage.removeItem('dailymood-push-subscription')
        console.log('Push subscription removed')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe from push notifications:', error)
      return false
    }
  }

  // Send local notification
  async sendLocalNotification(title: string, options: NotificationOptions = {}): Promise<boolean> {
    if (!this.isSupported || Notification.permission !== 'granted') {
      return false
    }

    try {
      const notification = new Notification(title, {
        icon: '/icon-192.png',
        badge: '/icon-192.png',
        tag: 'dailymood-notification',
        requireInteraction: false,
        silent: false,
        ...options
      })

      // Auto-close after 5 seconds
      setTimeout(() => {
        notification.close()
      }, 5000)

      return true
    } catch (error) {
      console.error('Failed to send local notification:', error)
      return false
    }
  }

  // Send mood reminder notification
  async sendMoodReminder(): Promise<boolean> {
    return this.sendLocalNotification('Time to log your mood! 😊', {
      body: 'How are you feeling today? Take a moment to reflect and track your mood.',
      tag: 'mood-reminder'
    })
  }

  // Send streak notification
  async sendStreakNotification(streakDays: number): Promise<boolean> {
    return this.sendLocalNotification(`🔥 ${streakDays} Day Streak!`, {
      body: `Amazing! You've been tracking your mood for ${streakDays} days in a row. Keep it up!`,
      tag: 'streak-notification'
    })
  }

  // Send achievement notification
  async sendAchievementNotification(achievement: string): Promise<boolean> {
    return this.sendLocalNotification('🏆 Achievement Unlocked!', {
      body: `Congratulations! You've earned: ${achievement}`,
      tag: 'achievement-notification'
    })
  }

  // Check if notifications are enabled
  isNotificationsEnabled(): boolean {
    return this.isSupported && 
           Notification.permission === 'granted' && 
           localStorage.getItem('dailymood-push-permission') === 'granted'
  }

  // Get subscription status
  async getSubscriptionStatus(): Promise<{
    isSubscribed: boolean
    permission: NotificationPermission
    isSupported: boolean
  }> {
    if (!this.isSupported) {
      return {
        isSubscribed: false,
        permission: 'denied',
        isSupported: false
      }
    }

    const permission = this.getPermissionStatus()
    let isSubscribed = false

    if (this.swRegistration && permission === 'granted') {
      const subscription = await this.swRegistration.pushManager.getSubscription()
      isSubscribed = !!subscription
    }

    return {
      isSubscribed,
      permission,
      isSupported: true
    }
  }

  // Schedule daily mood reminder
  scheduleDailyReminder(hour: number = 9, minute: number = 0): void {
    if (!this.isNotificationsEnabled()) {
      return
    }

    // Clear existing reminder
    this.clearDailyReminder()

    // Calculate next reminder time
    const now = new Date()
    const reminderTime = new Date()
    reminderTime.setHours(hour, minute, 0, 0)

    // If reminder time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1)
    }

    const timeUntilReminder = reminderTime.getTime() - now.getTime()

    // Schedule reminder
    const reminderId = setTimeout(() => {
      this.sendMoodReminder()
      // Schedule next day's reminder
      this.scheduleDailyReminder(hour, minute)
    }, timeUntilReminder)

    // Store reminder ID
    localStorage.setItem('dailymood-daily-reminder-id', reminderId.toString())
  }

  // Clear daily reminder
  clearDailyReminder(): void {
    const reminderId = localStorage.getItem('dailymood-daily-reminder-id')
    if (reminderId) {
      clearTimeout(parseInt(reminderId))
      localStorage.removeItem('dailymood-daily-reminder-id')
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray as unknown as Uint8Array
  }

  // Handle notification click
  handleNotificationClick(notification: Notification, action?: string): void {
    notification.close()

    switch (action) {
      case 'log-mood':
        // Navigate to mood logging page
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
        break
      case 'view-streak':
        // Navigate to streak page
        if (typeof window !== 'undefined') {
          window.location.href = '/dashboard'
        }
        break
      case 'view-achievements':
        // Navigate to achievements page
        if (typeof window !== 'undefined') {
          window.location.href = '/profile'
        }
        break
      case 'share':
        // Share achievement
        if (navigator.share) {
          navigator.share({
            title: 'DailyMood AI Achievement',
            text: 'I just unlocked an achievement in DailyMood AI!',
            url: window.location.href
          })
        }
        break
      default:
        // Default action - focus the app
        if (typeof window !== 'undefined') {
          window.focus()
        }
        break
    }
  }
}

// Export singleton instance
export const pushNotificationService = PushNotificationService.getInstance()
