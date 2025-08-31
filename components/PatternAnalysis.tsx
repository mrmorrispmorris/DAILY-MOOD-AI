'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { BarChart3, Activity, Clock, Zap } from 'lucide-react'
import { analyzeMoodCorrelations } from '@/lib/openai-service'

interface CorrelationData {
  activityCorrelations: Array<{ activity: string; impact: number; confidence: number }>
  timePatterns: Array<{ timeOfDay: string; averageMood: number }>
}

export default function PatternAnalysis({ userId }: { userId: string }) {
  const [correlations, setCorrelations] = useState<CorrelationData | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    if (userId) {
      analyzePatterns()
    }
  }, [userId, analyzePatterns])

  const analyzePatterns = async () => {
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

      // Convert to analysis format
      const moodData = entries.map(entry => ({
        score: entry.mood_score,
        notes: entry.notes,
        activities: entry.activities || [],
        timestamp: entry.created_at
      }))

      // Analyze correlations
      const result = analyzeMoodCorrelations(moodData)
      setCorrelations(result)

    } catch (error) {
      console.error('Error analyzing patterns:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: number) => {
    const absImpact = Math.abs(impact)
    if (impact > 0) {
      if (absImpact > 1) return 'text-green-700 bg-green-100 border-green-200'
      return 'text-green-600 bg-green-50 border-green-100'
    } else {
      if (absImpact > 1) return 'text-red-700 bg-red-100 border-red-200'
      return 'text-red-600 bg-red-50 border-red-100'
    }
  }

  const getImpactIcon = (impact: number) => {
    if (impact > 0.5) return '🚀'
    if (impact > 0) return '📈'
    if (impact < -0.5) return '⚠️'
    return '📉'
  }

  const getTimeIcon = (timeOfDay: string) => {
    switch (timeOfDay) {
      case 'morning': return '🌅'
      case 'afternoon': return '☀️'
      case 'evening': return '🌙'
      default: return '⏰'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="animate-pulse">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-5 h-5 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-32"></div>
          </div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!correlations || (correlations.activityCorrelations.length === 0 && correlations.timePatterns.length === 0)) {
    return (
      <div className="bg-white rounded-2xl shadow-sm p-6">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold">Pattern Analysis</h3>
        </div>
        <div className="text-center py-8">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-2">Not enough data yet</p>
          <p className="text-sm text-gray-400">
            Log activities with your moods to discover patterns
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-purple-600" />
        <h3 className="text-lg font-semibold">Pattern Analysis</h3>
        <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full flex items-center gap-1">
          <Zap className="w-3 h-3" />
          Smart Analysis
        </span>
      </div>

      <div className="space-y-6">
        {/* Activity Correlations */}
        {correlations.activityCorrelations.length > 0 && (
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <Activity className="w-4 h-4 text-green-500" />
              Activity Impact on Mood
            </h4>
            
            <div className="space-y-2">
              {correlations.activityCorrelations.map((item, i) => (
                <div key={i} className={`p-3 rounded-lg border ${getImpactColor(item.impact)}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">{getImpactIcon(item.impact)}</span>
                      <span className="font-medium capitalize">{item.activity}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {item.impact > 0 ? '+' : ''}{item.impact.toFixed(1)}
                      </div>
                      <div className="text-xs opacity-75">
                        {Math.round(item.confidence * 100)}% confidence
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2 text-xs">
                    {item.impact > 0 
                      ? `This activity typically boosts your mood by ${item.impact.toFixed(1)} points`
                      : `This activity tends to lower your mood by ${Math.abs(item.impact).toFixed(1)} points`
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Patterns */}
        {correlations.timePatterns.length > 0 && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-1">
              <Clock className="w-4 h-4 text-blue-500" />
              Time of Day Patterns
            </h4>
            
            <div className="grid gap-3">
              {correlations.timePatterns.map((pattern, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getTimeIcon(pattern.timeOfDay)}</span>
                    <div>
                      <div className="font-medium capitalize">{pattern.timeOfDay}</div>
                      <div className="text-xs text-gray-600">
                        Average mood: {pattern.averageMood}/10
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {/* Visual mood indicator */}
                    <div className="w-16 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-purple-400 to-purple-600 h-2 rounded-full"
                        style={{ width: `${(pattern.averageMood / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-purple-600">
                      {pattern.averageMood.toFixed(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Insights */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h4 className="text-sm font-semibold text-blue-800 mb-2">💡 Pattern Insights</h4>
          <div className="space-y-1 text-sm text-blue-700">
            {correlations.activityCorrelations.length > 0 && (
              <p>
                • <strong>{correlations.activityCorrelations[0].activity}</strong> has the strongest impact on your mood
              </p>
            )}
            {correlations.timePatterns.length > 0 && (
              <p>
                • Your mood is typically best in the <strong>{correlations.timePatterns[0].timeOfDay}</strong>
              </p>
            )}
            <p>• These patterns are based on your recent mood and activity data</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-4 pt-4 border-t">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>Patterns update as you log more moods</span>
          <span className="flex items-center gap-1">
            <Activity className="w-3 h-3" />
            Correlation Analysis
          </span>
        </div>
      </div>
    </div>
  )
}

