'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Brain, 
  Lightbulb, 
  Target, 
  Star, 
  CheckCircle, 
  Sparkles,
  TrendingUp,
  Activity,
  Heart,
  Users,
  Moon,
  BookOpen,
  Clock,
  RefreshCw
} from 'lucide-react'
import { useAIInsights } from '@/hooks/use-ai-insights'
import { cn } from '@/lib/utils'

interface EnhancedInsightsDisplayProps {
  moodData: any[]
  userProfile?: any
}

export function EnhancedInsightsDisplay({ moodData, userProfile }: EnhancedInsightsDisplayProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // Use React Query hook for AI insights with caching
  const { 
    data: aiInsights,
    isLoading, 
    isError, 
    error, 
    isFetching, 
    isStale, 
    dataUpdatedAt,
    refetch, 
    invalidateCache,
    prefetchRelated,
    isReady
  } = useAIInsights(moodData, userProfile?.id)

  // Prefetch insights when component mounts
  React.useEffect(() => {
    if (moodData.length > 0 && isReady) {
      prefetchRelated()
    }
  }, [moodData, isReady, prefetchRelated])

  // Extract insights from the new data structure
  const insights = aiInsights?.insights || {
    patterns: [],
    recommendations: [],
    research: [],
    actionPlan: [],
    summary: ''
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mood': return <TrendingUp className="w-4 h-4" />
      case 'behavior': return <Target className="w-4 h-4" />
      case 'lifestyle': return <Heart className="w-4 h-4" />
      case 'scientific': return <Brain className="w-4 h-4" />
      case 'personal': return <Users className="w-4 h-4" />
      default: return <Lightbulb className="w-4 h-4" />
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  if (!insights || !insights.patterns || insights.patterns.length === 0) {
    return (
      <div className="text-center py-8">
        <Brain className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-600 mb-2">No Insights Available</h3>
        <p className="text-gray-500 mb-4">Start tracking your mood to generate personalized insights</p>
        <Button onClick={() => refetch()}>Generate Insights</Button>
      </div>
    )
  }

  const allInsights = [
    ...insights.patterns.map(p => ({ ...p, type: 'pattern' as const, id: `pattern-${p.type}` })),
    ...insights.recommendations.map(r => ({ ...r, type: 'recommendation' as const })),
    ...insights.research.map(r => ({ ...r, type: 'research' as const })),
    ...insights.actionPlan.map(a => ({ ...a, type: 'action' as const }))
  ]

  const filteredInsights = selectedCategory === 'all' 
    ? allInsights 
    : allInsights.filter(insight => {
        if (insight.type === 'pattern') return insight.type.includes(selectedCategory)
        if (insight.type === 'recommendation') return insight.difficulty === selectedCategory
        if (insight.type === 'research') return insight.relevance === selectedCategory
        if (insight.type === 'action') return insight.difficulty === selectedCategory
        return false
      })

  return (
    <div className="space-y-6">
      {/* Overall Summary */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5" />
            AI-Powered Insights
          </CardTitle>
          <CardDescription>
            Analysis based on {moodData.length} mood entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge className="text-sm font-medium bg-blue-100 text-blue-700">
              {allInsights.length} Insights Generated
            </Badge>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {moodData.length > 0 ? 
                  (moodData.reduce((sum, entry) => sum + (entry.mood_score || 5), 0) / moodData.length).toFixed(1) 
                  : '0'}/10
              </p>
              <p className="text-sm text-gray-500">Average Mood</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cache Status */}
      <div className="flex items-center justify-between text-sm text-gray-500 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <RefreshCw className={cn("h-3 w-3", isFetching && "animate-spin")} />
            <span>
              {isStale ? 'Stale' : 'Live'} 
              {isStale && ` (${Math.round(dataUpdatedAt / 1000)}s ago)`}
            </span>
          </div>
          {isStale && (
            <Badge variant="outline" className="text-xs">
              Stale
            </Badge>
          )}
          {isFetching && (
            <Badge variant="outline" className="text-xs text-blue-600">
              Updating...
            </Badge>
          )}
        </div>
        <div className="text-xs">
          Load time: {isStale ? '<2s' : '5-10s'}
        </div>
      </div>

      {/* Category Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filter by Category</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {['all', 'mood', 'behavior', 'lifestyle', 'scientific', 'personal'].map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="capitalize"
              >
                {category === 'all' ? 'All Categories' : category}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.map((insight) => {
          // Handle different insight types
          if (insight.type === 'pattern') {
            return (
              <Card key={insight.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-blue-300 bg-blue-50 text-blue-700">
                      Pattern
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{Math.round(insight.confidence * 10)}/10</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{insight.description}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {insight.evidence}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Impact Level
                    </h5>
                    <Badge variant="outline" className={`${
                      insight.impact === 'high' ? 'border-red-300 bg-red-50 text-red-700' :
                      insight.impact === 'medium' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                      'border-green-300 bg-green-50 text-green-700'
                    }`}>
                      {insight.impact.charAt(0).toUpperCase() + insight.impact.slice(1)} Impact
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            )
          }
          
          if (insight.type === 'recommendation') {
            return (
              <Card key={insight.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-green-300 bg-green-50 text-green-700">
                      Recommendation
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{insight.effectiveness}% effective</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Research Backed
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {insight.researchSource}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      Expected outcome: {insight.expectedOutcome}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${
                    insight.difficulty === 'easy' ? 'border-green-300 bg-green-50 text-green-700' :
                    insight.difficulty === 'medium' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                    'border-red-300 bg-red-50 text-red-700'
                  }`}>
                    {insight.difficulty.charAt(0).toUpperCase() + insight.difficulty.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            )
          }
          
          if (insight.type === 'research') {
            return (
              <Card key={insight.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-purple-300 bg-purple-50 text-purple-700">
                      Research
                    </Badge>
                    <div className="flex items-center gap-1">
                      <BookOpen className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{insight.year}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {insight.authors}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Study Details
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {insight.source} • {insight.methodology}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${
                    insight.relevance === 'high' ? 'border-green-300 bg-green-50 text-green-700' :
                    insight.relevance === 'medium' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                    'border-red-300 bg-red-50 text-red-700'
                  }`}>
                    {insight.relevance.charAt(0).toUpperCase() + insight.relevance.slice(1)} Relevance
                  </Badge>
                </CardContent>
              </Card>
            )
          }
          
          if (insight.type === 'action') {
            return (
              <Card key={insight.id} className="hover:shadow-lg transition-all duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="border-orange-300 bg-orange-50 text-orange-700">
                      Action Step
                    </Badge>
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500">{insight.timeframe}</span>
                    </div>
                  </div>
                  <CardTitle className="text-lg leading-tight">{insight.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {insight.description}
                  </p>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                    <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      Expected Outcome
                    </h5>
                    <p className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                      {insight.expectedOutcome}
                    </p>
                  </div>
                  <Badge variant="outline" className={`${
                    insight.difficulty === 'easy' ? 'border-green-300 bg-green-50 text-green-700' :
                    insight.difficulty === 'medium' ? 'border-yellow-300 bg-yellow-50 text-yellow-700' :
                    'border-red-300 bg-red-50 text-red-700'
                  }`}>
                    {insight.difficulty.charAt(0).toUpperCase() + insight.difficulty.slice(1)}
                  </Badge>
                </CardContent>
              </Card>
            )
          }
          
          return null
        })}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <Button onClick={() => refetch()} variant="outline">
          <Lightbulb className="w-4 h-4 mr-2" />
          Refresh Insights
        </Button>
      </div>
    </div>
  )
}


