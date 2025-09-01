'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/app/lib/supabase-client'

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  emoji: string
  date: string
  time: string
  activities: string[]
  notes: string
  created_at: string
}

interface ActivityCorrelation {
  activity: string
  averageMood: number
  totalEntries: number
  impact: 'positive' | 'negative' | 'neutral'
  impactScore: number
  moodRange: {
    min: number
    max: number
  }
  recentTrend: 'improving' | 'declining' | 'stable'
}

interface ActivityMoodCorrelationProps {
  userId: string
  className?: string
}

export default function ActivityMoodCorrelation({ userId, className = "" }: ActivityMoodCorrelationProps) {
  const [loading, setLoading] = useState(true)
  const [correlations, setCorrelations] = useState<ActivityCorrelation[]>([])
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
    end: new Date().toISOString().split('T')[0] // today
  })
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<'impact' | 'frequency' | 'mood'>('impact')

  useEffect(() => {
    fetchCorrelationData()
  }, [dateRange, userId])

  const fetchCorrelationData = async () => {
    try {
      setLoading(true)
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', dateRange.start)
        .lte('date', dateRange.end)
        .order('date', { ascending: true })

      if (error) {
        console.error('Error fetching correlation data:', error)
        return
      }

      const entries = data || []
      
      // Calculate overall average mood for comparison
      const overallAverage = entries.length > 0 
        ? entries.reduce((sum, entry) => sum + entry.mood_score, 0) / entries.length 
        : 5

      // Group entries by activity
      const activityData = new Map<string, number[]>()
      
      entries.forEach((entry: MoodEntry) => {
        entry.activities.forEach(activity => {
          if (!activityData.has(activity)) {
            activityData.set(activity, [])
          }
          activityData.get(activity)!.push(entry.mood_score)
        })
      })

      // Calculate correlations
      const correlationResults: ActivityCorrelation[] = []
      
      activityData.forEach((moods, activity) => {
        const averageMood = moods.reduce((sum, mood) => sum + mood, 0) / moods.length
        const impactScore = averageMood - overallAverage
        const minMood = Math.min(...moods)
        const maxMood = Math.max(...moods)
        
        // Determine impact category
        let impact: 'positive' | 'negative' | 'neutral'
        if (impactScore > 0.5) impact = 'positive'
        else if (impactScore < -0.5) impact = 'negative'
        else impact = 'neutral'

        // Calculate recent trend (last 7 days vs previous period)
        const recentEntries = entries.filter(entry => 
          new Date(entry.date) >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
          entry.activities.includes(activity)
        )
        const olderEntries = entries.filter(entry => 
          new Date(entry.date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) &&
          entry.activities.includes(activity)
        )

        let recentTrend: 'improving' | 'declining' | 'stable' = 'stable'
        if (recentEntries.length >= 2 && olderEntries.length >= 2) {
          const recentAvg = recentEntries.reduce((sum, e) => sum + e.mood_score, 0) / recentEntries.length
          const olderAvg = olderEntries.reduce((sum, e) => sum + e.mood_score, 0) / olderEntries.length
          const trendDiff = recentAvg - olderAvg
          
          if (trendDiff > 0.3) recentTrend = 'improving'
          else if (trendDiff < -0.3) recentTrend = 'declining'
        }

        correlationResults.push({
          activity,
          averageMood,
          totalEntries: moods.length,
          impact,
          impactScore,
          moodRange: { min: minMood, max: maxMood },
          recentTrend
        })
      })

      // Sort correlations
      correlationResults.sort((a, b) => {
        switch (sortBy) {
          case 'impact':
            return Math.abs(b.impactScore) - Math.abs(a.impactScore)
          case 'frequency':
            return b.totalEntries - a.totalEntries
          case 'mood':
            return b.averageMood - a.averageMood
          default:
            return Math.abs(b.impactScore) - Math.abs(a.impactScore)
        }
      })

      setCorrelations(correlationResults)
    } catch (error) {
      console.error('Failed to fetch correlation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImpactColor = (impact: 'positive' | 'negative' | 'neutral', impactScore: number) => {
    if (impact === 'positive') {
      const intensity = Math.min(impactScore / 2, 1)
      return {
        bg: `rgba(34, 197, 94, ${0.2 + intensity * 0.3})`,
        border: 'border-green-400',
        text: 'text-green-400'
      }
    } else if (impact === 'negative') {
      const intensity = Math.min(Math.abs(impactScore) / 2, 1)
      return {
        bg: `rgba(239, 68, 68, ${0.2 + intensity * 0.3})`,
        border: 'border-red-400',
        text: 'text-red-400'
      }
    } else {
      return {
        bg: 'rgba(156, 163, 175, 0.2)',
        border: 'border-gray-400',
        text: 'text-gray-400'
      }
    }
  }

  const getTrendIcon = (trend: 'improving' | 'declining' | 'stable') => {
    switch (trend) {
      case 'improving':
        return { icon: '📈', color: 'text-green-400', label: 'Improving' }
      case 'declining':
        return { icon: '📉', color: 'text-red-400', label: 'Declining' }
      default:
        return { icon: '➡️', color: 'text-gray-400', label: 'Stable' }
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-cyan-300">Analyzing correlations...</p>
      </div>
    )
  }

  const positiveActivities = correlations.filter(c => c.impact === 'positive')
  const negativeActivities = correlations.filter(c => c.impact === 'negative')
  const neutralActivities = correlations.filter(c => c.impact === 'neutral')

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            🔗 Activity-Mood Correlations
          </h3>
          <p className="text-cyan-300">
            Discover which activities boost or lower your mood
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'impact' | 'frequency' | 'mood')}
            className="bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none"
          >
            <option value="impact">Sort by Impact</option>
            <option value="frequency">Sort by Frequency</option>
            <option value="mood">Sort by Average Mood</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-cyan-300 font-medium mb-2">From Date</label>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-cyan-300 font-medium mb-2">To Date</label>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="w-full bg-gray-800 border border-gray-600 rounded-lg px-4 py-2 text-white focus:border-cyan-500 focus:outline-none transition-colors"
            />
          </div>
        </div>
        
        <div className="mt-4 text-center text-gray-300">
          <p>Analyzing data from {formatDate(dateRange.start)} to {formatDate(dateRange.end)}</p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">🚀</div>
          <div className="text-2xl font-bold text-green-400 mb-1">{positiveActivities.length}</div>
          <div className="text-green-300 font-medium">Mood Boosters</div>
          <div className="text-sm text-green-400/70 mt-2">Activities that improve your mood</div>
        </div>
        
        <div className="bg-gray-500/10 border border-gray-500/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">😐</div>
          <div className="text-2xl font-bold text-gray-400 mb-1">{neutralActivities.length}</div>
          <div className="text-gray-300 font-medium">Neutral</div>
          <div className="text-sm text-gray-400/70 mt-2">Activities with no clear impact</div>
        </div>
        
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
          <div className="text-4xl mb-2">⚠️</div>
          <div className="text-2xl font-bold text-red-400 mb-1">{negativeActivities.length}</div>
          <div className="text-red-300 font-medium">Mood Drains</div>
          <div className="text-sm text-red-400/70 mt-2">Activities that lower your mood</div>
        </div>
      </div>

      {/* Top Insights */}
      {(positiveActivities.length > 0 || negativeActivities.length > 0) && (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <h4 className="text-xl font-semibold text-white mb-4">🎯 Key Insights</h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positiveActivities.length > 0 && (
              <div>
                <h5 className="text-green-400 font-medium mb-3 flex items-center gap-2">
                  <span>🚀</span> Best Mood Booster
                </h5>
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                  <div className="font-semibold text-white capitalize">{positiveActivities[0].activity}</div>
                  <div className="text-green-400 text-sm">
                    +{positiveActivities[0].impactScore.toFixed(1)} mood boost • {positiveActivities[0].totalEntries} times
                  </div>
                  <div className="text-green-300 text-sm mt-1">
                    Average mood: {positiveActivities[0].averageMood.toFixed(1)}/10
                  </div>
                </div>
              </div>
            )}
            
            {negativeActivities.length > 0 && (
              <div>
                <h5 className="text-red-400 font-medium mb-3 flex items-center gap-2">
                  <span>⚠️</span> Biggest Mood Drain
                </h5>
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <div className="font-semibold text-white capitalize">{negativeActivities[0].activity}</div>
                  <div className="text-red-400 text-sm">
                    {negativeActivities[0].impactScore.toFixed(1)} mood impact • {negativeActivities[0].totalEntries} times
                  </div>
                  <div className="text-red-300 text-sm mt-1">
                    Average mood: {negativeActivities[0].averageMood.toFixed(1)}/10
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Activity Correlations List */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h4 className="text-xl font-semibold text-white mb-6">📊 All Activity Correlations</h4>
        
        {correlations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h5 className="text-xl font-semibold text-white mb-2">No correlations found</h5>
            <p className="text-gray-400">Try selecting a different date range with more mood entries</p>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {correlations.map((correlation, index) => {
                const colors = getImpactColor(correlation.impact, correlation.impactScore)
                const trend = getTrendIcon(correlation.recentTrend)
                
                return (
                  <motion.div
                    key={correlation.activity}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    style={{ backgroundColor: colors.bg }}
                    className={`border-2 ${colors.border} rounded-xl p-6 cursor-pointer hover:scale-[1.02] transition-all duration-200`}
                    onClick={() => setSelectedActivity(
                      selectedActivity === correlation.activity ? null : correlation.activity
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-4 mb-2">
                          <h5 className="text-xl font-semibold text-white capitalize">
                            {correlation.activity}
                          </h5>
                          <div className={`flex items-center gap-1 ${trend.color}`}>
                            <span>{trend.icon}</span>
                            <span className="text-sm font-medium">{trend.label}</span>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div>
                            <div className={`font-semibold ${colors.text}`}>
                              {correlation.averageMood.toFixed(1)}/10
                            </div>
                            <div className="text-gray-400">Average Mood</div>
                          </div>
                          
                          <div>
                            <div className={`font-semibold ${colors.text}`}>
                              {correlation.impactScore > 0 ? '+' : ''}{correlation.impactScore.toFixed(1)}
                            </div>
                            <div className="text-gray-400">Impact Score</div>
                          </div>
                          
                          <div>
                            <div className="font-semibold text-cyan-400">
                              {correlation.totalEntries}
                            </div>
                            <div className="text-gray-400">Times Done</div>
                          </div>
                          
                          <div>
                            <div className="font-semibold text-purple-400">
                              {correlation.moodRange.min}-{correlation.moodRange.max}
                            </div>
                            <div className="text-gray-400">Mood Range</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="ml-4">
                        <svg 
                          className={`w-6 h-6 transition-transform duration-200 ${
                            selectedActivity === correlation.activity ? 'rotate-180' : ''
                          }`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>

                    <AnimatePresence>
                      {selectedActivity === correlation.activity && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-4 pt-4 border-t border-gray-600"
                        >
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <h6 className="text-white font-medium mb-2">Impact Analysis</h6>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Classification:</span>
                                  <span className={`font-medium ${colors.text} capitalize`}>
                                    {correlation.impact}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Frequency Rank:</span>
                                  <span className="text-cyan-400 font-medium">
                                    #{correlations.findIndex(c => c.totalEntries >= correlation.totalEntries) + 1} of {correlations.length}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Recent Trend:</span>
                                  <span className={`font-medium ${trend.color}`}>
                                    {trend.label}
                                  </span>
                                </div>
                              </div>
                            </div>
                            
                            <div>
                              <h6 className="text-white font-medium mb-2">Recommendations</h6>
                              <div className="text-sm text-gray-300">
                                {correlation.impact === 'positive' && (
                                  <p>✨ This activity consistently boosts your mood! Consider doing it more often, especially when feeling down.</p>
                                )}
                                {correlation.impact === 'negative' && (
                                  <p>⚠️ This activity tends to lower your mood. Consider reducing frequency or finding alternatives.</p>
                                )}
                                {correlation.impact === 'neutral' && (
                                  <p>➡️ This activity has neutral impact on your mood. It's fine to continue as usual.</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Action Recommendations */}
      {(positiveActivities.length > 0 || negativeActivities.length > 0) && (
        <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 border border-cyan-500/30 rounded-xl p-6">
          <h4 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
            <span>💡</span> Personalized Recommendations
          </h4>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {positiveActivities.length > 0 && (
              <div>
                <h5 className="text-green-400 font-medium mb-3">Do More Of:</h5>
                <div className="space-y-2">
                  {positiveActivities.slice(0, 3).map((activity) => (
                    <div key={activity.activity} className="flex items-center gap-3 text-sm">
                      <span className="text-green-400">•</span>
                      <span className="text-white capitalize font-medium">{activity.activity}</span>
                      <span className="text-green-400 text-xs">
                        (+{activity.impactScore.toFixed(1)} boost)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {negativeActivities.length > 0 && (
              <div>
                <h5 className="text-red-400 font-medium mb-3">Consider Reducing:</h5>
                <div className="space-y-2">
                  {negativeActivities.slice(0, 3).map((activity) => (
                    <div key={activity.activity} className="flex items-center gap-3 text-sm">
                      <span className="text-red-400">•</span>
                      <span className="text-white capitalize font-medium">{activity.activity}</span>
                      <span className="text-red-400 text-xs">
                        ({activity.impactScore.toFixed(1)} impact)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

