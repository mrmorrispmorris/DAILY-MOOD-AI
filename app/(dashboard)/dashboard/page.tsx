'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useMoodDataOptimized } from '@/hooks/use-mood-data-optimized'
import { useAIInsights } from '@/hooks/use-ai-insights'
import { MoodChart } from '@/components/charts/mood-chart'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Calendar, 
  Target, 
  Trophy, 
  Star, 
  Brain, 
  Bell, 
  BarChart3, 
  Users, 
  Zap,
  Crown,
  Flame,
  Activity
} from 'lucide-react'
import Link from 'next/link'
import { useSubscription } from '@/hooks/use-subscription'
import { GoalSetting } from '@/components/goals/goal-setting'
import { CustomTagInput } from '@/components/tags/custom-tag-input'
import { DailyHabitSuggestions } from '@/components/habits/daily-habit-suggestions'
import { StreakTracking } from '@/components/streaks/streak-tracking'
import { SocialSharing } from '@/components/social/social-sharing'
import { PremiumTeaser } from '@/components/premium/premium-teaser'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { BottomNav } from '@/components/ui/bottom-nav'
import { FullPageSpinner, InlineSpinner, DataSpinner } from '@/components/ui/loading-spinner'
import { PerformanceMonitor } from '@/components/performance/performance-monitor'

export default function DashboardPage() {
  const { user } = useAuth()
  const { subscriptionLevel } = useSubscription()
  const { 
    entries: moodEntries, 
    stats: moodStats,
    isLoading: moodLoading,
    isFetching: moodFetching,
    pagination,
    refresh
  } = useMoodDataOptimized(20)
  
  // AI insights with caching
  const { 
    data: aiInsights,
    isLoading: aiLoading,
    isReady: aiReady,
    prefetchRelated,
    invalidateCache
  } = useAIInsights(moodEntries, user?.id)
  
  // State for new features
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [customTags, setCustomTags] = useState<any[]>([])
  const [showPremiumTeaser, setShowPremiumTeaser] = useState(false)
  const [moodCount, setMoodCount] = useState(0)

  // Handle tag selection
  const handleTagToggle = (tagId: string) => {
    setSelectedTags(prev => 
      prev.includes(tagId) 
        ? prev.filter(id => id !== tagId)
        : [...prev, tagId]
    )
  }

  // Handle custom tag creation
  const handleAddCustomTag = (tag: any) => {
    setCustomTags(prev => [...prev, tag])
  }

  // Handle habit completion
  const handleHabitComplete = (habitId: string) => {
    // This would typically update the habit state
    console.log('Habit completed:', habitId)
  }

  // Calculate stats from optimized data
  const totalEntries = moodStats?.totalEntries || moodEntries.length
  const averageMood = moodStats?.averageMood || (moodEntries.length > 0 
    ? (moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length).toFixed(1)
    : '0.0')
  
  const currentStreak = moodStats?.currentStreak || 0
  const bestStreak = moodStats?.bestStreak || 0
  const weeklyProgress = moodStats?.weeklyProgress || 0

  // Track mood count and show premium teaser
  useEffect(() => {
    if (user) {
      const storedCount = localStorage.getItem(`dailymood-mood-count-${user.id}`)
      const count = storedCount ? parseInt(storedCount) : totalEntries
      setMoodCount(count)
      
      // Show premium teaser after 20 logs
      if (count >= 20 && !localStorage.getItem(`dailymood-teaser-shown-${user.id}`)) {
        setShowPremiumTeaser(true)
      }
    }
  }, [user, totalEntries])

  // Prefetch AI insights when data is ready
  useEffect(() => {
    if (aiReady && user?.id) {
      prefetchRelated()
    }
  }, [aiReady, user?.id, prefetchRelated])

  // Real data for new features - will be 0 for new users
  const challengeStats = {
    completed: 0, // Will be updated when challenges are implemented
    total: 20,
    streak: 0,
    rank: 'Bronze'
  }

  // Loading states
  const isPageLoading = moodLoading && moodEntries.length === 0
  const isDataStale = moodFetching && moodEntries.length > 0

  // Show loading state
  if (isPageLoading) {
    return (
      <FullPageSpinner 
        text="Loading your mood dashboard..."
        variant="primary"
      />
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header with theme toggle */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ''}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Track your mood and discover insights about your emotional well-being
            </p>
          </div>
          <ThemeToggle />
        </div>

        {/* Temporary Notice */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2 text-blue-800">
            <span className="text-lg">ℹ️</span>
            <div>
              <p className="font-semibold">Temporary Local Storage Mode</p>
              <p className="text-sm text-blue-600">
                Your mood data is currently saved locally in your browser while we resolve database issues. 
                All features work normally!
              </p>
            </div>
          </div>
        </div>

        {/* Data refresh indicator */}
        {isDataStale && (
          <div className="mb-6 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
              <InlineSpinner size="sm" variant="primary" />
              <span className="text-sm">Refreshing your data...</span>
            </div>
          </div>
        )}

        {/* Quick Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-blue-600" />
                Total Entries
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{totalEntries}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {moodStats?.monthlyTrend === 'improving' ? '📈 Improving' : 
                 moodStats?.monthlyTrend === 'declining' ? '📉 Declining' : '➡️ Stable'} this month
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Average Mood
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{averageMood}/10</div>
              <Progress value={parseFloat(averageMood) * 10} className="mt-2" />
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Flame className="w-5 h-5 text-orange-600" />
                Current Streak
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{currentStreak}</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Best: {bestStreak} days
              </p>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="w-5 h-5 text-purple-600" />
                Weekly Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-900 dark:text-white">{weeklyProgress}/10</div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                This week&apos;s average
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mood Chart with loading state */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" />
              Mood Trends
            </CardTitle>
            <CardDescription>
              Visualize your mood patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <MoodChart 
              type="area" 
              data={moodEntries.map(entry => ({ 
                date: (entry as any).date || entry.created_at?.split('T')[0] || '', 
                mood: entry.mood_score 
              }))}
              isLoading={moodLoading}
              height={80}
            />
          </CardContent>
        </Card>

        {/* AI Insights with loading state */}
        <Card className="mb-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-6 h-6 text-purple-600" />
              AI-Powered Insights
            </CardTitle>
            <CardDescription>
              Personalized recommendations based on your mood data
            </CardDescription>
          </CardHeader>
          <CardContent>
            {aiLoading ? (
              <DataSpinner 
                text="Analyzing your mood patterns..."
                variant="secondary"
              />
            ) : aiInsights?.insights ? (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Summary
                  </h4>
                  <p className="text-gray-700 dark:text-gray-300">
                    {aiInsights.insights.summary}
                  </p>
                </div>
                
                {aiInsights.insights.recommendations.slice(0, 3).map((rec, index) => (
                  <div key={index} className="p-4 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                      {rec.title}
                    </h4>
                    <p className="text-gray-700 dark:text-gray-300 mb-2">
                      {rec.description}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <span>Effectiveness: {rec.effectiveness}%</span>
                      <span>•</span>
                      <span>Time: {rec.implementationTime}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Start logging your mood to get AI insights</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Load More Button for Pagination */}
        {pagination.hasNextPage && (
          <div className="text-center mb-8">
            <Button 
              onClick={pagination.loadMore}
              disabled={pagination.isFetchingNextPage}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {pagination.isFetchingNextPage ? (
                <>
                  <InlineSpinner size="sm" variant="primary" />
                  Loading more...
                </>
              ) : (
                'Load More Entries'
              )}
            </Button>
          </div>
        )}

        {/* Premium Teaser */}
        {showPremiumTeaser && (
          <PremiumTeaser 
            isOpen={showPremiumTeaser}
            triggerType="mood-logs"
            onClose={() => setShowPremiumTeaser(false)}
          />
        )}

        {/* Bottom Navigation */}
        <BottomNav />
      </div>

      {/* Performance Monitor */}
      <PerformanceMonitor />
    </div>
  )
}