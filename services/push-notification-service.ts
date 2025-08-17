'use client'

interface PushNotificationServiceConfig {
  vapidPublicKey: string
  apiEndpoint: string
}

interface NotificationPayload {
  title: string
  body: string
  icon?: string
  badge?: string
  tag?: string
  data?: any
  actions?: NotificationAction[]
}

interface NotificationAction {
  action: string
  title: string
  icon?: string
}

class PushNotificationService {
  private config: PushNotificationServiceConfig
  private swRegistration: ServiceWorkerRegistration | null = null
  private isSupported: boolean

  constructor(config: PushNotificationServiceConfig) {
    this.config = config
    this.isSupported = 'serviceWorker' in navigator && 'PushManager' in window
  }

  // Initialize the service
  async initialize(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Push notifications not supported')
      return false
    }

    try {
      // Register service worker
      this.swRegistration = await navigator.serviceWorker.register('/sw.js')
      console.log('Service Worker registered:', this.swRegistration)
      
      // Check if already subscribed
      const subscription = await this.getSubscription()
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
      console.log('Notification permission:', permission)
      return permission
    } catch (error) {
      console.error('Failed to request notification permission:', error)
      return 'denied'
    }
  }

  // Subscribe to push notifications
  async subscribe(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.swRegistration) {
      console.warn('Push notifications not supported or not initialized')
      return null
    }

    try {
      // Check permission
      if (Notification.permission !== 'granted') {
        const permission = await this.requestPermission()
        if (permission !== 'granted') {
          throw new Error('Notification permission denied')
        }
      }

      // Subscribe to push manager
      const subscription = await this.swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(this.config.vapidPublicKey)
      })

      console.log('Push subscription created:', subscription)
      
      // Save subscription to backend
      await this.saveSubscription(subscription)
      
      return subscription
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error)
      return null
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe(): Promise<boolean> {
    if (!this.isSupported || !this.swRegistration) {
      return false
    }

    try {
      const subscription = await this.getSubscription()
      if (subscription) {
        await subscription.unsubscribe()
        await this.deleteSubscription(subscription)
        console.log('Unsubscribed from push notifications')
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to unsubscribe:', error)
      return false
    }
  }

  // Get current subscription
  async getSubscription(): Promise<PushSubscription | null> {
    if (!this.isSupported || !this.swRegistration) {
      return null
    }

    try {
      return await this.swRegistration.pushManager.getSubscription()
    } catch (error) {
      console.error('Failed to get subscription:', error)
      return null
    }
  }

  // Send local notification
  async sendLocalNotification(payload: NotificationPayload): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      // Check if we can show notifications
      if (Notification.permission !== 'granted') {
        return false
      }

      // Show notification
      const notification = new Notification(payload.title, {
        body: payload.body,
        icon: payload.icon || '/icon.svg',
        badge: payload.badge || '/icon.svg',
        tag: payload.tag,
        data: payload.data,
        requireInteraction: false,
        silent: false
      })

      // Handle notification click
      notification.onclick = () => {
        window.focus()
        notification.close()
        
        // Handle custom actions
        if (payload.data?.url) {
          window.open(payload.data.url, '_blank')
        }
      }

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

  // Send push notification to server
  async sendPushNotification(payload: NotificationPayload, userId: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/notifications/send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...payload,
          userId,
          timestamp: new Date().toISOString()
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }

      return true
    } catch (error) {
      console.error('Failed to send push notification:', error)
      return false
    }
  }

  // Schedule notification
  async scheduleNotification(payload: NotificationPayload, delay: number): Promise<boolean> {
    if (!this.isSupported) {
      return false
    }

    try {
      setTimeout(() => {
        this.sendLocalNotification(payload)
      }, delay)

      return true
    } catch (error) {
      console.error('Failed to schedule notification:', error)
      return false
    }
  }

  // Send reminder notification
  async sendReminderNotification(type: 'mood' | 'streak' | 'goal'): Promise<boolean> {
    const reminders = {
      mood: {
        title: 'Time to Log Your Mood! 😊',
        body: 'Take a moment to reflect on how you\'re feeling today',
        tag: 'mood-reminder',
        data: { type: 'mood', url: '/log-mood' }
      },
      streak: {
        title: 'Keep Your Streak Alive! 🔥',
        body: 'Don\'t break your mood logging streak - log today!',
        tag: 'streak-reminder',
        data: { type: 'streak', url: '/dashboard' }
      },
      goal: {
        title: 'Goal Check-in! 🎯',
        body: 'Review your wellness goals and track your progress',
        tag: 'goal-reminder',
        data: { type: 'goal', url: '/dashboard' }
      }
    }

    const reminder = reminders[type]
    return this.sendLocalNotification(reminder)
  }

  // Save subscription to backend
  private async saveSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/notifications/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          timestamp: new Date().toISOString()
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to save subscription:', error)
      return false
    }
  }

  // Delete subscription from backend
  private async deleteSubscription(subscription: PushSubscription): Promise<boolean> {
    try {
      const response = await fetch(`${this.config.apiEndpoint}/notifications/unsubscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      })

      return response.ok
    } catch (error) {
      console.error('Failed to delete subscription:', error)
      return false
    }
  }

  // Convert VAPID key to Uint8Array
  private urlBase64ToUint8Array(base64String: string): ArrayBuffer {
    const padding = '='.repeat((4 - base64String.length % 4) % 4)
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/')

    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray.buffer
  }

  // Get notification permission status
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported) {
      return 'denied'
    }
    return Notification.permission
  }

  // Check if notifications are supported
  isNotificationsSupported(): boolean {
    return this.isSupported
  }

  // Get service worker registration
  getServiceWorkerRegistration(): ServiceWorkerRegistration | null {
    return this.swRegistration
  }
}

// Create singleton instance
export const pushNotificationService = new PushNotificationService({
  vapidPublicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '',
  apiEndpoint: process.env.NEXT_PUBLIC_API_ENDPOINT || '/api'
})

export default pushNotificationService
