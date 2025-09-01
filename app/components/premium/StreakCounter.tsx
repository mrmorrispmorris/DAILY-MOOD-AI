'use client'
import { useMemo } from 'react'
import { motion } from 'framer-motion'

interface StreakCounterProps {
  moods: any[]
}

export default function StreakCounter({ moods }: StreakCounterProps) {
  const streakData = useMemo(() => {
    if (!moods || moods.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalDays: 0 }
    }

    // Sort moods by date (newest first)
    const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Calculate current streak
    let currentStreak = 0
    const today = new Date()
    let checkDate = new Date(today)
    
    // Check if today has an entry
    const todayStr = today.toISOString().split('T')[0]
    const hasToday = sortedMoods.some(mood => mood.date === todayStr)
    
    if (hasToday) {
      currentStreak = 1
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      // Check if yesterday has an entry
      checkDate.setDate(checkDate.getDate() - 1)
      const yesterdayStr = checkDate.toISOString().split('T')[0]
      const hasYesterday = sortedMoods.some(mood => mood.date === yesterdayStr)
      
      if (hasYesterday) {
        currentStreak = 1
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        currentStreak = 0
      }
    }

    // Continue checking backwards for consecutive days
    while (currentStreak > 0) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasEntry = sortedMoods.some(mood => mood.date === dateStr)
      
      if (hasEntry) {
        currentStreak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    // Calculate longest streak
    const moodDates = sortedMoods.map(mood => mood.date).sort()
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    moodDates.forEach(dateStr => {
      const currentDate = new Date(dateStr)
      
      if (lastDate === null) {
        tempStreak = 1
      } else {
        const daysDiff = (currentDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24)
        
        if (daysDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
      
      lastDate = currentDate
    })
    
    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      currentStreak: Math.max(0, currentStreak - 1), // Adjust for off-by-one
      longestStreak,
      totalDays: moods.length
    }
  }, [moods])

  const getStreakEmoji = (streak: number) => {
    if (streak === 0) return '😴'
    if (streak < 3) return '🌱'
    if (streak < 7) return '🔥'
    if (streak < 30) return '💪'
    if (streak < 100) return '🏆'
    return '👑'
  }

  const getStreakMessage = (streak: number) => {
    if (streak === 0) return 'Start your journey!'
    if (streak === 1) return 'Great start!'
    if (streak < 3) return 'Building momentum!'
    if (streak < 7) return 'On fire!'
    if (streak < 30) return 'Incredible dedication!'
    if (streak < 100) return 'Streak master!'
    return 'Legendary commitment!'
  }

  const getMotivationalMessage = (streak: number) => {
    if (streak === 0) return 'Log your mood today to start your streak!'
    if (streak === 1) return 'Keep going! Consistency is key.'
    if (streak < 7) return `${7 - streak} more days for a week streak!`
    if (streak < 30) return `${30 - streak} more days for a month streak!`
    return 'You\'re building an amazing habit!'
  }

  return (
    <div className="bg-gradient-to-br from-orange-500 via-red-500 to-pink-600 rounded-3xl shadow-2xl p-8 text-white border border-orange-400/20">
      <div className="text-center">
        {/* Main Streak Display */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="relative mb-6"
        >
          <div className="text-8xl mb-2">
            {getStreakEmoji(streakData.currentStreak)}
          </div>
          <div className="text-6xl font-bold mb-2">
            {streakData.currentStreak}
          </div>
          <div className="text-xl font-semibold text-orange-100">
            Day Streak
          </div>
        </motion.div>

        {/* Streak Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <h3 className="text-2xl font-bold text-yellow-200 mb-2">
            {getStreakMessage(streakData.currentStreak)}
          </h3>
          <p className="text-orange-100">
            {getMotivationalMessage(streakData.currentStreak)}
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="text-3xl font-bold text-yellow-200">
              {streakData.longestStreak}
            </div>
            <div className="text-sm text-orange-100">Longest Streak</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white/20 backdrop-blur-sm rounded-2xl p-4"
          >
            <div className="text-3xl font-bold text-yellow-200">
              {streakData.totalDays}
            </div>
            <div className="text-sm text-orange-100">Total Entries</div>
          </motion.div>
        </div>

        {/* Streak Milestones */}
        <div className="space-y-2">
          {[
            { milestone: 3, label: '3 Day Streak', emoji: '🌱' },
            { milestone: 7, label: 'Week Streak', emoji: '🔥' },
            { milestone: 30, label: 'Month Streak', emoji: '💪' },
            { milestone: 100, label: 'Hundred Days', emoji: '🏆' }
          ].map(({ milestone, label, emoji }) => (
            <div
              key={milestone}
              className={`flex items-center justify-between p-3 rounded-xl transition-all ${
                streakData.currentStreak >= milestone
                  ? 'bg-green-500/30 border border-green-400/50'
                  : streakData.longestStreak >= milestone
                  ? 'bg-yellow-500/20 border border-yellow-400/30'
                  : 'bg-white/10 border border-white/20'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{emoji}</span>
                <span className="font-medium">{label}</span>
              </div>
              <div className="text-sm">
                {streakData.currentStreak >= milestone ? (
                  <span className="text-green-200">✅ Active</span>
                ) : streakData.longestStreak >= milestone ? (
                  <span className="text-yellow-200">🏅 Achieved</span>
                ) : (
                  <span className="text-white/60">{milestone - streakData.currentStreak} days to go</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Motivation */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="mt-6 p-4 bg-white/10 backdrop-blur-sm rounded-2xl"
        >
          <div className="text-sm text-orange-100">
            💡 <strong>Pro Tip:</strong> {streakData.currentStreak === 0 
              ? 'Starting a streak builds lasting mental health habits!'
              : 'Consistent mood tracking improves emotional awareness by 40%!'
            }
          </div>
        </motion.div>
      </div>
    </div>
  )
}

