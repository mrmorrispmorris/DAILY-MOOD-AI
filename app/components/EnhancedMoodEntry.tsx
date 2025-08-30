'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { motion, AnimatePresence } from 'framer-motion'

// Daylio-inspired mood scale with better emotional granularity
const moodLevels = [
  { score: 1, emoji: '😢', label: 'Awful', color: '#EF4444', bg: 'from-red-500 to-red-600' },
  { score: 2, emoji: '😞', label: 'Bad', color: '#F97316', bg: 'from-orange-500 to-orange-600' },
  { score: 3, emoji: '😐', label: 'Meh', color: '#F59E0B', bg: 'from-yellow-500 to-yellow-600' },
  { score: 4, emoji: '🙂', label: 'Good', color: '#22C55E', bg: 'from-green-500 to-green-600' },
  { score: 5, emoji: '😁', label: 'Rad', color: '#10B981', bg: 'from-emerald-500 to-emerald-600' }
]

// Activity categories that correlate with mood (Daylio-inspired)
const activityCategories = {
  '😴': ['Sleep well', 'Nap', 'Insomnia', 'Tired'],
  '💪': ['Exercise', 'Walk', 'Gym', 'Sports', 'Yoga'],
  '🍽️': ['Healthy food', 'Junk food', 'Cooking', 'Eating out'],
  '👥': ['Friends', 'Family time', 'Date', 'Party', 'Alone time'],
  '💼': ['Work', 'Study', 'Meeting', 'Presentation', 'Productive'],
  '🎯': ['Achievement', 'Goal reached', 'Success', 'Progress'],
  '😌': ['Relax', 'Meditation', 'Music', 'Reading', 'Nature'],
  '😰': ['Stress', 'Anxiety', 'Worried', 'Overwhelmed', 'Pressure']
}

// Mood tags for better categorization
const moodTags = [
  '💭 Thoughtful', '🔥 Energetic', '😴 Tired', '🎉 Excited', 
  '😌 Calm', '😰 Anxious', '😢 Sad', '😠 Angry', 
  '💪 Motivated', '🤗 Grateful', '😞 Lonely', '🎯 Focused'
]

interface EnhancedMoodEntryProps {
  onSuccess: () => void
  quickMode?: boolean
}

export default function EnhancedMoodEntry({ onSuccess, quickMode = false }: EnhancedMoodEntryProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [currentStreak, setCurrentStreak] = useState(0)
  const [showSuccess, setShowSuccess] = useState(false)
  const [entryMode, setEntryMode] = useState<'quick' | 'detailed'>(quickMode ? 'quick' : 'detailed')

  useEffect(() => {
    fetchUserStreak()
  }, [])

  const fetchUserStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Calculate current streak (mock implementation)
    const { data: recentEntries } = await supabase
      .from('mood_entries')
      .select('date')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30)

    if (recentEntries) {
      let streak = 0
      const today = new Date()
      
      for (let i = 0; i < recentEntries.length; i++) {
        const entryDate = new Date(recentEntries[i].date)
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === streak) {
          streak++
        } else {
          break
        }
      }
      
      setCurrentStreak(streak)
    }
  }

  const saveMood = async () => {
    if (!selectedMood) {
      alert('Please select your mood first!')
      return
    }

    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Please login first')
      setSaving(false)
      return
    }

    // Ensure user exists
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: user.id,
        email: user.email || '',
        subscription_level: 'free',
        last_mood_entry: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (userError) {
      console.error('User creation error:', userError)
    }

    // Save mood entry with enhanced data
    const moodData = moodLevels.find(m => m.score === selectedMood)!
    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
        mood_score: selectedMood,
        emoji: moodData.emoji,
        mood_label: moodData.label,
        notes: notes,
        tags: [...selectedTags, ...selectedActivities],
        activities: selectedActivities,
        entry_mode: entryMode,
        created_at: new Date().toISOString()
      })

    if (error) {
      console.error('Mood entry error:', error)
      alert('Failed to save mood entry. Please try again.')
    } else {
      // Reset form
      setSelectedMood(null)
      setNotes('')
      setSelectedActivities([])
      setSelectedTags([])
      
      // Show success animation
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
      
      // Update streak
      setCurrentStreak(prev => prev + 1)
      
      // Track analytics
      if (typeof window !== 'undefined') {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'mood_entry_created',
            userId: user.id,
            moodScore: selectedMood,
            hasNotes: !!notes,
            activitiesCount: selectedActivities.length,
            tagsCount: selectedTags.length,
            entryMode,
            timestamp: new Date().toISOString()
          })
        })
      }
      
      onSuccess()
    }
    setSaving(false)
  }

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    )
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  if (showSuccess) {
    return (
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-3xl shadow-xl border border-green-200 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-6xl mb-4"
        >
          🎉
        </motion.div>
        <h3 className="text-2xl font-bold text-green-800 mb-2">Mood Saved!</h3>
        <p className="text-green-700 mb-2">Great job tracking your emotional journey!</p>
        {currentStreak > 1 && (
          <div className="inline-flex items-center bg-green-200 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
            🔥 {currentStreak} day streak!
          </div>
        )}
      </motion.div>
    )
  }

  return (
    <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/40 overflow-hidden">
      {/* Header with streak */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-2xl font-bold">How are you feeling?</h2>
            {currentStreak > 0 && (
              <div className="flex items-center bg-white/20 px-3 py-1 rounded-full text-sm">
                🔥 {currentStreak} day{currentStreak !== 1 ? 's' : ''}
              </div>
            )}
          </div>
          <p className="text-white/80">Track your emotional journey with just one tap</p>
        </div>
        
        {/* Mode Toggle */}
        <div className="absolute top-6 right-6 bg-white/20 rounded-full p-1 flex">
          <button
            onClick={() => setEntryMode('quick')}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              entryMode === 'quick' 
                ? 'bg-white text-purple-600 shadow-md' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Quick
          </button>
          <button
            onClick={() => setEntryMode('detailed')}
            className={`px-3 py-1 rounded-full text-xs transition-all ${
              entryMode === 'detailed' 
                ? 'bg-white text-purple-600 shadow-md' 
                : 'text-white/80 hover:text-white'
            }`}
          >
            Detailed
          </button>
        </div>
      </div>

      <div className="p-6">
        {/* Quick Mood Selection - Daylio Style */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
            Tap your mood
          </h3>
          <div className="flex justify-center space-x-3">
            {moodLevels.map((mood) => (
              <motion.button
                key={mood.score}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedMood(mood.score)}
                className={`relative flex flex-col items-center p-4 rounded-2xl transition-all duration-300 ${
                  selectedMood === mood.score
                    ? `bg-gradient-to-br ${mood.bg} text-white shadow-lg scale-110`
                    : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                }`}
              >
                <span className="text-3xl mb-1">{mood.emoji}</span>
                <span className="text-xs font-medium">{mood.label}</span>
                {selectedMood === mood.score && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg"
                  >
                    <span className="text-green-500 text-sm">✓</span>
                  </motion.div>
                )}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Detailed Mode Additional Options */}
        <AnimatePresence>
          {entryMode === 'detailed' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Activities */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">What did you do?</h4>
                <div className="space-y-3">
                  {Object.entries(activityCategories).map(([emoji, activities]) => (
                    <div key={emoji} className="flex flex-wrap items-center gap-2">
                      <span className="text-xl">{emoji}</span>
                      {activities.map((activity) => (
                        <button
                          key={activity}
                          onClick={() => toggleActivity(activity)}
                          className={`px-3 py-1 rounded-full text-sm transition-all ${
                            selectedActivities.includes(activity)
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {activity}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mood Tags */}
              <div className="mb-6">
                <h4 className="text-md font-semibold text-gray-800 mb-3">How would you describe it?</h4>
                <div className="flex flex-wrap gap-2">
                  {moodTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      className={`px-3 py-1 rounded-full text-sm transition-all ${
                        selectedTags.includes(tag)
                          ? 'bg-purple-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-md font-semibold text-gray-800 mb-2">
                  Any thoughts? ✨
                </label>
                <textarea
                  placeholder="What's on your mind today..."
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all resize-none bg-gray-50/50"
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={saveMood}
          disabled={saving || !selectedMood}
          className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 ${
            saving || !selectedMood
              ? 'bg-gray-300 cursor-not-allowed text-gray-500' 
              : selectedMood 
                ? `bg-gradient-to-r ${moodLevels.find(m => m.score === selectedMood)?.bg} text-white shadow-lg hover:shadow-xl`
                : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg hover:shadow-xl'
          }`}
        >
          {saving ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
              Saving your mood...
            </div>
          ) : !selectedMood ? (
            'Select your mood first'
          ) : (
            <div className="flex items-center justify-center">
              <span className="mr-2">{moodLevels.find(m => m.score === selectedMood)?.emoji}</span>
              Save {entryMode === 'quick' ? 'Quick' : 'Detailed'} Entry
            </div>
          )}
        </motion.button>
      </div>
    </div>
  )
}


