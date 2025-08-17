'use client'

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { createClient } from '@/lib/supabase/client'
import { useAuth } from './use-auth'

interface PaginationParams {
  page: number
  limit: number
  sortBy?: 'date' | 'mood_score' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

interface MoodDataResponse {
  data: any[]
  total: number
  page: number
  limit: number
  totalPages: number
  hasMore: boolean
}

interface UsePaginatedMoodDataOptions {
  initialLimit?: number
  sortBy?: 'date' | 'mood_score' | 'created_at'
  sortOrder?: 'desc' | 'asc'
  enabled?: boolean
}

export function usePaginatedMoodData(options: UsePaginatedMoodDataOptions = {}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const {
    initialLimit = 20,
    sortBy = 'date',
    sortOrder = 'desc',
    enabled = true
  } = options

  // Fetch paginated mood data
  const fetchMoodData = async ({ pageParam = 0 }: { pageParam?: number }) => {
    if (!user) throw new Error('User not authenticated')

    const supabase = createClient()
    const limit = initialLimit
    const offset = pageParam * limit

    // Build efficient query with proper indexing
    let query = supabase
      .from('mood_entries')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1)

    const { data, error, count } = await query

    if (error) throw error

    const total = count || 0
    const totalPages = Math.ceil(total / limit)
    const hasMore = pageParam < totalPages - 1

    return {
      data: data || [],
      total,
      page: pageParam,
      limit,
      totalPages,
      hasMore,
    }
  }

  // Infinite query for infinite scroll
  const infiniteQuery = useInfiniteQuery({
    queryKey: ['mood-data', user?.id, sortBy, sortOrder, initialLimit],
    queryFn: fetchMoodData,
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      return lastPage.hasMore ? lastPage.page + 1 : undefined
    },
    enabled: enabled && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    // Optimize for large datasets
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  })

  // Paginated query for traditional pagination
  const paginatedQuery = useQuery({
    queryKey: ['mood-data-paginated', user?.id, sortBy, sortOrder, initialLimit],
    queryFn: () => fetchMoodData({ pageParam: 0 }),
    enabled: enabled && !!user,
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })

  // Add new mood entry
  const addMoodEntry = useMutation({
    mutationFn: async (moodData: any) => {
      if (!user) throw new Error('User not authenticated')

      const supabase = createClient()
      const { data, error } = await supabase
        .from('mood_entries')
        .insert([{ ...moodData, user_id: user.id }])
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['mood-data'] })
      queryClient.invalidateQueries({ queryKey: ['mood-data-paginated'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
  })

  // Update mood entry
  const updateMoodEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      if (!user) throw new Error('User not authenticated')

      const supabase = createClient()
      const { data, error } = await supabase
        .from('mood_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-data'] })
      queryClient.invalidateQueries({ queryKey: ['mood-data-paginated'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
  })

  // Delete mood entry
  const deleteMoodEntry = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error('User not authenticated')

      const supabase = createClient()
      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-data'] })
      queryClient.invalidateQueries({ queryKey: ['mood-data-paginated'] })
      queryClient.invalidateQueries({ queryKey: ['ai-insights'] })
    },
  })

  // Get all data for charts (limited to last 100 entries for performance)
  const getChartData = async () => {
    if (!user) return []

    const supabase = createClient()
    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(100) // Limit for chart performance

    if (error) throw error
    return data || []
  }

  // Optimized chart data query
  const chartDataQuery = useQuery({
    queryKey: ['mood-chart-data', user?.id],
    queryFn: getChartData,
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes for chart data
    gcTime: 10 * 60 * 1000,
  })

  return {
    // Infinite scroll data
    infiniteData: infiniteQuery.data,
    infiniteIsLoading: infiniteQuery.isLoading,
    infiniteIsError: infiniteQuery.isError,
    infiniteError: infiniteQuery.error,
    infiniteFetchNextPage: infiniteQuery.fetchNextPage,
    infiniteHasNextPage: infiniteQuery.hasNextPage,
    infiniteIsFetchingNextPage: infiniteQuery.isFetchingNextPage,

    // Paginated data
    paginatedData: paginatedQuery.data,
    paginatedIsLoading: paginatedQuery.isLoading,
    paginatedIsError: paginatedQuery.isError,
    paginatedError: paginatedQuery.error,

    // Chart data
    chartData: chartDataQuery.data || [],
    chartIsLoading: chartDataQuery.isLoading,
    chartIsError: chartDataQuery.isError,

    // Mutations
    addMoodEntry: addMoodEntry.mutate,
    updateMoodEntry: updateMoodEntry.mutate,
    deleteMoodEntry: deleteMoodEntry.mutate,
    isAdding: addMoodEntry.isPending,
    isUpdating: updateMoodEntry.isPending,
    isDeleting: deleteMoodEntry.isPending,

    // Utilities
    refetch: infiniteQuery.refetch,
    prefetchNextPage: infiniteQuery.fetchNextPage,
  }
}
