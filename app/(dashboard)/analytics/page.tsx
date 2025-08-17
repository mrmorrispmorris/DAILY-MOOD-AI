'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useMoodData } from '@/hooks/use-mood-data'
import EnhancedMoodVisualization from '@/components/charts/enhanced-mood-visualization'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

export default function AnalyticsPage() {
  const { user } = useAuth()
  const { moodEntries, isLoading, error } = useMoodData()

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16 text-gray-500">
          <div className="text-6xl mb-4">🔒</div>
          <h3 className="text-2xl font-semibold mb-3">Authentication Required</h3>
          <p className="text-lg">Please log in to view your analytics.</p>
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-16">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-lg text-gray-600">Loading your analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Error Loading Analytics</CardTitle>
            <CardDescription>There was a problem loading your mood data.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Try Again
            </button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Insights</h1>
        <p className="text-gray-600">
          Deep dive into your mood patterns, correlations, and personalized insights.
        </p>
      </div>

      <EnhancedMoodVisualization moodData={moodEntries as any} />
    </div>
  )
}

