'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import AvatarWithChat from '@/app/components/avatar/AvatarWithChat'
import MoodEntry from '@/app/components/MoodEntry'
import MoodChart from '@/app/components/charts/MoodChart'
import RecentEntries from '@/app/components/RecentEntries'
import SimpleMoodChart from '@/app/components/analytics/SimpleMoodChart'
import GoalTracker from '@/app/components/goals/GoalTracker'
import DataExporter from '@/app/components/export/DataExporter'
import AchievementSystem from '@/app/components/gamification/AchievementSystem'
import StreakTracker from '@/app/components/gamification/StreakTracker'
import MoodSharing from '@/app/components/social/MoodSharing'
import PredictiveInsights from '@/app/components/analytics/PredictiveInsights'
import { Calendar, TrendingUp, Activity, Target, Trophy, Flame, Share2, Brain } from 'lucide-react'
import { useAuth } from '@/app/hooks/useAuth'
import { supabase } from '@/app/lib/supabase-client'

interface User {
  id: string
  email: string
  created_at: string
}

interface MoodEntry {
  id: number
  user_id: string
  mood_score: number
  date: string
  activities: string[]
  notes: string
  created_at: string
}

export default function ModernWorkingDashboard() {
  const router = useRouter()
  const { user, signOut, loading: authLoading } = useAuth()
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [currentView, setCurrentView] = useState('today')
  const [averageMood] = useState(7.0)

  useEffect(() => {
    // Skip if still checking auth
    if (authLoading) return
    
    // Check if user exists
    if (!user) {
      router.push('/login')
      return
    }

    // Fetch moods for demo
    fetchMoods()
  }, [user, authLoading, router])

  const fetchMoods = async () => {
    try {
      setLoading(true)
      
      // For demo purposes, add some mock data
      const demoMoods: MoodEntry[] = [
        {
          id: 1,
          user_id: user?.id || 'demo',
          mood_score: 8,
          date: new Date().toISOString(),
          activities: ['work', 'social'],
          notes: 'Great day with the team!',
          created_at: new Date().toISOString()
        },
        {
          id: 2,
          user_id: user?.id || 'demo',
          mood_score: 6,
          date: new Date(Date.now() - 86400000).toISOString(),
          activities: ['exercise'],
          notes: 'Morning run was refreshing',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ]
      
      setMoods(demoMoods)
    } catch (error) {
      console.error('Error fetching moods:', error)
      setMoods([])
    } finally {
      setLoading(false)
    }
  }

  // Helper functions for premium header
  const getTimeBasedGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const getUserDisplayName = (email: string) => {
    // Extract first name from email (fallback until we add proper name collection)
    const username = email.split('@')[0]
    // Capitalize and clean up common separators
    return username
      .split(/[._-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
      .join(' ')
  }

  const addMoodEntry = async (mood: number, notes: string, activities: string[], photos: string[]) => {
    try {
      const newEntry: MoodEntry = {
        id: Date.now(),
        user_id: user?.id || 'demo',
        mood_score: mood,
        date: new Date().toISOString(),
        activities,
        notes,
        created_at: new Date().toISOString()
      }
      
      setMoods(prev => [newEntry, ...prev])
    } catch (error) {
      console.error('Error adding mood entry:', error)
    }
  }

  // Calculate stats
  const stats = {
    average: moods.length > 0 ? moods.reduce((sum, mood) => sum + mood.mood_score, 0) / moods.length : 5,
    total: moods.length,
    streak: moods.length > 0 ? Math.floor((Date.now() - new Date(moods[0].date).getTime()) / (1000 * 60 * 60 * 24)) + 1 : 0
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="card p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-900">Loading your mood dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen dashboard-container" 
         style={{ backgroundColor: 'var(--bg-light)' }}>
      {/* Premium Header */}
      <div className="px-6 py-8 border-b relative overflow-hidden"
           style={{ 
             backgroundColor: 'var(--surface-light)', 
             borderColor: 'var(--outline-light)'
           }}>
        {/* Subtle background gradient */}
        <div className="absolute inset-0 opacity-5" 
             style={{ 
               background: `linear-gradient(135deg, var(--brand-primary) 0%, var(--brand-secondary) 100%)`
             }}>
        </div>
        
        <div className="relative z-10">
          {/* Main Content - Centered Layout */}
          <div className="flex flex-col items-center text-center space-y-4">
            {/* MOODY Avatar - Center Stage */}
            <div className="transform transition-all duration-300 hover:scale-105">
              <AvatarWithChat 
                mood={Math.round(averageMood)} 
                size="medium" 
                userId={user?.id} 
                userName={user?.email?.split('@')[0]} 
                showMoodScore={false} 
              />
            </div>
            
            {/* Premium Greeting */}
            <div className="space-y-2">
              <h1 className="text-3xl font-bold"
                  style={{ 
                    color: 'var(--text-primary)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
                    letterSpacing: '-0.02em'
                  }}>
                {getTimeBasedGreeting()}, {getUserDisplayName(user.email)}!
              </h1>
              <p className="text-lg font-medium opacity-75"
                 style={{ color: 'var(--brand-secondary)' }}>
                How are you feeling?
              </p>
            </div>
          </div>

          {/* Sign Out - Subtle Corner Position */}
          <button 
            onClick={signOut}
            className="absolute top-6 right-6 px-4 py-2 rounded-full font-medium transition-all duration-200 hover:scale-105"
            style={{ 
              color: 'var(--brand-secondary)',
              backgroundColor: 'rgba(91, 83, 214, 0.1)',
              fontSize: '14px'
            }}
          >
            Sign Out
          </button>
        </div>
      </div>
      
      {/* Quick Stats Bar */}
      <div className="bg-white px-4 py-3 grid grid-cols-3 gap-4 border-b">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">{moods.length}</p>
          <p className="text-xs text-gray-500">Entries</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>{stats.average.toFixed(1)}</p>
          <p className="text-xs text-gray-500">Average</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold" style={{ color: 'var(--brand-tertiary)' }}>{stats.streak}</p>
          <p className="text-xs text-gray-500">Streak</p>
        </div>
      </div>
      
      {/* Main Content Area */}
      <div className="p-4 space-y-4 pb-20">
        {/* View Selector */}
        <div className="flex gap-2 overflow-x-auto">
          {['Today', 'Week', 'Month', 'Year'].map((view) => (
            <button
              key={view}
              onClick={() => setCurrentView(view.toLowerCase())}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${
                currentView === view.toLowerCase()
                  ? 'text-white shadow-lg'
                  : 'text-gray-700 border hover:bg-gray-50'
              }`}
              style={{
                backgroundColor: currentView === view.toLowerCase() 
                  ? 'var(--brand-secondary)' 
                  : 'var(--surface-light)',
                borderColor: currentView !== view.toLowerCase() ? 'var(--outline-light)' : 'transparent'
              }}
            >
              {view}
            </button>
          ))}
        </div>
        
        {/* Dynamic Content Based on View */}
        {currentView === 'today' && (
          <>
            {/* Mood Entry Card */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">How are you feeling?</h2>
              <MoodEntry />
            </div>
            
            {/* Today's Entries */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Today's Entries</h2>
              <RecentEntries limit={3} />
            </div>
          </>
        )}
        
        {currentView === 'week' && (
          <>
            {/* Weekly Chart */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">This Week's Mood</h2>
              <MoodChart type="week" />
            </div>
            
            {/* Weekly Insights */}
            <div className="card">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Weekly Insights</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-sm text-gray-700">Best Day</span>
                  </div>
                  <span className="font-medium text-gray-900">Monday</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg"
                     style={{ backgroundColor: 'var(--surface-variant-light)' }}>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5" style={{ color: 'var(--brand-secondary)' }} />
                    <span className="text-sm text-gray-700">Most Common Activity</span>
                  </div>
                  <span className="font-medium text-gray-900">Work</span>
                </div>
              </div>
            </div>
          </>
        )}

        {currentView === 'month' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Monthly Overview</h2>
            <MoodChart type="month" />
          </div>
        )}

        {currentView === 'year' && (
          <div className="card">
            <h2 className="text-lg font-semibold mb-4 text-gray-900">Yearly Trends</h2>
            <MoodChart type="year" />
          </div>
        )}

        {currentView === 'calendar' && (
          <div className="space-y-6">
            <SimpleMoodChart moods={moods} userId={user?.id} />
          </div>
        )}

        {/* Achievements View */}
        {currentView === 'achievements' && (
          <div className="space-y-6">
            <AchievementSystem userId={user?.id} moods={moods} />
          </div>
        )}

        {/* Streaks View */}
        {currentView === 'streaks' && (
          <div className="space-y-6">
            <StreakTracker userId={user?.id} moods={moods} />
          </div>
        )}

        {/* Analytics View */}
        {currentView === 'analytics' && (
          <div className="space-y-6">
            <GoalTracker userId={user?.id} />
          </div>
        )}

        {/* AI Insights View */}
        {currentView === 'ai-insights' && (
          <div className="space-y-6">
            <PredictiveInsights userId={user?.id} moods={moods} />
          </div>
        )}

        {/* Share View */}
        {currentView === 'share' && (
          <div className="space-y-6">
            <MoodSharing 
              userId={user?.id} 
              moods={moods}
              streakData={{
                current: 0, // These will be calculated by the component
                longest: 0
              }}
              achievements={{
                total: 0, // These will be calculated by the component
                level: 1
              }}
            />
          </div>
        )}

        {currentView === 'backup' && (
          <div className="space-y-6">
            <DataExporter userId={user?.id} moods={moods} />
          </div>
        )}
      </div>
      
      {/* Bottom Navigation - ENHANCED: All gamification tabs functional */}
      <div className="fixed bottom-0 left-0 right-0 shadow-lg overflow-x-auto border-t"
           style={{ 
             backgroundColor: 'var(--surface-light)', 
             borderColor: 'var(--outline-light)' 
           }}>
        <div className="flex min-w-max px-2 h-16">
          {[
            { icon: '📝', label: 'Today', view: 'today', active: currentView === 'today' },
            { icon: '📅', label: 'Calendar', view: 'calendar', active: currentView === 'calendar' },
            { icon: '🏆', label: 'Achievements', view: 'achievements', active: currentView === 'achievements' },
            { icon: '🔥', label: 'Streaks', view: 'streaks', active: currentView === 'streaks' },
            { icon: '📊', label: 'Analytics', view: 'analytics', active: currentView === 'analytics' },
            { icon: '🧠', label: 'AI Insights', view: 'ai-insights', active: currentView === 'ai-insights' },
            { icon: '📱', label: 'Share', view: 'share', active: currentView === 'share' },
            { icon: '💾', label: 'Backup', view: 'backup', active: currentView === 'backup' }
          ].map((item) => (
            <button
              key={item.label}
              onClick={() => setCurrentView(item.view)}
              className={`flex flex-col items-center justify-center gap-1 px-3 py-2 transition-all duration-200 min-w-[80px] relative ${
                item.active 
                  ? '' 
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
              style={{
                color: item.active ? 'var(--brand-secondary)' : undefined,
                backgroundColor: item.active ? 'var(--surface-variant-light)' : undefined
              }}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
              {item.active && (
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-8 h-1 rounded-t-full"
                     style={{ backgroundColor: 'var(--brand-secondary)' }}></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}