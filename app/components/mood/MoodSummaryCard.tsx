'use client'
import { motion } from 'framer-motion'

interface MoodEntry {
  id: string
  mood_score: number
  date: string
  time: string
  activities?: string[]
  notes?: string
  emoji: string
}

interface MoodSummaryCardProps {
  moods: MoodEntry[]
  title: string
  subtitle: string
}

export default function MoodSummaryCard({ moods, title, subtitle }: MoodSummaryCardProps) {
  if (moods.length === 0) {
    return (
      <motion.div 
        className="card-soft rounded-xl p-6 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-6xl mb-4">📝</div>
        <h3 className="text-xl font-bold text-readable mb-2">{title}</h3>
        <p className="text-readable-secondary">{subtitle}</p>
        <div className="mt-4 text-sm text-readable-muted">
          Start tracking to unlock insights!
        </div>
      </motion.div>
    )
  }

  const latestMood = moods[0]
  const averageMood = moods.reduce((sum, mood) => sum + mood.mood_score, 0) / moods.length
  
  // Trend calculation (last 3 vs previous 3)
  const recent = moods.slice(0, 3)
  const older = moods.slice(3, 6)
  const recentAvg = recent.reduce((sum, m) => sum + m.mood_score, 0) / recent.length
  const olderAvg = older.length > 0 ? older.reduce((sum, m) => sum + m.mood_score, 0) / older.length : recentAvg
  const trendDirection = recentAvg - olderAvg

  const getTrendIcon = () => {
    if (trendDirection > 0.5) return '📈'
    if (trendDirection < -0.5) return '📉'
    return '➡️'
  }

  const getTrendText = () => {
    if (trendDirection > 0.5) return 'Improving!'
    if (trendDirection < -0.5) return 'Challenging period'
    return 'Steady'
  }

  return (
    <motion.div 
      className="card-soft rounded-xl p-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-readable">{title}</h3>
          <p className="text-readable-secondary text-sm">{subtitle}</p>
        </div>
        <div className="text-4xl">
          {latestMood.emoji}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-600">
            {averageMood.toFixed(1)}
          </div>
          <div className="text-xs text-readable-muted">Average</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">
            {moods.length}
          </div>
          <div className="text-xs text-readable-muted">Entries</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl">
            {getTrendIcon()}
          </div>
          <div className="text-xs text-readable-muted">{getTrendText()}</div>
        </div>
      </div>

      {/* Latest mood info */}
      <div className="bg-gray-50 rounded-lg p-3 border-l-4 border-purple-500">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-semibold text-readable">
              Latest: {latestMood.mood_score}/10 • {latestMood.emoji}
            </div>
            <div className="text-sm text-readable-secondary">
              {new Date(latestMood.date).toLocaleDateString()} at {latestMood.time?.slice(0,5)}
            </div>
          </div>
        </div>
        
        {latestMood.activities && latestMood.activities.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {latestMood.activities.slice(0, 3).map(activity => (
              <span 
                key={activity}
                className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs capitalize"
              >
                {activity.replace('-', ' ')}
              </span>
            ))}
            {latestMood.activities.length > 3 && (
              <span className="text-xs text-readable-muted">
                +{latestMood.activities.length - 3} more
              </span>
            )}
          </div>
        )}
        
        {latestMood.notes && (
          <div className="mt-2 text-sm text-readable-secondary italic">
            "{latestMood.notes.slice(0, 80)}{latestMood.notes.length > 80 ? '...' : ''}"
          </div>
        )}
      </div>

      {/* Quick insights */}
      {moods.length >= 3 && (
        <div className="mt-4 space-y-2">
          {trendDirection > 1 && (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-sm">🌟</span>
              <span className="text-sm">Great momentum - keep it up!</span>
            </div>
          )}
          {trendDirection < -1 && (
            <div className="flex items-center gap-2 text-orange-600">
              <span className="text-sm">💛</span>
              <span className="text-sm">Be gentle with yourself right now</span>
            </div>
          )}
          {Math.abs(trendDirection) <= 1 && averageMood >= 7 && (
            <div className="flex items-center gap-2 text-blue-600">
              <span className="text-sm">✨</span>
              <span className="text-sm">You're maintaining good vibes!</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

