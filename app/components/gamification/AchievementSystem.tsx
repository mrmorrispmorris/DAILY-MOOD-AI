'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Trophy, 
  Star, 
  Award, 
  Target, 
  Zap, 
  Crown, 
  Gift,
  Lock,
  ChevronRight,
  TrendingUp,
  Calendar,
  Activity
} from 'lucide-react'
import { supabase } from '@/app/lib/supabase-client'
import {
  Achievement,
  UserStats,
  ACHIEVEMENT_DEFINITIONS,
  checkAchievements,
  calculateLevel,
  getPointsToNextLevel,
  getAchievementProgress,
  getNextAchievements,
  calculateDailyBonus
} from '@/lib/achievements-system'

interface AchievementSystemProps {
  userId?: string
  moods: any[]
}

const CATEGORY_COLORS = {
  consistency: '#10b981', // Green
  improvement: '#3b82f6', // Blue  
  milestone: '#8b5cf6', // Purple
  wellness: '#06b6d4', // Cyan
  social: '#f59e0b', // Yellow
  special: '#ef4444' // Red
}

const CATEGORY_ICONS = {
  consistency: Calendar,
  improvement: TrendingUp,
  milestone: Trophy,
  wellness: Activity,
  social: Star,
  special: Crown
}

export default function AchievementSystem({ userId, moods }: AchievementSystemProps) {
  const [userAchievements, setUserAchievements] = useState<string[]>([])
  const [userStats, setUserStats] = useState<UserStats>({
    totalPoints: 0,
    level: 1,
    currentStreak: 0,
    longestStreak: 0,
    totalEntries: 0,
    averageMood: 0,
    improvementRate: 0,
    achievementsUnlocked: 0,
    badges: []
  })
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showCelebration, setShowCelebration] = useState<Achievement | null>(null)
  const [recentUnlocks, setRecentUnlocks] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)

  // Calculate user statistics from mood data
  const calculatedStats = useMemo(() => {
    if (!moods?.length) return userStats

    // Calculate streak
    const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate = new Date()

    sortedMoods.forEach((mood, index) => {
      const moodDate = new Date(mood.date)
      if (index === 0) {
        currentStreak = 1
        tempStreak = 1
      } else {
        const daysDiff = Math.floor((lastDate.getTime() - moodDate.getTime()) / (1000 * 60 * 60 * 24))
        if (daysDiff === 1) {
          tempStreak++
          if (index < 10) currentStreak++ // Only count current streak for recent entries
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
          if (daysDiff > 1) currentStreak = 0
        }
      }
      lastDate = moodDate
    })
    longestStreak = Math.max(longestStreak, tempStreak)

    // Calculate other stats
    const totalEntries = moods.length
    const averageMood = moods.reduce((sum, mood) => sum + mood.mood_score, 0) / totalEntries
    
    // Calculate improvement rate (last 7 vs previous 7)
    const recent7 = moods.slice(0, 7)
    const previous7 = moods.slice(7, 14)
    let improvementRate = 0
    if (recent7.length >= 3 && previous7.length >= 3) {
      const recentAvg = recent7.reduce((sum, mood) => sum + mood.mood_score, 0) / recent7.length
      const previousAvg = previous7.reduce((sum, mood) => sum + mood.mood_score, 0) / previous7.length
      improvementRate = ((recentAvg - previousAvg) / previousAvg) * 100
    }

    return {
      totalEntries,
      currentStreak,
      longestStreak,
      averageMood,
      improvementRate,
      conversationCount: 0, // Would come from AI conversations table
      exportCount: 0 // Would come from export logs
    }
  }, [moods])

  // Load user achievements from database
  useEffect(() => {
    if (userId) {
      loadUserAchievements()
    }
  }, [userId])

  // Check for new achievements when stats change
  useEffect(() => {
    if (calculatedStats.totalEntries > 0) {
      checkForNewAchievements()
    }
  }, [calculatedStats])

  const loadUserAchievements = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('achievement_id, unlocked_at, points')
        .eq('user_id', userId)

      if (error) throw error

      const achievementIds = data?.map(a => a.achievement_id) || []
      const totalPoints = data?.reduce((sum, a) => sum + a.points, 0) || 0
      
      setUserAchievements(achievementIds)
      setUserStats(prev => ({
        ...prev,
        totalPoints,
        level: calculateLevel(totalPoints),
        achievementsUnlocked: achievementIds.length
      }))
    } catch (error) {
      console.error('Error loading achievements:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkForNewAchievements = async () => {
    if (!userId) return

    const statsForCheck = {
      ...calculatedStats,
      recentMoods: moods || []
    }

    const newAchievements = checkAchievements(statsForCheck, userAchievements)

    if (newAchievements.length > 0) {
      // Save to database
      const achievementData = newAchievements.map(achievement => ({
        user_id: userId,
        achievement_id: achievement.id,
        unlocked_at: achievement.unlockedAt,
        points: achievement.points
      }))

      try {
        const { error } = await supabase
          .from('user_achievements')
          .insert(achievementData)

        if (!error) {
          // Update local state
          setUserAchievements(prev => [...prev, ...newAchievements.map(a => a.id)])
          setUserStats(prev => ({
            ...prev,
            totalPoints: prev.totalPoints + newAchievements.reduce((sum, a) => sum + a.points, 0),
            achievementsUnlocked: prev.achievementsUnlocked + newAchievements.length
          }))

          // Show celebration for first new achievement
          setRecentUnlocks(newAchievements)
          setShowCelebration(newAchievements[0])

          // Hide celebration after 3 seconds
          setTimeout(() => setShowCelebration(null), 3000)
        }
      } catch (error) {
        console.error('Error saving achievements:', error)
      }
    }
  }

  // Group achievements by category
  const groupedAchievements = useMemo(() => {
    const groups: Record<string, Achievement[]> = {}
    
    ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
      if (!groups[achievement.category]) {
        groups[achievement.category] = []
      }
      
      const isUnlocked = userAchievements.includes(achievement.id)
      const progress = getAchievementProgress(achievement, calculatedStats)
      
      groups[achievement.category].push({
        ...achievement,
        unlocked: isUnlocked,
        progress: progress.current,
        maxProgress: progress.max
      })
    })

    return groups
  }, [userAchievements, calculatedStats])

  // Get next achievements to work towards
  const nextAchievements = useMemo(() => {
    return getNextAchievements(calculatedStats, userAchievements)
  }, [calculatedStats, userAchievements])

  // Calculate daily bonus
  const dailyBonus = useMemo(() => {
    return calculateDailyBonus(moods || [])
  }, [moods])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'text-amber-600 bg-amber-50 border-amber-200'
      case 'silver': return 'text-gray-600 bg-gray-50 border-gray-200'
      case 'gold': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'platinum': return 'text-purple-600 bg-purple-50 border-purple-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Achievement Celebration Modal */}
      <AnimatePresence>
        {showCelebration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.8, rotate: 10 }}
              className="bg-white rounded-2xl p-8 max-w-md text-center shadow-2xl"
            >
              <div className="text-6xl mb-4">{showCelebration.icon}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Achievement Unlocked!</h2>
              <h3 className="text-xl font-semibold text-purple-600 mb-3">{showCelebration.name}</h3>
              <p className="text-gray-600 mb-4">{showCelebration.description}</p>
              <div className="flex items-center justify-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-yellow-500" />
                <span className="text-lg font-semibold">+{showCelebration.points} points</span>
              </div>
              <div className="text-sm text-gray-500">
                Level {calculateLevel(userStats.totalPoints)} • {userStats.achievementsUnlocked} achievements
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User Stats Overview */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Your Progress</h2>
            <p className="text-gray-600">Track your wellness journey achievements</p>
          </div>
          <div className="flex items-center gap-2">
            <Crown className="w-6 h-6 text-purple-600" />
            <span className="text-2xl font-bold text-purple-600">Level {userStats.level}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <Trophy className="w-8 h-8 text-blue-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-900">{userStats.totalPoints}</div>
            <div className="text-sm text-blue-700">Total Points</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Star className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{userStats.achievementsUnlocked}</div>
            <div className="text-sm text-green-700">Achievements</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-orange-900">{calculatedStats.currentStreak}</div>
            <div className="text-sm text-orange-700">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Award className="w-8 h-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">{calculatedStats.longestStreak}</div>
            <div className="text-sm text-purple-700">Best Streak</div>
          </div>
        </div>

        {/* Level Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Level {userStats.level}</span>
            <span>{getPointsToNextLevel(userStats.totalPoints)} points to next level</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ 
                width: `${100 - (getPointsToNextLevel(userStats.totalPoints) / 150) * 100}%`
              }}
              className="h-full bg-gradient-to-r from-purple-500 to-purple-600"
            />
          </div>
        </div>

        {/* Daily Bonus */}
        {dailyBonus > 0 && (
          <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border border-yellow-200 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Gift className="w-5 h-5 text-yellow-600" />
                <span className="font-medium text-yellow-800">Daily Bonus Earned!</span>
              </div>
              <div className="text-yellow-800 font-bold">+{dailyBonus} points</div>
            </div>
          </div>
        )}
      </div>

      {/* Next Achievements */}
      {nextAchievements.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Up Next</h3>
          <div className="space-y-3">
            {nextAchievements.map(achievement => (
              <div key={achievement.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl">{achievement.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-medium text-gray-900">{achievement.name}</h4>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(achievement.difficulty)}`}>
                      {achievement.difficulty}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {achievement.progress}/{achievement.maxProgress}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Zap className="w-4 h-4 text-yellow-500" />
                    <span>{achievement.points}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Achievement Categories */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">All Achievements</h3>
        
        {/* Category Filter */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
              selectedCategory === null 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {Object.keys(groupedAchievements).map(category => {
            const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
            const color = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
            const unlockedCount = groupedAchievements[category].filter(a => a.unlocked).length
            const totalCount = groupedAchievements[category].length
            
            return (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === category
                    ? 'text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                style={selectedCategory === category ? { backgroundColor: color } : {}}
              >
                <IconComponent className="w-4 h-4" />
                <span className="capitalize">{category}</span>
                <span className="bg-white/20 px-2 py-1 rounded-full text-xs">
                  {unlockedCount}/{totalCount}
                </span>
              </button>
            )
          })}
        </div>

        {/* Achievement Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(groupedAchievements)
            .filter(([category]) => selectedCategory === null || category === selectedCategory)
            .map(([category, achievements]) => 
              achievements.map(achievement => {
                const IconComponent = CATEGORY_ICONS[category as keyof typeof CATEGORY_ICONS]
                const categoryColor = CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS]
                
                return (
                  <motion.div
                    key={achievement.id}
                    layout
                    className={`p-4 rounded-lg border-2 transition-all ${
                      achievement.unlocked 
                        ? 'bg-white border-green-200 shadow-md' 
                        : achievement.hidden
                        ? 'bg-gray-100 border-gray-200 opacity-60'
                        : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-white text-xl ${
                          achievement.unlocked ? 'bg-green-500' : 'bg-gray-400'
                        }`}
                        style={achievement.unlocked ? {} : { backgroundColor: categoryColor }}
                      >
                        {achievement.hidden && !achievement.unlocked ? (
                          <Lock className="w-6 h-6" />
                        ) : (
                          achievement.icon
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-medium truncate ${
                            achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                          }`}>
                            {achievement.hidden && !achievement.unlocked ? '???' : achievement.name}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getDifficultyColor(achievement.difficulty)}`}>
                            {achievement.difficulty}
                          </span>
                        </div>
                        
                        <p className={`text-sm mb-2 ${
                          achievement.unlocked ? 'text-gray-600' : 'text-gray-500'
                        }`}>
                          {achievement.hidden && !achievement.unlocked 
                            ? 'Complete more achievements to unlock this mystery reward!'
                            : achievement.description
                          }
                        </p>
                        
                        {!achievement.unlocked && !achievement.hidden && (
                          <div className="flex items-center gap-2 mb-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-full rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${((achievement.progress || 0) / (achievement.maxProgress || 1)) * 100}%`,
                                  backgroundColor: categoryColor
                                }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">
                              {achievement.progress}/{achievement.maxProgress}
                            </span>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1">
                            <IconComponent className="w-4 h-4" style={{ color: categoryColor }} />
                            <span className="text-xs text-gray-500 capitalize">{category}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Zap className="w-4 h-4 text-yellow-500" />
                            <span className="text-sm font-medium">{achievement.points}</span>
                          </div>
                        </div>
                        
                        {achievement.unlocked && (
                          <div className="mt-2 text-xs text-green-600 font-medium">
                            ✓ Unlocked {new Date(achievement.unlockedAt || '').toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
        </div>
      </div>
    </div>
  )
}
