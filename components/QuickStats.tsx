'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { TrendingUp, Calendar, Award, BarChart3, Target, Zap, Activity, Clock, Heart } from 'lucide-react'

interface StatsData {
  currentStreak: number
  totalEntries: number
  averageMood: number
  thisWeekAvg: number
  lastWeekAvg: number
  improvement: number
  bestDay: string
  challengingDay: string
  moodVolatility: 'low' | 'medium' | 'high'
  consistencyScore: number
  bestActivity: string
  worstActivity: string
  bestTime: string
  longestStreak: number
  moodRange: { min: number, max: number }
  weeklyProgress: number[]
}

export default function QuickStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<StatsData>({
    currentStreak: 0,
    totalEntries: 0,
    averageMood: 0,
    thisWeekAvg: 0,
    lastWeekAvg: 0,
    improvement: 0,
    bestDay: 'N/A',
    challengingDay: 'N/A',
    moodVolatility: 'medium',
    consistencyScore: 0,
    bestActivity: 'N/A',
    worstActivity: 'N/A',
    bestTime: 'N/A',
    longestStreak: 0,
    moodRange: { min: 10, max: 1 },
    weeklyProgress: []
  })
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (userId) {
      calculateStats()
    }
  }, [userId, calculateStats])

  const calculateStats = async () => {
    try {
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      if (!entries || entries.length === 0) {
        setLoading(false)
        return
      }

      console.log('📊 Calculating enhanced stats for', entries.length, 'entries')

      // Calculate current streak and longest streak
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0
      const today = new Date()
      const entriesByDate = new Map()
      
      entries.forEach(entry => {
        const entryDate = new Date(entry.created_at).toDateString()
        if (!entriesByDate.has(entryDate)) {
          entriesByDate.set(entryDate, true)
        }
      })

      // Calculate current streak (consecutive days from today backwards)
      for (let i = 0; i < 365; i++) {
        const checkDate = new Date(today)
        checkDate.setDate(checkDate.getDate() - i)
        const dateString = checkDate.toDateString()
        
        if (entriesByDate.has(dateString)) {
          if (i === 0 || currentStreak > 0) currentStreak++
          tempStreak++
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak
          if (i === 0) currentStreak = 0
          tempStreak = 0
        }
      }
      if (tempStreak > longestStreak) longestStreak = tempStreak

      // Calculate mood statistics
      const moodScores = entries.map(e => e.mood_score)
      const totalMood = moodScores.reduce((sum, score) => sum + score, 0)
      const avgMood = totalMood / moodScores.length
      const minMood = Math.min(...moodScores)
      const maxMood = Math.max(...moodScores)

      // Calculate mood volatility (standard deviation)
      const variance = moodScores.reduce((sum, score) => sum + Math.pow(score - avgMood, 2), 0) / moodScores.length
      const stdDev = Math.sqrt(variance)
      const moodVolatility: 'low' | 'medium' | 'high' = 
        stdDev < 1.5 ? 'low' : stdDev < 2.5 ? 'medium' : 'high'

      // Calculate consistency score (inverse of volatility, normalized 0-100)
      const consistencyScore = Math.max(0, Math.min(100, 100 - (stdDev * 20)))

      // Weekly progress (last 7 days average mood)
      const weeklyProgress: number[] = []
      for (let i = 6; i >= 0; i--) {
        const dayStart = new Date(today)
        dayStart.setDate(dayStart.getDate() - i)
        dayStart.setHours(0, 0, 0, 0)
        
        const dayEnd = new Date(dayStart)
        dayEnd.setHours(23, 59, 59, 999)
        
        const dayEntries = entries.filter(e => {
          const entryDate = new Date(e.created_at)
          return entryDate >= dayStart && entryDate <= dayEnd
        })
        
        const dayAvg = dayEntries.length > 0 
          ? dayEntries.reduce((sum, e) => sum + e.mood_score, 0) / dayEntries.length
          : 0
        weeklyProgress.push(parseFloat(dayAvg.toFixed(1)))
      }

      // Weekly comparison
      const oneWeekAgo = new Date()
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14)

      const thisWeekEntries = entries.filter(e => new Date(e.created_at) >= oneWeekAgo)
      const lastWeekEntries = entries.filter(e => 
        new Date(e.created_at) >= twoWeeksAgo && new Date(e.created_at) < oneWeekAgo
      )

      const thisWeekAvg = thisWeekEntries.length > 0 
        ? thisWeekEntries.reduce((sum, e) => sum + e.mood_score, 0) / thisWeekEntries.length 
        : 0
      const lastWeekAvg = lastWeekEntries.length > 0 
        ? lastWeekEntries.reduce((sum, e) => sum + e.mood_score, 0) / lastWeekEntries.length 
        : 0

      const improvement = lastWeekAvg > 0 ? ((thisWeekAvg - lastWeekAvg) / lastWeekAvg) * 100 : 0

      // Best and challenging days analysis
      const dayAverages: Record<string, number[]> = {}
      entries.forEach(entry => {
        const dayName = new Date(entry.created_at).toLocaleDateString('en-US', { weekday: 'long' })
        if (!dayAverages[dayName]) dayAverages[dayName] = []
        dayAverages[dayName].push(entry.mood_score)
      })

      const dayStats = Object.entries(dayAverages)
        .map(([day, scores]) => ({
          day,
          avg: scores.reduce((a, b) => a + b, 0) / scores.length
        }))
        .sort((a, b) => b.avg - a.avg)

      // Activity impact analysis
      const activityImpact: Record<string, number[]> = {}
      entries.forEach(entry => {
        if (entry.activities && entry.activities.length > 0) {
          entry.activities.forEach((activity: string) => {
            if (!activityImpact[activity]) activityImpact[activity] = []
            activityImpact[activity].push(entry.mood_score)
          })
        }
      })

      let bestActivity = 'N/A'
      let worstActivity = 'N/A'
      let bestActivityScore = 0
      let worstActivityScore = 10

      Object.entries(activityImpact).forEach(([activity, scores]) => {
        if (scores.length >= 3) { // Only consider activities with enough data
          const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
          if (avg > bestActivityScore) {
            bestActivityScore = avg
            bestActivity = activity
          }
          if (avg < worstActivityScore) {
            worstActivityScore = avg
            worstActivity = activity
          }
        }
      })

      // Time of day analysis
      const timePatterns: Record<string, number[]> = {}
      entries.forEach(entry => {
        const hour = new Date(entry.created_at).getHours()
        const timeOfDay = hour < 12 ? 'Morning' : hour < 18 ? 'Afternoon' : 'Evening'
        if (!timePatterns[timeOfDay]) timePatterns[timeOfDay] = []
        timePatterns[timeOfDay].push(entry.mood_score)
      })

      let bestTime = 'N/A'
      let bestTimeScore = 0
      Object.entries(timePatterns).forEach(([time, scores]) => {
        const avg = scores.reduce((sum, score) => sum + score, 0) / scores.length
        if (avg > bestTimeScore) {
          bestTimeScore = avg
          bestTime = time
        }
      })

      setStats({
        currentStreak,
        totalEntries: entries.length,
        averageMood: parseFloat(avgMood.toFixed(1)),
        thisWeekAvg: parseFloat(thisWeekAvg.toFixed(1)),
        lastWeekAvg: parseFloat(lastWeekAvg.toFixed(1)),
        improvement: parseFloat(improvement.toFixed(1)),
        bestDay: dayStats[0]?.day || 'N/A',
        challengingDay: dayStats[dayStats.length - 1]?.day || 'N/A',
        moodVolatility,
        consistencyScore: Math.round(consistencyScore),
        bestActivity: bestActivity.charAt(0).toUpperCase() + bestActivity.slice(1),
        worstActivity: worstActivity.charAt(0).toUpperCase() + worstActivity.slice(1),
        bestTime,
        longestStreak,
        moodRange: { min: minMood, max: maxMood },
        weeklyProgress
      })
    } catch (error) {
      console.error('Error calculating enhanced stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (stats.totalEntries === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4">Your Stats</h3>
        <div className="text-center py-8">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Start logging your moods to see your stats!</p>
        </div>
      </div>
    )
  }

  const getImprovementColor = (improvement: number) => {
    if (improvement > 5) return 'text-green-600 bg-green-50 border-green-200'
    if (improvement < -5) return 'text-red-600 bg-red-50 border-red-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const getVolatilityColor = (volatility: string) => {
    switch (volatility) {
      case 'low': return 'text-green-600 bg-green-50'
      case 'high': return 'text-orange-600 bg-orange-50'
      default: return 'text-blue-600 bg-blue-50'
    }
  }

  const getVolatilityIcon = (volatility: string) => {
    switch (volatility) {
      case 'low': return <Heart className="w-4 h-4" />
      case 'high': return <Zap className="w-4 h-4" />
      default: return <Activity className="w-4 h-4" />
    }
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        Enhanced Analytics
      </h3>
      
      {/* Primary Stats Grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {/* Current Streak */}
        <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border border-purple-200">
          <Award className="w-6 h-6 text-purple-600 mx-auto mb-2" />
          <div className="text-xl font-bold text-purple-600">{stats.currentStreak}</div>
          <div className="text-xs text-purple-700">Current Streak</div>
          {stats.longestStreak > stats.currentStreak && (
            <div className="text-xs text-purple-600 mt-1">Best: {stats.longestStreak} days</div>
          )}
        </div>

        {/* Average Mood */}
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
          <div className="text-xl font-bold text-blue-600 mb-1">{stats.averageMood}/10</div>
          <div className="text-xs text-blue-700">Average Mood</div>
          <div className="text-xs text-blue-600 mt-1">
            Range: {stats.moodRange.min}-{stats.moodRange.max}
          </div>
        </div>

        {/* Consistency Score */}
        <div className={`text-center p-4 rounded-lg border ${getVolatilityColor(stats.moodVolatility)}`}>
          {getVolatilityIcon(stats.moodVolatility)}
          <div className="text-xl font-bold mt-1">{stats.consistencyScore}%</div>
          <div className="text-xs">Consistency</div>
          <div className="text-xs opacity-75 capitalize">{stats.moodVolatility} volatility</div>
        </div>

        {/* Weekly Trend */}
        <div className={`text-center p-4 rounded-lg border ${getImprovementColor(stats.improvement)}`}>
          <TrendingUp className="w-6 h-6 mx-auto mb-2" />
          <div className="text-xl font-bold">
            {stats.improvement > 0 ? '+' : ''}{stats.improvement}%
          </div>
          <div className="text-xs">Weekly Trend</div>
        </div>
      </div>

      {/* Weekly Progress Visualization */}
      <div className="mb-6">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">7-Day Progress</h4>
        <div className="flex justify-between items-end h-16 bg-gray-50 rounded-lg p-3">
          {stats.weeklyProgress.map((mood, i) => (
            <div key={i} className="flex flex-col items-center">
              <div
                className="bg-gradient-to-t from-purple-400 to-purple-600 rounded-t w-4 min-h-[4px]"
                style={{ height: `${(mood / 10) * 100}%` }}
              />
              <div className="text-xs text-gray-500 mt-1">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'][i]}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Insights */}
      <div className="space-y-3 border-t pt-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Best day:</span>
              <span className="font-semibold text-green-600">{stats.bestDay}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Best time:</span>
              <span className="font-semibold text-blue-600">{stats.bestTime}</span>
            </div>
          </div>
          
          <div>
            <div className="flex justify-between">
              <span className="text-gray-600">Total entries:</span>
              <span className="font-semibold text-purple-600">{stats.totalEntries}</span>
            </div>
            <div className="flex justify-between mt-1">
              <span className="text-gray-600">Challenging day:</span>
              <span className="font-semibold text-orange-600">{stats.challengingDay}</span>
            </div>
          </div>
        </div>

        {/* Activity Insights */}
        {(stats.bestActivity !== 'N/A' || stats.worstActivity !== 'N/A') && (
          <div className="bg-blue-50 rounded-lg p-3 mt-3">
            <h4 className="text-sm font-semibold text-blue-800 mb-2 flex items-center gap-1">
              <Activity className="w-4 h-4" />
              Activity Impact
            </h4>
            <div className="space-y-1 text-xs text-blue-700">
              {stats.bestActivity !== 'N/A' && (
                <div>🚀 <strong>{stats.bestActivity}</strong> boosts your mood the most</div>
              )}
              {stats.worstActivity !== 'N/A' && (
                <div>⚠️ <strong>{stats.worstActivity}</strong> tends to lower your mood</div>
              )}
            </div>
          </div>
        )}

        {/* Weekly Improvement Message */}
        {stats.improvement !== 0 && (
          <div className={`p-3 rounded-lg border ${getImprovementColor(stats.improvement)}`}>
            <p className="text-xs text-center">
              {stats.improvement > 5 
                ? `🎉 Excellent! Your mood improved ${Math.abs(stats.improvement)}% this week!`
                : stats.improvement > 0
                ? `📈 Great progress! Your mood is trending upward (+${stats.improvement}%)`
                : stats.improvement > -5
                ? `📊 Your mood has been stable this week (${stats.improvement}%)`
                : `💙 Challenging week, but remember: ups and downs are part of life`
              }
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Advanced analytics beyond basic mood tracking</span>
          <span className="flex items-center gap-1">
            <BarChart3 className="w-3 h-3" />
            Enhanced Stats
          </span>
        </div>
      </div>
    </div>
  )
}
