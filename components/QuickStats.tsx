'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { TrendingUp, Calendar, Target, BarChart3 } from 'lucide-react'

interface StatsData {
  totalEntries: number
  averageMood: number
  currentStreak: number
  longestStreak: number
  moodRange: { min: number; max: number }
  weeklyProgress: Array<{ date: string; mood: number }>
}

export default function QuickStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<StatsData>({
    totalEntries: 0,
    averageMood: 5,
    currentStreak: 0,
    longestStreak: 0,
    moodRange: { min: 10, max: 1 },
    weeklyProgress: []
  })
  const [loading, setLoading] = useState(true)

  const calculateStats = useCallback(async () => {
    if (!userId) return
    
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

      console.log('📊 Calculating stats for', entries.length, 'entries')

      // Calculate basic stats
      const totalEntries = entries.length
      const averageMood = entries.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / totalEntries
      
      // Calculate mood range
      const moodScores = entries.map(entry => entry.mood_score || 5)
      const moodRange = {
        min: Math.min(...moodScores),
        max: Math.max(...moodScores)
      }

      // Calculate streaks (simplified version)
      let currentStreak = 0
      let longestStreak = 0
      let tempStreak = 0

      const today = new Date()
      const sortedEntries = entries.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      
      for (let i = 0; i < sortedEntries.length; i++) {
        const entryDate = new Date(sortedEntries[i].created_at)
        const daysDiff = Math.floor((today.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === i) {
          tempStreak++
          if (i === 0) currentStreak = tempStreak
        } else {
          if (tempStreak > longestStreak) longestStreak = tempStreak
          tempStreak = 0
        }
      }
      
      if (tempStreak > longestStreak) longestStreak = tempStreak

      // Get last 7 days for weekly progress
      const weeklyProgress = entries
        .slice(0, 7)
        .map(entry => ({
          date: new Date(entry.created_at).toLocaleDateString(),
          mood: entry.mood_score || 5
        }))
        .reverse()

      setStats({
        totalEntries,
        averageMood: Math.round(averageMood * 10) / 10,
        currentStreak,
        longestStreak,
        moodRange,
        weeklyProgress
      })
      
    } catch (error) {
      console.error('Error calculating stats:', error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    calculateStats()
  }, [calculateStats])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-gray-200 rounded-xl h-24"></div>
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      icon: BarChart3,
      label: 'Total Entries',
      value: stats.totalEntries,
      color: 'blue'
    },
    {
      icon: TrendingUp,
      label: 'Average Mood',
      value: stats.averageMood,
      color: 'green'
    },
    {
      icon: Target,
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      color: 'purple'
    },
    {
      icon: Calendar,
      label: 'Best Streak',
      value: `${stats.longestStreak} days`,
      color: 'orange'
    }
  ]

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 uppercase tracking-wide">{card.label}</p>
                <p className="text-lg font-bold text-gray-900">{card.value}</p>
              </div>
              <card.icon className={`w-8 h-8 text-${card.color}-500`} />
            </div>
          </div>
        ))}
      </div>

      {stats.weeklyProgress.length > 0 && (
        <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg">
          <h3 className="text-sm font-semibold mb-3">Weekly Progress</h3>
          <div className="flex items-end justify-between h-16 gap-1">
            {stats.weeklyProgress.map((day, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-purple-500 rounded-t min-w-0 flex-1 opacity-80"
                  style={{ height: `${(day.mood / 10) * 100}%` }}
                  title={`${day.date}: ${day.mood}/10`}
                />
                <span className="text-xs text-gray-500 mt-1">
                  {day.date.split('/')[1]}/{day.date.split('/')[2]}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
