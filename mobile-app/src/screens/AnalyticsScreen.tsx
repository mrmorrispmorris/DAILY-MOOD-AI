import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { DatabaseService, MoodEntry } from '../services/SupabaseClient';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const [moods, setMoods] = useState<MoodEntry[]>([]);
  const [stats, setStats] = useState({
    averageMood: 0,
    totalEntries: 0,
    streak: 0,
  });
  const [aiInsight, setAiInsight] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [timeframe, setTimeframe] = useState<'week' | 'month' | 'year'>('month');

  useEffect(() => {
    loadData();
  }, [timeframe]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const limit = timeframe === 'week' ? 7 : timeframe === 'month' ? 30 : 365;
      const [moodData, userStats] = await Promise.all([
        DatabaseService.getMoodEntries(limit),
        DatabaseService.getMoodStats(),
      ]);

      setMoods(moodData);
      setStats(userStats);

      if (moodData.length >= 3) {
        const insights = await DatabaseService.getAIInsights(moodData);
        setAiInsight(insights.insight);
      }

    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getMoodTrend = (): { trend: 'up' | 'down' | 'stable'; percentage: number } => {
    if (moods.length < 2) return { trend: 'stable', percentage: 0 };
    
    const recentAvg = moods.slice(0, Math.ceil(moods.length / 2))
      .reduce((sum, mood) => sum + mood.mood_score, 0) / Math.ceil(moods.length / 2);
    
    const olderAvg = moods.slice(Math.ceil(moods.length / 2))
      .reduce((sum, mood) => sum + mood.mood_score, 0) / Math.floor(moods.length / 2);
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (Math.abs(change) < 5) return { trend: 'stable', percentage: 0 };
    return {
      trend: change > 0 ? 'up' : 'down',
      percentage: Math.abs(Math.round(change))
    };
  };

  const getFrequentMoods = () => {
    const moodCounts: { [key: number]: number } = {};
    moods.forEach(mood => {
      moodCounts[mood.mood_score] = (moodCounts[mood.mood_score] || 0) + 1;
    });
    
    return Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([score, count]) => ({ score: parseInt(score), count }));
  };

  const getMoodEmoji = (score: number): string => {
    const emojis = ['😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😃', '🤗', '🤩'];
    return emojis[score - 1] || '😐';
  };

  const trend = getMoodTrend();
  const frequentMoods = getFrequentMoods();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading your analytics...</Text>
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
      {/* Timeframe Selector */}
      <View style={styles.timeframeContainer}>
        {(['week', 'month', 'year'] as const).map((period) => (
          <TouchableOpacity
            key={period}
            style={[
              styles.timeframeButton,
              timeframe === period && styles.timeframeButtonActive
            ]}
            onPress={() => setTimeframe(period)}
          >
            <Text
              style={[
                styles.timeframeText,
                timeframe === period && styles.timeframeTextActive
              ]}
            >
              {period.charAt(0).toUpperCase() + period.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Key Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.averageMood}</Text>
          <Text style={styles.statLabel}>Average Mood</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{stats.streak}</Text>
          <Text style={styles.statLabel}>Current Streak</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statNumber}>{moods.length}</Text>
          <Text style={styles.statLabel}>Entries</Text>
        </View>
      </View>

      {/* Mood Trend */}
      <View style={styles.trendCard}>
        <Text style={styles.cardTitle}>📈 Mood Trend</Text>
        <View style={styles.trendContent}>
          <Text style={styles.trendEmoji}>
            {trend.trend === 'up' ? '📈' : trend.trend === 'down' ? '📉' : '📊'}
          </Text>
          <View>
            <Text style={styles.trendText}>
              {trend.trend === 'stable' 
                ? 'Your mood has been stable'
                : `Your mood is trending ${trend.trend} by ${trend.percentage}%`
              }
            </Text>
            <Text style={styles.trendSubtext}>
              Compared to the previous period
            </Text>
          </View>
        </View>
      </View>

      {/* Most Frequent Moods */}
      <View style={styles.frequentCard}>
        <Text style={styles.cardTitle}>🎯 Most Frequent Moods</Text>
        {frequentMoods.map(({ score, count }, index) => (
          <View key={score} style={styles.frequentItem}>
            <Text style={styles.frequentEmoji}>{getMoodEmoji(score)}</Text>
            <Text style={styles.frequentScore}>{score}/10</Text>
            <View style={styles.frequentBarContainer}>
              <View
                style={[
                  styles.frequentBar,
                  { 
                    width: `${(count / Math.max(...frequentMoods.map(m => m.count))) * 100}%`,
                    backgroundColor: index === 0 ? '#8B5CF6' : index === 1 ? '#06B6D4' : '#10B981'
                  }
                ]}
              />
            </View>
            <Text style={styles.frequentCount}>{count}</Text>
          </View>
        ))}
      </View>

      {/* AI Insights */}
      <View style={styles.aiCard}>
        <Text style={styles.cardTitle}>🤖 AI Insights</Text>
        <Text style={styles.aiInsight}>{aiInsight}</Text>
      </View>

      {/* Recent Entries Summary */}
      <View style={styles.recentCard}>
        <Text style={styles.cardTitle}>📋 Recent Entries</Text>
        {moods.slice(0, 5).map((mood) => (
          <View key={mood.id} style={styles.recentItem}>
            <Text style={styles.recentEmoji}>{mood.emoji}</Text>
            <View style={styles.recentInfo}>
              <Text style={styles.recentScore}>{mood.mood_score}/10</Text>
              <Text style={styles.recentDate}>
                {new Date(mood.date).toLocaleDateString()}
              </Text>
            </View>
            {mood.notes && (
              <Text style={styles.recentNotes} numberOfLines={1}>
                {mood.notes}
              </Text>
            )}
          </View>
        ))}
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
  timeframeContainer: {
    flexDirection: 'row',
    margin: 20,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 4,
  },
  timeframeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  timeframeButtonActive: {
    backgroundColor: '#8B5CF6',
  },
  timeframeText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  timeframeTextActive: {
    color: '#FFFFFF',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 20,
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
  trendCard: {
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
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  trendContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  trendEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  trendText: {
    fontSize: 16,
    color: '#111827',
    fontWeight: '500',
  },
  trendSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  frequentCard: {
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
  frequentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  frequentEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  frequentScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
    width: 40,
  },
  frequentBarContainer: {
    flex: 1,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginHorizontal: 12,
  },
  frequentBar: {
    height: '100%',
    borderRadius: 4,
  },
  frequentCount: {
    fontSize: 12,
    color: '#6B7280',
    width: 20,
    textAlign: 'right',
  },
  aiCard: {
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
  aiInsight: {
    fontSize: 14,
    color: '#4B5563',
    lineHeight: 20,
  },
  recentCard: {
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
  recentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  recentEmoji: {
    fontSize: 20,
    marginRight: 8,
  },
  recentInfo: {
    marginRight: 12,
  },
  recentScore: {
    fontSize: 14,
    fontWeight: '500',
    color: '#111827',
  },
  recentDate: {
    fontSize: 12,
    color: '#6B7280',
  },
  recentNotes: {
    flex: 1,
    fontSize: 12,
    color: '#4B5563',
    fontStyle: 'italic',
  },
  bottomPadding: {
    height: 20,
  },
});

export default AnalyticsScreen;


