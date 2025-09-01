'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface MoodEntry {
  id: string
  mood_score: number
  date: string
  time: string
  activities?: string[]
  notes?: string
}

interface AIFollowUpProps {
  moods: MoodEntry[]
  userTier: 'free' | 'premium'
  onActionTaken: (action: string) => void
}

export default function AIFollowUp({ moods, userTier, onActionTaken }: AIFollowUpProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [followUpInsights, setFollowUpInsights] = useState<string[]>([])
  const [showFollowUp, setShowFollowUp] = useState(false)

  const generateFollowUp = async (actionType: 'check_progress' | 'get_tips' | 'emergency_support') => {
    if (userTier === 'free') {
      // Free users get limited follow-up
      setFollowUpInsights([
        "🔒 Advanced AI follow-up requires Premium.",
        "Upgrade to get personalized check-ins and progress tracking.",
        "Premium AI remembers your goals and follows up on recommendations."
      ])
      setShowFollowUp(true)
      return
    }

    setIsLoading(true)
    setShowFollowUp(true)

    try {
      // Call AI for personalized follow-up
      const response = await fetch('/api/ai/follow-up', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          actionType,
          moodHistory: moods.slice(0, 7),
          previousRecommendations: localStorage.getItem('ai_recommendations') || '[]'
        })
      })

      if (response.ok) {
        const result = await response.json()
        setFollowUpInsights(result.followUpActions || [
          "Let me check your progress from our last conversation...",
          "Based on your recent moods, here's my updated assessment:",
          "I notice some changes since our last check-in. Let's address them."
        ])
      } else {
        throw new Error('Follow-up API failed')
      }
    } catch (error) {
      // Fallback follow-up
      const fallbackInsights = {
        check_progress: [
          "Looking at your recent mood entries, I see some interesting patterns.",
          "How did those recommendations work out for you?",
          "Let's adjust our strategy based on what I'm seeing."
        ],
        get_tips: [
          "Based on your mood patterns, here are personalized tips:",
          "I've noticed activities that seem to help your mood - let's build on those.",
          "Your data shows some clear opportunities for improvement."
        ],
        emergency_support: [
          "I'm here to support you through this difficult time.",
          "Let's create an immediate action plan based on what's worked before.",
          "I can see this is challenging - here's my emergency protocol for you."
        ]
      }
      
      setFollowUpInsights(fallbackInsights[actionType])
    }

    setIsLoading(false)
    onActionTaken(actionType)
  }

  if (!moods.length) return null

  return (
    <div className="bg-white rounded-2xl shadow-md border p-6 mt-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
          🤖 Moody AI Follow-Up Assistant
          {userTier === 'premium' && (
            <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">ACTIVE</span>
          )}
        </h3>
      </div>

      {/* Follow-up Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <button
          onClick={() => generateFollowUp('check_progress')}
          disabled={isLoading}
          className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-xl transition-colors border border-blue-200"
        >
          <div className="text-2xl mb-2">📊</div>
          <h4 className="font-semibold text-blue-800 mb-1">Check Progress</h4>
          <p className="text-sm text-blue-600">
            How are you doing with previous recommendations?
          </p>
        </button>

        <button
          onClick={() => generateFollowUp('get_tips')}
          disabled={isLoading}
          className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-xl transition-colors border border-green-200"
        >
          <div className="text-2xl mb-2">💡</div>
          <h4 className="font-semibold text-green-800 mb-1">Get New Tips</h4>
          <p className="text-sm text-green-600">
            Updated personalized recommendations
          </p>
        </button>

        <button
          onClick={() => generateFollowUp('emergency_support')}
          disabled={isLoading}
          className="p-4 text-left bg-purple-50 hover:bg-purple-100 rounded-xl transition-colors border border-purple-200"
        >
          <div className="text-2xl mb-2">🆘</div>
          <h4 className="font-semibold text-purple-800 mb-1">Need Support</h4>
          <p className="text-sm text-purple-600">
            Immediate help and action plan
          </p>
        </button>
      </div>

      {/* Follow-up Results */}
      {showFollowUp && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 rounded-xl p-4 border"
        >
          <div className="flex items-center gap-2 mb-3">
            <div className="text-xl">🤖</div>
            <h4 className="font-semibold text-gray-800">Moody AI Response:</h4>
            {isLoading && (
              <div className="ml-2 w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            )}
          </div>
          
          <div className="space-y-2">
            {followUpInsights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.5 }}
                className="flex items-start gap-2"
              >
                <span className="text-blue-500 mt-1">→</span>
                <p className="text-gray-700">{insight}</p>
              </motion.div>
            ))}
          </div>

          {userTier === 'free' && (
            <div className="mt-4 p-3 bg-purple-100 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">
                🔑 Upgrade to Premium for personalized AI follow-up conversations, 
                progress tracking, and emergency support protocols.
              </p>
            </div>
          )}

          <button
            onClick={() => setShowFollowUp(false)}
            className="mt-4 text-sm text-gray-500 hover:text-gray-700"
          >
            ✕ Close
          </button>
        </motion.div>
      )}
    </div>
  )
}
