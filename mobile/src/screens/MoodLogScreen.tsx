import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useSupabase } from '../context/SupabaseContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Slider from '@react-native-community/slider';
import HapticFeedback from 'react-native-haptic-feedback';

const moodEmojis = [
  { score: 1, emoji: '😢', label: 'Awful', color: '#EF4444' },
  { score: 2, emoji: '😔', label: 'Bad', color: '#F97316' },
  { score: 3, emoji: '😟', label: 'Not Good', color: '#EAB308' },
  { score: 4, emoji: '😕', label: 'Meh', color: '#EAB308' },
  { score: 5, emoji: '😐', label: 'Okay', color: '#84CC16' },
  { score: 6, emoji: '🙂', label: 'Good', color: '#22C55E' },
  { score: 7, emoji: '😊', label: 'Great', color: '#10B981' },
  { score: 8, emoji: '😄', label: 'Very Good', color: '#06B6D4' },
  { score: 9, emoji: '🤗', label: 'Amazing', color: '#3B82F6' },
  { score: 10, emoji: '🤩', label: 'Fantastic', color: '#8B5CF6' },
];

const activities = [
  { id: 'work', label: 'Work', icon: 'briefcase' },
  { id: 'exercise', label: 'Exercise', icon: 'dumbbell' },
  { id: 'social', label: 'Social', icon: 'account-group' },
  { id: 'reading', label: 'Reading', icon: 'book' },
  { id: 'music', label: 'Music', icon: 'music' },
  { id: 'relaxing', label: 'Relaxing', icon: 'sofa' },
];

export default function MoodLogScreen({ navigation }: any) {
  const { user } = useAuth();
  const supabase = useSupabase();
  const [moodScore, setMoodScore] = useState(7);
  const [notes, setNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedMoodData = moodEmojis.find(m => m.score === moodScore) || moodEmojis[6];

  const handleMoodChange = (value: number) => {
    const newScore = Math.round(value);
    setMoodScore(newScore);
    
    // Haptic feedback for better UX
    HapticFeedback.trigger('impactLight');
  };

  const toggleActivity = (activityId: string) => {
    HapticFeedback.trigger('impactLight');
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const saveMoodEntry = async () => {
    if (!user) {
      Alert.alert('Error', 'You must be logged in to save mood entries');
      return;
    }

    setSaving(true);

    try {
      // Create tags array from selected activities
      const tags = selectedActivities.map(a => `activity:${a}`);

      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          mood_score: moodScore,
          emoji: selectedMoodData.emoji,
          notes: notes.trim(),
          tags,
          date: new Date().toISOString().split('T')[0],
        });

      if (error) {
        throw error;
      }

      // Success feedback
      HapticFeedback.trigger('impactMedium');
      Alert.alert(
        'Mood Saved! 🎉',
        'Your mood has been successfully recorded.',
        [
          {
            text: 'View Dashboard',
            onPress: () => navigation.navigate('Home'),
          },
          { text: 'Log Another', style: 'cancel' },
        ]
      );

      // Reset form
      setNotes('');
      setSelectedActivities([]);
      setMoodScore(7);

    } catch (error: any) {
      console.error('Error saving mood:', error);
      Alert.alert('Error', 'Failed to save your mood. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>How are you feeling?</Text>
          <Text style={styles.subtitle}>
            Take a moment to reflect on your current mood
          </Text>
        </View>

        {/* Mood Display */}
        <View style={styles.moodDisplay}>
          <View
            style={[
              styles.moodCircle,
              { backgroundColor: selectedMoodData.color + '20' },
            ]}
          >
            <Text style={styles.moodEmoji}>{selectedMoodData.emoji}</Text>
          </View>
          <Text style={styles.moodLabel}>{selectedMoodData.label}</Text>
          <Text style={styles.moodScore}>{moodScore}/10</Text>
        </View>

        {/* Mood Slider */}
        <View style={styles.sliderContainer}>
          <Slider
            style={styles.slider}
            minimumValue={1}
            maximumValue={10}
            step={1}
            value={moodScore}
            onValueChange={handleMoodChange}
            minimumTrackTintColor="#8B5CF6"
            maximumTrackTintColor="#E5E7EB"
            thumbStyle={{
              backgroundColor: selectedMoodData.color,
              width: 24,
              height: 24,
            }}
          />
          <View style={styles.sliderLabels}>
            <Text style={styles.sliderLabel}>😢 Low</Text>
            <Text style={styles.sliderLabel}>😐 Neutral</Text>
            <Text style={styles.sliderLabel}>🤩 High</Text>
          </View>
        </View>

        {/* Activities */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>What did you do? (Optional)</Text>
          <View style={styles.activitiesGrid}>
            {activities.map((activity) => {
              const isSelected = selectedActivities.includes(activity.id);
              return (
                <TouchableOpacity
                  key={activity.id}
                  style={[
                    styles.activityButton,
                    isSelected && styles.activityButtonSelected,
                  ]}
                  onPress={() => toggleActivity(activity.id)}
                >
                  <Icon
                    name={activity.icon}
                    size={24}
                    color={isSelected ? '#8B5CF6' : '#6B7280'}
                  />
                  <Text
                    style={[
                      styles.activityLabel,
                      isSelected && styles.activityLabelSelected,
                    ]}
                  >
                    {activity.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Add notes (Optional)</Text>
          <TextInput
            style={styles.notesInput}
            placeholder="What's on your mind? Any thoughts about your mood today..."
            placeholderTextColor="#9CA3AF"
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[
            styles.saveButton,
            saving && styles.saveButtonDisabled,
          ]}
          onPress={saveMoodEntry}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Saving...' : 'Save Mood Entry'}
          </Text>
          <Icon name="content-save" size={20} color="white" />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  moodDisplay: {
    alignItems: 'center',
    marginVertical: 30,
  },
  moodCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
  },
  moodEmoji: {
    fontSize: 60,
  },
  moodLabel: {
    fontSize: 24,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 5,
  },
  moodScore: {
    fontSize: 18,
    color: '#6B7280',
  },
  sliderContainer: {
    paddingHorizontal: 30,
    marginBottom: 40,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 15,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  activityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    minWidth: '30%',
  },
  activityButtonSelected: {
    borderColor: '#8B5CF6',
    backgroundColor: '#F3F4F6',
  },
  activityLabel: {
    fontSize: 14,
    color: '#6B7280',
    marginLeft: 8,
  },
  activityLabelSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  notesInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    borderWidth: 2,
    borderColor: '#E5E7EB',
    height: 100,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#8B5CF6',
    marginHorizontal: 20,
    marginBottom: 30,
    padding: 16,
    borderRadius: 16,
    gap: 10,
  },
  saveButtonDisabled: {
    backgroundColor: '#9CA3AF',
  },
  saveButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
  },
});
