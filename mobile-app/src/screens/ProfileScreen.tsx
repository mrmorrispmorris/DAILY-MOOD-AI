import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { supabase, DatabaseService } from '../services/SupabaseClient';
import { NotificationService } from '../services/NotificationService';

const ProfileScreen: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reminderSettings, setReminderSettings] = useState({
    enabled: false,
    hour: 20,
    minute: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
    loadReminderSettings();
  }, []);

  const loadProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      
      if (user) {
        const userProfile = await DatabaseService.getUserProfile();
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadReminderSettings = async () => {
    try {
      const settings = await NotificationService.getReminderSettings();
      setReminderSettings(settings);
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            await supabase.auth.signOut();
          },
        },
      ]
    );
  };

  const toggleReminders = async (enabled: boolean) => {
    try {
      if (enabled) {
        const hasPermissions = await NotificationService.checkPermissionsAndPrompt();
        if (!hasPermissions) {
          Alert.alert(
            'Permissions Required',
            'Please enable notifications in your device settings to receive daily reminders.'
          );
          return;
        }
        await NotificationService.scheduleDailyMoodReminder(
          reminderSettings.hour,
          reminderSettings.minute
        );
      } else {
        await NotificationService.cancelDailyReminder();
      }
      
      setReminderSettings({ ...reminderSettings, enabled });
    } catch (error) {
      console.error('Error toggling reminders:', error);
    }
  };

  const showSubscriptionInfo = () => {
    Alert.alert(
      '✨ Premium Features',
      'Premium subscription includes:\n\n' +
      '• Unlimited mood entries\n' +
      '• Advanced AI insights\n' +
      '• Export your data\n' +
      '• Priority support\n' +
      '• No ads\n\n' +
      'Coming soon to the mobile app!',
      [{ text: 'OK' }]
    );
  };

  const exportData = () => {
    Alert.alert(
      '📊 Export Data',
      'Export functionality will be available in the next update. Your data will be exportable as CSV or PDF.',
      [{ text: 'OK' }]
    );
  };

  const deleteAccount = () => {
    Alert.alert(
      '⚠️ Delete Account',
      'This will permanently delete your account and all mood data. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'Are you absolutely sure? All your mood tracking data will be lost forever.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    // TODO: Implement account deletion
                    Alert.alert('Account deletion will be available in the next update');
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* User Info */}
      <View style={styles.userSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </Text>
        </View>
        <Text style={styles.userName}>{user?.email}</Text>
        <Text style={styles.userLevel}>
          {profile?.subscription_level === 'premium' ? '✨ Premium' : '🆓 Free'}
        </Text>
      </View>

      {/* Notifications */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🔔 Notifications</Text>
        <View style={styles.settingRow}>
          <View style={styles.settingInfo}>
            <Text style={styles.settingLabel}>Daily Mood Reminders</Text>
            <Text style={styles.settingDescription}>
              Get reminded to log your mood at {reminderSettings.hour}:00
            </Text>
          </View>
          <Switch
            value={reminderSettings.enabled}
            onValueChange={toggleReminders}
            trackColor={{ false: '#E5E7EB', true: '#8B5CF6' }}
            thumbColor={reminderSettings.enabled ? '#FFFFFF' : '#F3F4F6'}
          />
        </View>
      </View>

      {/* Subscription */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>✨ Subscription</Text>
        <TouchableOpacity style={styles.menuItem} onPress={showSubscriptionInfo}>
          <Text style={styles.menuText}>
            {profile?.subscription_level === 'premium' ? 'Manage Premium' : 'Upgrade to Premium'}
          </Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Data */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Your Data</Text>
        <TouchableOpacity style={styles.menuItem} onPress={exportData}>
          <Text style={styles.menuText}>Export Mood Data</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🆘 Support</Text>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Help', 'Support features coming soon!')}
        >
          <Text style={styles.menuText}>Help & FAQ</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Feedback', 'Feedback form coming soon!')}
        >
          <Text style={styles.menuText}>Send Feedback</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => Alert.alert('Privacy', 'Privacy policy viewer coming soon!')}
        >
          <Text style={styles.menuText}>Privacy Policy</Text>
          <Text style={styles.menuArrow}>→</Text>
        </TouchableOpacity>
      </View>

      {/* Account Actions */}
      <View style={styles.section}>
        <TouchableOpacity style={styles.signOutButton} onPress={handleLogout}>
          <Text style={styles.signOutText}>Sign Out</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.deleteButton} onPress={deleteAccount}>
          <Text style={styles.deleteText}>Delete Account</Text>
        </TouchableOpacity>
      </View>

      {/* App Info */}
      <View style={styles.appInfo}>
        <Text style={styles.appInfoText}>DailyMood AI v1.0.0</Text>
        <Text style={styles.appInfoText}>Made with ❤️ for your wellbeing</Text>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  loadingText: {
    fontSize: 16,
    color: '#6B7280',
  },
  userSection: {
    alignItems: 'center',
    paddingVertical: 30,
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  userLevel: {
    fontSize: 14,
    color: '#6B7280',
  },
  section: {
    backgroundColor: '#FFFFFF',
    marginBottom: 20,
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    color: '#111827',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 12,
    color: '#6B7280',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  menuText: {
    fontSize: 16,
    color: '#111827',
  },
  menuArrow: {
    fontSize: 16,
    color: '#6B7280',
  },
  signOutButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 12,
  },
  signOutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  deleteButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  deleteText: {
    color: '#EF4444',
    fontSize: 14,
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  appInfoText: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 4,
  },
  bottomPadding: {
    height: 20,
  },
});

export default ProfileScreen;


