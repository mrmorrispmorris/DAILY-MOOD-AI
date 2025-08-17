'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Flame, Trophy, Calendar, Target, Zap, Star, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StreakData {
  currentStreak: number
  bestStreak: number
  totalDays: number
  lastLogDate: string
  streakStartDate: string
  weeklyGoal: number
  weeklyProgress: number
  isOnTrack: boolean
  daysUntilMilestone: number
  nextMilestone: number
}

interface StreakMilestone {
  days: number
  emoji: string
  title: string
  description: string
  reward: string
}

const milestones: StreakMilestone[] = [
  { days: 3, emoji: '🔥', title: 'Getting Started', description: 'First streak milestone', reward: '10 XP' },
  { days: 7, emoji: '🔥🔥', title: 'Week Warrior', description: 'One week of consistency', reward: '50 XP' },
  { days: 14, emoji: '🔥🔥🔥', title: 'Fortnight Fighter', description: 'Two weeks strong', reward: '100 XP' },
  { days: 30, emoji: '🔥🔥🔥🔥', title: 'Monthly Master', description: 'One month of dedication', reward: '250 XP' },
  { days: 60, emoji: '🔥🔥🔥🔥🔥', title: 'Dedication King', description: 'Two months of excellence', reward: '500 XP' },
  { days: 100, emoji: '🔥🔥🔥🔥🔥🔥', title: 'Century Club', description: '100 days of tracking', reward: '1000 XP' },
  { days: 365, emoji: '👑', title: 'Year Champion', description: 'One year of consistency', reward: '5000 XP' }
]

export function StreakTracking() {
  const [streakData, setStreakData] = useState<StreakData>({
    currentStreak: 0,
    bestStreak: 0,
    totalDays: 0,
    lastLogDate: '',
    streakStartDate: '',
    weeklyGoal: 7,
    weeklyProgress: 0,
    isOnTrack: true,
    daysUntilMilestone: 0,
    nextMilestone: 0
  })
  const [showNotification, setShowNotification] = useState(false)
  const [notificationMessage, setNotificationMessage] = useState('')

  // Load streak data from localStorage
  useEffect(() => {
    const savedStreakData = localStorage.getItem('dailymood-streak-data')
    if (savedStreakData) {
      setStreakData(JSON.parse(savedStreakData))
    }
  }, [])

  // Save streak data to localStorage
  useEffect(() => {
    localStorage.setItem('dailymood-streak-data', JSON.stringify(streakData))
  }, [streakData])

  const breakStreak = useCallback(() => {
    const newStreakData = {
      ...streakData,
      currentStreak: 0,
      streakStartDate: '',
      isOnTrack: false
    }
    setStreakData(newStreakData)
    
    setNotificationMessage(`🔥 Streak broken! You had a ${streakData.currentStreak}-day streak. Start a new one today!`)
    setShowNotification(true)
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setShowNotification(false), 5000)
  }, [streakData])

  const showStreakWarning = useCallback(() => {
    setNotificationMessage(`⚠️ Don't break your ${streakData.currentStreak}-day streak! Log your mood today to keep it alive.`)
    setShowNotification(true)
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setShowNotification(false), 5000)
  }, [streakData.currentStreak])

  const checkStreakStatus = useCallback(() => {
    const today = new Date().toISOString().split('T')[0]
    const lastLog = new Date(streakData.lastLogDate)
    const todayDate = new Date(today)
    
    // Calculate days since last log
    const daysDiff = Math.floor((todayDate.getTime() - lastLog.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysDiff > 1 && streakData.currentStreak > 0) {
      // Streak broken
      breakStreak()
    } else if (daysDiff === 1) {
      // One day missed - warning
      showStreakWarning()
    }
  }, [streakData.lastLogDate, streakData.currentStreak, breakStreak, showStreakWarning])

  // Check streak status daily
  useEffect(() => {
    checkStreakStatus()
    const interval = setInterval(checkStreakStatus, 24 * 60 * 60 * 1000) // Check every 24 hours
    return () => clearInterval(interval)
  }, [checkStreakStatus])

  const logMoodToday = () => {
    const today = new Date().toISOString().split('T')[0]
    const lastLog = new Date(streakData.lastLogDate)
    const todayDate = new Date(today)
    
    let newStreak = streakData.currentStreak
    let newStartDate = streakData.streakStartDate
    
    if (todayDate.getTime() === lastLog.getTime()) {
      // Already logged today
      return
    }
    
    if (todayDate.getTime() - lastLog.getTime() === 24 * 60 * 60 * 1000) {
      // Consecutive day
      newStreak = streakData.currentStreak + 1
      if (newStreak === 1) {
        newStartDate = today
      }
    } else {
      // New streak
      newStreak = 1
      newStartDate = today
    }
    
    const newBestStreak = Math.max(newStreak, streakData.bestStreak)
    const newTotalDays = streakData.totalDays + 1
    
    // Check for milestone
    const nextMilestone = milestones.find(m => m.days > newStreak)
    const daysUntilMilestone = nextMilestone ? nextMilestone.days - newStreak : 0
    
    const newStreakData: StreakData = {
      ...streakData,
      currentStreak: newStreak,
      bestStreak: newBestStreak,
      totalDays: newTotalDays,
      lastLogDate: today,
      streakStartDate: newStartDate,
      weeklyProgress: Math.min(streakData.weeklyProgress + 1, streakData.weeklyGoal),
      isOnTrack: true,
      daysUntilMilestone,
      nextMilestone: nextMilestone?.days || 0
    }
    
    setStreakData(newStreakData)
    
    // Check if milestone reached
    if (milestones.some(m => m.days === newStreak)) {
      const milestone = milestones.find(m => m.days === newStreak)!
      setNotificationMessage(`🎉 ${milestone.emoji} ${milestone.title}! ${milestone.description} - ${milestone.reward}`)
      setShowNotification(true)
      setTimeout(() => setShowNotification(false), 5000)
    }
  }

  const getStreakEmoji = (streak: number): string => {
    if (streak >= 100) return '👑'
    if (streak >= 60) return '🔥🔥🔥🔥🔥'
    if (streak >= 30) return '🔥🔥🔥🔥'
    if (streak >= 14) return '🔥🔥🔥'
    if (streak >= 7) return '🔥🔥'
    if (streak >= 3) return '🔥'
    if (streak >= 1) return '✨'
    return '🌟'
  }

  const getStreakColor = (streak: number): string => {
    if (streak >= 100) return 'text-purple-600'
    if (streak >= 60) return 'text-red-600'
    if (streak >= 30) return 'text-orange-600'
    if (streak >= 14) return 'text-yellow-600'
    if (streak >= 7) return 'text-green-600'
    if (streak >= 3) return 'text-blue-600'
    return 'text-gray-600'
  }

  const getNextMilestone = () => {
    return milestones.find(m => m.days > streakData.currentStreak)
  }

  const nextMilestone = getNextMilestone()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Flame className="h-6 w-6 text-orange-500" />
            Streak Tracking
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Build consistency and never break your daily mood logging streak
          </p>
        </div>
        
        <Button
          onClick={logMoodToday}
          className="bg-calm-blue hover:bg-calm-blue/90"
        >
          <Zap className="h-4 w-4 mr-2" />
          Log Today
        </Button>
      </div>

      {/* Streak Notification */}
      {showNotification && (
        <Card className="border-2 border-calm-blue/30 bg-calm-blue/5 animate-fade-in">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-calm-blue" />
              <p className="text-calm-blue font-medium">{notificationMessage}</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowNotification(false)}
                className="ml-auto"
              >
                ×
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Streak Display */}
      <Card className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
        <CardContent className="p-6 text-center">
          <div className="text-6xl mb-4">
            {getStreakEmoji(streakData.currentStreak)}
          </div>
          
          <h3 className={cn("text-3xl font-bold mb-2", getStreakColor(streakData.currentStreak))}>
            {streakData.currentStreak} Day{streakData.currentStreak !== 1 ? 's' : ''}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {streakData.currentStreak === 0 
              ? 'Start your streak today!' 
              : `Keep it going! Don't break the chain.`
            }
          </p>
          
          {streakData.currentStreak > 0 && (
            <div className="flex items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Started {new Date(streakData.streakStartDate).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {streakData.totalDays} total days logged
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Best Streak */}
        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {streakData.bestStreak}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Best Streak</p>
          </CardContent>
        </Card>

        {/* Weekly Progress */}
        <Card>
          <CardContent className="p-4 text-center">
            <Star className="h-8 w-8 text-calm-blue mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {streakData.weeklyProgress}/{streakData.weeklyGoal}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
            <Progress 
              value={(streakData.weeklyProgress / streakData.weeklyGoal) * 100} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        {/* Total Days */}
        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              {streakData.totalDays}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">Total Days</p>
          </CardContent>
        </Card>
      </div>

      {/* Next Milestone */}
      {nextMilestone && (
        <Card className="border-2 border-dashed border-calm-blue/30 bg-calm-blue/5">
          <CardHeader>
            <CardTitle className="text-lg text-calm-blue flex items-center gap-2">
              <Target className="h-5 w-5" />
              Next Milestone
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <div className="text-4xl mb-2">{nextMilestone.emoji}</div>
              <h4 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-1">
                {nextMilestone.title}
              </h4>
              <p className="text-gray-600 dark:text-gray-400 mb-3">
                {nextMilestone.description}
              </p>
              
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-calm-blue">
                    {streakData.currentStreak}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Current</div>
                </div>
                
                <div className="text-gray-400">→</div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-calm-blue">
                    {nextMilestone.days}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Target</div>
                </div>
              </div>
              
              <div className="bg-calm-blue/10 rounded-lg p-3">
                <p className="text-sm text-calm-blue font-medium">
                  {streakData.daysUntilMilestone} more day{streakData.daysUntilMilestone !== 1 ? 's' : ''} to go!
                </p>
                <p className="text-xs text-calm-blue/80 mt-1">
                  Reward: {nextMilestone.reward}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Milestones */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          All Milestones
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {milestones.map((milestone) => {
            const isReached = streakData.bestStreak >= milestone.days
            const isCurrent = streakData.currentStreak >= milestone.days
            
            return (
              <Card 
                key={milestone.days}
                className={cn(
                  'transition-all duration-200',
                  isReached ? 'bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800' : '',
                  isCurrent ? 'ring-2 ring-calm-blue ring-opacity-50' : ''
                )}
              >
                <CardContent className="p-4 text-center">
                  <div className={cn(
                    "text-3xl mb-2",
                    isReached ? "opacity-100" : "opacity-40"
                  )}>
                    {milestone.emoji}
                  </div>
                  
                  <h4 className={cn(
                    "font-semibold mb-1",
                    isReached ? "text-green-800 dark:text-green-200" : "text-gray-600 dark:text-gray-400"
                  )}>
                    {milestone.title}
                  </h4>
                  
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    {milestone.days} days
                  </p>
                  
                  <Badge 
                    variant={isReached ? "default" : "outline"}
                    className={cn(
                      "text-xs",
                      isReached ? "bg-green-600 hover:bg-green-700" : ""
                    )}
                  >
                    {isReached ? "Achieved" : "Locked"}
                  </Badge>
                  
                  {isReached && (
                    <p className="text-xs text-green-600 dark:text-green-400 mt-2">
                      {milestone.reward}
                    </p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
