'use client'

export const dynamic = 'force-dynamic'

import { useEffect, useState, Suspense, lazy, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { supabase } from '@/app/lib/supabase-client'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { useFreemiumLimits } from '@/hooks/use-freemium-limits'
import { usePerformanceMonitor } from '@/lib/performance/performance-monitor'
import { PremiumPrompt } from '@/app/components/PremiumPrompt'
import { OnboardingFlow } from '@/app/components/OnboardingFlow'
import { ReferralSystem } from '@/app/components/ReferralSystem'
import { ErrorBoundary } from '@/app/components/ErrorBoundary'
import { 
  MoodEntryLoading, 
  MoodChartLoading, 
  AIInsightsLoading, 
  StatsCardLoading 
} from '@/app/components/LoadingStates'

// Dynamic imports for code splitting (Phase 2 performance optimization)
const MoodEntry = lazy(() => import('@/app/components/MoodEntry'))
const MoodChart = lazy(() => import('@/app/components/MoodChart'))
const AIInsights = lazy(() => import('@/app/components/AIInsights'))
const PremiumGate = lazy(() => import('@/app/components/PremiumGate'))

// Enhanced loading component
const ComponentLoader = ({ name, type = "default" }: { name: string; type?: string }) => {
  if (type === "mood-entry") return <MoodEntryLoading />
  if (type === "mood-chart") return <MoodChartLoading />
  if (type === "ai-insights") return <AIInsightsLoading />
  
  return (
    <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg animate-pulse">
      <div className="h-4 bg-purple-200 rounded mb-4"></div>
      <div className="h-8 bg-purple-100 rounded mb-2"></div>
      <div className="h-6 bg-purple-100 rounded"></div>
      <div className="text-xs text-purple-600 mt-2">Loading {name}...</div>
    </div>
  )
}

export default function Dashboard() {
  const router = useRouter()
  const { user } = useAuth()
  // const supabase = createClientComponentClient()
  const [moods, setMoods] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [promptTrigger, setPromptTrigger] = useState<string | null>(null)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const { isPremium } = useSubscription()
  const { canUseAI, canAccessAdvancedCharts, canExportData } = useFreemiumLimits()
  const { trackApiCall } = usePerformanceMonitor()

  // OPTIMIZATION: Memoize expensive calculations
  const stats = useMemo(() => {
    if (!moods.length) return null
    return {
      average: moods.reduce((a, m) => a + m.mood_score, 0) / moods.length,
      streak: 0, // calculateStreak(moods) - TODO: implement
      total: moods.length
    }
  }, [moods])

  // OPTIMIZATION: Enhanced data fetching with improved caching (Phase 4)
  const fetchMoods = useCallback(async () => {
    if (!user?.id) return
    
    const start = (page - 1) * 10
    const end = start + 9
    
    const { data, error } = await trackApiCall(
      `/api/mood-entries?page=${page}`,
      async () => {
        return await supabase
          .from('mood_entries')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .range(start, end)
      }
    )
    
    if (!error) {
      const moodData = data || []
      setMoods(prev => page === 1 ? moodData : [...prev, ...moodData])
      
      // ONBOARDING: Show onboarding for new users
      if (page === 1 && moodData.length === 0) {
        setShowOnboarding(true);
      }
    }
    setIsLoading(false)
  }, [page, user?.id, trackApiCall])

  useEffect(() => {
    if (user?.id) {
      checkOnboarding()
      fetchMoods()
    }
  }, [fetchMoods, user?.id])

  const checkOnboarding = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      // Check if user has completed onboarding
      const { data } = await supabase
        .from('user_preferences')
        .select('onboarding_completed')
        .eq('user_id', user.id)
        .single()
      
      if (!data || !data.onboarding_completed) {
        router.push('/dashboard/onboarding')
      }
    }
  }

  // OPTIMIZATION: Intersection observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading) {
          setPage(p => p + 1)
        }
      },
      { threshold: 0.1 }
    )
    
    const sentinel = document.querySelector('#scroll-sentinel')
    if (sentinel) observer.observe(sentinel)
    
    return () => observer.disconnect()
  }, [isLoading])

  // CONVERSION OPTIMIZATION: Enhanced premium prompt triggers with freemium integration  
  useEffect(() => {
    if (!isPremium && user) {
      // Enhanced conversion triggers based on usage patterns and limits
      if (moods.length > 0 && stats && !promptTrigger) {
        // Existing behavioral triggers
        if (stats.streak >= 3) {
          setPromptTrigger('mood_streak_3');
        } else if (moods.length > 10) {
          setPromptTrigger('history_limit');
        } else if (moods.length >= 15) {
          setPromptTrigger('power_user');
        }
      }
      
      // Track dashboard visit for analytics
      if (user.id) {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'dashboard_visited',
            userId: user.id,
            timestamp: new Date().toISOString()
          })
        });
      }
    }
  }, [stats, moods.length, isPremium, promptTrigger, user]);

  // Helper function for streak calculation
  function calculateStreak(moods: any[]) {
    if (!moods.length) return 0
    let streak = 0
    const today = new Date()
    
    for (let i = 0; i < moods.length; i++) {
      const moodDate = new Date(moods[i].date || moods[i].created_at)
      const daysDiff = Math.floor((today.getTime() - moodDate.getTime()) / (1000 * 3600 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else {
        break
      }
    }
    return streak
  }

  // Loading state per Master Recovery Plan
  if (isLoading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Beautiful Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-purple-600 mb-3">
            Welcome back, {user?.email?.split('@')[0]}!
          </h1>
          <p className="text-gray-600 mt-2">Here&apos;s how you&apos;ve been feeling</p>
        </div>

        {/* Dashboard Navigation - Mobile Optimized */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold">Your Mood Dashboard</h1>
          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-2 sm:pb-0">
            <Link
              href="/dashboard/analytics"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-purple-100 text-purple-600 rounded-lg hover:bg-purple-200 transition-colors whitespace-nowrap text-sm md:text-base"
            >
              <span className="text-base">📊</span>
              <span className="hidden sm:inline">Analytics</span>
            </Link>
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors whitespace-nowrap text-sm md:text-base"
            >
              <span className="text-base">⚙️</span>
              <span className="hidden sm:inline">Settings</span>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards - Load immediately with memoized data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {isLoading ? (
            <>
              <StatsCardLoading />
              <StatsCardLoading />
              <StatsCardLoading />
            </>
          ) : stats ? (
            <>
              <StatCard title="Mood Average" value={stats.average.toFixed(1)} icon="📊" />
              <StatCard title="Current Streak" value={`${stats.streak} days`} icon="🔥" />
              <StatCard title="Total Entries" value={stats.total} icon="📝" />
            </>
          ) : null}
        </div>
        
        {/* Main Content Grid - Mobile Optimized */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 md:gap-8 mb-8">
          <ErrorBoundary fallback={<ComponentLoader name="Mood Entry (Error)" type="mood-entry" />}>
            <Suspense fallback={<ComponentLoader name="Mood Entry" type="mood-entry" />}>
              <MoodEntry onSuccess={fetchMoods} />
            </Suspense>
          </ErrorBoundary>
          <ErrorBoundary fallback={<ComponentLoader name="Mood Chart (Error)" type="mood-chart" />}>
            <Suspense fallback={<ComponentLoader name="Mood Chart" type="mood-chart" />}>
              <MoodChart moods={moods} />
            </Suspense>
          </ErrorBoundary>
        </div>

        {/* AI Insights - Premium Feature */}
        <div className="mb-8">
          <ErrorBoundary fallback={<ComponentLoader name="AI Insights (Error)" type="ai-insights" />}>
            <Suspense fallback={<ComponentLoader name="Premium AI Insights" type="ai-insights" />}>
              <PremiumGate feature="AI-Powered Insights & Predictions">
                <AIInsights moods={moods} />
              </PremiumGate>
            </Suspense>
          </ErrorBoundary>
        </div>
        
        {/* Referral System - User Acquisition */}
        <div className="mb-12">
          <ReferralSystem userId={user?.id} userEmail={user?.email} />
        </div>
        
        {/* Recent Moods */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-2xl font-bold text-gray-800 flex items-center">
              <span className="mr-3">📊</span>
              Recent Mood Entries
              {!canUseAI && (
                <span className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full ml-2">
                  Free Plan: Basic view only
                </span>
              )}
            </h3>
            
            {/* Export Button with Freemium Gate */}
            {canExportData ? (
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition">
                📥 Export Data
              </button>
            ) : (
              <button 
                onClick={() => setPromptTrigger('data-export')}
                className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg text-sm cursor-not-allowed relative"
                title="Premium feature"
              >
                🔒 Export Data
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moods.slice(0, isPremium ? 12 : 3).map((mood) => (
              <div key={mood.id} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{mood.emoji || '😐'}</div>
                  <div className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {mood.mood_score}/10
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(mood.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {mood.notes && (
                  <p className="text-sm text-gray-700 italic border-l-3 border-purple-200 pl-3 mt-3">
                    &ldquo;{mood.notes}&rdquo;
                  </p>
                )}
              </div>
            ))}
            
            {/* Upgrade prompt for free users */}
            {!isPremium && moods.length > 3 && (
              <div className="md:col-span-2 lg:col-span-3">
                <Suspense fallback={<ComponentLoader name="Premium Upgrade" />}>
                  <PremiumGate feature="View All Mood History">
                    <div></div> {/* Empty content - gate shows upgrade prompt */}
                  </PremiumGate>
                </Suspense>
              </div>
            )}
          </div>
          <div id="scroll-sentinel" className="h-4" />
        </div>
        
        {/* USER ONBOARDING: Show for new users with no mood entries */}
        {showOnboarding && (
          <OnboardingFlow
            userId={user?.id}
            onComplete={() => {
              setShowOnboarding(false);
              // Focus on mood entry after onboarding
              document.querySelector('[data-mood-entry]')?.scrollIntoView({ behavior: 'smooth' });
            }}
            onSkip={() => setShowOnboarding(false)}
          />
        )}
        
        {/* CONVERSION OPTIMIZATION: Smart Premium Prompts */}
        {promptTrigger && !isPremium && (
          <PremiumPrompt trigger={promptTrigger} userId={user?.id} />
        )}
      </div>
    </div>
  )
}

// Helper components
function StatCard({ title, value, icon }: { title: string; value: string | number; icon: string }) {
  return (
    <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg hover:shadow-xl transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  )
}
