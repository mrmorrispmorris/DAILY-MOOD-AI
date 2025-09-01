'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface MoodEntry {
  id: string
  mood_score: number
  date: string
  time: string
  activities?: string[]
  notes?: string
  emoji: string
}

interface MoodOverviewProps {
  moods: MoodEntry[]
  userName?: string
}

export default function MoodOverview({ moods, userName = 'friend' }: MoodOverviewProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'all'>('week')

  // Comprehensive mood analysis
  const analysis = useMemo(() => {
    if (moods.length === 0) {
      return {
        average: 5,
        trend: 'stable',
        trendDirection: 0,
        bestDay: 'N/A',
        challengingDay: 'N/A',
        mostProductiveActivity: 'N/A',
        moodVolatility: 'stable',
        insights: ['Start logging moods to unlock insights'],
        recommendations: ['Log your first mood to begin analysis'],
        streakDays: 0,
        improvement: 0,
        weeklyPattern: []
      }
    }

    const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Filter by time range
    const filterMoods = (range: string) => {
      const now = new Date()
      if (range === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        return sortedMoods.filter(m => new Date(m.date) >= weekAgo)
      } else if (range === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        return sortedMoods.filter(m => new Date(m.date) >= monthAgo)
      }
      return sortedMoods
    }

    const filteredMoods = filterMoods(timeRange)
    const scores = filteredMoods.map(m => m.mood_score)
    
    // Basic calculations
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
    const volatility = variance > 6 ? 'high' : variance > 2 ? 'medium' : 'low'
    
    // Trend calculation
    const recentMoods = filteredMoods.slice(0, Math.min(7, filteredMoods.length))
    const olderMoods = filteredMoods.slice(7, Math.min(14, filteredMoods.length))
    
    const recentAvg = recentMoods.length > 0 ? 
      recentMoods.reduce((a, b) => a + b.mood_score, 0) / recentMoods.length : average
    const olderAvg = olderMoods.length > 0 ? 
      olderMoods.reduce((a, b) => a + b.mood_score, 0) / olderMoods.length : average
    
    const trendDirection = recentAvg - olderAvg
    const trend = Math.abs(trendDirection) < 0.5 ? 'stable' : 
                  trendDirection > 0 ? 'improving' : 'declining'

    // Day of week analysis
    const dayPatterns: Record<string, number[]> = {}
    filteredMoods.forEach(mood => {
      const day = new Date(mood.date).toLocaleDateString('en-US', { weekday: 'long' })
      if (!dayPatterns[day]) dayPatterns[day] = []
      dayPatterns[day].push(mood.mood_score)
    })

    const dayAverages = Object.entries(dayPatterns)
      .map(([day, scores]) => ({
        day,
        average: scores.reduce((a, b) => a + b, 0) / scores.length
      }))
      .sort((a, b) => b.average - a.average)

    const bestDay = dayAverages[0]?.day || 'N/A'
    const challengingDay = dayAverages[dayAverages.length - 1]?.day || 'N/A'

    // Activity analysis
    const activityImpact: Record<string, { total: number, count: number, average: number }> = {}
    filteredMoods.forEach(mood => {
      if (mood.activities) {
        mood.activities.forEach(activity => {
          if (!activityImpact[activity]) {
            activityImpact[activity] = { total: 0, count: 0, average: 0 }
          }
          activityImpact[activity].total += mood.mood_score
          activityImpact[activity].count += 1
        })
      }
    })

    Object.keys(activityImpact).forEach(activity => {
      activityImpact[activity].average = activityImpact[activity].total / activityImpact[activity].count
    })

    const bestActivity = Object.entries(activityImpact)
      .sort(([,a], [,b]) => b.average - a.average)[0]

    const mostProductiveActivity = bestActivity ? bestActivity[0] : 'N/A'

    // Generate insights
    const insights = []
    const recommendations = []

    if (trend === 'improving') {
      insights.push(`🚀 Great progress! Your mood has improved by ${trendDirection.toFixed(1)} points recently`)
      recommendations.push('Keep up whatever you\'re doing - it\'s working!')
    } else if (trend === 'declining') {
      insights.push(`📉 Your mood has dipped by ${Math.abs(trendDirection).toFixed(1)} points lately`)
      recommendations.push('Consider adding more mood-boosting activities to your routine')
    } else {
      insights.push(`➡️ Your mood has been stable around ${average.toFixed(1)}/10`)
      recommendations.push('Try exploring new activities to see what boosts your mood')
    }

    if (volatility === 'high') {
      insights.push(`🎢 Your mood varies quite a bit - that's normal but worth noting`)
      recommendations.push('Try to identify triggers for mood swings and develop coping strategies')
    }

    if (bestDay !== 'N/A' && challengingDay !== 'N/A') {
      insights.push(`📅 You feel best on ${bestDay}s and find ${challengingDay}s more challenging`)
      recommendations.push(`Plan important tasks for ${bestDay}s and extra self-care for ${challengingDay}s`)
    }

    if (mostProductiveActivity !== 'N/A' && activityImpact[mostProductiveActivity].average > average) {
      insights.push(`⭐ "${mostProductiveActivity}" consistently boosts your mood`)
      recommendations.push(`Try to incorporate more "${mostProductiveActivity}" into your routine`)
    }

    // Calculate improvement percentage
    const improvement = olderMoods.length > 0 ? 
      ((recentAvg - olderAvg) / olderAvg) * 100 : 0

    // Calculate streak
    const today = new Date().toDateString()
    let streak = 0
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toDateString()
      const hasEntry = moods.some(m => new Date(m.date).toDateString() === checkDate)
      if (hasEntry) {
        streak++
      } else if (i > 0) {
        break
      }
    }

    return {
      average: parseFloat(average.toFixed(1)),
      trend,
      trendDirection: parseFloat(trendDirection.toFixed(1)),
      bestDay,
      challengingDay,
      mostProductiveActivity,
      moodVolatility: volatility,
      insights: insights.slice(0, 3),
      recommendations: recommendations.slice(0, 3),
      streakDays: streak,
      improvement: parseFloat(improvement.toFixed(1)),
      weeklyPattern: dayAverages.slice(0, 7)
    }
  }, [moods, timeRange])

  const getTrendIcon = () => {
    if (analysis.trend === 'improving') return '📈'
    if (analysis.trend === 'declining') return '📉'
    return '➡️'
  }

  const getTrendColor = () => {
    if (analysis.trend === 'improving') return 'text-green-600'
    if (analysis.trend === 'declining') return 'text-red-600'
    return 'text-blue-600'
  }

  return (
    <div className="space-y-6">
      {/* Header with time range selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-readable">
          Hey {userName}! Here's your mood analysis 📊
        </h2>
        <div className="flex bg-gray-100 rounded-xl p-1">
          {(['week', 'month', 'all'] as const).map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                timeRange === range
                  ? 'bg-white shadow-md text-readable'
                  : 'text-readable-secondary hover:text-readable'
              }`}
            >
              {range === 'week' ? '7 Days' : range === 'month' ? '30 Days' : 'All Time'}
            </button>
          ))}
        </div>
      </div>

      {/* Key metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div 
          className="card-soft rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="text-3xl font-bold text-purple-600 mb-2">
            {analysis.average}/10
          </div>
          <div className="text-sm text-readable-secondary">Average Mood</div>
        </motion.div>

        <motion.div 
          className="card-soft rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={`text-3xl font-bold mb-2 ${getTrendColor()}`}>
            {getTrendIcon()}
          </div>
          <div className="text-sm text-readable-secondary capitalize">{analysis.trend}</div>
          {analysis.trendDirection !== 0 && (
            <div className="text-xs text-readable-muted mt-1">
              {analysis.trendDirection > 0 ? '+' : ''}{analysis.trendDirection.toFixed(1)} pts
            </div>
          )}
        </motion.div>

        <motion.div 
          className="card-soft rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="text-3xl font-bold text-orange-600 mb-2">
            {analysis.streakDays}
          </div>
          <div className="text-sm text-readable-secondary">Day Streak</div>
        </motion.div>

        <motion.div 
          className="card-soft rounded-xl p-6 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {analysis.improvement > 0 ? '+' : ''}{analysis.improvement}%
          </div>
          <div className="text-sm text-readable-secondary">Improvement</div>
        </motion.div>
      </div>

      {/* Insights */}
      <motion.div 
        className="card-soft rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <h3 className="text-xl font-bold text-readable mb-4">🔍 Key Insights</h3>
        <div className="space-y-3">
          {analysis.insights.map((insight, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              <span className="text-blue-500 mt-0.5">→</span>
              <p className="text-readable-secondary flex-1">{insight}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Recommendations */}
      <motion.div 
        className="card-soft rounded-xl p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <h3 className="text-xl font-bold text-readable mb-4">💡 Personalized Recommendations</h3>
        <div className="space-y-3">
          {analysis.recommendations.map((rec, index) => (
            <motion.div
              key={index}
              className="flex items-start gap-3 p-3 bg-green-50 rounded-xl"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + index * 0.1 }}
            >
              <span className="text-green-500 mt-0.5">✓</span>
              <p className="text-readable-secondary flex-1">{rec}</p>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* Pattern Analysis */}
      {analysis.bestDay !== 'N/A' && (
        <motion.div 
          className="card-soft rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9 }}
        >
          <h3 className="text-xl font-bold text-readable mb-4">📊 Weekly Patterns</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-readable-muted mb-1">Best Day</div>
              <div className="text-lg font-semibold text-green-600">📅 {analysis.bestDay}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-readable-muted mb-1">Challenging Day</div>
              <div className="text-lg font-semibold text-red-600">📅 {analysis.challengingDay}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-readable-muted mb-1">Mood Booster</div>
              <div className="text-lg font-semibold text-purple-600 capitalize">
                🌟 {analysis.mostProductiveActivity.replace('-', ' ')}
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}

