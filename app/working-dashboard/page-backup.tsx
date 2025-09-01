'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import MoodyCompanion from '@/app/components/avatar/MoodyCompanion'
import AvatarWidget from '@/app/components/avatar/AvatarWidget'
import MoodCharts from '@/app/components/analytics/MoodCharts'
import MoodTrackingBenefits from '@/app/components/education/MoodTrackingBenefits'
import UserGuide from '@/app/components/onboarding/UserGuide'
import MotivationalTips from '@/app/components/education/MotivationalTips'
import YearInPixels from '@/app/components/premium/YearInPixels'
import StreakCounter from '@/app/components/premium/StreakCounter'
import GoalsAndAchievements from '@/app/components/premium/GoalsAndAchievements'
import EnhancedMoodEntry from '@/app/components/premium/EnhancedMoodEntry'
import AIInsights from '@/app/components/ai/AIInsights'
import AIFollowUp from '@/app/components/ai/AIFollowUp'
import MoodOverview from '@/app/components/mood/MoodOverview'
import MoodPlanGenerator from '@/app/components/mood/MoodPlanGenerator'

interface User {
  id: string
  email: string
  created_at: string
}

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  date: string
  time: string // NEW: Add time for multiple entries per day
  emoji: string
  notes?: string
  activities?: string[] // NEW: Add activities array
  photos?: string[] // NEW: Add photos array
}

// BACKUP - USE page-modern.tsx FOR THE NEW DESIGN
export default function WorkingDashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check authentication
    const session = localStorage.getItem('dailymood_session')
    if (!session) {
      console.log('❌ No session found, redirecting to auth')
      router.push('/working-auth')
      return
    }

    try {
      const userData = JSON.parse(session)
      setUser(userData)
      console.log('✅ User authenticated:', userData.email)
      
      // Load mood data
      loadMoods(userData.id)
      
      // Check if user needs onboarding
      const hasCompletedOnboarding = localStorage.getItem('dailymood_onboarding_completed')
      if (!hasCompletedOnboarding) {
        setTimeout(() => setShowOnboarding(true), 1000) // Show after 1 second delay
      }
      
    } catch (error) {
      console.error('❌ Invalid session data:', error)
      localStorage.removeItem('dailymood_session')
      router.push('/working-auth')
      return
    }
    
    setLoading(false)
  }, [router])

  const loadMoods = (userId: string) => {
    const moodsKey = `dailymood_moods_${userId}`
    const savedMoods = localStorage.getItem(moodsKey)
    
    if (savedMoods) {
      try {
        const moodData = JSON.parse(savedMoods)
        setMoods(moodData)
        console.log(`✅ Loaded ${moodData.length} mood entries`)
      } catch (error) {
        console.error('❌ Error loading moods:', error)
        setMoods([])
      }
    } else {
      // Create some demo mood data
                    const demoMoods: MoodEntry[] = [
                {
                  id: 'mood_1',
                  user_id: userId,
                  mood_score: 8,
                  date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday
                  time: '14:30:00',
                  emoji: '😊',
                  notes: 'Great day at work!',
                  activities: ['work', 'exercise'],
                  photos: []
                },
                {
                  id: 'mood_2', 
                  user_id: userId,
                  mood_score: 6,
                  date: new Date(Date.now() - 86400000).toISOString().split('T')[0], // Yesterday evening
                  time: '20:15:00',
                  emoji: '😐',
                  notes: 'Tired after long day',
                  activities: ['home', 'relax'],
                  photos: []
                },
                {
                  id: 'mood_3',
                  user_id: userId,
                  mood_score: 9,
                  date: new Date(Date.now() - 172800000).toISOString().split('T')[0], // 2 days ago
                  time: '09:45:00',
                  emoji: '🤩',
                  notes: 'Amazing breakthrough!',
                  activities: ['work', 'achievement'],
                  photos: []
                }
              ]
      setMoods(demoMoods)
      localStorage.setItem(moodsKey, JSON.stringify(demoMoods))
    }
  }

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return '😢'
    if (score <= 4) return '😔' 
    if (score <= 6) return '😐'
    if (score <= 8) return '😊'
    return '🤩'
  }

  const addMoodEntry = (moodScore: number, notes: string, activities?: string[], photos?: string[]) => {
    if (!user) return
    
    const now = new Date()
    const newMood: MoodEntry = {
      id: `mood_${Date.now()}`,
      user_id: user.id,
      mood_score: moodScore,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0], // Add time for multiple entries per day
      emoji: getMoodEmoji(moodScore),
      notes: notes,
      activities: activities || [],
      photos: photos || []
    }
    
    const updatedMoods = [newMood, ...moods]
    setMoods(updatedMoods)
    
    const moodsKey = `dailymood_moods_${user.id}`
    localStorage.setItem(moodsKey, JSON.stringify(updatedMoods))
    
    console.log('✅ New mood entry added:', newMood)
  }

  // NEW: Function to edit existing mood entry
  const editMoodEntry = (entryId: string, updates: Partial<MoodEntry>) => {
    if (!user) return
    
    const updatedMoods = moods.map(mood => 
      mood.id === entryId 
        ? { ...mood, ...updates, emoji: updates.mood_score ? getMoodEmoji(updates.mood_score) : mood.emoji }
        : mood
    )
    
    setMoods(updatedMoods)
    
    const moodsKey = `dailymood_moods_${user.id}`
    localStorage.setItem(moodsKey, JSON.stringify(updatedMoods))
    
    console.log('✅ Mood entry updated:', entryId)
  }

  // NEW: Function to delete mood entry
  const deleteMoodEntry = (entryId: string) => {
    if (!user) return
    
    const updatedMoods = moods.filter(mood => mood.id !== entryId)
    setMoods(updatedMoods)
    
    const moodsKey = `dailymood_moods_${user.id}`
    localStorage.setItem(moodsKey, JSON.stringify(updatedMoods))
    
    console.log('✅ Mood entry deleted:', entryId)
  }

  const handleLogout = () => {
    localStorage.removeItem('dailymood_session')
    console.log('✅ User logged out')
    router.push('/working-auth')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect
  }

  const stats = moods.length > 0 ? {
    average: Math.round(moods.reduce((sum, mood) => sum + mood.mood_score, 0) / moods.length),
    total: moods.length,
    thisWeek: moods.filter(m => {
      const moodDate = new Date(m.date)
      const weekAgo = new Date(Date.now() - 7 * 86400000)
      return moodDate >= weekAgo
    }).length
  } : { average: 5, total: 0, thisWeek: 0 }

  // Calculate current streak properly
  const currentStreak = (() => {
    if (!moods || moods.length === 0) return 0

    const sortedMoods = [...moods].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    const today = new Date()
    let checkDate = new Date(today)
    
    // Check if today has an entry
    const todayStr = today.toISOString().split('T')[0]
    const hasToday = sortedMoods.some(mood => mood.date === todayStr)
    
    if (hasToday) {
      streak = 1
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      // Check if yesterday has an entry
      checkDate.setDate(checkDate.getDate() - 1)
      const yesterdayStr = checkDate.toISOString().split('T')[0]
      const hasYesterday = sortedMoods.some(mood => mood.date === yesterdayStr)
      
      if (hasYesterday) {
        streak = 1
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        return 0
      }
    }

    // Continue checking backwards for consecutive days
    while (streak > 0) {
      const dateStr = checkDate.toISOString().split('T')[0]
      const hasEntry = sortedMoods.some(mood => mood.date === dateStr)
      
      if (hasEntry) {
        streak++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return Math.max(0, streak - 1) // Adjust for off-by-one
  })()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 🎯 SIMPLE DAYLIO-STYLE HEADER */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎭</span>
              <div>
                            <h1 className="text-xl font-bold text-readable">DailyMood AI</h1>
            <p className="text-sm text-readable-secondary">Welcome back, {user.email.split('@')[0]}!</p>
              </div>
            </div>
            
            <button
                        onClick={handleLogout}
          className="text-readable-muted hover:text-readable px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors text-sm"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        
        {/* 🎯 PRIMARY ACTION - MOOD ENTRY (DAYLIO-STYLE TOP CENTER) */}
        <div className="text-center mb-8">
                          <h1 className="text-2xl font-bold text-readable mb-2">How are you feeling today?</h1>
                <p className="text-readable-secondary">Track your mood in just one tap - it takes 5 seconds!</p>
        </div>

        {/* 📋 QUICK GETTING STARTED (FIRST-TIME USER GUIDANCE) */}
        {moods.length === 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-start gap-4">
              <span className="text-2xl">👋</span>
              <div>
                                        <h3 className="font-semibold text-readable mb-2" style={{color: '#3b82f6'}}>Welcome! Here's how it works:</h3>
                        <ol className="text-readable-secondary text-sm space-y-1 list-decimal list-inside">
                  <li>Tap a mood below to log how you're feeling</li>
                  <li>Add notes about your day (optional)</li>
                  <li>View your patterns in the Calendar section</li>
                  <li>Track your streak and achieve goals</li>
                </ol>
              </div>
            </div>
          </div>
        )}
        
        <div className="max-w-2xl mx-auto mb-12">
          <EnhancedMoodEntry onMoodSave={addMoodEntry} />
        </div>

        {/* 🎯 COMPREHENSIVE MOOD ANALYSIS */}
        {moods.length > 0 && (
          <div className="mb-12">
            <MoodOverview moods={moods} userName={user.email.split('@')[0]} />
          </div>
        )}

        {/* 📊 SIMPLE STATS OVERVIEW (DAYLIO-STYLE CLEAN) */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-md border text-center">
                            <div className="text-2xl font-bold text-readable" style={{color: '#6366f1'}}>{stats.average}/10</div>
                <div className="text-sm text-readable-secondary">Average</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md border text-center">
                            <div className="text-2xl font-bold text-readable" style={{color: '#3b82f6'}}>{stats.total}</div>
                <div className="text-sm text-readable-secondary">Entries</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md border text-center">
                            <div className="text-2xl font-bold text-readable" style={{color: '#f59e0b'}}>{currentStreak}</div>
                <div className="text-sm text-readable-secondary">Day Streak</div>
          </div>
        </div>

        {/* 🎭 AI COMPANION & INSIGHTS */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="card-soft rounded-2xl p-6 text-center">
            <MoodyCompanion 
              mood={stats.average}
              userName={user.email.split('@')[0]}
              recentActivity={moods[0]?.activities?.[0] || 'none'}
              streakDays={moods.length}
              size="large"
            />
          </div>
          
          <div>
            <AIInsights moods={moods} userTier="premium" />
          </div>
        </div>

        {/* 🤖 AI FOLLOW-UP SYSTEM */}
        <AIFollowUp 
          moods={moods}
          userTier="premium"
          onActionTaken={(action) => {
            console.log('AI Action taken:', action)
            // Could track analytics here
          }}
        />

        {/* 📋 INTELLIGENT MOOD PLAN */}
        <div className="mb-8">
          <MoodPlanGenerator moods={moods} userName={user.email.split('@')[0]} />
        </div>

        {/* 📊 COLLAPSIBLE FEATURES (DAYLIO-STYLE PROGRESSIVE DISCLOSURE) */}
        <div className="space-y-6">
          {/* Calendar - Compact */}
          <details className="bg-white rounded-2xl shadow-md border overflow-hidden" data-calendar>
                                <summary className="px-6 py-4 cursor-pointer font-semibold text-readable hover:bg-gray-50 flex items-center justify-between">
                      <span>📅 Calendar View</span>
                      <span className="text-sm text-readable-muted">View your mood patterns</span>
            </summary>
            <div className="p-6 border-t bg-gray-50">
              <div className="max-h-96 overflow-y-auto">
                <YearInPixels moods={moods} />
              </div>
            </div>
          </details>

          {/* Streak & Goals - Compact */}
          <details className="bg-white rounded-2xl shadow-md border overflow-hidden">
                                <summary className="px-6 py-4 cursor-pointer font-semibold text-readable hover:bg-gray-50 flex items-center justify-between">
                      <span>🔥 Goals & Streaks</span>
                      <span className="text-sm text-readable-muted">{currentStreak} day streak</span>
            </summary>
            <div className="p-6 border-t bg-gray-50">
              <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <GoalsAndAchievements moods={moods} currentStreak={currentStreak} />
                </div>
                <div>
                  <StreakCounter moods={moods} />
                </div>
              </div>
            </div>
          </details>

          {/* Analytics - Compact */}
          <details className="bg-white rounded-2xl shadow-md border overflow-hidden" data-analytics>
                                <summary className="px-6 py-4 cursor-pointer font-semibold text-readable hover:bg-gray-50 flex items-center justify-between">
                      <span>📊 Analytics</span>
                      <span className="text-sm text-readable-muted">View insights</span>
            </summary>
            <div className="p-6 border-t bg-gray-50">
              <MoodCharts moods={moods} />
            </div>
          </details>
        </div>

        {/* 📱 RECENT MOODS - SIMPLE LIST (DAYLIO-STYLE) */}
        <div className="bg-white rounded-2xl shadow-md border p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Recent Entries</h3>
            <span className="text-sm text-gray-500">{moods.length} total</span>
          </div>
          
          <div className="space-y-3">
            {moods.slice(0, 5).map((mood, index) => (
              <div key={mood.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                <span className="text-2xl">{mood.emoji}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-800">{mood.mood_score}/10</span>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {mood.time && (
                        <div className="text-xs text-gray-400">
                          {mood.time.slice(0, 5)}
                        </div>
                      )}
                    </div>
                  </div>
                  {mood.activities && mood.activities.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {mood.activities.slice(0, 3).map(activity => (
                        <span 
                          key={activity}
                          className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs capitalize"
                        >
                          {activity.replace('-', ' ')}
                        </span>
                      ))}
                      {mood.activities.length > 3 && (
                        <span className="text-xs text-gray-400">+{mood.activities.length - 3} more</span>
                      )}
                    </div>
                  )}
                  {mood.notes && (
                    <p className="text-sm text-gray-600 truncate mt-1">"{mood.notes}"</p>
                  )}
                </div>
              </div>
            ))}
            
            {moods.length === 0 && (
              <div className="text-center py-8">
                <span className="text-4xl">🌟</span>
                <p className="text-gray-600 mt-2">Start tracking your mood above!</p>
              </div>
            )}
          </div>
        </div>

        {/* 📱 BOTTOM NAVIGATION (DAYLIO-STYLE) */}
        <div className="bg-white rounded-2xl shadow-md border p-4 mb-8">
          <div className="grid grid-cols-4 gap-4 text-center">
            <div className="p-3 bg-blue-50 rounded-xl border-2 border-blue-200">
              <span className="block text-2xl mb-1">📝</span>
              <span className="text-xs font-medium text-blue-800">Today</span>
              <p className="text-xs text-blue-600 mt-1">Log mood</p>
            </div>
            
            <button 
              onClick={() => document.querySelector('details[data-calendar]')?.setAttribute('open', 'true')}
              className="p-3 hover:bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors"
            >
              <span className="block text-2xl mb-1">📅</span>
              <span className="text-xs font-medium text-gray-800">Calendar</span>
              <p className="text-xs text-gray-600 mt-1">View patterns</p>
            </button>
            
            <button 
              onClick={() => document.querySelector('details[data-analytics]')?.setAttribute('open', 'true')}
              className="p-3 hover:bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors"
            >
              <span className="block text-2xl mb-1">📊</span>
              <span className="text-xs font-medium text-gray-800">Stats</span>
              <p className="text-xs text-gray-600 mt-1">View insights</p>
            </button>
            
            <a 
              href="/working-dashboard/settings" 
              className="p-3 hover:bg-gray-50 rounded-xl border-2 border-gray-200 transition-colors"
            >
              <span className="block text-2xl mb-1">⚙️</span>
              <span className="text-xs font-medium text-gray-800">Settings</span>
              <p className="text-xs text-gray-600 mt-1">Preferences</p>
            </a>
          </div>
        </div>


        
      </div>

      {/* Avatar Widget - Floating */}
      <AvatarWidget userId={user.id} currentMood={stats.average} />

      {/* Onboarding Guide */}
      {showOnboarding && (
        <UserGuide onComplete={() => setShowOnboarding(false)} />
      )}
    </div>
  )
}
