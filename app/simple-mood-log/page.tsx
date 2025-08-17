'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { Heart, Save, Calendar } from 'lucide-react'

interface SimpleMoodEntry {
  id: string
  date: string
  mood_score: number
  emoji: string
  notes: string
  tags: string[]
  timestamp: number
}

export default function SimpleMoodLogPage() {
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [entries, setEntries] = useState<SimpleMoodEntry[]>([])
  const [saving, setSaving] = useState(false)

  const moodEmojis = [
    { score: 1, emoji: '😢', label: 'Very Sad' },
    { score: 2, emoji: '😞', label: 'Sad' },
    { score: 3, emoji: '😕', label: 'Down' },
    { score: 4, emoji: '😐', label: 'Neutral' },
    { score: 5, emoji: '🙂', label: 'Okay' },
    { score: 6, emoji: '😊', label: 'Good' },
    { score: 7, emoji: '😄', label: 'Happy' },
    { score: 8, emoji: '😁', label: 'Very Happy' },
    { score: 9, emoji: '🤩', label: 'Excited' },
    { score: 10, emoji: '🥰', label: 'Amazing' },
  ]

  const defaultTags = ['work', 'family', 'exercise', 'social', 'health', 'creativity', 'stress', 'relaxation']

  useEffect(() => {
    // Load existing entries from localStorage
    const stored = localStorage.getItem('dailymood_simple_entries')
    if (stored) {
      try {
        setEntries(JSON.parse(stored))
      } catch (error) {
        console.error('Error loading entries:', error)
      }
    }
  }, [])

  useEffect(() => {
    // Update emoji when mood score changes
    const currentMood = moodEmojis.find(m => m.score === moodScore)
    if (currentMood) {
      setSelectedEmoji(currentMood.emoji)
    }
  }, [moodScore])

  const handleSave = async () => {
    setSaving(true)

    try {
      const newEntry: SimpleMoodEntry = {
        id: `mood-${Date.now()}`,
        date: new Date().toISOString().split('T')[0],
        mood_score: moodScore,
        emoji: selectedEmoji,
        notes: notes.trim(),
        tags: selectedTags,
        timestamp: Date.now()
      }

      const updatedEntries = [newEntry, ...entries]
      setEntries(updatedEntries)
      
      // Save to localStorage
      localStorage.setItem('dailymood_simple_entries', JSON.stringify(updatedEntries))
      
      // Reset form
      setMoodScore(5)
      setSelectedEmoji('😊')
      setNotes('')
      setSelectedTags([])
      
      toast.success('Mood logged successfully! 🎉')
      
    } catch (error) {
      console.error('Error saving mood:', error)
      toast.error('Failed to save mood entry')
    } finally {
      setSaving(false)
    }
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const getMoodColor = (score: number): string => {
    if (score >= 8) return '#10B981' // Green
    if (score >= 6) return '#3B82F6' // Blue
    if (score >= 4) return '#F59E0B' // Yellow
    if (score >= 2) return '#F97316' // Orange
    return '#EF4444' // Red
  }

  const getMoodLabel = (score: number): string => {
    const mood = moodEmojis.find(m => m.score === score)
    return mood?.label || 'Unknown'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Simple Mood Logger</h1>
          <p className="text-gray-600">No database issues - saves locally!</p>
        </div>

        {/* Mood Entry Form */}
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-gray-900">
              How are you feeling right now?
            </CardTitle>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* Emoji Display */}
            <div className="text-center">
              <div 
                className="text-8xl mb-4 transition-all duration-300 hover:scale-110 cursor-pointer"
                style={{ color: getMoodColor(moodScore) }}
              >
                {selectedEmoji}
              </div>
              <div className="text-2xl font-bold text-gray-800 mb-2">
                {getMoodLabel(moodScore)}
              </div>
              <div className="text-lg text-gray-600">
                {moodScore}/10
              </div>
            </div>

            {/* Mood Slider */}
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Mood Level
              </label>
              <div className="px-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={moodScore}
                  onChange={(e) => setMoodScore(parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                  style={{
                    background: `linear-gradient(to right, #EF4444 0%, #F97316 25%, #F59E0B 50%, #3B82F6 75%, #10B981 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>Very Sad</span>
                  <span>Amazing</span>
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Tags (Optional)
              </label>
              <div className="flex flex-wrap gap-2">
                {defaultTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer transition-all duration-200 ${
                      selectedTags.includes(tag) 
                        ? 'bg-blue-600 text-white hover:bg-blue-700' 
                        : 'hover:bg-blue-100'
                    }`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Notes (Optional)
              </label>
              <Textarea
                placeholder="How was your day? What's on your mind?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 text-lg font-semibold"
            >
              {saving ? (
                <>Saving...</>
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Mood Entry
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Recent Entries */}
        {entries.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Recent Entries ({entries.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {entries.slice(0, 10).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{entry.emoji}</span>
                      <div>
                        <div className="font-medium">{entry.mood_score}/10</div>
                        <div className="text-sm text-gray-500">{entry.date}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 mb-1">
                          {entry.tags.slice(0, 3).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {entry.notes && (
                        <div className="text-sm text-gray-600 max-w-48 truncate">
                          {entry.notes}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
