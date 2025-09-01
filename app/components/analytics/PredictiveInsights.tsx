'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  Clock, 
  Zap, 
  AlertTriangle, 
  CheckCircle, 
  Activity, 
  Sun, 
  Moon,
  CloudRain,
  Sunrise,
  Target,
  Lightbulb,
  BarChart3
} from 'lucide-react'

interface MoodEntry {
  id: number
  date: string
  mood_score: number
  activities?: string[]
  notes?: string
  created_at: string
}

interface PredictiveInsightsProps {
  userId?: string
  moods: MoodEntry[]
}

interface Pattern {
  type: 'weekly' | 'daily' | 'activity' | 'temporal' | 'trend'
  title: string
  description: string
  confidence: number
  actionable: boolean
  suggestion?: string
  icon: React.ComponentType<any>
  color: string
}

interface Prediction {
  date: string
  predictedMood: number
  confidence: number
  factors: string[]
  risk: 'low' | 'medium' | 'high'
  suggestions: string[]
}

export default function PredictiveInsights({ userId, moods }: PredictiveInsightsProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'week' | 'month' | 'quarter'>('week')
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Analyze patterns in mood data
  const patterns = useMemo((): Pattern[] => {
    if (!moods || moods.length < 7) {
      return [{
        type: 'trend',
        title: 'Building Your Baseline',
        description: 'Keep tracking for 7+ days to unlock personalized insights and patterns!',
        confidence: 0,
        actionable: true,
        suggestion: 'Log your mood daily to help our AI learn your patterns',
        icon: Target,
        color: 'text-blue-600'
      }]
    }

    const detectedPatterns: Pattern[] = []
    
    // Sort moods by date for analysis
    const sortedMoods = [...moods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Weekly pattern analysis
    const weeklyAvg = Array(7).fill(0).map((_, day) => {
      const dayMoods = sortedMoods.filter(mood => new Date(mood.date).getDay() === day)
      return dayMoods.length > 0 ? dayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / dayMoods.length : 0
    })
    
    const bestDay = weeklyAvg.indexOf(Math.max(...weeklyAvg.filter(avg => avg > 0)))
    const worstDay = weeklyAvg.indexOf(Math.min(...weeklyAvg.filter(avg => avg > 0)))
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    if (bestDay >= 0 && worstDay >= 0 && Math.max(...weeklyAvg) - Math.min(...weeklyAvg.filter(avg => avg > 0)) > 1) {
      detectedPatterns.push({
        type: 'weekly',
        title: 'Weekly Pattern Detected',
        description: `Your mood tends to be highest on ${dayNames[bestDay]} (${weeklyAvg[bestDay].toFixed(1)}/10) and lowest on ${dayNames[worstDay]} (${weeklyAvg[worstDay].toFixed(1)}/10)`,
        confidence: Math.min(95, moods.length * 3),
        actionable: true,
        suggestion: `Plan self-care activities on ${dayNames[worstDay]} and maintain positive routines on ${dayNames[bestDay]}`,
        icon: Calendar,
        color: 'text-purple-600'
      })
    }

    // Time-of-day pattern analysis
    const hourlyMoods = sortedMoods.map(mood => ({
      hour: new Date(mood.created_at).getHours(),
      score: mood.mood_score
    }))
    
    const morningMoods = hourlyMoods.filter(m => m.hour >= 6 && m.hour < 12)
    const afternoonMoods = hourlyMoods.filter(m => m.hour >= 12 && m.hour < 18)
    const eveningMoods = hourlyMoods.filter(m => m.hour >= 18 && m.hour < 24)
    
    const morningAvg = morningMoods.length > 0 ? morningMoods.reduce((sum, m) => sum + m.score, 0) / morningMoods.length : 0
    const afternoonAvg = afternoonMoods.length > 0 ? afternoonMoods.reduce((sum, m) => sum + m.score, 0) / afternoonMoods.length : 0
    const eveningAvg = eveningMoods.length > 0 ? eveningMoods.reduce((sum, m) => sum + m.score, 0) / eveningMoods.length : 0
    
    const timeAverages = [
      { period: 'Morning', avg: morningAvg, icon: Sunrise, suggestion: 'morning routine' },
      { period: 'Afternoon', avg: afternoonAvg, icon: Sun, suggestion: 'midday activities' },
      { period: 'Evening', avg: eveningAvg, icon: Moon, suggestion: 'evening wind-down' }
    ].filter(t => t.avg > 0).sort((a, b) => b.avg - a.avg)
    
    if (timeAverages.length >= 2 && timeAverages[0].avg - timeAverages[timeAverages.length - 1].avg > 0.8) {
      detectedPatterns.push({
        type: 'temporal',
        title: 'Daily Rhythm Pattern',
        description: `Your mood is typically best in the ${timeAverages[0].period.toLowerCase()} (${timeAverages[0].avg.toFixed(1)}/10) and lowest in the ${timeAverages[timeAverages.length - 1].period.toLowerCase()} (${timeAverages[timeAverages.length - 1].avg.toFixed(1)}/10)`,
        confidence: Math.min(90, moods.length * 2.5),
        actionable: true,
        suggestion: `Focus on important tasks during your peak ${timeAverages[0].period.toLowerCase()} hours and practice extra self-care during ${timeAverages[timeAverages.length - 1].period.toLowerCase()}`,
        icon: timeAverages[0].icon,
        color: 'text-yellow-600'
      })
    }

    // Activity correlation analysis
    const activityMoodMap: Record<string, number[]> = {}
    sortedMoods.forEach(mood => {
      mood.activities?.forEach(activity => {
        if (!activityMoodMap[activity]) activityMoodMap[activity] = []
        activityMoodMap[activity].push(mood.mood_score)
      })
    })
    
    const activityAverages = Object.entries(activityMoodMap)
      .filter(([_, scores]) => scores.length >= 3) // At least 3 data points
      .map(([activity, scores]) => ({
        activity,
        average: scores.reduce((sum, score) => sum + score, 0) / scores.length,
        count: scores.length
      }))
      .sort((a, b) => b.average - a.average)
    
    if (activityAverages.length >= 2 && activityAverages[0].average - activityAverages[activityAverages.length - 1].average > 1) {
      detectedPatterns.push({
        type: 'activity',
        title: 'Activity Impact Discovered',
        description: `${activityAverages[0].activity} consistently boosts your mood to ${activityAverages[0].average.toFixed(1)}/10, while ${activityAverages[activityAverages.length - 1].activity} tends to lower it to ${activityAverages[activityAverages.length - 1].average.toFixed(1)}/10`,
        confidence: Math.min(85, Math.max(...activityAverages.map(a => a.count)) * 10),
        actionable: true,
        suggestion: `Increase ${activityAverages[0].activity} and consider alternatives to ${activityAverages[activityAverages.length - 1].activity}`,
        icon: Activity,
        color: 'text-green-600'
      })
    }

    // Trend analysis
    const recent14 = sortedMoods.slice(-14)
    const previous14 = sortedMoods.slice(-28, -14)
    
    if (recent14.length >= 7 && previous14.length >= 7) {
      const recentAvg = recent14.reduce((sum, mood) => sum + mood.mood_score, 0) / recent14.length
      const previousAvg = previous14.reduce((sum, mood) => sum + mood.mood_score, 0) / previous14.length
      const trendChange = recentAvg - previousAvg
      
      if (Math.abs(trendChange) > 0.5) {
        const isImproving = trendChange > 0
        detectedPatterns.push({
          type: 'trend',
          title: isImproving ? 'Positive Trend Detected' : 'Mood Dip Noticed',
          description: `Your average mood has ${isImproving ? 'improved' : 'decreased'} by ${Math.abs(trendChange).toFixed(1)} points over the last two weeks (${recentAvg.toFixed(1)}/10 vs ${previousAvg.toFixed(1)}/10)`,
          confidence: Math.min(90, sortedMoods.length * 1.5),
          actionable: true,
          suggestion: isImproving 
            ? 'Keep up the great work! Try to identify what positive changes you\'ve made recently' 
            : 'Consider what might be affecting your mood lately and practice extra self-care',
          icon: isImproving ? TrendingUp : TrendingDown,
          color: isImproving ? 'text-green-600' : 'text-orange-600'
        })
      }
    }

    return detectedPatterns
  }, [moods])

  // Generate predictions for upcoming days
  const predictions = useMemo((): Prediction[] => {
    if (!moods || moods.length < 14) return []

    const predictions: Prediction[] = []
    const sortedMoods = [...moods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    // Simple prediction algorithm based on patterns
    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + i)
      const dayOfWeek = futureDate.getDay()
      
      // Base prediction on day-of-week average
      const dayMoods = sortedMoods.filter(mood => new Date(mood.date).getDay() === dayOfWeek)
      const dayAverage = dayMoods.length > 0 
        ? dayMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / dayMoods.length
        : 7 // neutral if no data
      
      // Adjust based on recent trend
      const recent7 = sortedMoods.slice(-7)
      const recentTrend = recent7.length > 3 
        ? (recent7[recent7.length - 1].mood_score - recent7[0].mood_score) / 7
        : 0
      
      const predictedMood = Math.max(1, Math.min(10, dayAverage + (recentTrend * i)))
      const confidence = Math.max(30, Math.min(85, dayMoods.length * 10))
      
      // Determine risk level
      let risk: 'low' | 'medium' | 'high' = 'low'
      if (predictedMood <= 4) risk = 'high'
      else if (predictedMood <= 6) risk = 'medium'
      
      // Generate suggestions based on prediction
      const suggestions = []
      if (risk === 'high') {
        suggestions.push('Schedule extra self-care activities')
        suggestions.push('Consider reaching out to supportive friends/family')
        suggestions.push('Practice stress-reduction techniques')
      } else if (risk === 'medium') {
        suggestions.push('Plan mood-boosting activities')
        suggestions.push('Maintain healthy routines')
      } else {
        suggestions.push('Great opportunity for challenging tasks')
        suggestions.push('Consider helping others or socializing')
      }
      
      predictions.push({
        date: futureDate.toISOString().split('T')[0],
        predictedMood,
        confidence,
        factors: [`Day-of-week pattern (${dayMoods.length} data points)`, `Recent trend analysis`],
        risk,
        suggestions
      })
    }
    
    return predictions
  }, [moods])

  const getRiskColor = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return 'text-green-600 bg-green-50 border-green-200'
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200'  
      case 'high': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600'
    if (confidence >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  return (
    <div className="space-y-6">
      {/* AI Insights Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">AI Predictive Insights</h2>
            <p className="text-gray-600">Discover patterns and predictions based on your mood data</p>
          </div>
        </div>

        {moods && moods.length < 7 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-5 h-5 text-blue-600" />
              <h3 className="font-medium text-blue-800">Building Your AI Profile</h3>
            </div>
            <p className="text-sm text-blue-700 mb-3">
              You have {moods?.length || 0} mood entries. Keep tracking for at least 7 days to unlock personalized AI insights and predictions!
            </p>
            <div className="w-full bg-blue-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min(100, ((moods?.length || 0) / 7) * 100)}%` }}
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              {Math.max(0, 7 - (moods?.length || 0))} more entries needed
            </p>
          </div>
        )}
      </div>

      {/* Detected Patterns */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Detected Patterns</h3>
        <div className="grid gap-4">
          {patterns.map((pattern, index) => {
            const IconComponent = pattern.icon
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0">
                    <IconComponent className={`w-6 h-6 ${pattern.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium text-gray-900">{pattern.title}</h4>
                      {pattern.confidence > 0 && (
                        <span className={`text-xs px-2 py-1 rounded-full ${getConfidenceColor(pattern.confidence)}`}>
                          {pattern.confidence}% confidence
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3">{pattern.description}</p>
                    {pattern.suggestion && (
                      <div className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-800">AI Recommendation</span>
                        </div>
                        <p className="text-sm text-gray-700">{pattern.suggestion}</p>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* 7-Day Mood Predictions */}
      {predictions.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">7-Day Mood Forecast</h3>
            <span className="text-sm text-gray-500">Experimental AI feature</span>
          </div>
          
          <div className="grid gap-3">
            {predictions.map((prediction, index) => (
              <motion.div
                key={prediction.date}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="border border-gray-200 rounded-lg p-4"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm font-medium text-gray-900">
                      {new Date(prediction.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs border ${getRiskColor(prediction.risk)}`}>
                      {prediction.risk} risk
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold text-purple-600">
                      {prediction.predictedMood.toFixed(1)}/10
                    </span>
                    <span className={`text-xs ${getConfidenceColor(prediction.confidence)}`}>
                      {prediction.confidence}% confident
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className="h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: `${(prediction.predictedMood / 10) * 100}%`,
                        backgroundColor: prediction.predictedMood >= 7 ? '#10b981' : 
                                        prediction.predictedMood >= 5 ? '#f59e0b' : '#ef4444'
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-xs text-gray-600">
                    <span className="font-medium">Based on:</span> {prediction.factors.join(', ')}
                  </div>
                  {prediction.suggestions.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-gray-700 mb-1">Suggestions:</div>
                      <div className="text-xs text-gray-600">
                        {prediction.suggestions.slice(0, 2).map((suggestion, idx) => (
                          <div key={idx} className="flex items-center gap-1">
                            <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                            <span>{suggestion}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">Experimental Feature</span>
            </div>
            <p className="text-xs text-yellow-700">
              These predictions are based on your historical patterns and are for guidance only. 
              Your actual mood may vary based on many factors not captured in our analysis.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
