'use client'
import { useEffect, useState, Suspense, lazy } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { useSubscription } from '@/hooks/use-subscription'

// Dynamic imports for code splitting (Phase 2 performance optimization)
const MoodEntry = lazy(() => import('@/app/components/MoodEntry'))
const MoodChart = lazy(() => import('@/app/components/MoodChart'))
const AIInsights = lazy(() => import('@/app/components/AIInsights'))
const PremiumGate = lazy(() => import('@/app/components/PremiumGate'))

// Loading components for better UX
const ComponentLoader = ({ name }: { name: string }) => (
  <div className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg animate-pulse">
    <div className="h-4 bg-purple-200 rounded mb-4"></div>
    <div className="h-8 bg-purple-100 rounded mb-2"></div>
    <div className="h-6 bg-purple-100 rounded"></div>
    <div className="text-xs text-purple-600 mt-2">Loading {name}...</div>
  </div>
)

export default function Dashboard() {
  const [moods, setMoods] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { isPremium } = useSubscription()

  useEffect(() => {
    checkUser()
    fetchMoods()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchMoods = async () => {
    setIsLoading(true)
    try {
      // Limit mood entries to last 30 days for performance
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .order('created_at', { ascending: false })
      
      if (error) {
        console.error('Error fetching moods:', error)
      } else if (data) {
        setMoods(data)
      }
    } catch (error) {
      console.error('Error in fetchMoods:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state per Master Recovery Plan
  if (isLoading) return <div>Loading...</div>

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Beautiful Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Your Mood Dashboard
          </h1>
          <p className="text-xl text-gray-600">Track your emotional journey with AI insights</p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <Suspense fallback={<ComponentLoader name="Mood Entry" />}>
            <MoodEntry onSuccess={fetchMoods} />
          </Suspense>
          <Suspense fallback={<ComponentLoader name="Mood Chart" />}>
            <MoodChart moods={moods} />
          </Suspense>
        </div>

        {/* AI Insights - Premium Feature */}
        <div className="mb-12">
          <Suspense fallback={<ComponentLoader name="Premium AI Insights" />}>
            <PremiumGate feature="AI-Powered Insights & Predictions">
              <AIInsights moods={moods} />
            </PremiumGate>
          </Suspense>
        </div>
        
        {/* Recent Moods */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Recent Mood Entries
            {!isPremium && (
              <span className="text-sm bg-purple-100 text-purple-600 px-2 py-1 rounded-full ml-2">
                Free Plan: Limited to 3 entries
              </span>
            )}
          </h3>
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
        </div>
      </div>
    </div>
  )
}
