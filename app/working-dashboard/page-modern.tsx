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
import { useAuth } from '@/app/hooks/useAuth'
import { supabase } from '@/app/lib/supabase-client'
import './../../styles/improved-colors.css'
import './../../styles/modern-dashboard.css'

interface User {
  id: string
  email: string
  created_at: string
}

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

export default function ModernWorkingDashboard() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/working-auth')
      return
    }
    
    fetchMoods()
    
    // Show onboarding for new users (no moods yet)
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding && moods.length === 0) {
      setShowOnboarding(true)
    }
  }, [user, router])

  const fetchMoods = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user?.id)
        .order('date', { ascending: false })
        .order('time', { ascending: false })
        .limit(100)

      if (error) {
        console.error('Error fetching moods:', error)
        return
      }

      setMoods(data || [])
    } catch (error) {
      console.error('Failed to fetch moods:', error)
    } finally {
      setLoading(false)
    }
  }

  const addMoodEntry = async (mood: number, notes: string, activities: string[] = [], photos: string[] = []) => {
    try {
      const today = new Date()
      const moodEmoji = mood >= 9 ? '🤩' : mood >= 7 ? '😊' : mood >= 5 ? '😐' : mood >= 3 ? '😞' : '😢'

      const { data, error } = await supabase
        .from('mood_entries')
        .insert([
          {
            user_id: user?.id,
            mood_score: mood,
            emoji: moodEmoji,
            date: today.toISOString().split('T')[0],
            time: today.toTimeString().split(' ')[0],
            activities: activities,
            notes: notes || '',
          }
        ])
        .select()

      if (error) {
        console.error('Error adding mood entry:', error)
        return
      }

      // Refresh moods to show the new entry
      await fetchMoods()
      
    } catch (error) {
      console.error('Failed to add mood entry:', error)
    }
  }

  const stats = {
    average: moods.length > 0 ? moods.reduce((sum, mood) => sum + mood.mood_score, 0) / moods.length : 5,
    total: moods.length,
    streak: moods.length > 0 ? Math.floor((Date.now() - new Date(moods[0].date).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0
  }

  if (loading) {
    return (
      <div className="modern-dashboard">
        <div className="min-h-screen flex items-center justify-center">
          <div className="premium-card p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your mood dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="modern-dashboard">
      {/* Modern Premium Header */}
      <header className="premium-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Premium Logo */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">🧠</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  DailyMood AI
                </h1>
                <p className="text-sm text-gray-600">Premium Mood Intelligence</p>
              </div>
            </div>

            {/* Premium User info */}
            <div className="flex items-center gap-6">
              <div className="glass-card py-2 px-4">
                <span className="text-sm font-medium text-gray-700">
                  👋 Hey {user.email.split('@')[0]}!
                </span>
              </div>
              <button 
                onClick={signOut}
                className="btn-premium"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Modern Main Content */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showOnboarding && (
          <div className="mb-8">
            <UserGuide 
              onComplete={() => setShowOnboarding(false)}
              userName={user.email.split('@')[0]} 
            />
          </div>
        )}
        
        {/* Premium Welcome Section */}
        {!showOnboarding && (
          <div className="text-center mb-16">
            <div className="premium-card inline-flex items-center gap-3 px-6 py-3 mb-6">
              <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-sm font-medium text-gray-700">✨ Premium AI Intelligence Active</span>
            </div>
            
            <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Welcome back, {user.email.split('@')[0]}! 🚀
            </h2>
            
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 drop-shadow">
              Your personal AI mood companion is ready to provide intelligent insights and support your mental wellness journey.
            </p>
            
            {/* Premium Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
              <div className="stat-card-modern">
                <div className="text-4xl font-bold text-purple-600 mb-2">{moods.length}</div>
                <div className="text-gray-600 font-medium">Mood Entries</div>
                <div className="text-xs text-gray-500 mt-1">Building your story</div>
              </div>
              
              <div className="stat-card-modern">
                <div className="text-4xl font-bold text-blue-600 mb-2">{stats.average.toFixed(1)}</div>
                <div className="text-gray-600 font-medium">Average Mood</div>
                <div className="text-xs text-gray-500 mt-1">Out of 10</div>
              </div>
              
              <div className="stat-card-modern">
                <div className="text-4xl font-bold text-green-600 mb-2">{stats.streak}</div>
                <div className="text-gray-600 font-medium">Day Streak</div>
                <div className="text-xs text-gray-500 mt-1">Keep it going!</div>
              </div>
            </div>
          </div>
        )}
        
        {/* Premium Mood Entry */}
        <div className="max-w-3xl mx-auto mb-16">
          <div className="mood-entry-modern">
            <EnhancedMoodEntry onMoodSave={addMoodEntry} />
          </div>
        </div>

        {/* 🎯 COMPREHENSIVE MOOD ANALYSIS */}
        {moods.length > 0 && (
          <div className="mb-16">
            <div className="premium-card p-8">
              <MoodOverview moods={moods} userName={user.email.split('@')[0]} />
            </div>
          </div>
        )}

        {/* 🎭 PREMIUM AI COMPANION & INSIGHTS */}
        <div className="grid lg:grid-cols-2 gap-8 mb-16">
          <div className="avatar-container-modern floating-animation">
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Meet Moody 🦉</h3>
            <MoodyCompanion 
              mood={stats.average}
              userName={user.email.split('@')[0]}
              recentActivity={moods[0]?.activities?.[0] || 'none'}
              streakDays={moods.length}
              size="large"
            />
            <p className="text-gray-600 mt-4">Your AI mood companion</p>
          </div>
          
          <div className="ai-insights-modern glow-animation">
            <AIInsights moods={moods} userTier="premium" />
          </div>
        </div>

        {/* 🤖 AI FOLLOW-UP SYSTEM */}
        <div className="mb-16">
          <div className="premium-card p-8">
            <AIFollowUp 
              moods={moods}
              userTier="premium"
              onActionTaken={(action) => {
                console.log('AI Action taken:', action)
              }}
            />
          </div>
        </div>

        {/* 📋 INTELLIGENT MOOD PLAN */}
        <div className="mb-16">
          <div className="premium-card p-8">
            <MoodPlanGenerator moods={moods} userName={user.email.split('@')[0]} />
          </div>
        </div>
        
        {/* Premium Navigation Dashboard */}
        <div className="nav-modern">
          {/* Today */}
          <div className="nav-item-modern" data-today>
            <div className="text-5xl mb-4">📝</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Today</h3>
            <p className="text-sm text-gray-600">Log your mood</p>
          </div>

          {/* Calendar */}
          <div className="nav-item-modern" data-calendar>
            <div className="text-5xl mb-4">📅</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Calendar</h3>
            <p className="text-sm text-gray-600">View patterns</p>
          </div>

          {/* Stats */}
          <div className="nav-item-modern" data-stats>
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Analytics</h3>
            <p className="text-sm text-gray-600">Deep insights</p>
          </div>

          {/* Settings */}
          <div className="nav-item-modern" data-settings>
            <div className="text-5xl mb-4">⚙️</div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Settings</h3>
            <p className="text-sm text-gray-600">Customize</p>
          </div>
        </div>
        
      </main>

      {/* Avatar Widget - Floating */}
      <AvatarWidget userId={user.id} currentMood={stats.average} />

    </div>
  )
}

