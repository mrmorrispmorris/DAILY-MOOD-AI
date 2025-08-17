import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query'
import { MoodEntry } from '@/types/database'
import { moodService } from '@/lib/supabase/mood-service'
import { useAuth } from './use-auth'

// Cache keys for React Query
export const MOOD_DATA_KEYS = {
  all: ['mood-data'] as const,
  user: (userId: string) => [...MOOD_DATA_KEYS.all, 'user', userId] as const,
  entries: (userId: string) => [...MOOD_DATA_KEYS.user(userId), 'entries'] as const,
  paginated: (userId: string, page: number, limit: number) => 
    [...MOOD_DATA_KEYS.entries(userId), 'paginated', page, limit] as const,
  stats: (userId: string) => [...MOOD_DATA_KEYS.user(userId), 'stats'] as const,
  recent: (userId: string, count: number) => [...MOOD_DATA_KEYS.user(userId), 'recent', count] as const,
}

// Optimized hook for mood data with pagination
export function useMoodDataOptimized(pageSize: number = 20) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  // Infinite query for paginated mood entries
  const infiniteQuery = useInfiniteQuery({
    queryKey: MOOD_DATA_KEYS.entries(user?.id || 'anonymous'),
    queryFn: async ({ pageParam = 0 }) => {
      if (!user) throw new Error('User not authenticated')
      
      const offset = pageParam * pageSize
      const { data, error } = await moodService.getUserMoodEntriesPaginated(offset, pageSize)
      
      if (error) throw new Error(error)
      
      return {
        entries: data || [],
        nextPage: data && data.length === pageSize ? pageParam + 1 : undefined,
        hasMore: data && data.length === pageSize,
        totalCount: 0, // Will be updated by stats query
      }
    },
    enabled: !!user,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => lastPage.nextPage,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  })

  // Query for mood statistics (cached separately)
  const statsQuery = useQuery({
    queryKey: MOOD_DATA_KEYS.stats(user?.id || 'anonymous'),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await moodService.getUserMoodStats()
      if (error) throw new Error(error)
      
      return data || {
        totalEntries: 0,
        averageMood: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyProgress: 0,
        monthlyTrend: 'stable'
      }
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
  })

  // Query for recent entries (for quick access)
  const recentQuery = useQuery({
    queryKey: MOOD_DATA_KEYS.recent(user?.id || 'anonymous', 10),
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await moodService.getUserMoodEntriesPaginated(0, 10)
      if (error) throw new Error(error)
      
      return data || []
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })

  // Mutation for adding new mood entries
  const addMoodEntryMutation = useMutation({
    mutationFn: async (entry: {
      date: string
      mood_score: number
      emoji: string
      notes: string
      tags: string[]
    }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await moodService.createMoodEntry(entry)
      if (error) throw new Error(error)
      
      return data
    },
    onSuccess: (newEntry) => {
      // Optimistically update the cache
      queryClient.setQueryData(
        MOOD_DATA_KEYS.recent(user!.id, 10),
        (old: MoodEntry[] = []) => [newEntry, ...old.slice(0, 9)]
      )
      
      // Invalidate related queries
      queryClient.invalidateQueries({
        queryKey: MOOD_DATA_KEYS.stats(user!.id)
      })
      
      // Update infinite query cache
      queryClient.setQueryData(
        MOOD_DATA_KEYS.entries(user!.id),
        (old: any) => {
          if (!old) return old
          
          return {
            ...old,
            pages: old.pages.map((page: any, index: number) => {
              if (index === 0) {
                return {
                  ...page,
                  entries: [newEntry, ...page.entries.slice(0, -1)]
                }
              }
              return page
            })
          }
        }
      )
    },
    onError: (error) => {
      console.error('Failed to add mood entry:', error)
    }
  })

  // Mutation for updating mood entries
  const updateMoodEntryMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<MoodEntry> }) => {
      if (!user) throw new Error('User not authenticated')
      
      const { data, error } = await moodService.updateMoodEntry(id, updates)
      if (error) throw new Error(error)
      
      return data
    },
    onSuccess: (updatedEntry) => {
      // Update all related caches
      queryClient.setQueriesData(
        { queryKey: MOOD_DATA_KEYS.entries(user!.id) },
        (old: any) => {
          if (!old) return old
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              entries: page.entries.map((entry: MoodEntry) =>
                entry.id === updatedEntry.id ? updatedEntry : entry
              )
            }))
          }
        }
      )
      
      // Update recent entries cache
      queryClient.setQueryData(
        MOOD_DATA_KEYS.recent(user!.id, 10),
        (old: MoodEntry[] = []) =>
          old.map(entry => entry.id === updatedEntry.id ? updatedEntry : entry)
      )
    }
  })

  // Mutation for deleting mood entries
  const deleteMoodEntryMutation = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')
      
      const { error } = await moodService.deleteMoodEntry(id)
      if (error) throw new Error(error)
      
      return id
    },
    onSuccess: (deletedId) => {
      // Remove from all caches
      queryClient.setQueriesData(
        { queryKey: MOOD_DATA_KEYS.entries(user!.id) },
        (old: any) => {
          if (!old) return old
          
          return {
            ...old,
            pages: old.pages.map((page: any) => ({
              ...page,
              entries: page.entries.filter((entry: MoodEntry) => entry.id !== deletedId)
            }))
          }
        }
      )
      
      // Update recent entries cache
      queryClient.setQueryData(
        MOOD_DATA_KEYS.recent(user!.id, 10),
        (old: MoodEntry[] = []) => old.filter(entry => entry.id !== deletedId)
      )
      
      // Invalidate stats
      queryClient.invalidateQueries({
        queryKey: MOOD_DATA_KEYS.stats(user!.id)
      })
    }
  })

  // Helper functions
  const loadMore = () => infiniteQuery.fetchNextPage()
  const refresh = () => {
    queryClient.invalidateQueries({
      queryKey: MOOD_DATA_KEYS.user(user?.id || 'anonymous')
    })
  }

  // Flatten all entries from infinite query
  const allEntries = infiniteQuery.data?.pages.flatMap(page => page.entries) || []
  
  // Loading states
  const isLoading = infiniteQuery.isLoading || statsQuery.isLoading
  const isFetching = infiniteQuery.isFetching || statsQuery.isFetching
  const isError = infiniteQuery.isError || statsQuery.isError

  return {
    // Data
    entries: allEntries,
    recentEntries: recentQuery.data || [],
    stats: statsQuery.data,
    pagination: {
      hasNextPage: infiniteQuery.hasNextPage,
      isFetchingNextPage: infiniteQuery.isFetchingNextPage,
      loadMore,
    },
    
    // Loading states
    isLoading,
    isFetching,
    isError,
    error: infiniteQuery.error || statsQuery.error,
    
    // Mutations
    addMoodEntry: addMoodEntryMutation.mutate,
    updateMoodEntry: updateMoodEntryMutation.mutate,
    deleteMoodEntry: deleteMoodEntryMutation.mutate,
    
    // Cache management
    refresh,
    invalidateCache: () => {
      queryClient.invalidateQueries({
        queryKey: MOOD_DATA_KEYS.user(user?.id || 'anonymous')
      })
    },
    
    // Optimistic updates
    isOptimistic: addMoodEntryMutation.isPending || updateMoodEntryMutation.isPending || deleteMoodEntryMutation.isPending,
  }
}
