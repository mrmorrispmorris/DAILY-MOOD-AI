'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Activity, 
  Download 
} from 'lucide-react'

interface MoodEntry {
  id: number
  user_id: string
  mood_score: number
  date: string
  activities: string[]
  notes: string
  created_at: string
  emoji?: string
}

interface SimpleMoodChartProps {
  moods: MoodEntry[]
  userId?: string
}

type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export default function SimpleMoodChart({ moods, userId }: SimpleMoodChartProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [showStats, setShowStats] = useState(true)

  // Filter moods based on time range
  const filteredMoods = useMemo(() => {
    if (!moods?.length) return []
    
    const now = new Date()
    const cutoffDate = new Date()
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7)
        break
      case '30d':
        cutoffDate.setDate(now.getDate() - 30)
        break
      case '90d':
        cutoffDate.setDate(now.getDate() - 90)
        break
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      case 'all':
        return moods
    }
    
    return moods.filter(mood => new Date(mood.date) >= cutoffDate)
  }, [moods, timeRange])

  // Calculate comprehensive statistics
  const statistics = useMemo(() => {
    if (!filteredMoods.length) return null
    
    const scores = filteredMoods.map(m => m.mood_score)
    const average = scores.reduce((a, b) => a + b, 0) / scores.length
    const sorted = [...scores].sort((a, b) => a - b)
    const median = sorted[Math.floor(sorted.length / 2)]
    const min = Math.min(...scores)
    const max = Math.max(...scores)
    const variance = scores.reduce((sum, score) => sum + Math.pow(score - average, 2), 0) / scores.length
    const standardDeviation = Math.sqrt(variance)
    
    // Trend calculation (last 7 vs previous 7)
    const recentMoods = filteredMoods.slice(0, 7)
    const olderMoods = filteredMoods.slice(7, 14)
    const recentAvg = recentMoods.length ? recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length : 0
    const olderAvg = olderMoods.length ? olderMoods.reduce((sum, m) => sum + m.mood_score, 0) / olderMoods.length : 0
    const trend = recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable'
    const trendChange = Math.abs(recentAvg - olderAvg)
    
    // Activity analysis
    const activityMap: Record<string, number[]> = {}
    filteredMoods.forEach(mood => {
      mood.activities?.forEach(activity => {
        if (!activityMap[activity]) activityMap[activity] = []
        activityMap[activity].push(mood.mood_score)
      })
    })
    
    const activityCorrelations = Object.entries(activityMap)
      .map(([activity, scores]) => ({
        activity,
        averageMood: scores.reduce((a, b) => a + b, 0) / scores.length,
        count: scores.length,
        impact: (scores.reduce((a, b) => a + b, 0) / scores.length) - average
      }))
      .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
      .slice(0, 5)
    
    // Day of week analysis
    const dayOfWeekMap: Record<string, number[]> = {}
    filteredMoods.forEach(mood => {
      const dayName = new Date(mood.date).toLocaleDateString('en-US', { weekday: 'long' })
      if (!dayOfWeekMap[dayName]) dayOfWeekMap[dayName] = []
      dayOfWeekMap[dayName].push(mood.mood_score)
    })
    
    const bestDay = Object.entries(dayOfWeekMap)
      .map(([day, scores]) => ({ 
        day, 
        average: scores.reduce((a, b) => a + b, 0) / scores.length 
      }))
      .sort((a, b) => b.average - a.average)[0]?.day || 'N/A'
    
    return {
      average: parseFloat(average.toFixed(1)),
      median,
      min,
      max,
      standardDeviation: parseFloat(standardDeviation.toFixed(1)),
      trend,
      trendChange: parseFloat(trendChange.toFixed(1)),
      totalEntries: filteredMoods.length,
      activityCorrelations,
      bestDay,
      consistency: standardDeviation < 1.5 ? 'high' : standardDeviation < 2.5 ? 'moderate' : 'low'
    }
  }, [filteredMoods])

  // Simple visual chart using CSS
  const visualChart = useMemo(() => {
    const sortedMoods = [...filteredMoods]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-14) // Last 14 days

    return sortedMoods.map(mood => ({
      date: new Date(mood.date).toLocaleDateString('en-US', { weekday: 'short' }),
      fullDate: mood.date,
      score: mood.score,
      height: (mood.mood_score / 10) * 100,
      color: mood.mood_score >= 8 ? '#10b981' : 
             mood.mood_score >= 6 ? '#84cc16' : 
             mood.mood_score >= 4 ? '#fbbf24' : '#f87171'
    }))
  }, [filteredMoods])

  if (!moods?.length) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Data Available</h3>
        <p className="text-gray-600">Start logging your moods to see beautiful analytics!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <h2 className="text-xl font-bold text-gray-900">Mood Analytics</h2>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Visual Insights</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-6">
          {/* Time Range Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Time Range:</span>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as TimeRange)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 3 months</option>
              <option value="1y">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
        </div>
        
        {/* Visual Chart */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-4">Mood Trend (Last 14 Days)</h3>
          <div className="flex items-end justify-between gap-2 h-40">
            {visualChart.map((item, index) => (
              <div key={index} className="flex-1 flex flex-col items-center gap-2">
                <div className="relative group">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${item.height}%` }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="w-full min-w-[20px] rounded-t-md cursor-pointer transition-all duration-200 hover:opacity-80"
                    style={{ backgroundColor: item.color }}
                  />
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.fullDate}: {item.score}/10
                  </div>
                </div>
                <span className="text-xs text-gray-600 font-medium">{item.date}</span>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-xs text-gray-500 mt-2">
            <span>Poor (1-3)</span>
            <span>Fair (4-6)</span>
            <span>Good (7-8)</span>
            <span>Excellent (9-10)</span>
          </div>
        </div>
      </div>

      {/* Statistics Panel */}
      {statistics && showStats && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Detailed Statistics</h3>
            <button
              onClick={() => setShowStats(!showStats)}
              className="text-sm text-blue-600 hover:text-blue-700"
            >
              Hide Stats
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Basic Stats */}
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-2">Overview</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Average:</span>
                  <span className="font-medium">{statistics.average}/10</span>
                </div>
                <div className="flex justify-between">
                  <span>Entries:</span>
                  <span className="font-medium">{statistics.totalEntries}</span>
                </div>
                <div className="flex justify-between">
                  <span>Range:</span>
                  <span className="font-medium">{statistics.min}-{statistics.max}</span>
                </div>
              </div>
            </div>
            
            {/* Trend Analysis */}
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-green-900 mb-2">Trend</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Direction:</span>
                  <span className={`font-medium capitalize ${
                    statistics.trend === 'improving' ? 'text-green-600' :
                    statistics.trend === 'declining' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {statistics.trend}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Change:</span>
                  <span className="font-medium">±{statistics.trendChange}</span>
                </div>
                <div className="flex justify-between">
                  <span>Consistency:</span>
                  <span className="font-medium capitalize">{statistics.consistency}</span>
                </div>
              </div>
            </div>
            
            {/* Patterns */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-purple-900 mb-2">Patterns</h4>
              <div className="space-y-1 text-sm">
                <div className="flex justify-between">
                  <span>Best Day:</span>
                  <span className="font-medium">{statistics.bestDay}</span>
                </div>
                <div className="flex justify-between">
                  <span>Std Dev:</span>
                  <span className="font-medium">{statistics.standardDeviation}</span>
                </div>
                <div className="flex justify-between">
                  <span>Median:</span>
                  <span className="font-medium">{statistics.median}/10</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Activity Correlations */}
          {statistics.activityCorrelations.length > 0 && (
            <div className="mt-6">
              <h4 className="font-medium text-gray-900 mb-3">Activity Impact</h4>
              <div className="space-y-2">
                {statistics.activityCorrelations.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium">{activity.activity}</span>
                      <span className="text-xs text-gray-600">({activity.count} times)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Avg: {activity.averageMood.toFixed(1)}</span>
                      <div className={`text-sm font-medium ${
                        activity.impact > 0.5 ? 'text-green-600' :
                        activity.impact < -0.5 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {activity.impact > 0 ? '+' : ''}{activity.impact.toFixed(1)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
