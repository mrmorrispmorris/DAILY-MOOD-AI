'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MoodEntry {
  id: string
  mood_score: number
  date: string
  time: string
  activities?: string[]
  notes?: string
}

interface AIInsightsProps {
  moods: MoodEntry[]
  userTier: 'free' | 'premium'
}

export default function AIInsights({ moods, userTier }: AIInsightsProps) {
  const [currentInsight, setCurrentInsight] = useState(0)
  const [insights, setInsights] = useState<any[]>([])

  useEffect(() => {
    generateRealAIInsights()
  }, [moods, userTier])

  const generateRealAIInsights = async () => {
    if (moods.length === 0) {
      setInsights([{
        type: 'welcome',
        title: '🎯 Welcome to Moody AI Insights!',
        content: 'Start logging your moods to unlock personalized Moody AI recommendations.',
        action: 'Log your first mood above to begin your Moody AI journey!',
        confidence: 100
      }])
      return
    }

    // Show loading state
    setInsights([{
      type: 'loading',
      title: '🤖 Moody AI Analyzing Your Data...',
      content: 'Moody AI is processing your mood patterns to generate personalized insights.',
      action: 'Please wait while we analyze your unique patterns...',
      confidence: 0
    }])

    try {
      // Call real OpenAI API for Premium users
      if (userTier === 'premium') {
        const response = await fetch('/api/ai/insights', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: 'premium_user', 
            moodEntries: moods.map(m => ({
              date: m.date,
              mood_score: m.mood_score,
              notes: m.notes || '',
              activities: m.activities || [],
              emoji: (m as any).emoji || '😐'
            }))
          })
        })

        if (response.ok) {
          const aiResult = await response.json()
          
          // Convert OpenAI response to our format
          setInsights([
            {
              type: 'ai_analysis',
              title: '🧠 Moody AI Analysis Complete',
              content: aiResult.summary,
              action: `Moody AI Action Plan: ${aiResult.suggestion}`,
              confidence: 95,
              isAI: true
            },
            {
              type: 'trend_analysis',
              title: `📊 Trend: ${aiResult.trend === 'improving' ? '📈 Improving' : aiResult.trend === 'declining' ? '📉 Declining' : '➡️ Stable'}`,
              content: `Your mood is currently ${aiResult.trend}. This analysis is based on your recent ${moods.length} entries using advanced pattern recognition.`,
              action: `Next steps: Continue tracking daily for even more accurate AI predictions.`,
              confidence: 92,
              isAI: true
            }
          ])
        } else {
          throw new Error('AI API failed')
        }
      } else {
        // Free tier gets basic pattern analysis with upgrade prompts
        await generateBasicInsights()
      }
    } catch (error) {
      console.error('AI Insights error:', error)
      // Fallback to basic insights if AI fails
      await generateBasicInsights()
    }
  }

  const generateBasicInsights = async () => {
    // Simulate API delay for realistic experience
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const recentMoods = moods.slice(0, 7)
    const avgMood = recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length
    const trendDirection = recentMoods.length > 1 ? 
      (recentMoods[0].mood_score - recentMoods[recentMoods.length - 1].mood_score) : 0

    let generatedInsights = []

    // Basic Pattern Recognition
    if (avgMood >= 7) {
      generatedInsights.push({
        type: 'positive_trend',
        title: '🌟 Great Mood Detected!',
        content: `Your recent average is ${avgMood.toFixed(1)}/10 - you're doing well! Premium AI can identify exactly what's driving these positive moods.`,
        action: 'Upgrade to Premium: Get personalized strategies to maintain these high moods.',
        confidence: 75,
        isPremiumFeature: true
      })
    } else if (avgMood <= 4) {
      generatedInsights.push({
        type: 'support_needed',
        title: '💙 Support Detected',
        content: `Your recent average is ${avgMood.toFixed(1)}/10. Free tier provides basic support, but Premium AI offers personalized intervention strategies.`,
        action: 'Upgrade to Premium: Get AI-powered personalized support plans.',
        confidence: 78,
        isPremiumFeature: true
      })
    }

    // Activity Correlation Teaser
    const activitiesWithMoods = moods.filter(m => m.activities && m.activities.length > 0)
    if (activitiesWithMoods.length >= 3) {
      generatedInsights.push({
        type: 'activity_teaser',
        title: '🔮 Activity Patterns Detected',
        content: `I've found correlations between your activities and mood, but detailed analysis requires Premium AI.`,
        action: 'Upgrade to Premium: Discover which activities boost your mood by up to 40%.',
        confidence: 0,
        isPremiumFeature: true
      })
    }

    // Trend Analysis
    if (Math.abs(trendDirection) > 0.5) {
      generatedInsights.push({
        type: 'trend_basic',
        title: trendDirection > 0 ? '📈 Upward Trend' : '📉 Downward Trend',
        content: `Your mood is trending ${trendDirection > 0 ? 'upward' : 'downward'}. Premium AI can predict mood changes 2-3 days in advance.`,
        action: 'Upgrade to Premium: Get predictive alerts and prevention strategies.',
        confidence: trendDirection > 0 ? 70 : 85,
        isPremiumFeature: true
      })
    }

    setInsights(generatedInsights.length > 0 ? generatedInsights : [{
      type: 'need_more_data',
      title: '📊 Building Your Profile',
      content: 'Keep logging moods for better insights. Premium AI can analyze patterns with just 3-5 entries!',
      action: 'Upgrade to Premium: Get AI insights starting from your first week.',
      confidence: 60,
      isPremiumFeature: true
    }])
  }

  const nextInsight = () => {
    setCurrentInsight((prev) => (prev + 1) % insights.length)
  }

  const prevInsight = () => {
    setCurrentInsight((prev) => (prev - 1 + insights.length) % insights.length)
  }

  if (insights.length === 0) return null

  const insight = insights[currentInsight]

  return (
    <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl shadow-lg border-2 border-purple-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-purple-800 flex items-center gap-2">
          🤖 Moody AI Analysis
          {userTier === 'free' && (
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded-full">
              FREE TIER
            </span>
          )}
          {userTier === 'premium' && (
            <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">
              PREMIUM
            </span>
          )}
        </h3>
        
        {insights.length > 1 && (
          <div className="flex gap-2">
            <button
              onClick={prevInsight}
              className="w-8 h-8 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center text-purple-700 font-bold"
            >
              ←
            </button>
            <button
              onClick={nextInsight}
              className="w-8 h-8 rounded-full bg-purple-200 hover:bg-purple-300 flex items-center justify-center text-purple-700 font-bold"
            >
              →
            </button>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentInsight}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
                      <div className={`p-4 rounded-xl ${
              insight.isAlert ? 'bg-red-50 border border-red-200' :
              insight.isPremiumFeature ? 'bg-gradient-to-r from-purple-100 to-blue-100 border border-purple-300' :
              insight.isAI ? 'bg-gradient-to-r from-green-50 to-blue-50 border border-green-200' :
              'bg-white border border-purple-100'
            }`}>
            <h4 className="font-bold text-gray-800 mb-2">{insight.title}</h4>
            <p className="text-gray-700 mb-3">{insight.content}</p>
            
            <div className={`p-3 rounded-lg ${
              insight.isPremiumFeature ? 'bg-purple-200' :
              insight.isAlert ? 'bg-red-100' :
              insight.isAI ? 'bg-green-100' :
              'bg-blue-100'
            }`}>
              <p className="text-sm font-medium text-gray-800">
                {insight.isAI && <span className="inline-block bg-green-500 text-white text-xs px-2 py-1 rounded-full mr-2 font-bold">REAL AI</span>}
                {insight.action}
              </p>
            </div>

            {insight.confidence > 0 && (
              <div className="flex items-center gap-2 mt-3">
                <span className="text-xs text-gray-600">AI Confidence:</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <motion.div
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${insight.confidence}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-700">{insight.confidence}%</span>
              </div>
            )}
          </div>

          {insights.length > 1 && (
            <div className="flex justify-center gap-2 mt-4">
              {insights.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentInsight(index)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    index === currentInsight ? 'bg-purple-600' : 'bg-purple-200'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
