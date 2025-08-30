'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface MoodEntry {
  id: string
  date: string
  mood_score: number
  emoji: string
  mood_label?: string
  notes?: string
  activities?: string[]
}

interface EnhancedMoodChartProps {
  moods: MoodEntry[]
  chartType?: 'line' | 'bar' | 'area' | 'trend'
  timeframe?: 'week' | 'month' | 'quarter' | 'year'
  showActivities?: boolean
}

const moodColors = {
  1: '#EF4444', 2: '#F97316', 3: '#F59E0B', 4: '#22C55E', 5: '#10B981'
}

const moodLabels = {
  1: 'Awful', 2: 'Bad', 3: 'Meh', 4: 'Good', 5: 'Rad'
}

export default function EnhancedMoodChart({ 
  moods, 
  chartType = 'line',
  timeframe = 'month',
  showActivities = false 
}: EnhancedMoodChartProps) {
  
  // Process mood data for visualization
  const chartData = useMemo(() => {
    if (!moods.length) return { data: [], stats: null }
    
    // Sort moods by date
    const sortedMoods = [...moods].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    )
    
    // Calculate timeframe
    const now = new Date()
    const cutoffDays = {
      week: 7,
      month: 30,
      quarter: 90,
      year: 365
    }[timeframe]
    
    const cutoffDate = new Date(now.getTime() - (cutoffDays * 24 * 60 * 60 * 1000))
    const filteredMoods = sortedMoods.filter(mood => 
      new Date(mood.date) >= cutoffDate
    )
    
    // Calculate stats
    const avgMood = filteredMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / filteredMoods.length
    const trendMoods = filteredMoods.slice(-14) // Last 2 weeks for trend
    const recentAvg = trendMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / trendMoods.length
    const olderAvg = filteredMoods.slice(-28, -14).reduce((sum, mood) => sum + mood.mood_score, 0) / 
                    Math.max(filteredMoods.slice(-28, -14).length, 1)
    const trend = recentAvg - olderAvg
    
    const stats = {
      average: Math.round(avgMood * 10) / 10,
      trend: Math.round(trend * 100) / 100,
      bestMood: Math.max(...filteredMoods.map(m => m.mood_score)),
      worstMood: Math.min(...filteredMoods.map(m => m.mood_score)),
      totalEntries: filteredMoods.length,
      consistency: calculateConsistency(filteredMoods)
    }
    
    return { data: filteredMoods, stats }
  }, [moods, timeframe])

  const calculateConsistency = (moods: MoodEntry[]) => {
    if (moods.length < 2) return 0
    const variance = moods.reduce((sum, mood, i, arr) => {
      if (i === 0) return 0
      return sum + Math.pow(mood.mood_score - arr[i-1].mood_score, 2)
    }, 0) / (moods.length - 1)
    return Math.max(0, 100 - (variance * 25)) // Convert to consistency percentage
  }

  const renderLineChart = () => {
    if (!chartData.data.length) return null
    
    const maxHeight = 200
    const width = 100
    const data = chartData.data.slice(-30) // Last 30 entries
    
    // Calculate path
    const points = data.map((mood, index) => {
      const x = (index / (data.length - 1)) * width
      const y = maxHeight - ((mood.mood_score - 1) / 4) * maxHeight
      return `${x},${y}`
    }).join(' ')
    
    return (
      <div className="relative">
        <svg
          viewBox={`0 0 ${width} ${maxHeight}`}
          className="w-full h-48 overflow-visible"
        >
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map(level => (
            <line
              key={level}
              x1="0"
              y1={maxHeight - ((level - 1) / 4) * maxHeight}
              x2={width}
              y2={maxHeight - ((level - 1) / 4) * maxHeight}
              stroke="#E5E7EB"
              strokeWidth="1"
              strokeDasharray="2,2"
            />
          ))}
          
          {/* Area gradient */}
          <defs>
            <linearGradient id="moodGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3"/>
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1"/>
            </linearGradient>
          </defs>
          
          {/* Area fill */}
          {chartType === 'area' && (
            <path
              d={`M 0,${maxHeight} L ${points} L ${width},${maxHeight} Z`}
              fill="url(#moodGradient)"
            />
          )}
          
          {/* Main line */}
          <motion.polyline
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            points={points}
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          
          {/* Data points */}
          {data.map((mood, index) => {
            const x = (index / (data.length - 1)) * width
            const y = maxHeight - ((mood.mood_score - 1) / 4) * maxHeight
            
            return (
              <motion.g key={mood.id}>
                <motion.circle
                  initial={{ r: 0, opacity: 0 }}
                  animate={{ r: 4, opacity: 1 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  cx={x}
                  cy={y}
                  fill={moodColors[mood.mood_score as keyof typeof moodColors]}
                  stroke="white"
                  strokeWidth="2"
                  className="hover:r-6 cursor-pointer transition-all"
                />
                
                {/* Mood emoji on hover */}
                <text
                  x={x}
                  y={y - 10}
                  textAnchor="middle"
                  fontSize="12"
                  className="opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {mood.emoji}
                </text>
              </motion.g>
            )
          })}
        </svg>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-48 flex flex-col justify-between text-xs text-gray-500 -ml-8">
          {['Rad', 'Good', 'Meh', 'Bad', 'Awful'].map((label, index) => (
            <span key={label} className="leading-none">{label}</span>
          ))}
        </div>
      </div>
    )
  }

  const renderBarChart = () => {
    if (!chartData.data.length) return null
    
    const recentMoods = chartData.data.slice(-14) // Last 2 weeks
    
    return (
      <div className="flex items-end justify-between h-48 px-2">
        {recentMoods.map((mood, index) => {
          const height = (mood.mood_score / 5) * 100
          const color = moodColors[mood.mood_score as keyof typeof moodColors]
          
          return (
            <motion.div
              key={mood.id}
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              className="flex-1 mx-0.5 rounded-t-lg flex flex-col justify-end items-center relative group cursor-pointer"
              style={{ backgroundColor: color }}
            >
              {/* Emoji tooltip */}
              <div className="absolute -top-8 opacity-0 group-hover:opacity-100 transition-opacity bg-black text-white px-2 py-1 rounded text-xs">
                {mood.emoji} {new Date(mood.date).getMonth() + 1}/{new Date(mood.date).getDate()}
              </div>
            </motion.div>
          )
        })}
      </div>
    )
  }

  const renderTrendChart = () => {
    if (!chartData.data.length || !chartData.stats) return null
    
    const trend = chartData.stats.trend
    const trendColor = trend > 0 ? '#22C55E' : trend < 0 ? '#EF4444' : '#F59E0B'
    const trendIcon = trend > 0 ? '📈' : trend < 0 ? '📉' : '📊'
    
    return (
      <div className="flex items-center justify-center h-48">
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="text-6xl mb-4"
          >
            {trendIcon}
          </motion.div>
          <div className="text-2xl font-bold mb-2" style={{ color: trendColor }}>
            {trend > 0 ? '+' : ''}{trend.toFixed(2)}
          </div>
          <div className="text-sm text-gray-600">
            {trend > 0.1 ? 'Improving!' : trend < -0.1 ? 'Declining' : 'Stable'}
          </div>
        </div>
      </div>
    )
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar': return renderBarChart()
      case 'area': return renderLineChart()
      case 'trend': return renderTrendChart()
      default: return renderLineChart()
    }
  }

  if (!chartData.data.length) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="text-6xl mb-4">📊</div>
        <h3 className="text-lg font-semibold text-gray-800 mb-2">No mood data yet</h3>
        <p className="text-gray-600">Start tracking your moods to see beautiful visualizations!</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold">Mood Trends</h3>
          <span className="text-sm bg-white/20 px-3 py-1 rounded-full capitalize">
            {timeframe}
          </span>
        </div>
        
        {/* Quick Stats */}
        {chartData.stats && (
          <div className="grid grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{chartData.stats.average}</div>
              <div className="text-xs opacity-80">Average</div>
            </div>
            <div>
              <div className="text-2xl font-bold" style={{ 
                color: chartData.stats.trend > 0 ? '#4ADE80' : chartData.stats.trend < 0 ? '#F87171' : 'white' 
              }}>
                {chartData.stats.trend > 0 ? '+' : ''}{chartData.stats.trend.toFixed(1)}
              </div>
              <div className="text-xs opacity-80">Trend</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{Math.round(chartData.stats.consistency)}%</div>
              <div className="text-xs opacity-80">Consistent</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{chartData.stats.totalEntries}</div>
              <div className="text-xs opacity-80">Entries</div>
            </div>
          </div>
        )}
      </div>
      
      {/* Chart Content */}
      <div className="p-6">
        {renderChart()}
      </div>
      
      {/* Activity Insights */}
      {showActivities && chartData.data.length > 0 && (
        <div className="border-t bg-gray-50 p-6">
          <h4 className="font-semibold text-gray-800 mb-3">Top Activities</h4>
          <div className="flex flex-wrap gap-2">
            {/* Calculate top activities */}
            {Object.entries(
              chartData.data
                .flatMap(mood => mood.activities || [])
                .reduce((acc: {[key: string]: number}, activity) => {
                  acc[activity] = (acc[activity] || 0) + 1
                  return acc
                }, {})
            )
              .sort(([,a], [,b]) => (b as number) - (a as number))
              .slice(0, 6)
              .map(([activity, count]) => (
                <span 
                  key={activity}
                  className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
                >
                  {activity} ({count})
                </span>
              ))
            }
          </div>
        </div>
      )}
    </div>
  )
}


