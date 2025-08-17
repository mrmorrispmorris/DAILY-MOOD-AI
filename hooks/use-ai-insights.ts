'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { enhancedInsightsService } from '@/lib/openai/enhanced-insights-service'
import { MoodEntry } from '@/types/database'

// Cache keys for React Query
export const AI_INSIGHTS_KEYS = {
  all: ['ai-insights'] as const,
  user: (userId: string) => [...AI_INSIGHTS_KEYS.all, 'user', userId] as const,
  analysis: (userId: string, entryCount: number) => 
    [...AI_INSIGHTS_KEYS.user(userId), 'analysis', entryCount] as const,
  patterns: (userId: string) => [...AI_INSIGHTS_KEYS.user(userId), 'patterns'] as const,
  recommendations: (userId: string) => [...AI_INSIGHTS_KEYS.user(userId), 'recommendations'] as const,
}

// Hook for getting AI insights with intelligent caching
export function useAIInsights(moodEntries: MoodEntry[], userId?: string) {
  const queryClient = useQueryClient()
  const entryCount = moodEntries.length
  
  // Only fetch insights if we have enough data and a user
  const shouldFetch = entryCount >= 3 && !!userId
  
  const query = useQuery({
    queryKey: AI_INSIGHTS_KEYS.analysis(userId || 'anonymous', entryCount),
    queryFn: async () => {
      if (!shouldFetch) {
        throw new Error('Insufficient data for analysis')
      }
      
      // Add artificial delay to simulate processing (remove in production)
      await new Promise(resolve => setTimeout(resolve, 100))
      
      return enhancedInsightsService.analyzeMoodData(moodEntries, { userId })
    },
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 30, // 30 minutes - insights don't change frequently
    gcTime: 1000 * 60 * 60 * 2, // 2 hours - keep in memory longer
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  })

  // Prefetch related data
  const prefetchRelated = async () => {
    if (shouldFetch) {
      await queryClient.prefetchQuery({
        queryKey: AI_INSIGHTS_KEYS.patterns(userId!),
        queryFn: () => query.data?.insights.patterns || [],
        staleTime: 1000 * 60 * 60, // 1 hour
      })
      
      await queryClient.prefetchQuery({
        queryKey: AI_INSIGHTS_KEYS.recommendations(userId!),
        queryFn: () => query.data?.insights.recommendations || [],
        staleTime: 1000 * 60 * 60, // 1 hour
      })
    }
  }

  // Invalidate cache when new mood entries are added
  const invalidateCache = () => {
    if (userId) {
      queryClient.invalidateQueries({
        queryKey: AI_INSIGHTS_KEYS.user(userId)
      })
    }
  }

  return {
    ...query,
    prefetchRelated,
    invalidateCache,
    isReady: shouldFetch && !query.isLoading && !query.error,
  }
}

// Hook for getting specific insight types with separate caching
export function useInsightPatterns(userId?: string) {
  return useQuery({
    queryKey: AI_INSIGHTS_KEYS.patterns(userId || 'anonymous'),
    queryFn: async () => {
      // This would typically fetch from a cached analysis
      return []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 4, // 4 hours
  })
}

export function useInsightRecommendations(userId?: string) {
  return useQuery({
    queryKey: AI_INSIGHTS_KEYS.recommendations(userId || 'anonymous'),
    queryFn: async () => {
      // This would typically fetch from a cached analysis
      return []
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 4, // 4 hours
  })
}

// Hook for refreshing insights manually
export function useRefreshInsights() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async ({ userId, moodEntries }: { userId: string; moodEntries: MoodEntry[] }) => {
      // Force refresh by invalidating cache
      await queryClient.invalidateQueries({
        queryKey: AI_INSIGHTS_KEYS.user(userId)
      })
      
      // Return fresh data
      return enhancedInsightsService.analyzeMoodData(moodEntries, { userId })
    },
    onSuccess: (data, { userId }) => {
      // Update cache with fresh data
      queryClient.setQueryData(
        AI_INSIGHTS_KEYS.analysis(userId, data.entryCount),
        data
      )
    }
  })
}
