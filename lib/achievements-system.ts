/**
 * COMPASSIONATE ACHIEVEMENT SYSTEM
 * Gamification focused on mental wellness and positive reinforcement
 * Following PRD specifications for engagement without being overwhelming
 */

export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  category: 'consistency' | 'improvement' | 'milestone' | 'wellness' | 'social' | 'special'
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  requirements: {
    type: 'streak' | 'count' | 'average' | 'improvement' | 'activity' | 'time_based'
    value: number
    timeframe?: 'daily' | 'weekly' | 'monthly' | 'all_time'
    conditions?: Record<string, any>
  }
  unlocked?: boolean
  unlockedAt?: string
  progress?: number
  maxProgress?: number
  hidden?: boolean // For special achievements
}

export interface UserStats {
  totalPoints: number
  level: number
  currentStreak: number
  longestStreak: number
  totalEntries: number
  averageMood: number
  improvementRate: number
  achievementsUnlocked: number
  badges: string[]
}

/**
 * Comprehensive achievement definitions focusing on mental wellness
 */
export const ACHIEVEMENT_DEFINITIONS: Achievement[] = [
  // CONSISTENCY CATEGORY - Building healthy habits
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Log your first mood entry - every journey begins with a single step',
    icon: '🌱',
    category: 'consistency',
    difficulty: 'bronze',
    points: 10,
    requirements: {
      type: 'count',
      value: 1
    }
  },
  {
    id: 'daily_dedication',
    name: 'Daily Dedication',
    description: 'Check in with yourself for 7 days in a row',
    icon: '🔥',
    category: 'consistency',
    difficulty: 'bronze',
    points: 50,
    requirements: {
      type: 'streak',
      value: 7
    }
  },
  {
    id: 'weekly_warrior',
    name: 'Weekly Warrior',
    description: 'Maintain a 7-day streak - you\'re building real habits!',
    icon: '⚔️',
    category: 'consistency',
    difficulty: 'silver',
    points: 100,
    requirements: {
      type: 'streak',
      value: 7
    }
  },
  {
    id: 'monthly_champion',
    name: 'Monthly Champion',
    description: 'Track your mood consistently for 30 days straight',
    icon: '🏆',
    category: 'consistency',
    difficulty: 'gold',
    points: 300,
    requirements: {
      type: 'streak',
      value: 30
    }
  },
  {
    id: 'streak_legend',
    name: 'Streak Legend',
    description: 'Achieve a 100-day tracking streak - you\'re a wellness champion!',
    icon: '👑',
    category: 'consistency',
    difficulty: 'platinum',
    points: 1000,
    requirements: {
      type: 'streak',
      value: 100
    }
  },

  // IMPROVEMENT CATEGORY - Personal growth and progress
  {
    id: 'mood_improver',
    name: 'Mood Improver',
    description: 'Increase your average mood by 1 point from last week',
    icon: '📈',
    category: 'improvement',
    difficulty: 'silver',
    points: 75,
    requirements: {
      type: 'improvement',
      value: 1,
      timeframe: 'weekly'
    }
  },
  {
    id: 'upward_spiral',
    name: 'Upward Spiral',
    description: 'Show consistent mood improvement over 2 weeks',
    icon: '🌟',
    category: 'improvement',
    difficulty: 'gold',
    points: 200,
    requirements: {
      type: 'improvement',
      value: 1.5,
      timeframe: 'weekly',
      conditions: { consecutive_weeks: 2 }
    }
  },
  {
    id: 'peak_performer',
    name: 'Peak Performer',
    description: 'Maintain an average mood of 8+ for a full week',
    icon: '⭐',
    category: 'improvement',
    difficulty: 'gold',
    points: 250,
    requirements: {
      type: 'average',
      value: 8,
      timeframe: 'weekly'
    }
  },

  // MILESTONE CATEGORY - Significant accomplishments
  {
    id: 'century_club',
    name: 'Century Club',
    description: 'Log 100 mood entries - you\'re committed to wellness!',
    icon: '💯',
    category: 'milestone',
    difficulty: 'silver',
    points: 150,
    requirements: {
      type: 'count',
      value: 100
    }
  },
  {
    id: 'mood_master',
    name: 'Mood Master',
    description: 'Reach 500 total mood entries',
    icon: '🎓',
    category: 'milestone',
    difficulty: 'gold',
    points: 500,
    requirements: {
      type: 'count',
      value: 500
    }
  },
  {
    id: 'wellness_guru',
    name: 'Wellness Guru',
    description: 'Complete 1000 mood entries - you\'re a true wellness advocate',
    icon: '🧘',
    category: 'milestone',
    difficulty: 'platinum',
    points: 1500,
    requirements: {
      type: 'count',
      value: 1000
    }
  },

  // WELLNESS CATEGORY - Holistic health activities
  {
    id: 'activity_explorer',
    name: 'Activity Explorer',
    description: 'Log 10 different activities that affect your mood',
    icon: '🗺️',
    category: 'wellness',
    difficulty: 'bronze',
    points: 40,
    requirements: {
      type: 'activity',
      value: 10,
      conditions: { unique_activities: true }
    }
  },
  {
    id: 'self_care_champion',
    name: 'Self-Care Champion',
    description: 'Include self-care activities in 20 mood entries',
    icon: '💆',
    category: 'wellness',
    difficulty: 'silver',
    points: 80,
    requirements: {
      type: 'activity',
      value: 20,
      conditions: { activity_type: 'self_care' }
    }
  },
  {
    id: 'mindful_tracker',
    name: 'Mindful Tracker',
    description: 'Add thoughtful notes to 50 mood entries',
    icon: '📝',
    category: 'wellness',
    difficulty: 'silver',
    points: 100,
    requirements: {
      type: 'count',
      value: 50,
      conditions: { has_notes: true, min_note_length: 10 }
    }
  },

  // SOCIAL CATEGORY - Community and sharing
  {
    id: 'moody_friend',
    name: 'MOODY\'s Friend',
    description: 'Have 10 conversations with your AI companion',
    icon: '🤖',
    category: 'social',
    difficulty: 'bronze',
    points: 60,
    requirements: {
      type: 'count',
      value: 10,
      conditions: { conversation_type: 'ai_chat' }
    }
  },
  {
    id: 'data_scientist',
    name: 'Data Scientist',
    description: 'Export your mood data for analysis',
    icon: '📊',
    category: 'social',
    difficulty: 'bronze',
    points: 30,
    requirements: {
      type: 'count',
      value: 1,
      conditions: { action_type: 'data_export' }
    }
  },

  // SPECIAL CATEGORY - Hidden achievements and seasonal rewards
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log mood entries before 7 AM for 5 consecutive days',
    icon: '🌅',
    category: 'special',
    difficulty: 'silver',
    points: 120,
    requirements: {
      type: 'time_based',
      value: 5,
      conditions: { before_hour: 7, consecutive: true }
    },
    hidden: true
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log mood entries after 10 PM for 7 days',
    icon: '🦉',
    category: 'special',
    difficulty: 'silver',
    points: 120,
    requirements: {
      type: 'time_based',
      value: 7,
      conditions: { after_hour: 22 }
    },
    hidden: true
  },
  {
    id: 'comeback_story',
    name: 'Comeback Story',
    description: 'Improve from a mood below 4 to above 7 within a week',
    icon: '🚀',
    category: 'special',
    difficulty: 'gold',
    points: 300,
    requirements: {
      type: 'improvement',
      value: 3,
      timeframe: 'weekly',
      conditions: { min_start: 4, min_end: 7 }
    },
    hidden: true
  },
  {
    id: 'balance_master',
    name: 'Balance Master',
    description: 'Maintain mood between 6-8 for 14 consecutive days',
    icon: '⚖️',
    category: 'special',
    difficulty: 'gold',
    points: 400,
    requirements: {
      type: 'average',
      value: 7,
      timeframe: 'daily',
      conditions: { min_range: 6, max_range: 8, consecutive_days: 14 }
    },
    hidden: true
  }
]

/**
 * Calculate user level based on total points
 */
export function calculateLevel(totalPoints: number): number {
  // Level progression: 100 points for level 1, then increases by 50 each level
  if (totalPoints < 100) return 1
  return Math.floor((totalPoints - 100) / 150) + 2
}

/**
 * Get points needed for next level
 */
export function getPointsForNextLevel(currentLevel: number): number {
  if (currentLevel === 1) return 100
  return 100 + (currentLevel - 1) * 150
}

/**
 * Get points needed to reach next level from current points
 */
export function getPointsToNextLevel(totalPoints: number): number {
  const currentLevel = calculateLevel(totalPoints)
  const pointsForNextLevel = getPointsForNextLevel(currentLevel + 1)
  return pointsForNextLevel - totalPoints
}

/**
 * Check which achievements a user has earned based on their data
 */
export function checkAchievements(
  userStats: {
    totalEntries: number
    currentStreak: number
    longestStreak: number
    averageMood: number
    recentMoods: Array<{ date: string; mood_score: number; notes?: string; activities?: string[]; created_at: string }>
    conversationCount: number
    exportCount: number
  },
  previousAchievements: string[] = []
): Achievement[] {
  const newAchievements: Achievement[] = []

  ACHIEVEMENT_DEFINITIONS.forEach(achievement => {
    // Skip if already unlocked
    if (previousAchievements.includes(achievement.id)) return

    let isUnlocked = false

    switch (achievement.requirements.type) {
      case 'count':
        if (achievement.requirements.conditions?.conversation_type === 'ai_chat') {
          isUnlocked = userStats.conversationCount >= achievement.requirements.value
        } else if (achievement.requirements.conditions?.action_type === 'data_export') {
          isUnlocked = userStats.exportCount >= achievement.requirements.value
        } else if (achievement.requirements.conditions?.has_notes) {
          const entriesWithNotes = userStats.recentMoods.filter(mood => 
            mood.notes && mood.notes.length >= (achievement.requirements.conditions?.min_note_length || 0)
          ).length
          isUnlocked = entriesWithNotes >= achievement.requirements.value
        } else {
          isUnlocked = userStats.totalEntries >= achievement.requirements.value
        }
        break

      case 'streak':
        isUnlocked = userStats.currentStreak >= achievement.requirements.value
        break

      case 'average':
        if (achievement.requirements.timeframe === 'weekly') {
          // Check if current week average meets requirement
          const thisWeek = userStats.recentMoods.filter(mood => {
            const moodDate = new Date(mood.date)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return moodDate >= weekAgo
          })
          if (thisWeek.length >= 5) { // At least 5 entries in the week
            const weekAvg = thisWeek.reduce((sum, mood) => sum + mood.mood_score, 0) / thisWeek.length
            isUnlocked = weekAvg >= achievement.requirements.value
          }
        }
        break

      case 'improvement':
        if (achievement.requirements.timeframe === 'weekly') {
          const thisWeek = userStats.recentMoods.filter(mood => {
            const moodDate = new Date(mood.date)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return moodDate >= weekAgo
          })
          const lastWeek = userStats.recentMoods.filter(mood => {
            const moodDate = new Date(mood.date)
            const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            return moodDate >= twoWeeksAgo && moodDate < weekAgo
          })
          
          if (thisWeek.length >= 3 && lastWeek.length >= 3) {
            const thisWeekAvg = thisWeek.reduce((sum, mood) => sum + mood.mood_score, 0) / thisWeek.length
            const lastWeekAvg = lastWeek.reduce((sum, mood) => sum + mood.mood_score, 0) / lastWeek.length
            const improvement = thisWeekAvg - lastWeekAvg
            isUnlocked = improvement >= achievement.requirements.value
          }
        }
        break

      case 'activity':
        if (achievement.requirements.conditions?.unique_activities) {
          const uniqueActivities = new Set()
          userStats.recentMoods.forEach(mood => {
            mood.activities?.forEach(activity => uniqueActivities.add(activity))
          })
          isUnlocked = uniqueActivities.size >= achievement.requirements.value
        } else if (achievement.requirements.conditions?.activity_type) {
          const activityEntries = userStats.recentMoods.filter(mood =>
            mood.activities?.some(activity => 
              activity.toLowerCase().includes('care') || 
              activity.toLowerCase().includes('meditation') ||
              activity.toLowerCase().includes('rest')
            )
          ).length
          isUnlocked = activityEntries >= achievement.requirements.value
        }
        break

      case 'time_based':
        if (achievement.requirements.conditions?.before_hour) {
          const earlyEntries = userStats.recentMoods.filter(mood => {
            const hour = new Date(mood.created_at).getHours()
            return hour < achievement.requirements.conditions!.before_hour
          })
          if (achievement.requirements.conditions.consecutive) {
            // Check for consecutive early entries
            const sortedEntries = earlyEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
            let consecutiveCount = 0
            let maxConsecutive = 0
            
            for (let i = 0; i < sortedEntries.length - 1; i++) {
              const current = new Date(sortedEntries[i].date)
              const next = new Date(sortedEntries[i + 1].date)
              const diffDays = Math.floor((next.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))
              
              if (diffDays === 1) {
                consecutiveCount++
              } else {
                maxConsecutive = Math.max(maxConsecutive, consecutiveCount + 1)
                consecutiveCount = 0
              }
            }
            maxConsecutive = Math.max(maxConsecutive, consecutiveCount + 1)
            isUnlocked = maxConsecutive >= achievement.requirements.value
          } else {
            isUnlocked = earlyEntries.length >= achievement.requirements.value
          }
        }
        break
    }

    if (isUnlocked) {
      newAchievements.push({
        ...achievement,
        unlocked: true,
        unlockedAt: new Date().toISOString()
      })
    }
  })

  return newAchievements
}

/**
 * Get achievement progress for display
 */
export function getAchievementProgress(achievement: Achievement, userStats: any): { current: number; max: number; percentage: number } {
  let current = 0
  const max = achievement.requirements.value

  switch (achievement.requirements.type) {
    case 'count':
      current = Math.min(userStats.totalEntries, max)
      break
    case 'streak':
      current = Math.min(userStats.currentStreak, max)
      break
    case 'average':
      current = Math.min(userStats.averageMood * 10, max * 10) / 10
      break
    default:
      current = 0
  }

  const percentage = Math.min(100, (current / max) * 100)
  return { current, max, percentage }
}

/**
 * Get user's next achievable achievements (not hidden, close to completion)
 */
export function getNextAchievements(userStats: any, currentAchievements: string[]): Achievement[] {
  return ACHIEVEMENT_DEFINITIONS
    .filter(achievement => 
      !achievement.hidden && 
      !currentAchievements.includes(achievement.id)
    )
    .map(achievement => {
      const progress = getAchievementProgress(achievement, userStats)
      return { ...achievement, progress: progress.current, maxProgress: progress.max }
    })
    .filter(achievement => (achievement.progress || 0) > 0)
    .sort((a, b) => ((b.progress || 0) / (b.maxProgress || 1)) - ((a.progress || 0) / (a.maxProgress || 1)))
    .slice(0, 3)
}

/**
 * Calculate daily engagement bonus based on activities
 */
export function calculateDailyBonus(moodEntries: any[]): number {
  const today = new Date().toDateString()
  const todayEntries = moodEntries.filter(entry => 
    new Date(entry.date).toDateString() === today
  )

  let bonus = 0
  
  // Consistency bonus
  if (todayEntries.length >= 1) bonus += 5
  if (todayEntries.length >= 3) bonus += 5
  
  // Quality bonus (entries with notes)
  const entriesWithNotes = todayEntries.filter(entry => entry.notes && entry.notes.length > 10)
  bonus += entriesWithNotes.length * 3
  
  // Activity bonus
  const entriesWithActivities = todayEntries.filter(entry => entry.activities && entry.activities.length > 0)
  bonus += entriesWithActivities.length * 2

  return Math.min(bonus, 25) // Cap at 25 points per day
}

export default {
  ACHIEVEMENT_DEFINITIONS,
  checkAchievements,
  calculateLevel,
  getPointsToNextLevel,
  getAchievementProgress,
  getNextAchievements,
  calculateDailyBonus
}
