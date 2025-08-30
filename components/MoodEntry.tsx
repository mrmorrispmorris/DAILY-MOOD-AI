'use client'
import { useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Briefcase, Dumbbell, Users, Book, Music, Gamepad2, Coffee, Home, MapPin,
  Sun, Cloud, CloudRain, Zap, Snowflake, Wind, Mic, MicOff
} from 'lucide-react'

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

export default function MoodEntry({ userId }: { userId: string }) {
  const [selectedMood, setSelectedMood] = useState(5)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [selectedWeather, setSelectedWeather] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const supabase = createClientComponentClient()

  const selectedMoodData = moodEmojis.find(m => m.score === selectedMood)

  const handleSubmit = async () => {
    if (!userId) return
    
    setIsSubmitting(true)
    
    try {
      const { error } = await supabase.from('mood_entries').insert({
        user_id: userId,
        mood_score: selectedMood,
        activities: selectedActivities,
        weather: selectedWeather || null,
        notes: notes.trim() || null,
        created_at: new Date().toISOString()
      })

      if (!error) {
        setShowSuccess(true)
        setTimeout(() => {
          setShowSuccess(false)
          // Reset form but keep mood selection for easy re-entry
          setSelectedActivities([])
          setSelectedWeather('')
          setNotes('')
        }, 2000)
      } else {
        console.error('Error saving mood:', error)
        alert('Error saving mood entry. Please try again.')
      }
    } catch (error) {
      console.error('Error saving mood:', error)
      alert('Error saving mood entry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const toggleActivity = (activityId: string) => {
    setSelectedActivities(prev =>
      prev.includes(activityId)
        ? prev.filter(id => id !== activityId)
        : [...prev, activityId]
    )
  }

  const toggleVoiceRecording = () => {
    if (isRecording) {
      // Stop recording logic would go here
      setIsRecording(false)
      // In a real implementation, you'd convert speech to text and add to notes
    } else {
      // Start recording logic would go here
      setIsRecording(true)
      // For now, just simulate recording
      setTimeout(() => {
        setIsRecording(false)
        setNotes(prev => prev + (prev ? ' ' : '') + '[Voice note transcribed]')
      }, 3000)
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold mb-6 text-center">How are you feeling right now?</h2>

      {/* Mood Selection Grid */}
      <div className="mb-6">
        <div className="grid grid-cols-5 gap-3 mb-4">
          {moodEmojis.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setSelectedMood(mood.score)}
              className={`flex flex-col items-center p-3 rounded-xl transition-all transform hover:scale-105 ${
                selectedMood === mood.score
                  ? `bg-gradient-to-br ${mood.color} text-white shadow-lg ring-2 ring-offset-2 ring-purple-500`
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-2xl mb-1">{mood.emoji}</span>
              <span className="text-xs font-medium">{mood.label}</span>
              <span className="text-xs opacity-75">{mood.score}</span>
            </button>
          ))}
        </div>
        
        {/* Selected Mood Display */}
        <div className="text-center">
          <div className={`inline-flex items-center gap-3 px-6 py-3 rounded-full bg-gradient-to-r ${selectedMoodData?.color} text-white shadow-lg`}>
            <span className="text-3xl">{selectedMoodData?.emoji}</span>
            <div className="text-left">
              <div className="font-bold text-lg">{selectedMoodData?.label}</div>
              <div className="text-sm opacity-90">{selectedMood}/10</div>
            </div>
          </div>
        </div>
      </div>

      {/* Activities Section */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3">What activities were part of your day?</h3>
        <div className="grid grid-cols-4 gap-2">
          {activities.map((activity) => {
            const Icon = activity.icon
            const isSelected = selectedActivities.includes(activity.id)
            return (
              <motion.button
                key={activity.id}
                onClick={() => toggleActivity(activity.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${
                  isSelected ? 'text-purple-600' : activity.color
                }`} />
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-purple-700' : 'text-gray-600'
                }`}>{activity.label}</span>
              </motion.button>
            )
          })}
        </div>
        {selectedActivities.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex flex-wrap gap-2"
          >
            {selectedActivities.map(activityId => {
              const activity = activities.find(a => a.id === activityId)
              return activity ? (
                <span key={activityId} className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                  {activity.label}
                </span>
              ) : null
            })}
          </motion.div>
        )}
      </motion.div>

      {/* Weather Section */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3">What's the weather like?</h3>
        <div className="grid grid-cols-4 gap-2">
          {weatherOptions.map((weather) => {
            const Icon = weather.icon
            const isSelected = selectedWeather === weather.id
            return (
              <motion.button
                key={weather.id}
                onClick={() => setSelectedWeather(isSelected ? '' : weather.id)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center p-3 rounded-lg border-2 transition-all ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50 shadow-sm'
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Icon className={`w-5 h-5 mb-1 ${
                  isSelected ? 'text-blue-600' : weather.color
                }`} />
                <span className={`text-xs font-medium ${
                  isSelected ? 'text-blue-700' : 'text-gray-600'
                }`}>{weather.label}</span>
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Notes Section with Voice Recording */}
      <motion.div 
        className="mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mb-3">
          <label className="block text-sm font-medium text-gray-700">
            What's on your mind? (optional)
          </label>
          <motion.button
            onClick={toggleVoiceRecording}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium transition-all ${
              isRecording
                ? 'bg-red-100 text-red-700 border border-red-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
            }`}
          >
            {isRecording ? (
              <>
                <MicOff className="w-3 h-3" />
                Recording...
              </>
            ) : (
              <>
                <Mic className="w-3 h-3" />
                Voice Note
              </>
            )}
          </motion.button>
        </div>
        
        <div className="relative">
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Share what's happening in your life, how you're feeling, or what influenced your mood today..."
            className={`w-full p-4 border rounded-xl resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
              isRecording ? 'border-red-300 bg-red-50' : 'border-gray-200'
            }`}
            rows={3}
            maxLength={500}
          />
          {isRecording && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute top-4 right-4 w-3 h-3 bg-red-500 rounded-full"
            />
          )}
        </div>
        
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-gray-500">
            {isRecording && (
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="flex items-center gap-1"
              >
                <div className="w-2 h-2 bg-red-500 rounded-full" />
                Listening...
              </motion.span>
            )}
          </div>
          <div className="text-right text-xs text-gray-500">
            {notes.length}/500 characters
          </div>
        </div>
      </motion.div>

      {/* Enhanced Submit Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={isSubmitting}
        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={`w-full py-4 rounded-xl font-semibold text-white shadow-lg transition-all ${
          isSubmitting 
            ? 'bg-gray-400 cursor-not-allowed' 
            : `bg-gradient-to-r ${selectedMoodData?.color} hover:shadow-xl`
        }`}
      >
        {isSubmitting ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
            />
            Saving your mood...
          </motion.div>
        ) : (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center justify-center gap-2"
          >
            Save My Mood
            <span className="text-lg">{selectedMoodData?.emoji}</span>
          </motion.span>
        )}
      </motion.button>

      {/* Enhanced Success Message */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: -50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -50 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl shadow-xl z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="flex items-center gap-3"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-2xl"
              >
                ✨
              </motion.div>
              <div>
                <div className="font-bold">Mood saved successfully!</div>
                <div className="text-sm opacity-90">Great job tracking your wellbeing!</div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Daily Streak Motivation */}
      <div className="mt-4 text-center text-sm text-gray-600">
        💡 <strong>Tip:</strong> Daily mood tracking helps you identify patterns and improve your mental wellness
      </div>
    </div>
  )
}
