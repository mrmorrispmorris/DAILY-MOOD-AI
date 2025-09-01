'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ActivitySelector from './ActivitySelector'

interface EnhancedMoodEntryProps {
  onMoodSave: (mood: number, notes: string, activities?: string[], photos?: string[]) => void
}

export default function EnhancedMoodEntry({ onMoodSave }: EnhancedMoodEntryProps) {
  const [selectedMood, setSelectedMood] = useState<number | null>(null)
  const [notes, setNotes] = useState('')
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [step, setStep] = useState<'mood' | 'activities' | 'notes' | 'confirm'>('mood')
  
  // FORCE LOG TO CHECK STEP STATE
  console.log('📝 EnhancedMoodEntry step:', step)
  const [saving, setSaving] = useState(false)

  const moodOptions = [
    { value: 10, emoji: '🤩', label: 'Amazing', color: 'from-emerald-500 to-green-600', description: 'Life is perfect!' },
    { value: 9, emoji: '😊', label: 'Great', color: 'from-green-400 to-emerald-500', description: 'Feeling fantastic' },
    { value: 8, emoji: '🙂', label: 'Good', color: 'from-lime-400 to-green-400', description: 'Pretty good day' },
    { value: 7, emoji: '😌', label: 'Fine', color: 'from-yellow-300 to-lime-400', description: 'Everything is okay' },
    { value: 6, emoji: '😐', label: 'Okay', color: 'from-yellow-400 to-yellow-300', description: 'Just an average day' },
    { value: 5, emoji: '🫤', label: 'Meh', color: 'from-orange-300 to-yellow-400', description: 'Could be better' },
    { value: 4, emoji: '😕', label: 'Not Great', color: 'from-orange-400 to-orange-300', description: 'Having some struggles' },
    { value: 3, emoji: '🙁', label: 'Bad', color: 'from-red-300 to-orange-400', description: 'Not a good day' },
    { value: 2, emoji: '😞', label: 'Rough', color: 'from-red-400 to-red-300', description: 'Really difficult day' },
    { value: 1, emoji: '😢', label: 'Terrible', color: 'from-red-600 to-red-400', description: 'Everything feels wrong' }
  ]

  const selectedMoodData = moodOptions.find(m => m.value === selectedMood)

  const handleMoodSelect = (mood: number) => {
    setSelectedMood(mood)
    setTimeout(() => {
      setStep('activities')
    }, 500)
  }

  const handleActivitiesComplete = () => {
    setStep('notes')
  }

  const handleNotesComplete = () => {
    setStep('confirm')
  }

  const handleSave = async () => {
    if (!selectedMood) return
    
    setSaving(true)
    try {
      await onMoodSave(selectedMood, notes, selectedActivities)
      
      // Reset form
      setSelectedMood(null)
      setNotes('')
      setSelectedActivities([])
      setStep('mood')
    } catch (error) {
      console.error('Failed to save mood:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBack = () => {
    if (step === 'activities') {
      setStep('mood')
    } else if (step === 'notes') {
      setStep('activities')
    } else if (step === 'confirm') {
      setStep('notes')
    }
  }

  return (
    <div className="bg-gradient-to-br from-white/95 to-white/85 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/60 overflow-hidden">
      {/* Header */}
      <div className={`p-8 transition-all duration-700 ${
        selectedMoodData 
          ? `bg-gradient-to-r ${selectedMoodData.color}` 
          : 'bg-gradient-to-r from-purple-600 to-blue-700'
      }`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              {step === 'mood' && '🎭 How are you feeling?'}
              {step === 'activities' && '🎯 What did you do?'}
              {step === 'notes' && '📝 Tell us more'}
              {step === 'confirm' && '✨ Ready to save?'}
            </h2>
            <p className="text-white/90">
              {step === 'mood' && 'Choose the mood that best describes how you feel right now'}
              {step === 'activities' && 'Select activities that might have influenced your mood (optional)'}
              {step === 'notes' && 'Add any thoughts or details about your day (optional)'}
              {step === 'confirm' && 'Review your mood entry before saving'}
            </p>
          </div>
          
          {step !== 'mood' && (
            <button
              onClick={handleBack}
              className="bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6">
          <div className="w-full bg-white/20 rounded-full h-2">
            <motion.div
              className="bg-white h-2 rounded-full"
              initial={{ width: '0%' }}
              animate={{ 
                width: step === 'mood' ? '25%' : step === 'activities' ? '50%' : step === 'notes' ? '75%' : '100%' 
              }}
              transition={{ duration: 0.5 }}
            />
          </div>
          <div className="flex justify-between mt-2 text-white/80 text-sm">
            <span className={step === 'mood' ? 'text-white font-semibold' : ''}>Mood</span>
            <span className={step === 'activities' ? 'text-white font-semibold' : ''}>Activities</span>
            <span className={step === 'notes' ? 'text-white font-semibold' : ''}>Notes</span>
            <span className={step === 'confirm' ? 'text-white font-semibold' : ''}>Done</span>
          </div>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {/* Step 1: Mood Selection */}
          {step === 'mood' && (
            <motion.div
              key="mood"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4"
            >
              <div className="text-center mb-8">
                <p className="text-gray-600 text-lg">
                  Tap on the mood that matches how you're feeling
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {moodOptions.map((mood, index) => (
                  <motion.button
                    key={mood.value}
                    onClick={() => handleMoodSelect(mood.value)}
                    className={`p-6 rounded-2xl border-2 transition-all duration-300 hover:scale-105 ${
                      selectedMood === mood.value
                        ? `border-purple-500 bg-gradient-to-br ${mood.color} text-white shadow-xl`
                        : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-lg'
                    }`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{mood.emoji}</div>
                      <div className={`font-bold text-lg mb-1 ${
                        selectedMood === mood.value ? 'text-white' : 'text-gray-800'
                      }`}>
                        {mood.label}
                      </div>
                      <div className={`text-sm ${
                        selectedMood === mood.value ? 'text-white/80' : 'text-gray-500'
                      }`}>
                        {mood.value}/10
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Activities */}
          {step === 'activities' && (
            <motion.div
              key="activities"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedMoodData && (
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r ${selectedMoodData.color} text-white shadow-lg`}>
                    <span className="text-4xl">{selectedMoodData.emoji}</span>
                    <div>
                      <div className="text-xl font-bold">{selectedMoodData.label}</div>
                      <div className="text-sm opacity-90">{selectedMoodData.description}</div>
                    </div>
                  </div>
                </div>
              )}

              <ActivitySelector 
                selectedActivities={selectedActivities}
                onActivitiesChange={setSelectedActivities}
              />

              <div className="flex justify-center">
                <button
                  onClick={handleActivitiesComplete}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                    selectedMoodData
                      ? `bg-gradient-to-r ${selectedMoodData.color} text-white hover:shadow-xl`
                      : 'bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-xl'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Notes */}
          {step === 'notes' && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {selectedMoodData && (
                <div className="text-center mb-8">
                  <div className={`inline-flex items-center gap-4 px-8 py-4 rounded-2xl bg-gradient-to-r ${selectedMoodData.color} text-white shadow-lg`}>
                    <span className="text-4xl">{selectedMoodData.emoji}</span>
                    <div>
                      <div className="text-xl font-bold">{selectedMoodData.label}</div>
                      <div className="text-sm opacity-90">{selectedMoodData.description}</div>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  What's on your mind? (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Share what happened today, how you're feeling, or anything else you'd like to remember..."
                  rows={6}
                  className="w-full px-6 py-4 border-2 border-gray-200 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-200 transition-all text-gray-700 text-lg leading-relaxed resize-none"
                />
              </div>

              <div className="flex justify-center">
                <button
                  onClick={handleNotesComplete}
                  className={`px-8 py-4 rounded-xl font-bold text-lg transition-all shadow-lg ${
                    selectedMoodData
                      ? `bg-gradient-to-r ${selectedMoodData.color} text-white hover:shadow-xl`
                      : 'bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-xl'
                  }`}
                >
                  Continue →
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Confirmation */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-4">Review Your Entry</h3>
                <p className="text-gray-600">Make sure everything looks good before saving</p>
              </div>

              {selectedMoodData && (
                <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
                  <div className="flex items-center justify-center gap-6 mb-6">
                    <div className={`w-24 h-24 rounded-full bg-gradient-to-br ${selectedMoodData.color} flex items-center justify-center text-4xl shadow-xl`}>
                      {selectedMoodData.emoji}
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-800">{selectedMoodData.label}</div>
                      <div className="text-lg text-gray-600">{selectedMoodData.value}/10</div>
                      <div className="text-sm text-gray-500 mt-1">{selectedMoodData.description}</div>
                    </div>
                  </div>

                  {selectedActivities.length > 0 && (
                    <div className="bg-white rounded-xl p-6 border border-gray-100 mb-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Your Activities:</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedActivities.map(activity => (
                          <span
                            key={activity}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium capitalize"
                          >
                            {activity.replace('-', ' ')}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {notes && (
                    <div className="bg-white rounded-xl p-6 border border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-3">Your Notes:</h4>
                      <p className="text-gray-700 leading-relaxed italic">"{notes}"</p>
                    </div>
                  )}

                  <div className="text-center text-sm text-gray-500 mt-6">
                    📅 {new Date().toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-center gap-4">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className={`px-12 py-4 rounded-xl font-bold text-lg transition-all shadow-xl ${
                    selectedMoodData
                      ? `bg-gradient-to-r ${selectedMoodData.color} text-white hover:shadow-2xl disabled:opacity-70`
                      : 'bg-gradient-to-r from-purple-600 to-blue-700 text-white hover:shadow-2xl disabled:opacity-70'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    '✨ Save My Mood'
                  )}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
