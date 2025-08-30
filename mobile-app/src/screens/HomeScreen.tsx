import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { DatabaseService, MoodEntry } from '../services/SupabaseClient';
import { NotificationService } from '../services/NotificationService';

const { width } = Dimensions.get('window');

interface HomeScreenProps {
  navigation: any;
}

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState({
    averageMood: 0,
    totalEntries: 0,
    streak: 0,
  });
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadData();
    setupNotifications();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load recent moods and stats in parallel
      const [moods, userStats] = await Promise.all([
        DatabaseService.getMoodEntries(7),
        DatabaseService.getMoodStats(),
      ]);

      setRecentMoods(moods);
      setStats(userStats);

      // Get AI insights if we have enough data
      if (moods.length >= 3) {
        const insights = await DatabaseService.getAIInsights(moods);
        setAiInsight(insights.insight);
      } else {
        setAiInsight('Log at least 3 moods to unlock AI insights!');
      }

      // Check for streak achievements
      if (userStats.streak > 0) {
        NotificationService.sendStreakNotification(userStats.streak);
      }

    } catch (error) {
      console.error('Error loading data:', error);
      Alert.alert('Error', 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const setupNotifications = async () => {
    const hasPermissions = await NotificationService.checkPermissionsAndPrompt();
    if (hasPermissions) {
      const settings = await NotificationService.getReminderSettings();
      if (!settings.enabled) {
        // Prompt to enable daily reminders
        Alert.alert(
          'Daily Reminders',
          'Would you like to receive daily reminders to track your mood?',
          [
            { text: 'Not Now', style: 'cancel' },
            {
              text: 'Enable',
              onPress: () => NotificationService.scheduleDailyMoodReminder(),
            },
          ]
        );
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMoodEmoji = (score: number): string => {
    const emojis = ['😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😃', '🤗', '🤩'];
    return emojis[score - 1] || '😐';
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>Welcome back!</Text>
        <Text style={styles.subText}>How are you feeling today?</Text>
      </View>

      {/* Quick Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.averageMood}</Text>
          <Text style={styles.statLabel}>Avg Mood</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Day Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.totalEntries}</Text>
          <Text style={styles.statLabel}>Total Entries</Text>
        </View>
      </View>

      {/* Quick Log Button */}
      <TouchableOpacity
        style={styles.quickLogButton}
        onPress={() => navigation.navigate('MoodLog')}
      >
        <Text style={styles.quickLogText}>📝 Log Today's Mood</Text>
      </TouchableOpacity>

      {/* AI Insights */}
      <View style={styles.insightCard}>
        <Text style={styles.insightTitle}>🤖 AI Insights</Text>
        <Text style={styles.insightText}>{aiInsight}</Text>
        {recentMoods.length >= 3 && (
          <TouchableOpacity
            style={styles.viewMoreButton}
            onPress={() => navigation.navigate('Analytics')}
          >
            <Text style={styles.viewMoreText}>View Detailed Analytics →</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Recent Moods */}
      <View style={styles.recentSection}>
        <Text style={styles.sectionTitle}>Recent Moods</Text>
        {recentMoods.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No mood entries yet</Text>
            <TouchableOpacity
              style={styles.startButton}
              onPress={() => navigation.navigate('MoodLog')}
            >
              <Text style={styles.startButtonText}>Start Tracking</Text>
            </TouchableOpacity>
          </View>
        ) : (
          recentMoods.map((mood) => (
            <View key={mood.id} style={styles.moodCard}>
              <View style={styles.moodHeader}>
                <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                <View style={styles.moodInfo}>
                  <Text style={styles.moodScore}>{mood.mood_score}/10</Text>
                  <Text style={styles.moodDate}>{formatDate(mood.date)}</Text>
                </View>
              </View>
              {mood.notes && (
                <Text style={styles.moodNotes} numberOfLines={2}>
                  {mood.notes}
                </Text>
              )}
            </View>
          ))
        )}
      </View>

      {/* Premium Prompt */}
      <TouchableOpacity style={styles.premiumCard}>
        <Text style={styles.premiumTitle}>✨ Upgrade to Premium</Text>
        <Text style={styles.premiumText}>
          Unlock unlimited entries, advanced analytics, and personalized insights
        </Text>
        <Text style={styles.premiumPrice}>$9.99/month</Text>
      </TouchableOpacity>
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
  welcomeSection: {
    padding: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  subText: {
    fontSize: 16,
    color: '#6B7280',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8B5CF6',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  quickLogButton: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  quickLogText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  viewMoreButton: {
    marginTop: 12,
  },
  viewMoreText: {
    color: '#8B5CF6',
    fontSize: 14,
    fontWeight: '500',
  },
  recentSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    padding: 32,
    borderRadius: 12,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 16,
  },
  startButton: {
    backgroundColor: '#8B5CF6',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  moodCard: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  moodHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  moodEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  moodInfo: {
    flex: 1,
  },
  moodScore: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  moodDate: {
    fontSize: 14,
    color: '#6B7280',
  },
  moodNotes: {
    marginTop: 8,
    fontSize: 14,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  premiumCard: {
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  premiumTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  premiumText: {
    color: '#E9D5FF',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  premiumPrice: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;


