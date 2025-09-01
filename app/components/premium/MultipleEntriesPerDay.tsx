'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/app/lib/supabase-client'

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  emoji: string
  date: string
  time: string
  activities: string[]
  notes: string
  created_at: string
}

interface MultipleEntriesPerDayProps {
  userId: string
  selectedDate?: string
  onEntryAdded?: (entry: MoodEntry) => void
  onEntryUpdated?: (entry: MoodEntry) => void
  onEntryDeleted?: (entryId: string) => void
}

export default function MultipleEntriesPerDay({ 
  userId, 
  selectedDate = new Date().toISOString().split('T')[0],
  onEntryAdded,
  onEntryUpdated,
  onEntryDeleted
}: MultipleEntriesPerDayProps) {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddEntry, setShowAddEntry] = useState(false)
  const [editingEntry, setEditingEntry] = useState<string | null>(null)

  // New entry form state
  const [newMood, setNewMood] = useState(5)
  const [newNotes, setNewNotes] = useState('')
  const [newActivities, setNewActivities] = useState<string[]>([])
  const [customTime, setCustomTime] = useState(new Date().toTimeString().slice(0, 5))

  const moodEmojis = [
    { score: 1, emoji: '😢', label: 'Awful' },
    { score: 2, emoji: '😞', label: 'Bad' },
    { score: 3, emoji: '😐', label: 'Meh' },
    { score: 4, emoji: '🙂', label: 'Good' },
    { score: 5, emoji: '😊', label: 'Great' },
    { score: 6, emoji: '😄', label: 'Amazing' },
    { score: 7, emoji: '🤩', label: 'Fantastic' },
    { score: 8, emoji: '😍', label: 'Incredible' },
    { score: 9, emoji: '🥰', label: 'Perfect' },
    { score: 10, emoji: '🤯', label: 'Mind-blown' }
  ]

  const activityOptions = [
    'work', 'exercise', 'friends', 'family', 'dating', 'relax', 'movies', 'reading',
    'music', 'cooking', 'cleaning', 'shopping', 'travel', 'nature', 'gaming', 'creative',
    'learning', 'meditation', 'sleep', 'health'
  ]

  useEffect(() => {
    fetchEntriesForDate()
  }, [selectedDate, userId])

  const fetchEntriesForDate = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('date', selectedDate)
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching entries:', error)
        return
      }

      setEntries(data || [])
    } catch (error) {
      console.error('Failed to fetch entries:', error)
    } finally {
      setLoading(false)
    }
  }

  const addNewEntry = async () => {
    try {
      const selectedEmoji = moodEmojis.find(e => e.score === newMood)?.emoji || '😐'
      
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: userId,
            mood_score: newMood,
            emoji: selectedEmoji,
            date: selectedDate,
            time: customTime + ':00',
            activities: newActivities,
            notes: newNotes || '',
            created_at: new Date().toISOString()
          }
        ])
        .select()
        .single()

      if (error) {
        console.error('Error adding entry:', error)
        return
      }

      const newEntry = data as MoodEntry
      setEntries([...entries, newEntry].sort((a, b) => a.time.localeCompare(b.time)))
      onEntryAdded?.(newEntry)
      
      // Reset form
      setNewMood(5)
      setNewNotes('')
      setNewActivities([])
      setCustomTime(new Date().toTimeString().slice(0, 5))
      setShowAddEntry(false)
      
    } catch (error) {
      console.error('Failed to add entry:', error)
    }
  }

  const deleteEntry = async (entryId: string) => {
    try {
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', entryId)

      if (error) {
        console.error('Error deleting entry:', error)
        return
      }

      setEntries(entries.filter(e => e.id !== entryId))
      onEntryDeleted?.(entryId)
      
    } catch (error) {
      console.error('Failed to delete entry:', error)
    }
  }

  const toggleActivity = (activity: string) => {
    setNewActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    )
  }

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400 mx-auto"></div>
        <p className="text-cyan-300 mt-2">Loading entries...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-white mb-2">
            Daily Entries
          </h3>
          <p className="text-cyan-300">
            {new Date(selectedDate).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        <button
          onClick={() => setShowAddEntry(true)}
          className="bg-gradient-to-r from-cyan-500 to-purple-500 text-white px-6 py-3 rounded-xl hover:from-cyan-600 hover:to-purple-600 transition-all duration-300 font-medium"
        >
          + Add Entry
        </button>
      </div>

      {/* Existing Entries */}
      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="text-center py-12 bg-gray-800/50 rounded-xl border border-gray-700">
            <div className="text-6xl mb-4">📝</div>
            <h4 className="text-xl font-semibold text-white mb-2">No entries yet</h4>
            <p className="text-gray-400">Start tracking your mood throughout the day!</p>
          </div>
        ) : (
          <AnimatePresence>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ delay: index * 0.1 }}
                className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-cyan-500/50 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="text-4xl">{entry.emoji}</div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-white font-semibold">
                          {moodEmojis.find(m => m.score === entry.mood_score)?.label || 'Unknown'}
                        </span>
                        <span className="text-cyan-400 font-medium">
                          {entry.mood_score}/10
                        </span>
                      </div>
                      <div className="text-sm text-gray-400">
                        {formatTime(entry.time)}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="text-red-400 hover:text-red-300 transition-colors duration-200 p-2 hover:bg-red-500/10 rounded-lg"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                {/* Activities */}
                {entry.activities && entry.activities.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {entry.activities.map((activity) => (
                        <span
                          key={activity}
                          className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm border border-purple-500/30"
                        >
                          {activity}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                {entry.notes && (
                  <div className="text-gray-300 text-sm bg-gray-700/30 p-3 rounded-lg">
                    "{entry.notes}"
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Add Entry Modal */}
      <AnimatePresence>
        {showAddEntry && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50"
            onClick={() => setShowAddEntry(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-gray-900 border border-gray-700 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-xl font-bold text-white">Add New Entry</h4>
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Time Input */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-medium mb-2">Time</label>
                <input
                  type="time"
                  value={customTime}
                  onChange={(e) => setCustomTime(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-cyan-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Mood Selection */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-medium mb-3">
                  How are you feeling? ({newMood}/10)
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {moodEmojis.map((mood) => (
                    <button
                      key={mood.score}
                      onClick={() => setNewMood(mood.score)}
                      className={`p-3 rounded-lg text-2xl transition-all duration-200 ${
                        newMood === mood.score
                          ? 'bg-cyan-500/30 border-2 border-cyan-400 transform scale-110'
                          : 'bg-gray-800 border-2 border-gray-600 hover:border-gray-500'
                      }`}
                      title={mood.label}
                    >
                      {mood.emoji}
                    </button>
                  ))}
                </div>
                <div className="text-center mt-2 text-sm text-gray-400">
                  {moodEmojis.find(m => m.score === newMood)?.label}
                </div>
              </div>

              {/* Activities */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-medium mb-3">Activities</label>
                <div className="grid grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {activityOptions.map((activity) => (
                    <button
                      key={activity}
                      onClick={() => toggleActivity(activity)}
                      className={`px-3 py-2 rounded-lg text-sm capitalize transition-all duration-200 ${
                        newActivities.includes(activity)
                          ? 'bg-purple-500/30 text-purple-300 border border-purple-400'
                          : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {activity}
                    </button>
                  ))}
                </div>
              </div>

              {/* Notes */}
              <div className="mb-6">
                <label className="block text-cyan-300 font-medium mb-2">Notes (optional)</label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="How was your day? What happened?"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-cyan-500 focus:outline-none transition-colors resize-none h-20"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowAddEntry(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-3 rounded-xl transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={addNewEntry}
                  className="flex-1 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-600 hover:to-purple-600 text-white py-3 rounded-xl transition-all duration-200 font-medium"
                >
                  Add Entry
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

