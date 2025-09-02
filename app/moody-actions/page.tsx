'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import MoodyAvatar from '../components/avatar/MoodyAvatar'
import MoodyChat from '../components/moody/MoodyChat'

export default function MoodyActionsPage() {
  const router = useRouter()
  const [selectedQuote, setSelectedQuote] = useState<string>('')
  const [isChatOpen, setIsChatOpen] = useState(false)
  
  // PERSONALIZATION: Real user data integration
  // TODO: Replace with actual user context and database queries
  const currentMood = 1 // Would come from: latest mood_entries.mood_score
  const userName = 'Ben' // Would come from: user.email.split('@')[0] or user.display_name
  const userEmail = 'benm@cecontractors.com.au' // Would come from: user.email
  const userStreak = 7 // Would come from: calculateConsecutiveDays(mood_entries)
  const lastMoodEntry = '2 hours ago' // Would come from: formatTimeAgo(latest_mood_entry.created_at)
  
  // Example database queries that would replace static values:
  // const { data: latestMood } = await supabase.from('mood_entries').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
  // const { data: moodEntries } = await supabase.from('mood_entries').select('created_at').eq('user_id', user.id).order('created_at')
  // const streak = calculateConsecutiveDays(moodEntries)
  // const lastEntry = formatTimeAgo(latestMood[0]?.created_at)

  const inspirationalQuotes = [
    "Every small step counts! 🌱",
    "You're stronger than you think 💪",
    "Progress, not perfection ✨",
    "Your mental health matters 💙",
    "Take it one breath at a time 🌸",
    "You've got this! 🌟",
    "Healing isn't linear 🌈",
    "Be gentle with yourself today 🤗",
    "Today is a fresh start 🌅",
    "Your feelings are valid 💜",
    "You are worthy of love and kindness ❤️",
    "This too shall pass 🕊️"
  ]

  const getRandomQuote = () => {
    const quote = inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]
    setSelectedQuote(quote)
  }

  const handleAction = (action: string) => {
    switch (action) {
      case 'log-mood':
        router.push('/log-mood')
        break
      case 'statistics':
        router.push('/analytics-dashboard')
        break
      case 'calendar':
        router.push('/calendar-view')
        break
      case 'quote':
        getRandomQuote()
        break
      case 'chat':
        setIsChatOpen(true)
        break
      case 'goals':
        router.push('/goals-dashboard')
        break
    }
  }

  const getMoodGreeting = () => {
    if (currentMood <= 2) return `I'm here for you, ${userName}. You're incredibly brave for reaching out 💙`
    if (currentMood <= 4) return `Hey ${userName}, let's work through this together. You've got a ${userStreak}-day streak! 🤗`
    if (currentMood <= 6) return `Hi ${userName}! I see you logged ${lastMoodEntry}. Ready for some self-care? 🌱`
    if (currentMood <= 8) return `${userName}! Your ${userStreak}-day streak is amazing. What's your goal today? ✨`
    return `${userName}, you're absolutely glowing today! Your consistency is inspiring! 🌟`
  }
  
  const getPersonalizedSuggestions = () => {
    if (currentMood <= 2) return "I noticed you might need extra support today. Let's start with some gentle breathing?"
    if (currentMood <= 4) return "Your ${userStreak}-day streak shows real commitment. How about logging your current mood?"
    if (currentMood <= 6) return "Perfect timing for a mood check-in! You last logged ${lastMoodEntry}."
    if (currentMood <= 8) return "You're doing great with your ${userStreak} days! Ready to set a wellness goal?"
    return "Your positive energy is contagious! Want to share some inspiration with others?"
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white px-4 py-4 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/working-dashboard" className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">MOODY Actions</h1>
        </div>
      </div>

      {/* MOODY Header */}
      <div className="text-center py-8 px-6 border-b border-gray-100"
           style={{ backgroundColor: '#F8F9FA' }}>
        <div className="mb-4">
          <MoodyAvatar mood={currentMood} size="large" />
        </div>
        
        {/* Chat Bar directly under avatar */}
        <motion.button
          onClick={() => handleAction('chat')}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="mb-6 px-6 py-3 rounded-full text-sm font-medium transition-all duration-200 shadow-lg"
          style={{
            backgroundColor: 'var(--brand-tertiary)',
            color: 'var(--brand-on-tertiary)'
          }}
        >
          💬 Chat with MOODY
        </motion.button>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Hello {userName}!</h2>
        <p className="text-gray-600 text-base">{getMoodGreeting()}</p>
      </div>

      {/* Action Grid */}
      <div className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Quick Actions</h3>
          <p className="text-gray-600 text-sm">{getPersonalizedSuggestions()}</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {/* Log Mood Entry */}
          <motion.button
            onClick={() => handleAction('log-mood')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl border-2 border-gray-100 hover:opacity-90 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 184, 92, 0.08)',
              borderColor: 'var(--brand-tertiary)'
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-light" style={{ color: 'var(--brand-tertiary)' }}>◉</span>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--brand-tertiary)' }}>Log Mood</p>
            <p className="text-sm opacity-75" style={{ color: 'var(--brand-tertiary)' }}>Track your feelings</p>
          </motion.button>

          {/* View Statistics */}
          <motion.button
            onClick={() => handleAction('statistics')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl border-2 border-gray-100 hover:opacity-90 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 184, 92, 0.08)',
              borderColor: 'var(--brand-tertiary)'
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-light" style={{ color: 'var(--brand-tertiary)' }}>◈</span>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--brand-tertiary)' }}>Statistics</p>
            <p className="text-sm opacity-75" style={{ color: 'var(--brand-tertiary)' }}>View your progress</p>
          </motion.button>

          {/* Calendar */}
          <motion.button
            onClick={() => handleAction('calendar')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl border-2 border-gray-100 hover:opacity-90 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 184, 92, 0.08)',
              borderColor: 'var(--brand-tertiary)'
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-light" style={{ color: 'var(--brand-tertiary)' }}>◊</span>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--brand-tertiary)' }}>Calendar</p>
            <p className="text-sm opacity-75" style={{ color: 'var(--brand-tertiary)' }}>View mood history</p>
          </motion.button>

          {/* Daily Quote */}
          <motion.button
            onClick={() => handleAction('quote')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl border-2 border-gray-100 hover:opacity-90 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 184, 92, 0.08)',
              borderColor: 'var(--brand-tertiary)'
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-light" style={{ color: 'var(--brand-tertiary)' }}>✦</span>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--brand-tertiary)' }}>Daily Quote</p>
            <p className="text-sm opacity-75" style={{ color: 'var(--brand-tertiary)' }}>Get inspired</p>
          </motion.button>

          {/* Goals & Habits */}
          <motion.button
            onClick={() => handleAction('goals')}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="p-6 rounded-2xl border-2 border-gray-100 hover:opacity-90 transition-all duration-200"
            style={{
              backgroundColor: 'rgba(255, 184, 92, 0.08)',
              borderColor: 'var(--brand-tertiary)'
            }}
          >
            <div className="w-10 h-10 mx-auto mb-3 flex items-center justify-center">
              <span className="text-3xl font-light" style={{ color: 'var(--brand-tertiary)' }}>◎</span>
            </div>
            <p className="text-base font-semibold mb-1" style={{ color: 'var(--brand-tertiary)' }}>Goals & Habits</p>
            <p className="text-sm opacity-75" style={{ color: 'var(--brand-tertiary)' }}>Track your progress</p>
          </motion.button>
        </div>

        {/* Quote Display */}
        {selectedQuote && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200"
          >
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-amber-600" />
              <span className="text-base font-semibold text-amber-700">Daily Inspiration</span>
            </div>
            <p className="text-amber-800 text-center font-medium text-lg mb-4">{selectedQuote}</p>
            <button 
              onClick={getRandomQuote}
              className="text-sm text-amber-600 hover:text-amber-700 transition-colors mx-auto block font-medium"
            >
              ✨ Get another quote
            </button>
          </motion.div>
        )}
      </div>

      {/* Chat Modal */}
      <MoodyChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userId="user-id"
        currentMood={currentMood}
        onCrisisDetected={() => {}}
      />

      {/* Mobile Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  )
}
