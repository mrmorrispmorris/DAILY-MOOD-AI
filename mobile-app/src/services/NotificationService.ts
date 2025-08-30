import PushNotification from 'react-native-push-notification';
import { Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class NotificationService {
  static configure() {
    PushNotification.configure({
      // Called when notification is opened
      onNotification: function (notification) {
        console.log('NOTIFICATION:', notification);
      },

      // Called when app is launched by a notification
      onAction: function (notification) {
        console.log('ACTION:', notification.action);
        console.log('NOTIFICATION:', notification);
      },

      // Called when registration is completed
      onRegistration: function (token) {
        console.log('TOKEN:', token);
        // Store FCM token for push notifications
        AsyncStorage.setItem('fcm_token', token.token);
      },

      // IOS ONLY: called when a remote notification is received while the app is running
      onRemoteNotification: function (notification) {
        console.log('REMOTE NOTIFICATION ==>', notification);
      },

      permissions: {
        alert: true,
        badge: true,
        sound: true,
      },

      popInitialNotification: true,
      requestPermissions: true,
    });
  }

  static async requestPermissions(): Promise<boolean> {
    try {
      const permissions = await PushNotification.requestPermissions();
      return permissions.alert || permissions.badge || permissions.sound;
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  static async scheduleDailyMoodReminder(hour = 20, minute = 0) {
    // Cancel existing reminders
    PushNotification.cancelAllLocalNotifications();

    // Schedule daily reminder
    PushNotification.localNotificationSchedule({
      id: 'daily-mood-reminder',
      title: '🌟 How are you feeling today?',
      message: 'Take a moment to log your mood and reflect on your day',
      date: this.getNextNotificationDate(hour, minute),
      repeatType: 'day',
      repeatTime: 1,
    });

    // Save preference
    await AsyncStorage.setItem('mood_reminder_enabled', 'true');
    await AsyncStorage.setItem('mood_reminder_hour', hour.toString());
    await AsyncStorage.setItem('mood_reminder_minute', minute.toString());
  }

  static async cancelDailyReminder() {
    PushNotification.cancelLocalNotifications({ id: 'daily-mood-reminder' });
    await AsyncStorage.setItem('mood_reminder_enabled', 'false');
  }

  static async getReminderSettings(): Promise<{
    enabled: boolean;
    hour: number;
    minute: number;
  }> {
    const enabled = await AsyncStorage.getItem('mood_reminder_enabled');
    const hour = await AsyncStorage.getItem('mood_reminder_hour');
    const minute = await AsyncStorage.getItem('mood_reminder_minute');

    return {
      enabled: enabled === 'true',
      hour: hour ? parseInt(hour) : 20,
      minute: minute ? parseInt(minute) : 0,
    };
  }

  static sendImmediateNotification(title: string, message: string) {
    PushNotification.localNotification({
      title,
      message,
      playSound: true,
      soundName: 'default',
    });
  }

  static async checkPermissionsAndPrompt(): Promise<boolean> {
    const hasPermissions = await this.requestPermissions();
    
    if (!hasPermissions) {
      Alert.alert(
        'Enable Notifications',
        'Stay consistent with your mood tracking! Allow notifications to receive daily reminders.',
        [
          { text: 'Not Now', style: 'cancel' },
          { 
            text: 'Enable', 
            onPress: () => this.requestPermissions() 
          }
        ]
      );
    }

    return hasPermissions;
  }

  private static getNextNotificationDate(hour: number, minute: number): Date {
    const now = new Date();
    const notificationTime = new Date();
    notificationTime.setHours(hour, minute, 0, 0);

    // If the time has already passed today, schedule for tomorrow
    if (notificationTime.getTime() <= now.getTime()) {
      notificationTime.setDate(notificationTime.getDate() + 1);
    }

    return notificationTime;
  }

  // Weekly insights notification
  static async scheduleWeeklyInsights() {
    PushNotification.localNotificationSchedule({
      id: 'weekly-insights',
      title: '📊 Your Weekly Mood Insights',
      message: 'Check out your mood patterns and AI insights from this week!',
      date: this.getNextWeeklyDate(),
      repeatType: 'week',
    });
  }

  private static getNextWeeklyDate(): Date {
    const now = new Date();
    const nextSunday = new Date();
    nextSunday.setDate(now.getDate() + (7 - now.getDay()));
    nextSunday.setHours(18, 0, 0, 0); // 6 PM on Sunday
    
    return nextSunday;
  }

  // Achievement notifications
  static sendAchievementNotification(achievement: string) {
    PushNotification.localNotification({
      id: 'achievement',
      title: '🎉 Achievement Unlocked!',
      message: achievement,
      playSound: true,
      soundName: 'default',
    });
  }

  // Streak reminders
  static sendStreakNotification(streak: number) {
    if (streak === 7) {
      this.sendAchievementNotification('7-day mood tracking streak! Keep it up!');
    } else if (streak === 30) {
      this.sendAchievementNotification('30-day streak! You\'re building a great habit!');
    } else if (streak === 100) {
      this.sendAchievementNotification('100-day streak! You\'re a mood tracking champion!');
    }
  }
}


