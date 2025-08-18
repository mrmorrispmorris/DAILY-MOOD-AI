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
      return
    }

    const { error } = await supabase
      .from('moods')
      .insert({
        user_id: user.id,
        mood_score: mood,
        mood_label: moodEmojis[mood - 1],
        notes: notes
      })

    if (!error) {
      setNotes('')
      onSuccess()
    }
    setSaving(false)
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">How are you feeling?</h2>
      
      <div className="text-6xl text-center mb-4">
        {moodEmojis[mood - 1]}
      </div>
      
      <input
        type="range"
        min="1"
        max="10"
        value={mood}
        onChange={(e) => setMood(Number(e.target.value))}
        className="w-full mb-6"
        style={{ accentColor: moodColors[mood - 1] }}
      />
      
      <textarea
        placeholder="Any notes? (optional)"
        className="w-full p-3 border rounded-lg mb-4"
        rows={3}
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
      />
      
      <button
        onClick={saveMood}
        disabled={saving}
        className="w-full bg-mood-purple text-white py-3 rounded-lg hover:bg-purple-700 transition"
      >
        {saving ? 'Saving...' : 'Save Mood'}
      </button>
    </div>
  )
}
