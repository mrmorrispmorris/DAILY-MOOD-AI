import PushNotification from 'react-native-push-notification';
import { Platform } from 'react-native';

class NotificationServiceClass {
  private isInitialized = false;

  initialize() {
    if (this.isInitialized) return;

    PushNotification.configure({
      // Called when notification is clicked
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
        
        // Handle notification tap
        if (notification.userInteraction) {
          // User tapped on notification
          // Navigate to appropriate screen
        }
        
        notification.finish();
      },

      // Called when notification is received (iOS and Android)
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      // Called when remote notification is received (iOS and Android)
      onRegistrationError: function (err) {
        console.error('Notification registration error:', err);
      },

      // Permission settings (iOS only)
      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      // Should the initial notification be popped automatically
      popInitialNotification: true,

      // Request permissions on init (iOS only)
      requestPermissions: Platform.OS === 'ios',
    });

    // Create notification channels (Android only)
    if (Platform.OS === 'android') {
      PushNotification.createChannel(
        {
          channelId: 'mood-reminders',
          channelName: 'Mood Reminders',
          channelDescription: 'Daily mood tracking reminders',
          soundName: 'default',
          importance: 4,
          vibrate: true,
        },
        (created) => console.log(`Channel created: ${created}`)
      );

      PushNotification.createChannel(
        {
          channelId: 'insights',
          channelName: 'AI Insights',
          channelDescription: 'Personalized mood insights and tips',
          soundName: 'default',
          importance: 3,
          vibrate: false,
        },
        (created) => console.log(`Channel created: ${created}`)
      );
    }

    this.isInitialized = true;
  }

  // Request notification permissions
  async requestPermissions(): Promise<boolean> {
    return new Promise((resolve) => {
      PushNotification.requestPermissions((permissions) => {
        console.log('Notification permissions:', permissions);
        resolve(permissions.alert || false);
      });
    });
  }

  // Schedule daily mood reminder
  scheduleDailyMoodReminder(hour: number = 19, minute: number = 0) {
    PushNotification.localNotificationSchedule({
      id: 'daily-mood-reminder',
      channelId: 'mood-reminders',
      title: '🌟 Time to check in with yourself',
      message: "How are you feeling today? Take a moment to log your mood and reflect on your day.",
      date: new Date(Date.now() + 60 * 1000), // Start 1 minute from now for testing
      repeatType: 'day',
      actions: ['Log Mood', 'Remind Later'],
    });
  }

  // Schedule weekly insight notification
  scheduleWeeklyInsight() {
    PushNotification.localNotificationSchedule({
      id: 'weekly-insight',
      channelId: 'insights',
      title: '📊 Your Weekly Mood Summary',
      message: "Discover your mood patterns and get personalized insights from this week's data.",
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      repeatType: 'week',
      actions: ['View Insights', 'Dismiss'],
    });
  }

  // Send immediate mood streak notification
  sendMoodStreakNotification(days: number) {
    PushNotification.localNotification({
      id: `mood-streak-${days}`,
      channelId: 'insights',
      title: `🔥 ${days} Day Streak!`,
      message: `Amazing! You've been consistent with mood tracking for ${days} days. Keep up the great work!`,
      actions: ['Continue Streak', 'Share Achievement'],
    });
  }

  // Send mood improvement notification
  sendMoodImprovementNotification() {
    PushNotification.localNotification({
      id: 'mood-improvement',
      channelId: 'insights',
      title: '📈 Mood Improvement Detected!',
      message: "Your mood has been trending upward this week. You're making great progress!",
      actions: ['View Details', 'Share Progress'],
    });
  }

  // Cancel specific notification
  cancelNotification(id: string) {
    PushNotification.cancelLocalNotification(id);
  }

  // Cancel all notifications
  cancelAllNotifications() {
    PushNotification.cancelAllLocalNotifications();
  }

  // Get notification settings
  checkPermissions(): Promise<any> {
    return new Promise((resolve) => {
      PushNotification.checkPermissions((permissions) => {
        resolve(permissions);
      });
    });
  }
}

export const NotificationService = new NotificationServiceClass();
