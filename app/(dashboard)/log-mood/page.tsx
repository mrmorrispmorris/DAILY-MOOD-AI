'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { useMoodData } from '@/hooks/use-mood-data'
import { useFreemiumLimits } from '@/hooks/use-freemium-limits'
import { useAnalytics } from '@/hooks/use-analytics'
// Using simple HTML elements instead of complex UI components
import { Heart, Save, Calendar, Zap } from 'lucide-react'
// Removed ErrorService and toast imports - using simple error handling
// ThemeToggle removed for simplicity

export default function LogMoodPage() {
  const { user, loading } = useAuth()
  const { isFree, loading: subscriptionLoading } = useSubscription()
  const { addMoodEntry } = useMoodData()
  const { 
    canCreateMoodEntry, 
    checkTagLimit, 
    checkNotesLimit,
    getUpgradePrompt,
    remainingMoodEntries,
    limits 
  } = useFreemiumLimits()
  const { trackMoodLogged, trackPage } = useAnalytics()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get date from URL params or use today
  const dateParam = searchParams.get('date')
  const initialDate = dateParam || new Date().toISOString().split('T')[0]
  
  const [moodScore, setMoodScore] = useState(7)
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  
  // Mood emoji mapping
  const moodEmojis = [
    { score: 1, emoji: '😔' }, { score: 2, emoji: '😟' }, { score: 3, emoji: '😕' },
    { score: 4, emoji: '😐' }, { score: 5, emoji: '🙂' }, { score: 6, emoji: '😊' },
    { score: 7, emoji: '😄' }, { score: 8, emoji: '😃' }, { score: 9, emoji: '🤗' }, 
    { score: 10, emoji: '🤩' }
  ]
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(initialDate)

  // Track page visit for analytics
  useEffect(() => {
    trackPage('log-mood')
  }, [])

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  const handleEmojiSelect = (score: number, emoji: string) => {
    setMoodScore(score)
    setSelectedEmoji(emoji)
  }

  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  const handleAddCustomTag = (tag: string) => {
    // Tag logic simplified
  }

  const handleSave = async (moodData: any) => {
    console.log('🔄 LogMoodPage: handleSave called with:', moodData)
    
    // Database connection verified via Supabase client
    
    // Check freemium limits with conversion prompts
    if (!canCreateMoodEntry()) {
      // Show monthly limit reached conversion prompt
      if (typeof window !== 'undefined') {
        window.location.href = '/pricing?trigger=monthly_limit_reached'
      }
      return
    }

    if (checkTagLimit(moodData.tags.length)) {
      // Show tag limit conversion prompt  
      if (typeof window !== 'undefined') {
        window.location.href = '/pricing?trigger=tag_limit'
      }
      return
    }

    if (checkNotesLimit(moodData.notes.length)) {
      // Show notes limit conversion prompt
      if (typeof window !== 'undefined') {
        window.location.href = '/pricing?trigger=notes_limit_hit'
      }
      return
    }

    setSaving(true)
    console.log('🔄 LogMoodPage: Setting saving state to true')
    
    try {
      const entryData = {
        date,
        mood_score: moodData.score,
        emoji: moodData.emoji,
        notes: moodData.notes.trim(),
        tags: moodData.tags
      }
      
      console.log('📝 LogMoodPage: Calling addMoodEntry with:', entryData)
      const result = await addMoodEntry(entryData)
      console.log('📊 LogMoodPage: addMoodEntry result:', result)

      if (result.success) {
        console.log('✅ LogMoodPage: Mood entry saved successfully')
        
        // Track successful mood entry for analytics
        trackMoodLogged(entryData.mood_score, entryData.tags, entryData.notes)
        
        alert('Mood logged successfully! 🎉')
        router.push('/dashboard')
      } else {
        console.error('❌ LogMoodPage: Failed to save mood entry:', result.error)
        alert('Failed to save mood entry: ' + (result.error || 'Unknown error'))
      }
    } catch (error) {
      console.error('💥 LogMoodPage: Exception during save:', error)
      alert('An error occurred while saving your mood. Please try again.')
    } finally {
      setSaving(false)
      console.log('🔄 LogMoodPage: Setting saving state to false')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 pb-20 animate-fade-in">
      {/* Header */}
      <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-calm-blue" />
            <h1 className="text-xl font-bold text-calm-blue">Log Your Mood</h1>
          </div>
          {/* Freemium Usage Indicator */}
          {isFree && (
            <div className="flex items-center space-x-2 text-sm">
              <div className="text-gray-600">
                {remainingMoodEntries > 0 ? (
                  <span className="text-purple-600 font-medium">
                    {remainingMoodEntries} entries left
                  </span>
                ) : (
                  <span className="text-red-600 font-medium">Limit reached</span>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date Selection */}
        <div className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 dark:text-gray-200">When did this happen?</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Select the date for your mood entry</p>
                </div>
              </div>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="px-4 py-3 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 font-medium transition-all duration-200 hover:border-blue-300 dark:hover:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Simple Mood Entry */}
        <div className="border-0 shadow-lg bg-white dark:bg-gray-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold mb-4">How are you feeling?</h3>
          <div className="text-4xl text-center mb-4">{selectedEmoji}</div>
          <div className="text-center text-lg font-medium mb-4">{moodScore}/10</div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={moodScore}
            className="w-full mb-4"
            onChange={(e) => {
              const newScore = Number(e.target.value)
              setMoodScore(newScore)
              const emojiData = moodEmojis.find(m => m.score === newScore)
              setSelectedEmoji(emojiData?.emoji || '😊')
            }}
          />
          <textarea
            placeholder="Add notes about your mood (optional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 border rounded-lg mb-4"
            rows={3}
          />
          <button
            onClick={() => handleSave({ 
              score: moodScore, 
              emoji: selectedEmoji, 
              notes: notes,
              tags: selectedTags 
            })}
            disabled={saving}
            className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Mood'}
          </button>
        </div>

        {/* Quick Actions */}
        <div className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <button
                className="h-12 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </button>
              <button
                className="h-12 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                onClick={() => setDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Yesterday
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom navigation removed for simplicity */}
    </div>
  )
}