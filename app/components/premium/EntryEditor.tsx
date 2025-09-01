'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActivitySelector from './ActivitySelector'

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  date: string
  time: string
  emoji: string
  notes?: string
  activities?: string[]
  photos?: string[]
}

interface EntryEditorProps {
  entry: MoodEntry
  onSave: (entryId: string, updates: Partial<MoodEntry>) => void
  onDelete: (entryId: string) => void
  onCancel: () => void
}

export default function EntryEditor({ entry, onSave, onDelete, onCancel }: EntryEditorProps) {
  const [mood, setMood] = useState(entry.mood_score)
  const [notes, setNotes] = useState(entry.notes || '')
  const [activities, setActivities] = useState(entry.activities || [])
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const moodOptions = [
    { value: 10, emoji: '🤩', label: 'Amazing', color: 'from-emerald-500 to-green-600' },
    { value: 9, emoji: '😊', label: 'Great', color: 'from-green-400 to-emerald-500' },
    { value: 8, emoji: '🙂', label: 'Good', color: 'from-lime-400 to-green-400' },
    { value: 7, emoji: '😌', label: 'Pleasant', color: 'from-yellow-400 to-lime-400' },
    { value: 6, emoji: '😐', label: 'Neutral', color: 'from-yellow-500 to-yellow-400' },
    { value: 5, emoji: '😕', label: 'Mixed', color: 'from-orange-400 to-yellow-500' },
    { value: 4, emoji: '😔', label: 'Low', color: 'from-orange-500 to-orange-400' },
    { value: 3, emoji: '😞', label: 'Down', color: 'from-red-400 to-orange-500' },
    { value: 2, emoji: '😢', label: 'Sad', color: 'from-red-500 to-red-400' },
    { value: 1, emoji: '😭', label: 'Terrible', color: 'from-red-600 to-red-500' }
  ]

  const handleSave = () => {
    onSave(entry.id, {
      mood_score: mood,
      notes: notes,
      activities: activities
    })
  }

  const handleDelete = () => {
    onDelete(entry.id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onCancel()}
    >
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-800">Edit Entry</h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
          <div className="text-sm text-gray-500 mt-2">
            {new Date(entry.date).toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })} at {entry.time.slice(0, 5)}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Mood Selection */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mood</h3>
            <div className="grid grid-cols-5 gap-3">
              {moodOptions.map((option) => (
                <motion.button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`p-4 rounded-xl border-2 transition-all ${
                    mood === option.value
                      ? 'border-purple-400 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-3xl mb-2">{option.emoji}</div>
                  <div className="text-xs font-medium text-gray-700">
                    {option.value}
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Activities */}
          <div>
            <ActivitySelector 
              selectedActivities={activities}
              onActivitiesChange={setActivities}
            />
          </div>

          {/* Notes */}
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How was your day? What happened?"
              className="w-full h-32 p-4 border border-gray-200 rounded-xl resize-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-between">
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-6 py-3 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
          >
            🗑️ Delete
          </button>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-60 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-4">Delete Entry?</h3>
              <p className="text-gray-600 mb-6">
                Are you sure you want to delete this mood entry? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

