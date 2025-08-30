'use client'
import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Calendar, TrendingUp, Eye } from 'lucide-react'

interface MoodEntry {
  id: string
  mood_score: number
  notes: string | null
  created_at: string
}

export default function MoodHistory({ userId }: { userId: string }) {
  const [entries, setEntries] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'recent' | 'chart'>('recent')
  const supabase = createClientComponentClient()

  useEffect(() => {
    if (userId) {
      fetchMoodHistory()
    }
  }, [userId])

  const fetchMoodHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(14)

      if (error) throw error
      setEntries(data || [])
    } catch (error) {
      console.error('Error fetching mood history:', error)
    } finally {
      setLoading(false)
    }
  }

  const getMoodEmoji = (score: number) => {
    const emojiMap: Record<number, string> = {
      1: '😔', 2: '😟', 3: '😕', 4: '😐', 5: '🙂',
      6: '😊', 7: '😄', 8: '😃', 9: '🤗', 10: '🤩'
    }
    return emojiMap[score] || '🙂'
  }

  const getMoodColor = (score: number) => {
    if (score <= 3) return 'text-red-500 bg-red-50'
    if (score <= 5) return 'text-yellow-600 bg-yellow-50'
    if (score <= 7) return 'text-green-500 bg-green-50'
    return 'text-purple-500 bg-purple-50'
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric' 
      })
    }
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Simple chart representation
  const generateChart = () => {
    if (entries.length === 0) return []
    
    const chartData = entries
      .slice()
      .reverse()
      .slice(-7)
      .map(entry => ({
        date: new Date(entry.created_at).getDate(),
        score: entry.mood_score,
        emoji: getMoodEmoji(entry.mood_score)
      }))

    return chartData
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Mood History
        </h3>
        <div className="text-center py-12">
          <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium mb-2">No mood entries yet</p>
          <p className="text-gray-400 text-sm">Your mood history will appear here as you start tracking</p>
        </div>
      </div>
    )
  }

  const chartData = generateChart()
  const maxScore = Math.max(...chartData.map(d => d.score))
  const minScore = Math.min(...chartData.map(d => d.score))

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="w-5 h-5 text-purple-600" />
          Mood History
        </h3>
        
        <div className="flex rounded-lg bg-gray-100 p-1">
          <button
            onClick={() => setViewMode('recent')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              viewMode === 'recent'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Recent
          </button>
          <button
            onClick={() => setViewMode('chart')}
            className={`px-3 py-1 rounded text-sm font-medium transition-all ${
              viewMode === 'chart'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Chart
          </button>
        </div>
      </div>

      {viewMode === 'recent' ? (
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {entries.map((entry) => (
            <div key={entry.id} className="flex items-start gap-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${getMoodColor(entry.mood_score)}`}>
                {getMoodEmoji(entry.mood_score)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      {entry.mood_score}/10
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatDate(entry.created_at)}
                    </span>
                  </div>
                  <span className="text-xs text-gray-400">
                    {formatTime(entry.created_at)}
                  </span>
                </div>
                {entry.notes && (
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {entry.notes}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Simple ASCII-style chart */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Last 7 Days Trend
            </h4>
            
            {chartData.length > 0 ? (
              <div className="space-y-3">
                {/* Chart bars */}
                <div className="flex items-end justify-between h-32 border-b border-gray-200 pb-2">
                  {chartData.map((point, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      <div className="text-xs text-gray-500">
                        {point.score}
                      </div>
                      <div
                        className="bg-gradient-to-t from-purple-400 to-purple-600 rounded-t w-8 min-h-[4px] flex items-end justify-center pb-1"
                        style={{ 
                          height: `${((point.score - minScore) / (maxScore - minScore || 1)) * 100 + 20}%` 
                        }}
                      >
                        <span className="text-xs">
                          {point.emoji}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400">
                        {point.date}
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Legend */}
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Past week</span>
                  <span>Today</span>
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                Need more entries to show chart
              </p>
            )}
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-blue-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-blue-600">
                {entries.length > 0 ? (entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length).toFixed(1) : '0'}
              </div>
              <div className="text-xs text-blue-700">Average</div>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-green-600">
                {Math.max(...entries.map(e => e.mood_score))}
              </div>
              <div className="text-xs text-green-700">Highest</div>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <div className="text-lg font-bold text-purple-600">
                {entries.length}
              </div>
              <div className="text-xs text-purple-700">Entries</div>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t">
        <p className="text-xs text-gray-500 text-center">
          📊 <strong>Coming soon:</strong> Advanced charts and trend analysis
        </p>
      </div>
    </div>
  )
}


