'use client'
import { useState } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2'
import { Calendar, TrendingUp, Activity, Clock, Sun, Users, Target } from 'lucide-react'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface MoodChartsProps {
  moods: any[]
}

export default function MoodCharts({ moods }: MoodChartsProps) {
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('week')
  const [chartType, setChartType] = useState<'line' | 'bar' | 'activity' | 'time' | 'weather'>('line')
  
  // Process mood trend data
  const getMoodTrendData = () => {
    const sortedMoods = [...moods].sort((a, b) => new Date(a.date || a.created_at).getTime() - new Date(b.date || b.created_at).getTime())
    
    let dataPoints = []
    let labels = []
    
    if (timeRange === 'week') {
      dataPoints = sortedMoods.slice(-7)
      labels = dataPoints.map(m => new Date(m.date || m.created_at).toLocaleDateString('en', { weekday: 'short' }))
    } else if (timeRange === 'month') {
      dataPoints = sortedMoods.slice(-30)
      labels = dataPoints.map(m => new Date(m.date || m.created_at).getDate().toString())
    } else {
      dataPoints = sortedMoods.slice(-365)
      labels = dataPoints.map(m => new Date(m.date || m.created_at).toLocaleDateString('en', { month: 'short' }))
    }
    
    return {
      labels,
      datasets: [{
        label: 'Mood Score',
        data: dataPoints.map(m => m.mood_score),
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(139, 92, 246)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8
      }]
    }
  }
  
  // Process activity correlation data
  const getActivityData = () => {
    const activityMoods: Record<string, number[]> = {}
    
    moods.forEach(mood => {
      const activities = mood.activities || mood.tags || []
      activities.forEach((activity: string) => {
        if (!activityMoods[activity]) activityMoods[activity] = []
        activityMoods[activity].push(mood.mood_score)
      })
    })
    
    const activityAverages = Object.entries(activityMoods).map(([activity, scores]) => ({
      activity: activity.charAt(0).toUpperCase() + activity.slice(1),
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length
    })).sort((a, b) => b.average - a.average).slice(0, 8)
    
    return {
      labels: activityAverages.map(a => a.activity),
      datasets: [{
        label: 'Average Mood Score',
        data: activityAverages.map(a => a.average),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',   // Green
          'rgba(59, 130, 246, 0.8)',  // Blue  
          'rgba(139, 92, 246, 0.8)',  // Purple
          'rgba(236, 72, 153, 0.8)',  // Pink
          'rgba(251, 146, 60, 0.8)',  // Orange
          'rgba(34, 211, 238, 0.8)',  // Cyan
          'rgba(248, 113, 113, 0.8)', // Red
          'rgba(163, 163, 163, 0.8)'  // Gray
        ],
        borderColor: [
          'rgb(34, 197, 94)',
          'rgb(59, 130, 246)', 
          'rgb(139, 92, 246)',
          'rgb(236, 72, 153)',
          'rgb(251, 146, 60)',
          'rgb(34, 211, 238)',
          'rgb(248, 113, 113)',
          'rgb(163, 163, 163)'
        ],
        borderWidth: 2
      }]
    }
  }
  
  // Process time pattern data
  const getTimePatternData = () => {
    const hourlyMoods: Record<number, number[]> = {}
    
    moods.forEach(mood => {
      const hour = new Date(mood.created_at).getHours()
      if (!hourlyMoods[hour]) hourlyMoods[hour] = []
      hourlyMoods[hour].push(mood.mood_score)
    })
    
    const hourlyAverages = Array.from({length: 24}, (_, hour) => ({
      hour: hour,
      average: hourlyMoods[hour] ? hourlyMoods[hour].reduce((a, b) => a + b, 0) / hourlyMoods[hour].length : 0,
      count: hourlyMoods[hour]?.length || 0
    })).filter(h => h.count > 0)
    
    return {
      labels: hourlyAverages.map(h => `${h.hour}:00`),
      datasets: [{
        label: 'Average Mood by Hour',
        data: hourlyAverages.map(h => h.average),
        borderColor: 'rgb(34, 211, 238)',
        backgroundColor: 'rgba(34, 211, 238, 0.1)',
        tension: 0.4,
        fill: true,
        pointBackgroundColor: 'rgb(34, 211, 238)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4
      }]
    }
  }
  
  // Process weather correlation data  
  const getWeatherData = () => {
    const weatherMoods: Record<string, number[]> = {}
    
    moods.forEach(mood => {
      const weather = mood.weather
      if (weather) {
        if (!weatherMoods[weather]) weatherMoods[weather] = []
        weatherMoods[weather].push(mood.mood_score)
      }
    })
    
    const weatherAverages = Object.entries(weatherMoods).map(([weather, scores]) => ({
      weather: weather.charAt(0).toUpperCase() + weather.slice(1),
      average: scores.reduce((a, b) => a + b, 0) / scores.length,
      count: scores.length
    }))
    
    return {
      labels: weatherAverages.map(w => w.weather),
      datasets: [{
        label: 'Average Mood by Weather',
        data: weatherAverages.map(w => w.average),
        backgroundColor: [
          'rgba(251, 191, 36, 0.8)',  // Sunny - Yellow
          'rgba(156, 163, 175, 0.8)', // Cloudy - Gray  
          'rgba(59, 130, 246, 0.8)',  // Rainy - Blue
          'rgba(34, 197, 94, 0.8)',   // Windy - Green
        ],
        borderWidth: 0
      }]
    }
  }
  
  // Calculate insights
  const getInsights = () => {
    if (moods.length === 0) return null
    
    const recentMoods = moods.slice(0, 7)
    const average = recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length
    
    // Find best day of week
    const dayMoods: Record<number, number[]> = {}
    moods.forEach(mood => {
      const day = new Date(mood.created_at).getDay()
      if (!dayMoods[day]) dayMoods[day] = []
      dayMoods[day].push(mood.mood_score)
    })
    
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    const bestDay = Object.entries(dayMoods).reduce((best, [day, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return avg > best.average ? { day: dayNames[parseInt(day)], average: avg } : best
    }, { day: 'Mon', average: 0 })
    
    // Find best activity
    const activityMoods: Record<string, number[]> = {}
    moods.forEach(mood => {
      const activities = mood.activities || mood.tags || []
      activities.forEach((activity: string) => {
        if (!activityMoods[activity]) activityMoods[activity] = []
        activityMoods[activity].push(mood.mood_score)
      })
    })
    
    const bestActivity = Object.entries(activityMoods).reduce((best, [activity, scores]) => {
      const avg = scores.reduce((a, b) => a + b, 0) / scores.length
      return avg > best.average ? { activity, average: avg } : best
    }, { activity: 'exercise', average: 0 })
    
    // Calculate trend
    const oldAvg = moods.slice(7, 14).reduce((sum, m) => sum + m.mood_score, 0) / Math.min(moods.slice(7, 14).length, 7)
    const trend = oldAvg > 0 ? ((average - oldAvg) / oldAvg * 100) : 0
    
    return {
      average: Math.round(average * 10) / 10,
      bestDay: bestDay.day,
      bestActivity: bestActivity.activity,
      trend: Math.round(trend)
    }
  }
  
  const insights = getInsights()
  
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff',
        borderColor: 'rgba(139, 92, 246, 0.8)',
        borderWidth: 1
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 10,
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      },
      x: {
        grid: {
          color: 'rgba(0, 0, 0, 0.1)'
        },
        ticks: {
          color: '#666'
        }
      }
    }
  }
  
  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#fff',
        bodyColor: '#fff'
      }
    }
  }
  
  return (
    <div className="bg-white rounded-3xl shadow-xl p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          Analytics Dashboard
        </h2>
        
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Time Range Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'year'] as const).map(range => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  timeRange === range 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Calendar className="w-4 h-4 inline mr-1" />
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
          
          {/* Chart Type Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {[
              { key: 'line', label: 'Trends', icon: TrendingUp },
              { key: 'bar', label: 'Compare', icon: Target },
              { key: 'activity', label: 'Activities', icon: Activity },
              { key: 'time', label: 'Time', icon: Clock },
              { key: 'weather', label: 'Weather', icon: Sun }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setChartType(key as any)}
                className={`px-2 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                  chartType === key 
                    ? 'bg-white shadow-sm text-gray-900' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon className="w-3 h-3" />
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Insights Cards */}
      {insights && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Weekly Avg</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">{insights.average}</p>
            <p className="text-xs text-purple-600">Out of 10</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">Best Day</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">{insights.bestDay}</p>
            <p className="text-xs text-blue-600">Of the week</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-700">Top Activity</span>
            </div>
            <p className="text-lg font-bold text-green-900 capitalize">{insights.bestActivity}</p>
            <p className="text-xs text-green-600">Highest mood</p>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-orange-600" />
              <span className="text-xs font-medium text-orange-700">Trend</span>
            </div>
            <p className="text-2xl font-bold text-orange-900">
              {insights.trend > 0 ? '+' : ''}{insights.trend}%
            </p>
            <p className="text-xs text-orange-600">vs last week</p>
          </div>
        </div>
      )}
      
      {/* Main Chart */}
      <div className="h-80 mb-4">
        {chartType === 'line' && (
          <Line data={getMoodTrendData()} options={chartOptions} />
        )}
        {chartType === 'bar' && (
          <Bar data={getMoodTrendData()} options={chartOptions} />
        )}
        {chartType === 'activity' && (
          <Bar data={getActivityData()} options={chartOptions} />
        )}
        {chartType === 'time' && (
          <Line data={getTimePatternData()} options={chartOptions} />
        )}
        {chartType === 'weather' && (
          <Doughnut data={getWeatherData()} options={pieOptions} />
        )}
      </div>
      
      {/* Chart Description */}
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          {chartType === 'line' && `Mood trends over the past ${timeRange}. Look for patterns in your emotional well-being.`}
          {chartType === 'bar' && `Compare mood levels over time. Higher bars indicate better mood periods.`}
          {chartType === 'activity' && 'Activities that correlate with higher mood scores. Focus on these for better well-being.'}
          {chartType === 'time' && 'Your mood patterns throughout the day. Optimize your schedule around your peak hours.'}
          {chartType === 'weather' && 'How different weather conditions affect your mood. Use this insight for planning.'}
        </p>
      </div>
    </div>
  )
}

