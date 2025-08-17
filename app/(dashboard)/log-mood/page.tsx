'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { useMoodData } from '@/hooks/use-mood-data'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { BottomNav } from '@/components/ui/bottom-nav'
import { EmojiPicker } from '@/components/mood/emoji-picker'
import { MoodSlider } from '@/components/mood/mood-slider'
import { CustomTagInput } from '@/components/mood/custom-tag-input'
import { Heart, Save, Calendar, Zap } from 'lucide-react'
import { ErrorService } from '@/lib/error-handling/error-service'
import { toast } from 'sonner'
import { ThemeToggle } from '@/components/ui/theme-toggle'

export default function LogMoodPage() {
  const { user, loading } = useAuth()
  const { isFree, loading: subscriptionLoading } = useSubscription()
  const { addMoodEntry } = useMoodData()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get date from URL params or use today
  const dateParam = searchParams.get('date')
  const initialDate = dateParam || new Date().toISOString().split('T')[0]
  
  const [moodScore, setMoodScore] = useState(7)
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [date, setDate] = useState(initialDate)

  if (loading || subscriptionLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
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
    // Custom tag logic is handled in the CustomTagInput component
  }

  const handleSave = async (moodData: any) => {
    console.log('🔄 LogMoodPage: handleSave called with:', moodData)
    
    // DEBUG: Test database connection first
    console.log('🔍 LogMoodPage: Testing database connection before save...')
    try {
      const { moodService } = await import('@/lib/supabase/mood-service')
      const testResult = await moodService.testDatabaseConnection()
      console.log('🔍 Database Connection Test Result:', testResult)
    } catch (testError) {
      console.error('💥 Database connection test failed:', testError)
    }
    
    // Check free tier limits
    if (isFree && moodData.tags.length > 3) {
      console.log('⚠️ LogMoodPage: Free tier tag limit exceeded')
      ErrorService.showError(new Error('Free users can select up to 3 tags. Upgrade to Premium for unlimited tags!'), 'Premium Feature')
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
        toast.success('Mood logged successfully! 🎉')
        router.push('/dashboard')
      } else {
        console.error('❌ LogMoodPage: Failed to save mood entry:', result.error)
        ErrorService.showError(new Error(result.error || 'Failed to save mood entry'), 'Mood Logging')
      }
    } catch (error) {
      console.error('💥 LogMoodPage: Exception during save:', error)
      ErrorService.showError(error, 'Mood Logging')
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
          {/* Theme Toggle */}
          <div className="flex items-center space-x-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Date Selection */}
        <Card className="border-0 shadow-lg bg-white/80 dark:bg-gray-800/80 backdrop-blur-md">
          <CardContent className="p-6">
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
          </CardContent>
        </Card>

        {/* Enhanced Mood Slider with All Features */}
        <MoodSlider
          onSave={handleSave}
          isLoading={saving}
        />

        {/* Quick Actions */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-600" />
              Quick Actions
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 border-green-200 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-50 dark:hover:bg-green-900/20 transition-all duration-200"
                onClick={() => setDate(new Date().toISOString().split('T')[0])}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Today
              </Button>
              <Button
                variant="outline"
                className="h-12 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-200"
                onClick={() => setDate(new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0])}
              >
                <Calendar className="h-4 w-4 mr-2" />
                Yesterday
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  )
}