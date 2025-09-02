'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import MoodyAvatar from './MoodyAvatar'
import MoodyChat from '../moody/MoodyChat'
import { motion } from 'framer-motion'

interface AvatarWithChatProps {
  mood: number
  size?: 'small' | 'medium' | 'large'
  userId?: string
  userName?: string
  showMoodScore?: boolean
}

export default function AvatarWithChat({ 
  mood, 
  size = 'medium', 
  userId,
  userName,
  showMoodScore = true 
}: AvatarWithChatProps) {
  const router = useRouter()
  const [isChatOpen, setIsChatOpen] = useState(false)
  const [crisisResources, setCrisisResources] = useState<any>(null)

  const handleAvatarClick = () => {
    console.log('🎯 MOODY clicked - navigating to actions page') // Mobile debugging
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Gentle haptic feedback
    }
    router.push('/moody-actions')
  }

  const handleChatClick = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(50) // Gentle haptic feedback
    }
    setIsChatOpen(true)
  }

  const handleCrisisDetected = (resources: any) => {
    setCrisisResources(resources)
    // Could trigger additional crisis protocols here
    console.log('Crisis detected, resources provided:', resources)
  }

  const getMoodLabel = (score: number): string => {
    if (score <= 2) return 'Crisis Support'
    if (score <= 4) return 'Gentle Care'
    if (score <= 6) return 'Balanced'
    if (score <= 8) return 'Positive'
    return 'Thriving'
  }

  const getMoodColor = (score: number): string => {
    if (score <= 2) return 'text-red-600'
    if (score <= 4) return 'text-orange-600'
    if (score <= 6) return 'text-yellow-600'
    if (score <= 8) return 'text-green-600'
    return 'text-purple-600'
  }

  const inspirationalQuotes = [
    "Every small step counts! 🌱",
    "You're stronger than you think 💪",
    "Progress, not perfection ✨",
    "Your mental health matters 💙",
    "Take it one breath at a time 🌸",
    "You've got this! 🌟",
    "Healing isn't linear 🌈",
    "Be gentle with yourself today 🤗"
  ]

  const getRandomQuote = () => {
    return inspirationalQuotes[Math.floor(Math.random() * inspirationalQuotes.length)]
  }

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Mood Score Display */}
      {showMoodScore && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <div className="flex items-center justify-center space-x-2 mb-1">
            <span className="text-2xl font-bold text-gray-700">{mood}</span>
            <span className="text-sm text-gray-500">/10</span>
          </div>
          <div className={`text-sm font-medium ${getMoodColor(mood)}`}>
            {getMoodLabel(mood)}
          </div>
        </motion.div>
      )}

      {/* Avatar with Left-Side Chat Button */}
      <div className="relative flex items-center">


        {/* Interactive Avatar */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer relative"
          onClick={handleAvatarClick}
        >
          <MoodyAvatar 
            mood={mood} 
            size={size}
            interactive={true}
            showMessage={false}
          />
        </motion.div>
      </div>

      {/* Crisis Alert */}
      {crisisResources && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-50 border-2 border-red-200 rounded-lg p-4 max-w-sm text-center fixed top-4 left-4 right-4 z-50 mx-auto"
          style={{ maxWidth: '320px' }}
        >
          <div className="text-red-600 mb-2">
            <span className="text-2xl">🆘</span>
          </div>
          <h4 className="font-semibold text-red-800 mb-2">Support Available</h4>
          <p className="text-sm text-red-700 mb-3">
            MOODY has detected you might need immediate support. You're not alone.
          </p>
          <div className="space-y-2">
            {crisisResources.resources?.map((resource: any, index: number) => (
              <div key={index} className="text-xs">
                <strong>{resource.name}:</strong> {resource.contact}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setCrisisResources(null)}
            className="mt-2 text-red-600 text-xs underline"
          >
            Close
          </button>
        </motion.div>
      )}

      {/* MOODY Chat Interface - Fixed sizing */}
      <MoodyChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        userId={userId}
        currentMood={mood}
        onCrisisDetected={handleCrisisDetected}
      />
    </div>
  )
}
