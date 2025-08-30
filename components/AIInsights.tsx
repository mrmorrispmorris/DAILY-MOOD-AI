'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Sparkles, Brain, TrendingUp, Clock, Lightbulb, Zap } from 'lucide-react'
import { generateMoodInsights, type AIInsightResult } from '@/lib/openai-service'

interface InsightData extends AIInsightResult {
  hasEnoughData: boolean
  isAIPowered: boolean
}

export default function AIInsights({ userId }: { userId: string }) {
  const [insights, setInsights] = useState<InsightData>({
    insights: [],
    patterns: {},
    suggestions: [],
    predictions: [],
    confidence: 0,
    hasEnoughData: false,
    isAIPowered: false
  })
  const [loading, setLoading] = useState(true)
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (userId) {
      generateAIInsights()
    }
  }, [userId])

  const generateAIInsights = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(30)

      if (error) throw error

      if (!entries || entries.length < 3) {
        setInsights({
          insights: [],
          patterns: {},
          suggestions: ['Start by logging your mood for a few days to unlock AI insights'],
          predictions: [],
          confidence: 0.1,
          hasEnoughData: false,
          isAIPowered: false
        })
        setLoading(false)
        return
      }

      console.log('🤖 Generating AI insights for', entries.length, 'mood entries')

      // Convert database entries to the format expected by the AI service
      const moodData = entries.map(entry => ({
        score: entry.mood_score,
        notes: entry.notes,
        activities: entry.activities || [],
        timestamp: entry.created_at
      }))

      // Call the OpenAI service
      const aiResult = await generateMoodInsights(moodData, userId)

      setInsights({
        ...aiResult,
        hasEnoughData: entries.length >= 7,
        isAIPowered: aiResult.confidence > 0.6 // AI-powered if high confidence
      })

    } catch (error) {
      console.error('Error generating AI insights:', error)
      
      // Fallback to basic insights if AI fails
      setInsights({
        insights: ["Unable to generate AI insights at the moment"],
        patterns: {},
        suggestions: ["Try logging a few more mood entries for better analysis"],
        predictions: [],
        confidence: 0.2,
        hasEnoughData: false,
        isAIPowered: false
      })
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">AI Insights</h3>
        <div className="ml-auto flex items-center gap-2">
          {insights.isAIPowered ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex items-center gap-1">
              <Zap className="w-3 h-3" />
              AI-Powered
            </span>
          ) : (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
              Pattern Analysis
            </span>
          )}
          {!insights.hasEnoughData && (
            <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">
              Beta
            </span>
          )}
        </div>
      </div>

      {!insights.hasEnoughData && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 text-purple-700">
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">Building your profile...</span>
          </div>
          <p className="text-xs text-purple-600 mt-1">
            Log moods for 7+ days to unlock advanced AI insights
          </p>
        </div>
      )}

      <div className="space-y-4">
        {/* Key Insights Section */}
        {insights.insights.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Brain className="w-4 h-4 text-blue-500" />
              Key Insights
            </h4>
            <div className="space-y-2">
              {insights.insights.map((insight, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{insight}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictions Section */}
        {insights.predictions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-purple-500" />
              Predictions
            </h4>
            <div className="space-y-2">
              {insights.predictions.map((prediction, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{prediction}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions Section */}
        {insights.suggestions.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
              <Lightbulb className="w-4 h-4 text-green-500" />
              Suggestions
            </h4>
            <div className="space-y-2">
              {insights.suggestions.map((suggestion, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>{suggestion}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Confidence: {Math.round(insights.confidence * 100)}%</span>
          {insights.isAIPowered ? (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              Powered by GPT-4
            </span>
          ) : (
            <span>Pattern-based analysis</span>
          )}
        </div>
      </div>
    </div>
  )
}
