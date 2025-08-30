'use client'
import { useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import toast from 'react-hot-toast'

export default function MoodEntry({ onSuccess }: { onSuccess: () => void }) {
  const [selectedMood, setSelectedMood] = useState(5)
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)
  const [activities, setActivities] = useState<string[]>([])

  const saveMood = async () => {
    setSaving(true)
    
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        toast.error('Please login to save mood entries')
        window.location.href = '/login'
        return
      }

      const { error } = await supabase
        .from('mood_entries')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          mood_score: selectedMood,
          emoji: getMoodEmoji(selectedMood),
          notes: notes,
          tags: activities
        })

      if (error) throw error

      toast.success('Mood saved successfully!')
      setNotes('')
      setSelectedMood(5)
      setActivities([])
      onSuccess()
      
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error('Failed to save mood. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const getMoodEmoji = (score: number) => {
    const emojis = ['😔', '😟', '😕', '😐', '🙂', '😊', '😄', '😃', '🤗', '🤩']
    return emojis[score - 1] || '😐'
  }

  return (
    <div className="mood-entry-container bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-purple-600 mb-2">
          How are you feeling?
        </h2>
        <p className="text-gray-600">Express your emotions on a scale of 1-10</p>
      </div>

      {/* Mood Display */}
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">{getMoodEmoji(selectedMood)}</div>
        <div className="text-2xl font-bold text-gray-800 mb-1">
          {selectedMood}/10
        </div>
      </div>
      
      {/* Mood slider with working onChange */}
      <div className="mb-8">
        <input
          type="range"
          min="1"
          max="10"
          value={selectedMood}
          onChange={(e) => setSelectedMood(parseInt(e.target.value))}
          className="mood-slider w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full outline-none appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-2">
          <span>1 - Awful</span>
          <span>10 - Amazing</span>
        </div>
      </div>
      
      {/* Activity buttons that actually toggle */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Activities (optional)
        </label>
        <div className="activities-grid grid grid-cols-2 gap-3">
          {['work', 'exercise', 'social', 'relax'].map(activity => (
            <button
              key={activity}
              onClick={() => {
                setActivities(prev => 
                  prev.includes(activity) 
                    ? prev.filter(a => a !== activity)
                    : [...prev, activity]
                )
              }}
              className={`activity-btn p-3 rounded-xl border-2 transition-all duration-200 text-sm font-medium capitalize min-h-[50px] ${
                activities.includes(activity) 
                  ? 'active border-purple-400 bg-purple-50 text-purple-700' 
                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
              }`}
            >
              {activity}
            </button>
          ))}
        </div>
      </div>
      
      {/* Notes textarea */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Notes (optional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How are you feeling?"
          className="mood-notes w-full p-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-all duration-200 resize-none"
          rows={3}
        />
      </div>
      
      {/* Save button with proper handler */}
      <button
        onClick={saveMood}
        disabled={saving}
        className="save-mood-btn w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : 'Save Mood Entry'}
      </button>
    </div>
  )
}
