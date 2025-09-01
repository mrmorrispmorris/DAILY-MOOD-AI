'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Flame, 
  Calendar, 
  Target, 
  TrendingUp, 
  Award, 
  CheckCircle2, 
  Clock,
  Zap,
  Star,
  Crown
} from 'lucide-react'

interface MoodEntry {
  id: number
  date: string
  mood_score: number
  created_at: string
}

interface StreakTrackerProps {
  userId?: string
  moods: MoodEntry[]
}

interface StreakData {
  current: number
  longest: number
  thisWeek: number
  thisMonth: number
  streakHealth: 'excellent' | 'good' | 'moderate' | 'needs_attention'
  lastEntryDate: string | null
  nextMilestone: number
  daysUntilMilestone: number
}

interface MilestoneReward {
  days: number
  title: string
  description: string
  icon: string
  points: number
  unlocked: boolean
}

export default function StreakTracker({ userId, moods }: StreakTrackerProps) {
  const [showMotivation, setShowMotivation] = useState(false)
  const [celebratingMilestone, setCelebratingMilestone] = useState<MilestoneReward | null>(null)

  // Calculate comprehensive streak data
  const streakData = useMemo((): StreakData => {
    if (!moods?.length) {
      return {
        current: 0,
        longest: 0,
        thisWeek: 0,
        thisMonth: 0,
        streakHealth: 'needs_attention',
        lastEntryDate: null,
        nextMilestone: 7,
        daysUntilMilestone: 7
      }
    }

    // Sort moods by date (most recent first)
    const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    
    // Calculate current streak
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate = new Date()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Check if user logged today or yesterday (for streak continuation)
    const mostRecentDate = new Date(sortedMoods[0].date)
    mostRecentDate.setHours(0, 0, 0, 0)
    const daysSinceLastEntry = Math.floor((today.getTime() - mostRecentDate.getTime()) / (1000 * 60 * 60 * 24))

    if (daysSinceLastEntry <= 1) {
      // User is still on streak or can continue today
      currentStreak = 1
      tempStreak = 1
      lastDate = mostRecentDate

      // Count backwards to find full current streak
      for (let i = 1; i < sortedMoods.length; i++) {
        const moodDate = new Date(sortedMoods[i].date)
        moodDate.setHours(0, 0, 0, 0)
        const daysDiff = Math.floor((lastDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          currentStreak++
          tempStreak++
          lastDate = moodDate
        } else if (daysDiff === 0) {
          // Same day, don't break streak but don't increment
          continue
        } else {
          break
        }
      }
    }

    // Calculate longest streak by going through all entries
    tempStreak = 1
    lastDate = new Date(sortedMoods[0].date)
    lastDate.setHours(0, 0, 0, 0)

    for (let i = 1; i < sortedMoods.length; i++) {
      const moodDate = new Date(sortedMoods[i].date)
      moodDate.setHours(0, 0, 0, 0)
      const daysDiff = Math.floor((lastDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        tempStreak++
      } else if (daysDiff === 0) {
        // Same day entries don't break or extend streak
        continue
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
      }
      lastDate = moodDate
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Calculate this week's entries
    const oneWeekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const thisWeek = sortedMoods.filter(mood => new Date(mood.date) >= oneWeekAgo).length

    // Calculate this month's entries
    const oneMonthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const thisMonth = sortedMoods.filter(mood => new Date(mood.date) >= oneMonthAgo).length

    // Determine streak health
    let streakHealth: StreakData['streakHealth']
    if (currentStreak >= 30) streakHealth = 'excellent'
    else if (currentStreak >= 14) streakHealth = 'good'
    else if (currentStreak >= 7) streakHealth = 'moderate'
    else streakHealth = 'needs_attention'

    // Calculate next milestone
    const milestones = [7, 14, 30, 60, 100, 200, 365]
    const nextMilestone = milestones.find(m => m > currentStreak) || milestones[milestones.length - 1]
    const daysUntilMilestone = nextMilestone - currentStreak

    return {
      current: currentStreak,
      longest: longestStreak,
      thisWeek,
      thisMonth,
      streakHealth,
      lastEntryDate: sortedMoods[0]?.date || null,
      nextMilestone,
      daysUntilMilestone
    }
  }, [moods])

  // Define milestone rewards
  const milestoneRewards: MilestoneReward[] = [
    {
      days: 3,
      title: 'Getting Started',
      description: 'Three days of consistent tracking!',
      icon: '🌱',
      points: 25,
      unlocked: streakData.current >= 3
    },
    {
      days: 7,
      title: 'Week Warrior',
      description: 'A full week of mood tracking!',
      icon: '🔥',
      points: 75,
      unlocked: streakData.current >= 7
    },
    {
      days: 14,
      title: 'Fortnight Champion',
      description: 'Two weeks of dedication!',
      icon: '⚔️',
      points: 150,
      unlocked: streakData.current >= 14
    },
    {
      days: 30,
      title: 'Monthly Master',
      description: 'A full month of wellness tracking!',
      icon: '🏆',
      points: 300,
      unlocked: streakData.current >= 30
    },
    {
      days: 60,
      title: 'Consistency King',
      description: 'Two months of unwavering dedication!',
      icon: '👑',
      points: 500,
      unlocked: streakData.current >= 60
    },
    {
      days: 100,
      title: 'Centennial Sage',
      description: 'One hundred days of wisdom!',
      icon: '🧙‍♂️',
      points: 1000,
      unlocked: streakData.current >= 100
    },
    {
      days: 365,
      title: 'Annual Legend',
      description: 'A full year of self-awareness!',
      icon: '🌟',
      points: 2500,
      unlocked: streakData.current >= 365
    }
  ]

  // Check for milestone celebration
  useEffect(() => {
    const currentMilestone = milestoneRewards.find(reward => 
      reward.days === streakData.current && reward.unlocked
    )
    if (currentMilestone && streakData.current > 0) {
      setCelebratingMilestone(currentMilestone)
      setTimeout(() => setCelebratingMilestone(null), 4000)
    }
  }, [streakData.current])

  const getStreakHealthColor = (health: StreakData['streakHealth']) => {
    switch (health) {
      case 'excellent': return 'text-green-600 bg-green-50 border-green-200'
      case 'good': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'moderate': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'needs_attention': return 'text-red-600 bg-red-50 border-red-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStreakHealthMessage = (health: StreakData['streakHealth'], current: number) => {
    switch (health) {
      case 'excellent':
        return `Amazing! ${current} days strong! You're a wellness champion! 🌟`
      case 'good':
        return `Great work! ${current} days of consistent tracking! 💪`
      case 'moderate':
        return `Good progress! ${current} days down - keep building that habit! 📈`
      case 'needs_attention':
        return current === 0 
          ? "Ready to start your streak? Every journey begins with day one! 🌱"
          : `${current} days is a start! Let's build this into a strong habit! 🔥`
      default:
        return 'Keep tracking your mood daily to build consistency!'
    }
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Every day you track is a day you invest in yourself! 💜",
      "Consistency is the key to understanding your patterns! 📊",
      "You're building a powerful habit of self-awareness! 🧠",
      "Small daily actions create big transformations! ✨",
      "Your future self will thank you for this dedication! 🙏",
      "Progress, not perfection - you're doing amazing! 🎯"
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  // Calculate streak visualization data (last 30 days)
  const streakVisualization = useMemo(() => {
    const last30Days = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000)
      const dateString = date.toISOString().split('T')[0]
      const hasEntry = moods?.some(mood => mood.date === dateString)
      
      last30Days.push({
        date: dateString,
        hasEntry,
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNumber: date.getDate()
      })
    }
    
    return last30Days
  }, [moods])

  return (
    <div className="space-y-6">
      {/* Milestone Celebration */}
      <AnimatePresence>
        {celebratingMilestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed top-4 right-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white p-4 rounded-xl shadow-2xl z-50 max-w-sm"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-3xl">{celebratingMilestone.icon}</div>
              <div>
                <h3 className="font-bold">Milestone Reached!</h3>
                <p className="text-sm opacity-90">{celebratingMilestone.title}</p>
              </div>
            </div>
            <p className="text-sm opacity-90 mb-2">{celebratingMilestone.description}</p>
            <div className="flex items-center gap-1">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="font-medium">+{celebratingMilestone.points} points</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Streak Display */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Streak Tracker</h2>
            <p className="text-gray-600">Build consistency, build success</p>
          </div>
          <div className="flex items-center gap-2">
            <Flame className="w-8 h-8 text-orange-500" />
            <span className="text-3xl font-bold text-orange-600">{streakData.current}</span>
            <span className="text-lg text-gray-600">days</span>
          </div>
        </div>

        {/* Streak Health Status */}
        <div className={`p-4 rounded-lg border-2 mb-6 ${getStreakHealthColor(streakData.streakHealth)}`}>
          <p className="font-medium mb-1">{getStreakHealthMessage(streakData.streakHealth, streakData.current)}</p>
          {streakData.nextMilestone > streakData.current && (
            <p className="text-sm opacity-80">
              {streakData.daysUntilMilestone} more days until your next milestone reward!
            </p>
          )}
        </div>

        {/* Streak Statistics Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Flame className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">{streakData.current}</div>
            <div className="text-sm text-orange-700">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Crown className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{streakData.longest}</div>
            <div className="text-sm text-purple-700">Longest Streak</div>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Calendar className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{streakData.thisWeek}</div>
            <div className="text-sm text-blue-700">This Week</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{streakData.thisMonth}</div>
            <div className="text-sm text-green-700">This Month</div>
          </div>
        </div>

        {/* Motivational Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Star className="w-6 h-6 text-purple-600" />
              <div>
                <h3 className="font-medium text-purple-800">Daily Motivation</h3>
                <p className="text-sm text-purple-600">{getMotivationalMessage()}</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMotivation(!showMotivation)}
              className="text-purple-600 hover:text-purple-700"
            >
              <Zap className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        {/* 30-Day Streak Visualization */}
        <div className="mb-6">
          <h3 className="font-medium text-gray-900 mb-3">Last 30 Days</h3>
          <div className="grid grid-cols-15 gap-1 md:gap-2">
            {streakVisualization.map((day, index) => (
              <div key={day.date} className="text-center">
                <div className="text-xs text-gray-500 mb-1 hidden md:block">
                  {index % 7 === 0 ? day.dayName : ''}
                </div>
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.02 }}
                  className={`w-4 h-4 md:w-6 md:h-6 rounded-md mx-auto ${
                    day.hasEntry 
                      ? 'bg-green-500 shadow-sm' 
                      : 'bg-gray-200'
                  }`}
                  title={`${day.date}: ${day.hasEntry ? 'Tracked' : 'Not tracked'}`}
                >
                  {day.hasEntry && (
                    <CheckCircle2 className="w-full h-full text-white p-0.5" />
                  )}
                </motion.div>
                <div className="text-xs text-gray-400 mt-1 hidden md:block">
                  {day.dayNumber}
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      </div>

      {/* Milestone Rewards */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Milestone Rewards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestoneRewards.map(reward => (
            <motion.div
              key={reward.days}
              layout
              className={`p-4 rounded-lg border-2 transition-all ${
                reward.unlocked
                  ? 'bg-green-50 border-green-200'
                  : reward.days === streakData.nextMilestone
                  ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-300'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`text-2xl ${
                  reward.unlocked ? '' : 'grayscale opacity-50'
                }`}>
                  {reward.icon}
                </div>
                <div>
                  <h4 className={`font-medium ${
                    reward.unlocked ? 'text-green-800' : 'text-gray-700'
                  }`}>
                    {reward.title}
                  </h4>
                  <div className="text-sm text-gray-600">{reward.days} days</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-2">{reward.description}</p>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <Zap className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium">{reward.points} points</span>
                </div>
                {reward.unlocked && (
                  <div className="text-green-600 font-medium text-sm">
                    ✓ Unlocked
                  </div>
                )}
              </div>
              {reward.days === streakData.nextMilestone && !reward.unlocked && (
                <div className="mt-2 text-xs text-blue-600 font-medium">
                  Next milestone: {streakData.daysUntilMilestone} days to go!
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
