'use client'
import { useState, useCallback } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { memoComponent, withPerformanceMonitoring } from '@/lib/optimization/react-optimizations'
import { useCache } from '@/lib/cache/cache-service'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { 
  Briefcase, Dumbbell, Users, Book, Music, Gamepad2, Coffee, Home,
  Sun, Cloud, CloudRain, Zap, Mic, MicOff
} from 'lucide-react'

// Enhanced mood system with 10-point scale
const moodEmojis = [
  { score: 1, emoji: '😔', label: 'Awful', color: 'from-red-500 to-red-600' },
  { score: 2, emoji: '😟', label: 'Bad', color: 'from-orange-500 to-orange-600' },
  { score: 3, emoji: '😕', label: 'Not Good', color: 'from-yellow-600 to-yellow-700' },
  { score: 4, emoji: '😐', label: 'Meh', color: 'from-yellow-500 to-yellow-600' },
  { score: 5, emoji: '🙂', label: 'Okay', color: 'from-lime-500 to-lime-600' },
  { score: 6, emoji: '😊', label: 'Good', color: 'from-green-500 to-green-600' },
  { score: 7, emoji: '😄', label: 'Great', color: 'from-emerald-500 to-emerald-600' },
  { score: 8, emoji: '😃', label: 'Very Good', color: 'from-teal-500 to-teal-600' },
  { score: 9, emoji: '🤗', label: 'Amazing', color: 'from-cyan-500 to-cyan-600' },
  { score: 10, emoji: '🤩', label: 'Fantastic', color: 'from-purple-500 to-purple-600' }
]

const activities = [
  { id: 'work', icon: Briefcase, label: 'Work', color: 'text-blue-600' },
  { id: 'exercise', icon: Dumbbell, label: 'Exercise', color: 'text-green-600' },
  { id: 'social', icon: Users, label: 'Social', color: 'text-pink-600' },
  { id: 'reading', icon: Book, label: 'Reading', color: 'text-purple-600' },
  { id: 'music', icon: Music, label: 'Music', color: 'text-indigo-600' },
  { id: 'gaming', icon: Gamepad2, label: 'Gaming', color: 'text-orange-600' },
  { id: 'coffee', icon: Coffee, label: 'Coffee', color: 'text-amber-700' },
  { id: 'home', icon: Home, label: 'Relaxing', color: 'text-emerald-600' }
]

const weatherOptions = [
  { id: 'sunny', icon: Sun, label: 'Sunny', color: 'text-yellow-500' },
  { id: 'cloudy', icon: Cloud, label: 'Cloudy', color: 'text-gray-500' },
  { id: 'rainy', icon: CloudRain, label: 'Rainy', color: 'text-blue-500' },
  { id: 'stormy', icon: Zap, label: 'Stormy', color: 'text-purple-500' }
]

function MoodEntryComponent({ onSuccess }: { onSuccess: () => void }) {
  const [selectedMood, setSelectedMood] = useState(5)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [selectedWeather, setSelectedWeather] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const { delete: deleteCache } = useCache()

  const selectedMoodData = moodEmojis.find(m => m.score === selectedMood)

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const toggleVoiceRecording = () => {
    if (isRecording) {
      setIsRecording(false)
    } else {
      setIsRecording(true)
      // Simulate voice recording
      setTimeout(() => {
        setIsRecording(false)
        setNotes(prev => prev + (prev ? ' ' : '') + '[Voice note transcribed]')
      }, 3000)
    }
  }

  const saveMood = useCallback(async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      toast.error('Please login first', {
        duration: 4000,
        icon: '🔒'
      })
      setSaving(false)
      return
    }

    // Ensure user exists in users table (create if doesn't exist)
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        subscription_level: 'free'
      }, {
        onConflict: 'id'
      })

    if (userError) {
      console.error('User creation error:', userError)
    }

    // Insert mood entry with correct database schema
    // Store activities and weather in tags array for now
    const moodTags = [
      ...selectedActivities.map(a => `activity:${a}`),
      ...(selectedWeather ? [`weather:${selectedWeather}`] : [])
    ]

    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        mood_score: selectedMood,
        emoji: selectedMoodData?.emoji || '🙂',
        notes: notes,
        tags: moodTags
      })

    if (error) {
      console.error('Mood entry error:', error)
      toast.error('Failed to save mood entry. Please try again.', {
        duration: 5000,
        icon: '❌'
      })
    } else {
      // Clear relevant cache entries after successful save
      deleteCache('mood-entries-page-1')
      deleteCache('user-mood-summary')
      deleteCache('/api/mood-entries?page=1')
      
      // Reset form to initial state
      setNotes('')
      setSelectedMood(5)
      setSelectedActivities([])
      setSelectedWeather('')
      onSuccess()
      
      toast.success('Mood saved successfully!', {
        duration: 3000,
        icon: '🎉'
      })
    }
    setSaving(false)
  }, [deleteCache, onSuccess])

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">
          How are you feeling?
        </h2>
        <p className="text-gray-600">Express your emotions on a scale of 1-10</p>
      </div>
      
      {/* Beautiful Emoji Display with Enhanced Labels */}
      <div className="text-center mb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedMood}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className={`inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br ${selectedMoodData?.color} rounded-full shadow-lg mb-4 hover:scale-105 transition-transform`}
          >
            <span className="text-6xl">{selectedMoodData?.emoji}</span>
          </motion.div>
        </AnimatePresence>
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {selectedMoodData?.label}
        </div>
        <div className="text-lg text-gray-600">
          {selectedMood}/10
        </div>
      </div>
      
      {/* Enhanced Mood Slider */}
      <div className="mb-8">
        <div className="flex justify-between text-xs text-gray-500 mb-2">
          <span>😢 Very Low</span>
          <span>😐 Neutral</span>
          <span>🥳 Amazing</span>
        </div>
        <div className="relative">
          <input
            type="range"
            min="1"
            max="10"
            value={selectedMood}
            onChange={(e) => setSelectedMood(Number(e.target.value))}
            className="w-full h-4 sm:h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full outline-none appearance-none cursor-pointer slider touch-manipulation"
            style={{ 
              background: `linear-gradient(to right, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
              accentColor: selectedMoodData?.color ? '#8b5cf6' : '#8b5cf6'
            }}
          />
          <div 
            className="absolute top-0 w-7 h-7 sm:w-6 sm:h-6 bg-white rounded-full shadow-lg border-4 transition-all duration-200 -mt-2 sm:-mt-1.5 -ml-3.5 sm:-ml-3"
            style={{ 
              left: `${((selectedMood - 1) / 9) * 100}%`,
              borderColor: selectedMoodData?.color ? '#8b5cf6' : '#8b5cf6'
            }}
          />
        </div>
      </div>
      
      {/* Activities Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What activities did you do? (Select all that apply) 🎯
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {activities.map((activity) => {
            const Icon = activity.icon
            const isSelected = selectedActivities.includes(activity.id)
            return (
              <motion.button
                key={activity.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => toggleActivity(activity.id)}
                className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center min-h-[60px] sm:min-h-[70px] ${
                  isSelected 
                    ? 'border-purple-400 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-5 h-5 sm:w-6 sm:h-6 mb-1 ${activity.color}`} />
                <span className="text-xs font-medium text-gray-700 text-center">{activity.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Weather Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          What&apos;s the weather like? ☀️
        </label>
        <div className="grid grid-cols-2 sm:flex sm:gap-3 gap-2">
          {weatherOptions.map((weather) => {
            const Icon = weather.icon
            const isSelected = selectedWeather === weather.id
            return (
              <motion.button
                key={weather.id}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedWeather(isSelected ? '' : weather.id)}
                className={`p-2 sm:p-3 rounded-xl border-2 transition-all duration-200 flex flex-col items-center flex-1 min-h-[60px] ${
                  isSelected 
                    ? 'border-purple-400 bg-purple-50 shadow-md' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`w-6 h-6 mb-1 ${weather.color}`} />
                <span className="text-xs font-medium text-gray-700">{weather.label}</span>
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Voice Notes (Future Enhancement) */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
          Add some notes (optional) ✨
          <button
            type="button"
            onClick={toggleVoiceRecording}
            className={`ml-2 p-2 rounded-full transition-colors ${
              isRecording ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            title={isRecording ? 'Recording...' : 'Voice note'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>
        </label>
        <textarea
          placeholder="What's on your mind? Any thoughts about your mood today..."
          className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 resize-none bg-gray-50/50"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        {isRecording && (
          <div className="text-sm text-red-600 flex items-center">
            <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full mr-2"></div>
            Recording voice note...
          </div>
        )}
      </div>
      
      {/* Beautiful Save Button */}
      <button
        onClick={saveMood}
        disabled={saving}
        className={`w-full py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg touch-manipulation ${
          saving 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg active:scale-[0.98]'
        }`}
      >
        {saving ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Saving your mood...
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <span className="mr-2">💾</span>
            Save Mood Entry
          </div>
        )}
      </button>
    </div>
  )
}

// Export optimized component with performance monitoring and memoization
export default withPerformanceMonitoring(
  memoComponent(MoodEntryComponent),
  'MoodEntry'
)
