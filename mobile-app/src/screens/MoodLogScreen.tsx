import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { DatabaseService } from '../services/SupabaseClient';
import { NotificationService } from '../services/NotificationService';

const { width } = Dimensions.get('window');

interface MoodLogScreenProps {
  navigation: any;
}

const MoodLogScreen: React.FC<MoodLogScreenProps> = ({ navigation }) => {
  const [selectedMood, setSelectedMood] = useState(5);
  const [notes, setNotes] = useState('');
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const moodEmojis = [
    { score: 1, emoji: '😔', label: 'Awful', color: '#EF4444' },
    { score: 2, emoji: '😟', label: 'Bad', color: '#F97316' },
    { score: 3, emoji: '😕', label: 'Not Good', color: '#EAB308' },
    { score: 4, emoji: '😐', label: 'Meh', color: '#EAB308' },
    { score: 5, emoji: '🙂', label: 'Okay', color: '#84CC16' },
    { score: 6, emoji: '😊', label: 'Good', color: '#22C55E' },
    { score: 7, emoji: '😄', label: 'Great', color: '#10B981' },
    { score: 8, emoji: '😃', label: 'Very Good', color: '#06B6D4' },
    { score: 9, emoji: '🤗', label: 'Amazing', color: '#3B82F6' },
    { score: 10, emoji: '🤩', label: 'Fantastic', color: '#8B5CF6' }
  ];

  const activities = [
    { id: 'work', label: 'Work', emoji: '💼' },
    { id: 'exercise', label: 'Exercise', emoji: '🏃‍♀️' },
    { id: 'social', label: 'Social', emoji: '👥' },
    { id: 'family', label: 'Family', emoji: '👨‍👩‍👧‍👦' },
    { id: 'reading', label: 'Reading', emoji: '📚' },
    { id: 'music', label: 'Music', emoji: '🎵' },
    { id: 'cooking', label: 'Cooking', emoji: '👨‍🍳' },
    { id: 'nature', label: 'Nature', emoji: '🌳' },
    { id: 'meditation', label: 'Meditation', emoji: '🧘‍♀️' },
    { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
    { id: 'travel', label: 'Travel', emoji: '✈️' },
    { id: 'gaming', label: 'Gaming', emoji: '🎮' },
  ];

  const selectedMoodData = moodEmojis.find(m => m.score === selectedMood) || moodEmojis[4];

  const handleMoodChange = (value: number) => {
    setSelectedMood(Math.round(value));
    
    // Animate emoji size change
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.2,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    );
  };

  const saveMoodEntry = async () => {
    if (saving) return;

    setSaving(true);
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await DatabaseService.createMoodEntry({
        date: today,
        mood_score: selectedMood,
        emoji: selectedMoodData.emoji,
        notes: notes.trim() || undefined,
        tags: selectedActivities,
      });

      // Show success feedback
      Alert.alert(
        '✅ Mood Saved!',
        'Your mood has been logged successfully.',
        [
          {
            text: 'View Dashboard',
            onPress: () => navigation.navigate('Home'),
          },
          {
            text: 'Log Another',
            style: 'cancel',
            onPress: resetForm,
          },
        ]
      );

      // Send achievement notification if it's a streak
      const stats = await DatabaseService.getMoodStats();
      if (stats.streak > 1) {
        NotificationService.sendStreakNotification(stats.streak);
      }

    } catch (error) {
      console.error('Error saving mood:', error);
      Alert.alert(
        'Error',
        'Failed to save your mood entry. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setSelectedMood(5);
    setNotes('');
    setSelectedActivities([]);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>How are you feeling?</Text>
        <Text style={styles.headerSubtitle}>Take a moment to check in with yourself</Text>
      </View>

      {/* Mood Display */}
      <View style={styles.moodDisplay}>
        <Animated.Text
          style={[
            styles.moodEmoji,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          {selectedMoodData.emoji}
        </Animated.Text>
        <Text style={styles.moodLabel}>{selectedMoodData.label}</Text>
        <Text style={styles.moodScore}>{selectedMood}/10</Text>
      </View>

      {/* Mood Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>😢 Low</Text>
          <Text style={styles.sliderLabel}>😐 Neutral</Text>
          <Text style={styles.sliderLabel}>🤩 High</Text>
        </View>
        <Slider
          style={styles.slider}
          minimumValue={1}
          maximumValue={10}
          step={1}
          value={selectedMood}
          onValueChange={handleMoodChange}
          minimumTrackTintColor={selectedMoodData.color}
          maximumTrackTintColor="#E5E7EB"
          thumbStyle={{
            backgroundColor: selectedMoodData.color,
            width: 24,
            height: 24,
          }}
        />
      </View>

      {/* Activities */}
      <View style={styles.activitiesSection}>
        <Text style={styles.sectionTitle}>What did you do today?</Text>
        <Text style={styles.sectionSubtitle}>Select all that apply</Text>
        <View style={styles.activitiesGrid}>
          {activities.map((activity) => (
            <TouchableOpacity
              key={activity.id}
              style={[
                styles.activityButton,
                selectedActivities.includes(activity.id) && styles.activityButtonSelected
              ]}
              onPress={() => toggleActivity(activity.id)}
            >
              <Text style={styles.activityEmoji}>{activity.emoji}</Text>
              <Text
                style={[
                  styles.activityLabel,
                  selectedActivities.includes(activity.id) && styles.activityLabelSelected
                ]}
              >
                {activity.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Notes */}
      <View style={styles.notesSection}>
        <Text style={styles.sectionTitle}>Add some notes (optional)</Text>
        <Text style={styles.sectionSubtitle}>What's on your mind?</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          numberOfLines={4}
          placeholder="How was your day? What made you feel this way?"
          placeholderTextColor="#9CA3AF"
          value={notes}
          onChangeText={setNotes}
          maxLength={500}
        />
        <Text style={styles.characterCount}>{notes.length}/500</Text>
      </View>

      {/* Save Button */}
      <TouchableOpacity
        style={[
          styles.saveButton,
          { backgroundColor: selectedMoodData.color },
          saving && styles.saveButtonDisabled
        ]}
        onPress={saveMoodEntry}
        disabled={saving}
      >
        <Text style={styles.saveButtonText}>
          {saving ? 'Saving...' : '💾 Save Mood Entry'}
        </Text>
      </TouchableOpacity>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    padding: 20,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
  },
  moodDisplay: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  moodEmoji: {
    fontSize: 80,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  moodScore: {
    fontSize: 16,
    color: '#6B7280',
  },
  sliderContainer: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  sliderLabel: {
    fontSize: 12,
    color: '#6B7280',
  },
  slider: {
    width: '100%',
    height: 40,
  },
  activitiesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 16,
  },
  activitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    minWidth: (width - 56) / 3,
    flexBasis: (width - 56) / 3,
  },
  activityButtonSelected: {
    backgroundColor: '#EDE9FE',
    borderColor: '#8B5CF6',
  },
  activityEmoji: {
    fontSize: 20,
    marginBottom: 4,
  },
  activityLabel: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  activityLabelSelected: {
    color: '#8B5CF6',
    fontWeight: '600',
  },
  notesSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#111827',
    textAlignVertical: 'top',
    minHeight: 100,
  },
  characterCount: {
    fontSize: 12,
    color: '#9CA3AF',
    textAlign: 'right',
    marginTop: 4,
  },
  saveButton: {
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 40,
  },
});

export default MoodLogScreen;


