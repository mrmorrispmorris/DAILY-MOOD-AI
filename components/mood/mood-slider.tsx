'use client'

import { useState, useEffect } from 'react'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmojiPicker } from './emoji-picker'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Tag, MessageSquare } from 'lucide-react'
import { VoiceInput } from '@/components/ui/voice-input'

interface MoodSliderProps {
  onSave: (moodData: MoodData) => void
  isLoading?: boolean
}

interface MoodData {
  score: number
  emoji: string
  notes: string
  tags: string[]
  timeOfDay: string
  weather?: string
}

const timeOfDayOptions = ['morning', 'afternoon', 'evening', 'night']
const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy', 'windy']
const defaultTags = ['work', 'family', 'exercise', 'social', 'health', 'creativity']

export function MoodSlider({ onSave, isLoading = false }: MoodSliderProps) {
  const [moodScore, setMoodScore] = useState(5)
  const [selectedEmoji, setSelectedEmoji] = useState('😊')
  const [notes, setNotes] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [timeOfDay, setTimeOfDay] = useState('afternoon')
  const [weather, setWeather] = useState<string>('')
  const [showEmojiPicker, setShowEmojiPicker] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  // Get mood color based on score
  const getMoodColor = (score: number): string => {
    if (score >= 8) return '#10B981' // Green
    if (score >= 6) return '#3B82F6' // Blue
    if (score >= 4) return '#F59E0B' // Yellow
    if (score >= 2) return '#F97316' // Orange
    return '#EF4444' // Red
  }

  // Get mood label based on score
  const getMoodLabel = (score: number): string => {
    if (score >= 9) return 'Ecstatic'
    if (score >= 8) return 'Very Happy'
    if (score >= 7) return 'Happy'
    if (score >= 6) return 'Good'
    if (score >= 5) return 'Okay'
    if (score >= 4) return 'Neutral'
    if (score >= 3) return 'Down'
    if (score >= 2) return 'Sad'
    return 'Very Sad'
  }

  // Animate emoji when score changes
  useEffect(() => {
    setIsAnimating(true)
    const timer = setTimeout(() => setIsAnimating(false), 300)
    return () => clearTimeout(timer)
  }, [moodScore])

  const handleSave = () => {
    const moodData: MoodData = {
      score: moodScore,
      emoji: selectedEmoji,
      notes,
      tags: selectedTags,
      timeOfDay,
      weather
    }
    onSave(moodData)
  }

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold text-gray-900">
          How are you feeling right now?
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Big Animated Emoji Display */}
        <div className="text-center">
          <div 
            className={`text-9xl mb-6 transition-all duration-500 ease-out ${
              isAnimating ? 'scale-150 rotate-12' : 'scale-100 rotate-0'
            } hover:scale-110 cursor-pointer`}
            style={{ color: getMoodColor(moodScore) }}
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            role="button"
            tabIndex={0}
            aria-label={`Current mood: ${getMoodLabel(moodScore)} with emoji ${selectedEmoji}`}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                setShowEmojiPicker(!showEmojiPicker)
              }
            }}
          >
            {selectedEmoji}
          </div>
          <div className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-3 animate-fade-in">
            {getMoodLabel(moodScore)}
          </div>
          <div className="text-xl text-gray-600 dark:text-gray-400 font-medium">
            Score: {moodScore}/10
          </div>
          {/* Mood indicator bar */}
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
            <div 
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${(moodScore / 10) * 100}%`,
                backgroundColor: getMoodColor(moodScore)
              }}
            />
          </div>
        </div>

        {/* Mood Score Slider */}
        <div className="space-y-4">
          <Label className="text-lg font-semibold flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 text-sm">🎯</span>
            </div>
            Mood Score
          </Label>
          <div className="px-4">
            <Slider
              value={[moodScore]}
              onValueChange={(value) => setMoodScore(value[0])}
              max={10}
              min={1}
              step={1}
              className="w-full"
              style={{
                '--thumb-color': getMoodColor(moodScore),
                '--track-color': getMoodColor(moodScore)
              } as React.CSSProperties}
              aria-label="Mood score slider"
            />
          </div>
          <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
            <span className="flex items-center gap-1">
              <span className="text-lg">😢</span>
              <span className="hidden sm:inline">Very Low</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-lg">😐</span>
              <span className="hidden sm:inline">Neutral</span>
            </span>
            <span className="flex items-center gap-1">
              <span className="text-lg">🥳</span>
              <span className="hidden sm:inline">Very High</span>
            </span>
          </div>
        </div>

        {/* Emoji Picker */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-lg font-semibold flex items-center gap-2">
              <div className="w-6 h-6 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                <span className="text-purple-600 dark:text-purple-400 text-sm">😊</span>
              </div>
              Choose Emoji
            </Label>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="transition-all duration-200 hover:scale-105"
            >
              {showEmojiPicker ? 'Hide' : 'Customize'} Emoji
            </Button>
          </div>
          
          {showEmojiPicker && (
            <div className="border-2 border-purple-200 dark:border-purple-700 rounded-xl p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 animate-fade-in">
              <EmojiPicker
                selectedScore={moodScore}
                onSelect={(score, emoji) => {
                  setMoodScore(score)
                  setSelectedEmoji(emoji)
                }}
                showCategories={true}
              />
            </div>
          )}
        </div>

        {/* Time and Weather */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <Clock className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              Time of Day
            </Label>
            <div className="flex flex-wrap gap-2">
              {timeOfDayOptions.map((time) => (
                <Button
                  key={time}
                  variant={timeOfDay === time ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTimeOfDay(time)}
                  className="capitalize h-10 px-4 transition-all duration-200 hover:scale-105"
                  aria-pressed={timeOfDay === time}
                >
                  {time}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <div className="w-6 h-6 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                <Calendar className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
              </div>
              Weather
            </Label>
            <div className="flex flex-wrap gap-2">
              {weatherOptions.map((w) => (
                <Button
                  key={w}
                  variant={weather === w ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setWeather(w === weather ? '' : w)}
                  className="capitalize h-10 px-4 transition-all duration-200 hover:scale-105"
                  aria-pressed={weather === w}
                >
                  {w}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <div className="w-6 h-6 bg-orange-100 dark:bg-orange-900/30 rounded-full flex items-center justify-center">
              <Tag className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
            Tags
          </Label>
          <div className="flex flex-wrap gap-2">
            {defaultTags.map((tag) => (
              <Badge
                key={tag}
                variant={selectedTags.includes(tag) ? 'default' : 'outline'}
                className={`cursor-pointer hover:scale-105 transition-all duration-200 h-8 px-3 text-sm ${
                  selectedTags.includes(tag) 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'hover:bg-primary/10 border-primary/30'
                }`}
                onClick={() => toggleTag(tag)}
                role="button"
                tabIndex={0}
                aria-pressed={selectedTags.includes(tag)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    toggleTag(tag)
                  }
                }}
              >
                {tag}
              </Badge>
            ))}
          </div>
        </div>

        {/* Notes with Voice Input */}
        <div className="space-y-3">
          <Label className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
            Notes (Optional)
          </Label>
          <div className="space-y-3">
            <Textarea
              placeholder="How was your day? What's on your mind?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="min-h-[120px] resize-none text-base leading-relaxed p-4 border-2 border-blue-200 dark:border-blue-700 rounded-xl focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 focus:border-blue-500 dark:focus:border-blue-400 transition-all duration-200 placeholder:text-gray-500 dark:placeholder:text-gray-400"
              aria-label="Mood notes input"
            />
            {/* Voice Input - Separate component below textarea */}
            <div className="flex items-center justify-center">
              <VoiceInput
                onTranscript={(text) => setNotes(prev => prev + (prev ? ' ' : '') + text)}
                placeholder="🎤 Click to add voice notes"
                className="w-full max-w-sm"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={handleSave}
          disabled={isLoading}
          className="w-full h-14 text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:transform-none disabled:scale-100"
          >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Saving...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>💾</span>
              Save Mood Entry
            </div>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}