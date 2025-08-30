'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { Gem, TrendingUp, Calendar, Target, AlertTriangle, CheckCircle } from 'lucide-react'
import { predictMoodTrend, type PredictionResult } from '@/lib/mood-prediction'

export default function MoodPredictions({ userId }: { userId: string }) {
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (userId) {
      generatePredictions()
    }
  }, [userId])

  const generatePredictions = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(60)

      if (error) throw error

      if (!entries || entries.length < 3) {
        setPrediction({
          predictedScore: 5.5,
          confidence: 0.1,
          trend: 'stable',
          factors: ['Need more mood entries for predictions'],
          recommendations: ['Track your mood for a few days to unlock predictions'],
          nextWeekForecast: []
        })
        setLoading(false)
        return
      }

      console.log('🔮 Generating mood predictions for', entries.length, 'entries')

      // Convert database entries to prediction format
      const moodData = entries.map(entry => ({
        score: entry.mood_score,
        notes: entry.notes,
        activities: entry.activities || [],
        timestamp: entry.created_at
      }))

      // Generate predictions
      const result = predictMoodTrend(moodData, 7)
      setPrediction(result)

    } catch (error) {
      console.error('Error generating predictions:', error)
      setPrediction(null)
    } finally {
      setLoading(false)
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-50'
      case 'declining': return 'text-orange-600 bg-orange-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4" />
      case 'declining': return <AlertTriangle className="w-4 h-4" />
      default: return <CheckCircle className="w-4 h-4" />
    }
  }

  const getPredictionColor = (score: number) => {
    if (score >= 7) return 'text-green-600 bg-green-100'
    if (score >= 5) return 'text-yellow-600 bg-yellow-100'
    return 'text-red-600 bg-red-100'
  }

  const getMoodEmoji = (score: number) => {
    if (score >= 8) return '🤩'
    if (score >= 7) return '😄'
    if (score >= 6) return '😊'
    if (score >= 5) return '🙂'
    if (score >= 4) return '😐'
    if (score >= 3) return '😕'
    return '😔'
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
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!prediction) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="text-center py-8">
          <Gem className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Unable to generate predictions</p>
          <p className="text-sm text-gray-400 mt-2">Try again later</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-4">
        <Gem className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Mood Predictions</h3>
        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
          {Math.round(prediction.confidence * 100)}% confidence
        </span>
      </div>

      {/* Main Prediction */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Tomorrow's predicted mood</span>
          <div className={`px-3 py-1 rounded-full flex items-center gap-1 ${getTrendColor(prediction.trend)}`}>
            {getTrendIcon(prediction.trend)}
            <span className="text-sm font-medium capitalize">{prediction.trend}</span>
          </div>
        </div>

        <div className="text-center mb-4">
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-xl ${getPredictionColor(prediction.predictedScore)}`}>
            <span className="text-4xl">{getMoodEmoji(prediction.predictedScore)}</span>
            <div className="text-left">
              <div className="text-2xl font-bold">{prediction.predictedScore}/10</div>
              <div className="text-sm opacity-80">Predicted score</div>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Forecast */}
      {prediction.nextWeekForecast.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
            <Calendar className="w-4 h-4 text-purple-500" />
            7-Day Forecast
          </h4>
          
          <div className="grid grid-cols-7 gap-1">
            {prediction.nextWeekForecast.map((day, i) => (
              <div key={i} className="text-center">
                <div className="text-xs text-gray-500 mb-1">
                  {day.dayOfWeek.substring(0, 3)}
                </div>
                <div className="bg-gray-50 rounded-lg p-2">
                  <div className="text-lg mb-1">{getMoodEmoji(day.predictedMood)}</div>
                  <div className="text-xs font-medium">{day.predictedMood}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Factors */}
      {prediction.factors.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Target className="w-4 h-4 text-blue-500" />
            Prediction Factors
          </h4>
          <div className="space-y-1">
            {prediction.factors.map((factor, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{factor}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommendations */}
      {prediction.recommendations.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1">
            <Target className="w-4 h-4 text-green-500" />
            Recommendations
          </h4>
          <div className="space-y-1">
            {prediction.recommendations.map((rec, i) => (
              <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <span>{rec}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Confidence indicator */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Prediction accuracy improves with more data</span>
          <span className="flex items-center gap-1">
            <Gem className="w-3 h-3" />
            AI Forecasting
          </span>
        </div>
      </div>
    </div>
  )
}

