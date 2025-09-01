'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MotivationalTips() {
  const [currentTip, setCurrentTip] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const tips = [
    {
      icon: '🌱',
      title: 'Growth Mindset',
      message: 'Every mood entry is a step toward better mental health. Small consistent actions create lasting change.',
      color: 'from-green-500 to-emerald-600'
    },
    {
      icon: '🧠',
      title: 'Pattern Recognition',
      message: 'Your brain is amazing at finding patterns. The more you track, the clearer your emotional landscape becomes.',
      color: 'from-blue-500 to-indigo-600'
    },
    {
      icon: '💪',
      title: 'Emotional Strength',
      message: 'Acknowledging your emotions, even difficult ones, builds emotional resilience and self-awareness.',
      color: 'from-purple-500 to-pink-600'
    },
    {
      icon: '🎯',
      title: 'Progress Over Perfection',
      message: 'You don\'t need perfect days. Focus on understanding your emotional patterns and celebrating small wins.',
      color: 'from-orange-500 to-red-600'
    },
    {
      icon: '🌟',
      title: 'Self-Compassion',
      message: 'Be kind to yourself on tough days. Tracking your mood is an act of self-care and personal growth.',
      color: 'from-teal-500 to-cyan-600'
    }
  ]

  // Rotate tips every 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTip((prev) => (prev + 1) % tips.length)
    }, 10000)

    return () => clearInterval(interval)
  }, [tips.length])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('dailymood_tips_dismissed', Date.now().toString())
  }

  // Check if tips were recently dismissed (hide for 1 hour)
  useEffect(() => {
    const dismissed = localStorage.getItem('dailymood_tips_dismissed')
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const oneHour = 60 * 60 * 1000
      if (Date.now() - dismissedTime < oneHour) {
        setIsVisible(false)
      }
    }
  }, [])

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      <div className={`bg-gradient-to-r ${tips[currentTip].color} rounded-2xl p-6 text-white shadow-xl border border-white/20`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-3xl">{tips[currentTip].icon}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-bold mb-2">{tips[currentTip].title}</h3>
              <AnimatePresence mode="wait">
                <motion.p
                  key={currentTip}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-white/90 leading-relaxed"
                >
                  {tips[currentTip].message}
                </motion.p>
              </AnimatePresence>
            </div>
          </div>
          
          <div className="flex items-center gap-2 ml-4">
            <button
              onClick={handleDismiss}
              className="text-white/60 hover:text-white/80 transition-colors p-2"
              title="Dismiss for 1 hour"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Progress Indicator */}
        <div className="flex gap-1 mt-4 justify-center">
          {tips.map((_, index) => (
            <motion.div
              key={index}
              className={`h-1 rounded-full transition-all duration-300 ${
                index === currentTip ? 'w-8 bg-white' : 'w-2 bg-white/40'
              }`}
              layout
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

