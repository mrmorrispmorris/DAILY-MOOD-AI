'use client'

import { cn } from '@/lib/utils'
import { useState } from 'react'

const moodEmojis = [
  // Very Low Moods (1-3)
  { emoji: '😢', label: 'Devastated', score: 1, color: 'bg-red-100 border-red-300', category: 'very-low' },
  { emoji: '😭', label: 'Crying', score: 1, color: 'bg-red-100 border-red-300', category: 'very-low' },
  { emoji: '😞', label: 'Very Sad', score: 2, color: 'bg-red-50 border-red-200', category: 'very-low' },
  { emoji: '😔', label: 'Sad', score: 2, color: 'bg-red-50 border-red-200', category: 'very-low' },
  { emoji: '😕', label: 'Down', score: 3, color: 'bg-orange-50 border-orange-200', category: 'low' },
  { emoji: '😟', label: 'Worried', score: 3, color: 'bg-orange-50 border-orange-200', category: 'low' },
  { emoji: '😰', label: 'Anxious', score: 2, color: 'bg-red-50 border-red-200', category: 'very-low' },
  { emoji: '😨', label: 'Fearful', score: 2, color: 'bg-red-50 border-red-200', category: 'very-low' },
  { emoji: '😩', label: 'Tired', score: 3, color: 'bg-orange-50 border-orange-200', category: 'low' },
  { emoji: '😫', label: 'Frustrated', score: 3, color: 'bg-orange-50 border-orange-200', category: 'low' },
  
  // Neutral Moods (4-6)
  { emoji: '😐', label: 'Neutral', score: 4, color: 'bg-gray-50 border-gray-200', category: 'neutral' },
  { emoji: '😶', label: 'Blank', score: 4, color: 'bg-gray-50 border-gray-200', category: 'neutral' },
  { emoji: '🙂', label: 'Okay', score: 5, color: 'bg-yellow-50 border-yellow-200', category: 'neutral' },
  { emoji: '😊', label: 'Good', score: 6, color: 'bg-yellow-100 border-yellow-300', category: 'neutral' },
  { emoji: '🙃', label: 'Silly', score: 6, color: 'bg-yellow-100 border-yellow-300', category: 'neutral' },
  { emoji: '😴', label: 'Sleepy', score: 4, color: 'bg-gray-50 border-gray-200', category: 'neutral' },
  { emoji: '🤔', label: 'Thinking', score: 5, color: 'bg-yellow-50 border-yellow-200', category: 'neutral' },
  { emoji: '😏', label: 'Smirking', score: 6, color: 'bg-yellow-100 border-yellow-300', category: 'neutral' },
  { emoji: '😌', label: 'Peaceful', score: 6, color: 'bg-yellow-100 border-yellow-300', category: 'neutral' },
  { emoji: '🤨', label: 'Skeptical', score: 5, color: 'bg-yellow-50 border-yellow-200', category: 'neutral' },
  
  // Positive Moods (7-9)
  { emoji: '😄', label: 'Happy', score: 7, color: 'bg-green-50 border-green-200', category: 'positive' },
  { emoji: '😁', label: 'Very Happy', score: 8, color: 'bg-green-100 border-green-300', category: 'positive' },
  { emoji: '🤩', label: 'Excited', score: 9, color: 'bg-blue-50 border-blue-200', category: 'positive' },
  { emoji: '🥳', label: 'Ecstatic', score: 10, color: 'bg-purple-50 border-purple-200', category: 'positive' },
  { emoji: '😇', label: 'Blessed', score: 8, color: 'bg-green-100 border-green-300', category: 'positive' },
  { emoji: '🤗', label: 'Hugging', score: 8, color: 'bg-green-100 border-green-300', category: 'positive' },
  { emoji: '😎', label: 'Cool', score: 7, color: 'bg-blue-50 border-blue-200', category: 'positive' },
  { emoji: '🤠', label: 'Cowboy', score: 7, color: 'bg-blue-50 border-blue-200', category: 'positive' },
  { emoji: '🧘', label: 'Zen', score: 8, color: 'bg-green-100 border-green-300', category: 'positive' },
  { emoji: '🤓', label: 'Nerdy', score: 7, color: 'bg-blue-50 border-blue-200', category: 'positive' },
  
  // Special Moods (Bonus Options)
  { emoji: '💪', label: 'Strong', score: 8, color: 'bg-green-100 border-green-300', category: 'positive' },
  { emoji: '🔥', label: 'On Fire', score: 9, color: 'bg-orange-100 border-orange-300', category: 'positive' },
  { emoji: '⭐', label: 'Star', score: 9, color: 'bg-yellow-100 border-yellow-300', category: 'positive' },
  { emoji: '🌈', label: 'Magical', score: 8, color: 'bg-purple-100 border-purple-300', category: 'positive' },
  { emoji: '🎉', label: 'Celebrating', score: 9, color: 'bg-purple-100 border-purple-300', category: 'positive' },
  { emoji: '💎', label: 'Precious', score: 8, color: 'bg-blue-100 border-blue-300', category: 'positive' },
  { emoji: '🌺', label: 'Blooming', score: 7, color: 'bg-pink-100 border-pink-300', category: 'positive' },
  { emoji: '🌊', label: 'Flowing', score: 7, color: 'bg-blue-100 border-blue-300', category: 'positive' },
  { emoji: '🌞', label: 'Sunny', score: 8, color: 'bg-yellow-100 border-yellow-300', category: 'positive' },
  { emoji: '🦋', label: 'Free', score: 8, color: 'bg-purple-100 border-purple-300', category: 'positive' },
  
  // Activity-Based Moods
  { emoji: '🏃', label: 'Energetic', score: 8, color: 'bg-green-100 border-green-300', category: 'positive' },
  { emoji: '💃', label: 'Dancing', score: 8, color: 'bg-purple-100 border-purple-300', category: 'positive' },
  { emoji: '🎵', label: 'Musical', score: 7, color: 'bg-blue-100 border-blue-300', category: 'positive' },
  { emoji: '📚', label: 'Learning', score: 7, color: 'bg-blue-100 border-blue-300', category: 'positive' },
  { emoji: '🎨', label: 'Creative', score: 8, color: 'bg-purple-100 border-purple-300', category: 'positive' },
  { emoji: '🍕', label: 'Satisfied', score: 7, color: 'bg-orange-100 border-orange-300', category: 'positive' },
  { emoji: '☕', label: 'Cozy', score: 6, color: 'bg-brown-100 border-brown-300', category: 'neutral' },
  { emoji: '🛁', label: 'Relaxed', score: 7, color: 'bg-blue-100 border-blue-300', category: 'positive' },
  { emoji: '🛏️', label: 'Comfortable', score: 6, color: 'bg-gray-100 border-gray-300', category: 'neutral' },
  { emoji: '🚗', label: 'Adventurous', score: 7, color: 'bg-blue-100 border-blue-300', category: 'positive' },
]

interface EmojiPickerProps {
  selectedScore: number
  onSelect: (score: number, emoji: string) => void
  showCategories?: boolean
}

export function EmojiPicker({ selectedScore, onSelect, showCategories = true }: EmojiPickerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  const categories = [
    { id: 'all', label: 'All Moods', emoji: '🌈' },
    { id: 'very-low', label: 'Very Low', emoji: '😢' },
    { id: 'low', label: 'Low', emoji: '😕' },
    { id: 'neutral', label: 'Neutral', emoji: '😐' },
    { id: 'positive', label: 'Positive', emoji: '😊' },
  ]
  
  const filteredEmojis = selectedCategory === 'all' 
    ? moodEmojis 
    : moodEmojis.filter(emoji => emoji.category === selectedCategory)

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800 text-center">
        How are you feeling?
      </h3>
      
      {/* Category Filter */}
      {showCategories && (
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={cn(
                'flex items-center space-x-2 px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
                selectedCategory === category.id
                  ? 'bg-primary text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              )}
            >
              <span>{category.emoji}</span>
              <span className="hidden sm:inline">{category.label}</span>
            </button>
          ))}
        </div>
      )}
      
      {/* Emoji Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 gap-3">
        {filteredEmojis.map(({ emoji, label, score, color }) => (
          <button
            key={score}
            onClick={() => onSelect(score, emoji)}
            className={cn(
              'flex flex-col items-center p-3 rounded-xl border-2 transition-all duration-200 hover:scale-105 hover:shadow-md',
              selectedScore === score 
                ? 'border-primary bg-primary/10 shadow-md scale-105' 
                : color
            )}
            title={`${label} (${score}/10)`}
          >
            <span className="text-2xl mb-1">{emoji}</span>
            <span className="text-xs font-medium text-gray-600">{score}</span>
          </button>
        ))}
      </div>
      
      {/* Selected Mood Display */}
      {selectedScore > 0 && (
        <div className="text-center animate-fade-in">
          <div className="text-4xl mb-2">{moodEmojis.find(m => m.score === selectedScore)?.emoji}</div>
          <p className="text-sm text-gray-600">
            Selected: <span className="font-semibold">{moodEmojis.find(m => m.score === selectedScore)?.label}</span>
          </p>
          <p className="text-xs text-gray-500">Score: {selectedScore}/10</p>
        </div>
      )}
    </div>
  )
}