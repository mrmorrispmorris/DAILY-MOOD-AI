'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useMoodData } from '@/hooks/use-mood-data'
import { EnhancedInsightsDisplay } from '@/components/insights/enhanced-insights-display'
import { PWAInstallInstructions } from '@/components/pwa/install-prompt'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Brain, Download, Star, TrendingUp } from 'lucide-react'

export default function InsightsPage() {
  const { user, loading } = useAuth()
  const { moodEntries, isLoading } = useMoodData()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])



  if (loading || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center space-x-2">
            <Brain className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">AI Insights</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Enhanced AI Insights */}
        <EnhancedInsightsDisplay moodData={moodEntries} userProfile={user} />

        {/* PWA Install Instructions */}
        <div className="mt-8">
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Download className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-2xl">Get the Full App Experience</CardTitle>
              <CardContent className="text-lg text-gray-600">
                Install DailyMood AI on your device for offline access, push notifications, and faster performance
              </CardContent>
            </CardHeader>
            <CardContent>
              <PWAInstallInstructions />
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Star className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Offline Access</h4>
                  <p className="text-sm text-gray-600">Track your mood even without internet connection</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Smart Reminders</h4>
                  <p className="text-sm text-gray-600">Get personalized notifications based on your patterns</p>
                </div>
                
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Brain className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">Enhanced AI</h4>
                  <p className="text-sm text-gray-600">Access advanced insights and evidence-based tips</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}