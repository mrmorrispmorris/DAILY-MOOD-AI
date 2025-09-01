'use client'

import { useState, useEffect } from 'react'
import MoodyCompanion from './MoodyCompanion'
import { motion, AnimatePresence } from 'framer-motion'

interface AvatarCompanionProps {
  userMood: number
  userName?: string
  lastMoodEntry?: Date
  recentActivity?: string
}

export default function AvatarCompanion({ 
  userMood, 
  userName = 'friend',
  lastMoodEntry,
  recentActivity = 'none'
}: AvatarCompanionProps) {
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  
  // Avatar messages based on context
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return `Good morning, ${userName}!`
    if (hour < 18) return `Good afternoon, ${userName}!`
    return `Good evening, ${userName}!`
  }
  
  const getMoodMessage = (mood: number) => {
    if (mood <= 3) return "I'm here for you. Want to talk about it?"
    if (mood <= 5) return "Let's work on lifting your spirits!"
    if (mood <= 7) return "You're doing great! Keep it up!"
    return "Amazing energy today! 🎉"
  }
  
  const getStreakMessage = () => {
    if (!lastMoodEntry) return "Let's start tracking your mood!"
    const daysSince = Math.floor((Date.now() - lastMoodEntry.getTime()) / (1000 * 60 * 60 * 24))
    if (daysSince === 0) return "Great job logging today!"
    if (daysSince === 1) return "Don't forget to log today's mood!"
    return `It's been ${daysSince} days. I missed you!`
  }
  
  // Cycle through messages
  useEffect(() => {
    const messages = [
      getGreeting(),
      getMoodMessage(userMood),
      getStreakMessage(),
      "Tap me for a surprise! 🎁"
    ]
    
    let index = 0
    const interval = setInterval(() => {
      setMessage(messages[index])
      setShowMessage(true)
      
      setTimeout(() => setShowMessage(false), 3000)
      
      index = (index + 1) % messages.length
    }, 5000)
    
    return () => clearInterval(interval)
  }, [userMood, userName, lastMoodEntry])
  
  return (
    <div className="relative">
      {/* 🎯 MOODY - YOUR MOOD COMPANION! */}
      <MoodyCompanion
        mood={userMood}
        userName={userName}
        size="large"
        recentActivity={recentActivity}
        streakDays={lastMoodEntry ? Math.floor((Date.now() - lastMoodEntry.getTime()) / (1000 * 60 * 60 * 24)) : 0}
      />
      
      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 
                       bg-white rounded-2xl px-4 py-2 shadow-lg 
                       border-2 border-purple-200 min-w-[200px] text-center"
          >
            <p className="text-sm text-gray-700 whitespace-nowrap">{message}</p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                          w-4 h-4 bg-white border-b-2 border-r-2 
                          border-purple-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
