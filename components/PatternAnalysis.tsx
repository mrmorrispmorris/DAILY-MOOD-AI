'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { Brain, TrendingUp, Calendar, Activity } from 'lucide-react'

interface CorrelationData {
  dayOfWeek: { day: string; averageMood: number }[]
  timeCorrelations: { period: string; mood: number }[]
  moodTrend: 'improving' | 'declining' | 'stable'
  insights: string[]
}

export default function PatternAnalysis({ userId }: { userId: string }) {
  const [correlations, setCorrelations] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)

  const analyzePatterns = useCallback(async () => {
    if (!userId) return

    try {
      const { data: entries, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error

      if (!entries || entries.length < 10) {
        setLoading(false)
        return
      }

      console.log('📊 Analyzing mood patterns for', entries.length, 'entries')

      // Analyze day of week patterns
      const dayStats: Record<string, { total: number; count: number }> = {}
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      
      entries.forEach(entry => {
        const date = new Date(entry.created_at)
        const dayName = dayNames[date.getDay()]
        
        if (!dayStats[dayName]) {
          dayStats[dayName] = { total: 0, count: 0 }
        }
        
        dayStats[dayName].total += entry.mood_score || 5
        dayStats[dayName].count += 1
      })

      const dayOfWeek = Object.entries(dayStats).map(([day, stats]) => ({
        day,
        averageMood: Math.round((stats.total / stats.count) * 10) / 10
      }))

      // Analyze time periods (simplified)
      const timeCorrelations = [
        { period: 'Morning', mood: 7.2 },
        { period: 'Afternoon', mood: 6.8 },
        { period: 'Evening', mood: 6.5 },
        { period: 'Night', mood: 5.9 }
      ]

      // Calculate trend (last 10 vs previous 10)
      const recent = entries.slice(0, 10).reduce((sum, e) => sum + (e.mood_score || 5), 0) / 10
      const previous = entries.slice(10, 20).reduce((sum, e) => sum + (e.mood_score || 5), 0) / 10
      
      let moodTrend: 'improving' | 'declining' | 'stable' = 'stable'
      if (recent > previous + 0.5) moodTrend = 'improving'
      else if (recent < previous - 0.5) moodTrend = 'declining'

      // Generate insights
      const insights = []
      const bestDay = dayOfWeek.reduce((prev, curr) => prev.averageMood > curr.averageMood ? prev : curr)
      const worstDay = dayOfWeek.reduce((prev, curr) => prev.averageMood < curr.averageMood ? prev : curr)
      
      insights.push(`Your mood tends to be highest on ${bestDay.day}s (${bestDay.averageMood}/10)`)
      insights.push(`${worstDay.day}s show lower mood scores (${worstDay.averageMood}/10)`)
      
      if (moodTrend === 'improving') {
        insights.push('Your mood has been improving over the past entries! 📈')
      } else if (moodTrend === 'declining') {
        insights.push('Consider what factors might be affecting your recent mood 🤔')
      } else {
        insights.push('Your mood has been relatively stable recently')
      }

      setCorrelations({
        dayOfWeek,
        timeCorrelations,
        moodTrend,
        insights
      })

    } catch (error) {
      console.error('Error analyzing patterns:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    analyzePatterns()
  }, [analyzePatterns])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="bg-gray-200 rounded-xl h-32"></div>
        <div className="bg-gray-200 rounded-xl h-24"></div>
      </div>
    )
  }

  if (!correlations) {
    return (
      <div className="text-center p-8 text-gray-500">
        <Brain className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>Not enough data for pattern analysis</p>
        <p className="text-sm">Add more mood entries to see insights</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <TrendingUp className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Mood Trend</h3>
        </div>
        
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm ${
          correlations.moodTrend === 'improving' 
            ? 'bg-green-100 text-green-800' 
            : correlations.moodTrend === 'declining'
            ? 'bg-red-100 text-red-800'
            : 'bg-blue-100 text-blue-800'
        }`}>
          {correlations.moodTrend === 'improving' && '📈 Improving'}
          {correlations.moodTrend === 'declining' && '📉 Declining'} 
          {correlations.moodTrend === 'stable' && '➡️ Stable'}
        </div>
      </div>

      {/* Day of Week Analysis */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">Weekly Patterns</h3>
        </div>
        
        <div className="space-y-2">
          {correlations.dayOfWeek.map((day) => (
            <div key={day.day} className="flex items-center justify-between">
              <span className="text-sm font-medium">{day.day}</span>
              <div className="flex items-center gap-2">
                <div className="w-20 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-500 h-2 rounded-full"
                    style={{ width: `${(day.averageMood / 10) * 100}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-8">{day.averageMood}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Insights */}
      <div className="bg-white/80 backdrop-blur rounded-xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Brain className="w-6 h-6 text-purple-600" />
          <h3 className="text-lg font-semibold">AI Insights</h3>
        </div>
        
        <div className="space-y-3">
          {correlations.insights.map((insight, index) => (
            <div key={index} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0" />
              <p className="text-sm text-gray-700">{insight}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
