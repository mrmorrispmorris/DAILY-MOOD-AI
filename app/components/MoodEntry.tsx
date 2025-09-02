'use client'
import { useState } from 'react'
// Using elegant symbols instead of Lucide icons for consistency

const moodEmojis = [
  { value: 10, emoji: ':)', label: 'rad', color: '#4ADE80' }, // Green - happy
  { value: 8, emoji: ':)', label: 'good', color: '#FCD34D' }, // Yellow - good  
  { value: 5, emoji: ':|', label: 'meh', color: '#FB923C' }, // Orange/peach - meh
  { value: 3, emoji: ':(', label: 'bad', color: '#F87171' }, // Red - bad
  { value: 1, emoji: ';(', label: 'awful', color: '#9CA3AF' } // Gray - awful
]

const activities = [
  { id: 'work', icon: '◼', label: 'Work' },
  { id: 'exercise', icon: '◆', label: 'Exercise' },
  { id: 'social', icon: '◗', label: 'Social' },
  { id: 'family', icon: '◈', label: 'Family' },
  { id: 'relax', icon: '◯', label: 'Relax' },
  { id: 'hobby', icon: '◐', label: 'Hobby' },
  { id: 'food', icon: '◑', label: 'Food' },
  { id: 'travel', icon: '◒', label: 'Travel' }
]

interface MoodEntryProps {
  onSuccess?: () => void | Promise<void>
}

export default function MoodEntry({ onSuccess }: MoodEntryProps = {}) {
  const [step, setStep] = useState(1)
  const [selectedMood, setSelectedMood] = useState(6)
  const [selectedActivities, setSelectedActivities] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  
  if (step === 1) {
    return (
      <div className="space-y-4">
        <p className="text-center text-gray-600">Tap on the mood that matches how you're feeling</p>
        <div className="grid grid-cols-5 gap-2">
          {moodEmojis.map((mood) => (
            <button
              key={mood.value}
              onClick={() => {
                setSelectedMood(mood.value)
                setStep(2)
              }}
              className="flex flex-col items-center p-3 rounded-xl hover:bg-purple-50 transition-colors"
            >
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center mb-1"
                style={{ backgroundColor: mood.color }}
              >
                <span className="text-xl font-bold text-white" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>{mood.emoji}</span>
              </div>
              <span className="text-xs text-gray-600">{mood.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  if (step === 2) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={() => setStep(1)} className="text-purple-600">← Back</button>
          <p className="text-gray-600">What did you do?</p>
          <button onClick={() => setStep(3)} className="text-purple-600">Next →</button>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {activities.map((activity) => (
            <button
              key={activity.id}
              onClick={() => {
                setSelectedActivities(prev =>
                  prev.includes(activity.id)
                    ? prev.filter(a => a !== activity.id)
                    : [...prev, activity.id]
                )
              }}
              className={`flex flex-col items-center p-3 rounded-xl border-2 transition-all ${
                selectedActivities.includes(activity.id)
                  ? 'border-purple-600 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <span className="text-2xl mb-1 font-light" style={{ color: 'var(--brand-tertiary)' }}>{activity.icon}</span>
              <span className="text-xs">{activity.label}</span>
            </button>
          ))}
        </div>
      </div>
    )
  }
  
  if (step === 3) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <button onClick={() => setStep(2)} className="text-purple-600">← Back</button>
          <p className="text-gray-600">Add notes (optional)</p>
          <button className="text-purple-600">Done ✓</button>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How was your day? Any thoughts to remember?"
          className="w-full p-3 border border-gray-200 rounded-lg resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-600"
        />
        <div className="flex gap-2">
          <button className="flex-1 py-2 px-4 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
            <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>○</span>
            <span className="text-sm">Add Photo</span>
          </button>
          <button className="flex-1 py-2 px-4 border border-gray-200 rounded-lg flex items-center justify-center gap-2 hover:bg-gray-50">
            <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>◆</span>
            <span className="text-sm">Add Location</span>
          </button>
        </div>
      </div>
    )
  }
  
  return null
}