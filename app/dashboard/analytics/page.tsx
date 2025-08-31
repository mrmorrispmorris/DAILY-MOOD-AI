'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { ArrowLeft, TrendingUp, Brain, Calendar, Activity } from 'lucide-react'

// Import MoodPredictions component
const MoodPredictions = dynamic(() => import('@/components/MoodPredictions'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
})

// Dynamic imports for premium components
const QuickStats = dynamic(() => import('@/components/QuickStats'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
})

const PatternAnalysis = dynamic(() => import('@/components/PatternAnalysis'), {
  loading: () => <div className="animate-pulse bg-gray-200 rounded-xl h-64"></div>
})

export default function AnalyticsPage() {
  const [subscription, setSubscription] = useState('free')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkSubscription()
  }, [])

  const checkSubscription = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUserId(user.id)
      const { data } = await supabase
        .from('users')
        .select('subscription_level')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setSubscription(data.subscription_level || 'free')
      }
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <h1 className="text-3xl font-bold">Mood Analytics</h1>
          </div>
          {subscription === 'free' && (
            <Link
              href="/pricing"
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700"
            >
              Unlock All Analytics →
            </Link>
          )}
        </div>

        {subscription === 'premium' ? (
          <div className="space-y-8">
            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-6 h-6 text-purple-600" />
                <h2 className="text-xl font-bold">Quick Stats</h2>
              </div>
              {userId && <QuickStats userId={userId} />}
            </div>

            {/* Pattern Analysis */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-6 h-6 text-blue-600" />
                <h2 className="text-xl font-bold">AI Pattern Analysis</h2>
              </div>
              {userId && <PatternAnalysis userId={userId} />}
            </div>

            {/* Mood Predictions */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-6 h-6 text-green-600" />
                <h2 className="text-xl font-bold">Mood Predictions</h2>
              </div>
              {userId && <MoodPredictions userId={userId} />}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Brain className="w-10 h-10 text-purple-600" />
              </div>
              <h2 className="text-2xl font-bold mb-4">Unlock Advanced Analytics</h2>
              <p className="text-gray-600 mb-8">
                Get AI-powered insights, mood predictions, pattern analysis, and more with Premium
              </p>
              
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="text-left p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">📊 Mood Trends</p>
                  <p className="text-sm text-gray-600">Track patterns over time</p>
                </div>
                <div className="text-left p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">🎯 Correlations</p>
                  <p className="text-sm text-gray-600">Activity impact analysis</p>
                </div>
                <div className="text-left p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">🔮 Predictions</p>
                  <p className="text-sm text-gray-600">AI mood forecasting</p>
                </div>
                <div className="text-left p-4 bg-gray-50 rounded-lg">
                  <p className="font-semibold mb-1">💡 Insights</p>
                  <p className="text-sm text-gray-600">Personalized tips</p>
                </div>
              </div>

              <Link
                href="/pricing"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transform hover:scale-[1.02] transition-all"
              >
                Start 14-Day Free Trial →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
