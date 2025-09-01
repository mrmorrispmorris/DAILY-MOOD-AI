'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  RadialLinearScale
} from 'chart.js'
import { Line, Bar, Pie, Radar } from 'react-chartjs-2'
import { Calendar, TrendingUp, BarChart3, PieChart, Activity, Download } from 'lucide-react'
import 'chartjs-adapter-date-fns'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  RadialLinearScale
)

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

interface AdvancedMoodChartProps {
  moods: MoodEntry[]
  userId?: string
}

type ChartType = 'line' | 'bar' | 'pie' | 'radar'
type TimeRange = '7d' | '30d' | '90d' | '1y' | 'all'

export default function AdvancedMoodChart({ moods, userId }: AdvancedMoodChartProps) {
  const [chartType, setChartType] = useState<ChartType>('line')
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [showStats, setShowStats] = useState(true)
  const chartRef = useRef<any>(null)

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

  // Line Chart Data
  const lineData = useMemo(() => {
    const sortedMoods = [...filteredMoods].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    
    return {
      labels: sortedMoods.map(m => new Date(m.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Mood Score',
          data: sortedMoods.map(m => m.mood_score),
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          tension: 0.4,
          fill: true,
          pointBackgroundColor: sortedMoods.map(m => {
            if (m.mood_score >= 8) return '#10b981'
            if (m.mood_score >= 6) return '#84cc16'
            if (m.mood_score >= 4) return '#fbbf24'
            return '#f87171'
          }),
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6
        }
      ]
    }
  }, [filteredMoods])

  // Bar Chart Data (Day of Week)
  const barData = useMemo(() => {
    const dayOfWeekMap: Record<string, number[]> = {}
    const dayOrder = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    
    filteredMoods.forEach(mood => {
      const dayName = new Date(mood.date).toLocaleDateString('en-US', { weekday: 'long' })
      if (!dayOfWeekMap[dayName]) dayOfWeekMap[dayName] = []
      dayOfWeekMap[dayName].push(mood.mood_score)
    })
    
    const dayAverages = dayOrder.map(day => {
      const scores = dayOfWeekMap[day] || []
      return scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
    })
    
    return {
      labels: dayOrder,
      datasets: [
        {
          label: 'Average Mood by Day',
          data: dayAverages,
          backgroundColor: [
            'rgba(239, 68, 68, 0.8)',   // Red
            'rgba(245, 101, 101, 0.8)',  // Red-orange
            'rgba(251, 191, 36, 0.8)',   // Yellow
            'rgba(132, 204, 22, 0.8)',   // Light green
            'rgba(16, 185, 129, 0.8)',   // Green
            'rgba(59, 130, 246, 0.8)',   // Blue
            'rgba(139, 92, 246, 0.8)'    // Purple
          ],
          borderColor: [
            'rgba(239, 68, 68, 1)',
            'rgba(245, 101, 101, 1)',
            'rgba(251, 191, 36, 1)',
            'rgba(132, 204, 22, 1)',
            'rgba(16, 185, 129, 1)',
            'rgba(59, 130, 246, 1)',
            'rgba(139, 92, 246, 1)'
          ],
          borderWidth: 1
        }
      ]
    }
  }, [filteredMoods])

  // Pie Chart Data (Mood Distribution)
  const pieData = useMemo(() => {
    const moodRanges = {
      'Excellent (9-10)': filteredMoods.filter(m => m.mood_score >= 9).length,
      'Good (7-8)': filteredMoods.filter(m => m.mood_score >= 7 && m.mood_score < 9).length,
      'Neutral (5-6)': filteredMoods.filter(m => m.mood_score >= 5 && m.mood_score < 7).length,
      'Low (3-4)': filteredMoods.filter(m => m.mood_score >= 3 && m.mood_score < 5).length,
      'Poor (1-2)': filteredMoods.filter(m => m.mood_score >= 1 && m.mood_score < 3).length
    }
    
    const nonZeroRanges = Object.entries(moodRanges).filter(([_, count]) => count > 0)
    
    return {
      labels: nonZeroRanges.map(([label, _]) => label),
      datasets: [
        {
          data: nonZeroRanges.map(([_, count]) => count),
          backgroundColor: [
            '#10b981', // Excellent - Green
            '#84cc16', // Good - Light green
            '#fbbf24', // Neutral - Yellow
            '#fb923c', // Low - Orange
            '#f87171'  // Poor - Red
          ],
          borderColor: '#ffffff',
          borderWidth: 2
        }
      ]
    }
  }, [filteredMoods])

  // Radar Chart Data (Weekly Pattern)
  const radarData = useMemo(() => {
    if (!statistics?.activityCorrelations?.length) {
      return {
        labels: ['Sleep', 'Exercise', 'Social', 'Work', 'Self-care'],
        datasets: [
          {
            label: 'Activity Impact',
            data: [5, 5, 5, 5, 5],
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            borderWidth: 2
          }
        ]
      }
    }
    
    return {
      labels: statistics.activityCorrelations.map(ac => ac.activity),
      datasets: [
        {
          label: 'Activity Impact on Mood',
          data: statistics.activityCorrelations.map(ac => Math.max(0, ac.averageMood)),
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: 'rgb(59, 130, 246)',
          borderWidth: 2,
          pointBackgroundColor: 'rgb(59, 130, 246)',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2
        }
      ]
    }
  }, [statistics])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: `Mood Analytics - ${timeRange} view`
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
      }
    },
    scales: chartType === 'line' || chartType === 'bar' ? {
      y: {
        beginAtZero: true,
        max: 10,
        ticks: {
          stepSize: 1
        }
      }
    } : undefined,
    interaction: {
      mode: 'nearest' as const,
      axis: 'x' as const,
      intersect: false,
    },
  }

  const downloadChart = () => {
    if (chartRef.current) {
      const url = chartRef.current.toBase64Image()
      const link = document.createElement('a')
      link.download = `mood-chart-${timeRange}-${chartType}.png`
      link.href = url
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

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
          <h2 className="text-xl font-bold text-gray-900">Advanced Analytics</h2>
          <button
            onClick={downloadChart}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            Export Chart
          </button>
        </div>
        
        <div className="flex flex-wrap gap-4 mb-4">
          {/* Chart Type Selector */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-700">Chart Type:</span>
            <div className="flex bg-gray-100 rounded-lg p-1">
              {[
                { type: 'line', icon: TrendingUp, label: 'Line' },
                { type: 'bar', icon: BarChart3, label: 'Bar' },
                { type: 'pie', icon: PieChart, label: 'Pie' },
                { type: 'radar', icon: Activity, label: 'Radar' }
              ].map(({ type, icon: Icon, label }) => (
                <button
                  key={type}
                  onClick={() => setChartType(type as ChartType)}
                  className={`flex items-center gap-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    chartType === type
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
          
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
        
        {/* Chart Container */}
        <div className="h-96 w-full">
          {chartType === 'line' && <Line ref={chartRef} data={lineData} options={chartOptions} />}
          {chartType === 'bar' && <Bar ref={chartRef} data={barData} options={chartOptions} />}
          {chartType === 'pie' && <Pie ref={chartRef} data={pieData} options={chartOptions} />}
          {chartType === 'radar' && <Radar ref={chartRef} data={radarData} options={chartOptions} />}
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
