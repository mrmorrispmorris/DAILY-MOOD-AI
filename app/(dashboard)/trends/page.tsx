'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useMoodData } from '@/hooks/use-mood-data'
import { MoodChart } from '@/components/charts/mood-chart'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { TrendingUp, Calendar, BarChart3, Target, Activity } from 'lucide-react'

export default function TrendsPage() {
  const { user, loading } = useAuth()
  const { moodEntries, isLoading } = useMoodData()
  const router = useRouter()
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  const getFilteredData = () => {
    const today = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoffDate = new Date(today.getTime() - (days * 24 * 60 * 60 * 1000))
    
    return moodEntries.filter(entry => {
      const entryDate = new Date((entry as any).date || entry.created_at)
      return entryDate >= cutoffDate
    })
  }

  const filteredData = getFilteredData()
  const chartData = filteredData.map(entry => ({
    date: (entry as any).date || entry.created_at?.split('T')[0] || '',
    mood: entry.mood_score
  }))

  const calculateStats = () => {
    if (filteredData.length === 0) return { avg: 0, trend: 'stable', consistency: 0 }
    
    const avg = filteredData.reduce((sum, entry) => sum + entry.mood_score, 0) / filteredData.length
    
    // Calculate trend
    const firstHalf = filteredData.slice(0, Math.floor(filteredData.length / 2))
    const secondHalf = filteredData.slice(Math.floor(filteredData.length / 2))
    
    let trend = 'stable'
    if (firstHalf.length > 0 && secondHalf.length > 0) {
      const firstAvg = firstHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / firstHalf.length
      const secondAvg = secondHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / secondHalf.length
      if (secondAvg > firstAvg + 0.5) trend = 'improving'
      else if (secondAvg < firstAvg - 0.5) trend = 'declining'
    }
    
    // Calculate consistency (standard deviation)
    const variance = filteredData.reduce((sum, entry) => sum + Math.pow(entry.mood_score - avg, 2), 0) / filteredData.length
    const consistency = Math.max(0, 10 - Math.sqrt(variance)) // Higher is more consistent
    
    return { avg: avg.toFixed(1), trend, consistency: consistency.toFixed(1) }
  }

  const stats = calculateStats()
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving': return 'text-green-600 bg-green-100'
      case 'declining': return 'text-red-600 bg-red-100'
      default: return 'text-blue-600 bg-blue-100'
    }
  }

  const getTagFrequency = () => {
    const tagCounts: Record<string, number> = {}
    filteredData.forEach(entry => {
      ((entry as any).tags || entry.activities || [])?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })
    
    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag, count]) => ({ tag, count }))
  }

  const tagFrequency = getTagFrequency()

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-xl font-bold text-primary">Mood Trends</h1>
            </div>
            <div className="flex space-x-1">
              {(['7d', '30d', '90d'] as const).map((range) => (
                <button
                  key={range}
                  onClick={() => setTimeRange(range)}
                  className={`px-3 py-1 text-sm rounded-lg transition-colors ${
                    timeRange === range
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {range === '7d' ? '7D' : range === '30d' ? '30D' : '90D'}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-primary">{stats.avg}</div>
              <div className="text-xs text-gray-600">Avg Mood</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-green-600">{stats.consistency}</div>
              <div className="text-xs text-gray-600">Consistency</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Badge className={getTrendColor(stats.trend)}>
                {stats.trend}
              </Badge>
              <div className="text-xs text-gray-600 mt-1">Trend</div>
            </CardContent>
          </Card>
        </div>

        {/* Mood Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center">
              <BarChart3 className="mr-2 h-5 w-5" />
              Mood Over Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            {chartData.length > 0 ? (
              <MoodChart type="bar" data={chartData} />
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Activity className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>No data for selected time range</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tag Analysis */}
        {tagFrequency.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="mr-2 h-5 w-5" />
                Most Common Tags
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tagFrequency.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="secondary">{item.tag}</Badge>
                      <span className="text-sm text-gray-600">
                        {item.count} time{item.count !== 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {((item.count / filteredData.length) * 100).toFixed(0)}%
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Insights */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Trend Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-blue-800 text-sm">
                  <strong>Time Range:</strong> {timeRange === '7d' ? 'Last 7 days' : timeRange === '30d' ? 'Last 30 days' : 'Last 90 days'}
                </p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                <p className="text-green-800 text-sm">
                  <strong>Data Points:</strong> {filteredData.length} mood entries analyzed
                </p>
              </div>
              {stats.trend !== 'stable' && (
                <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
                  <p className="text-yellow-800 text-sm">
                    <strong>Trend:</strong> Your mood is {stats.trend} over this period
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}