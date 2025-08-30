import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../context/SupabaseContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { LineChart } from 'react-native-chart-kit';

const { width: screenWidth } = Dimensions.get('window');

interface MoodEntry {
  id: string;
  mood_score: number;
  notes?: string;
  created_at: string;
  emoji?: string;
}

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [recentMoods, setRecentMoods] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyAverage, setWeeklyAverage] = useState(0);

  useEffect(() => {
    if (user) {
      fetchRecentMoods();
    }
  }, [user]);

  const fetchRecentMoods = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) {
        console.error('Error fetching moods:', error);
        return;
      }

      setRecentMoods(data || []);
      
      // Calculate weekly average
      if (data && data.length > 0) {
        const average = data.reduce((sum, mood) => sum + mood.mood_score, 0) / data.length;
        setWeeklyAverage(Math.round(average * 10) / 10);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getMoodEmoji = (score: number): string => {
    if (score >= 9) return '🤩';
    if (score >= 8) return '😄';
    if (score >= 7) return '😊';
    if (score >= 6) return '🙂';
    if (score >= 5) return '😐';
    if (score >= 4) return '😕';
    if (score >= 3) return '😟';
    if (score >= 2) return '😔';
    return '😢';
  };

  const chartData = {
    labels: recentMoods.slice(0, 7).reverse().map((_, i) => `${i + 1}d`),
    datasets: [
      {
        data: recentMoods.slice(0, 7).reverse().map(mood => mood.mood_score),
        color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
        strokeWidth: 3,
      },
    ],
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good {getTimeOfDay()}!</Text>
            <Text style={styles.username}>
              {user?.email?.split('@')[0] || 'User'}
            </Text>
          </View>
          <TouchableOpacity style={styles.notificationButton}>
            <Icon name="bell" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Quick Mood Log */}
        <View style={styles.quickLogCard}>
          <Text style={styles.cardTitle}>How are you feeling?</Text>
          <TouchableOpacity
            style={styles.quickLogButton}
            onPress={() => navigation.navigate('MoodLog')}
          >
            <Icon name="emoticon-happy" size={32} color="#8B5CF6" />
            <Text style={styles.quickLogText}>Log Your Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{weeklyAverage}</Text>
            <Text style={styles.statLabel}>Weekly Average</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{recentMoods.length}</Text>
            <Text style={styles.statLabel}>Entries This Week</Text>
          </View>
        </View>

        {/* Chart */}
        {recentMoods.length > 0 && (
          <View style={styles.chartCard}>
            <Text style={styles.cardTitle}>Your Mood Trend</Text>
            <LineChart
              data={chartData}
              width={screenWidth - 60}
              height={200}
              chartConfig={{
                backgroundColor: '#ffffff',
                backgroundGradientFrom: '#ffffff',
                backgroundGradientTo: '#ffffff',
                decimalPlaces: 0,
                color: (opacity = 1) => `rgba(139, 92, 246, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(107, 114, 128, ${opacity})`,
                style: {
                  borderRadius: 16,
                },
                propsForDots: {
                  r: '6',
                  strokeWidth: '2',
                  stroke: '#8B5CF6',
                },
              }}
              style={styles.chart}
              bezier
            />
          </View>
        )}

        {/* Recent Entries */}
        <View style={styles.recentCard}>
          <Text style={styles.cardTitle}>Recent Entries</Text>
          {recentMoods.slice(0, 3).map((mood) => (
            <View key={mood.id} style={styles.moodItem}>
              <View style={styles.moodIcon}>
                <Text style={styles.emoji}>{getMoodEmoji(mood.mood_score)}</Text>
              </View>
              <View style={styles.moodContent}>
                <Text style={styles.moodScore}>{mood.mood_score}/10</Text>
                <Text style={styles.moodDate}>
                  {new Date(mood.created_at).toLocaleDateString()}
                </Text>
                {mood.notes && (
                  <Text style={styles.moodNotes} numberOfLines={1}>
                    "{mood.notes}"
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'morning';
  if (hour < 17) return 'afternoon';
  return 'evening';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  greeting: {
    fontSize: 16,
    color: '#6B7280',
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  notificationButton: {
    padding: 8,
  },
  quickLogCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  quickLogButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F3F4F6',
    padding: 15,
    borderRadius: 12,
  },
  quickLogText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8B5CF6',
    marginLeft: 10,
  },
  statsRow: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#8B5CF6',
  },
  statLabel: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 5,
  },
  chartCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  chart: {
    borderRadius: 16,
  },
  recentCard: {
    backgroundColor: 'white',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  moodItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  moodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  emoji: {
    fontSize: 24,
  },
  moodContent: {
    flex: 1,
  },
  moodScore: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  moodDate: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  moodNotes: {
    fontSize: 14,
    color: '#6B7280',
    fontStyle: 'italic',
    marginTop: 4,
  },
});
