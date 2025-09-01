export const achievements = [
  {
    id: 'first_mood',
    name: 'First Step',
    description: 'Log your first mood',
    icon: '🌟',
    xp: 10
  },
  {
    id: 'week_streak',
    name: 'Week Warrior',
    description: '7-day logging streak',
    icon: '🔥',
    xp: 50
  },
  {
    id: 'mood_improver',
    name: 'Mood Booster',
    description: 'Improve average mood by 2 points',
    icon: '📈',
    xp: 30
  },
  {
    id: 'night_owl',
    name: 'Night Owl',
    description: 'Log mood after midnight',
    icon: '🦉',
    xp: 15
  },
  {
    id: 'early_bird',
    name: 'Early Bird',
    description: 'Log mood before 6 AM',
    icon: '🐦',
    xp: 15
  }
]

export function checkAchievements(
  moods: any[],
  currentAchievements: string[]
): string[] {
  const newAchievements: string[] = []
  
  // Check each achievement condition
  if (!currentAchievements.includes('first_mood') && moods.length >= 1) {
    newAchievements.push('first_mood')
  }
  
  // Check for 7-day streak
  if (!currentAchievements.includes('week_streak')) {
    const hasStreak = checkConsecutiveDays(moods, 7)
    if (hasStreak) newAchievements.push('week_streak')
  }
  
  return newAchievements
}

function checkConsecutiveDays(moods: any[], days: number): boolean {
  if (moods.length < days) return false
  
  const sortedDates = moods
    .map(m => new Date(m.created_at).toDateString())
    .sort()
    .reverse()
  
  let consecutive = 1
  for (let i = 1; i < sortedDates.length && consecutive < days; i++) {
    const current = new Date(sortedDates[i])
    const previous = new Date(sortedDates[i - 1])
    const diffDays = Math.floor((previous.getTime() - current.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 1) {
      consecutive++
    } else {
      consecutive = 1
    }
  }
  
  return consecutive >= days
}

