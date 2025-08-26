'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'

const moodEmojis = ['😢', '😕', '😐', '🙂', '😊', '😄', '🤗', '😍', '🤩', '🥳']
const moodColors = ['#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16', '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#3B82F6']

export default function MoodEntry({ onSuccess }: { onSuccess: () => void }) {
  const [mood, setMood] = useState(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  const saveMood = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      alert('Please login first')
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

    // Insert mood entry into correct table with correct schema
    const { error } = await supabase
      .from('mood_entries')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0], // Current date in YYYY-MM-DD format
        mood_score: mood,
        emoji: moodEmojis[mood - 1],
        notes: notes,
        tags: [] // Empty tags for now
      })

    if (error) {
      console.error('Mood entry error:', error)
      alert('Failed to save mood entry. Please try again.')
    } else {
      setNotes('')
      setMood(5) // Reset to neutral
      onSuccess()
      alert('Mood saved successfully! 🎉')
    }
    setSaving(false)
  }

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 hover:shadow-2xl transition-all duration-300">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          How are you feeling?
        </h2>
        <p className="text-gray-600">Express your emotions on a scale of 1-10</p>
      </div>
      
      {/* Beautiful Emoji Display */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full shadow-lg mb-4 transition-all duration-300 hover:scale-105">
          <span className="text-6xl animate-bounce">{moodEmojis[mood - 1]}</span>
        </div>
        <div className="text-2xl font-bold" style={{ color: moodColors[mood - 1] }}>
          {mood}/10
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
            value={mood}
            onChange={(e) => setMood(Number(e.target.value))}
            className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full outline-none appearance-none cursor-pointer slider"
            style={{ 
              background: `linear-gradient(to right, #EF4444 0%, #F59E0B 50%, #10B981 100%)`,
              accentColor: moodColors[mood - 1] 
            }}
          />
          <div 
            className="absolute top-0 w-6 h-6 bg-white rounded-full shadow-lg border-4 transition-all duration-200 -mt-1.5 -ml-3"
            style={{ 
              left: `${((mood - 1) / 9) * 100}%`,
              borderColor: moodColors[mood - 1]
            }}
          />
        </div>
      </div>
      
      {/* Beautiful Textarea */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Add some notes (optional) ✨
        </label>
        <textarea
          placeholder="What's on your mind? Any thoughts about your mood today..."
          className="w-full p-4 border-2 border-gray-200 rounded-2xl mb-4 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 transition-all duration-200 resize-none bg-gray-50/50"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>
      
      {/* Beautiful Save Button */}
      <button
        onClick={saveMood}
        disabled={saving}
        className={`w-full py-4 rounded-2xl font-semibold text-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
          saving 
            ? 'bg-gray-400 cursor-not-allowed' 
            : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg'
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
