'use client'

import { useState, useEffect } from 'react'
import { X, Sparkles, TrendingUp, Brain } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface PremiumPromptProps {
  trigger: 'mood_entry' | 'streak' | 'analytics'
  onClose: () => void
}

export default function PremiumPrompt({ trigger, onClose }: PremiumPromptProps) {
  const [isVisible, setIsVisible] = useState(true)

  const prompts = {
    mood_entry: {
      title: "Unlock AI Insights! 🧠",
      message: "You've logged 7 moods! Unlock AI-powered insights to understand your patterns better.",
      icon: Brain
    },
    streak: {
      title: "You're on a 3-day streak! 🔥",
      message: "Keep the momentum going with smart reminders and achievement badges.",
      icon: TrendingUp
    },
    analytics: {
      title: "Discover Hidden Patterns 📊",
      message: "Your mood data has stories to tell. Unlock advanced analytics to see them.",
      icon: Sparkles
    }
  }

  const prompt = prompts[trigger]

  if (!isVisible) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 max-w-sm z-50"
      >
        <div className="bg-white rounded-xl shadow-2xl border border-purple-100 p-6">
          <button
            onClick={() => {
              setIsVisible(false)
              onClose()
            }}
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-lg flex items-center justify-center flex-shrink-0">
              <prompt.icon className="w-6 h-6 text-white" />
            </div>
            
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-1">{prompt.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{prompt.message}</p>
              
              <div className="flex gap-2">
                <Link
                  href="/pricing"
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700"
                >
                  Try Premium Free
                </Link>
                <button
                  onClick={() => {
                    setIsVisible(false)
                    onClose()
                  }}
                  className="px-4 py-2 text-gray-600 text-sm hover:text-gray-800"
                >
                  Later
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

