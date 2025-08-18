'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { moodService, type CreateMoodEntryData, type MoodEntry } from '@/lib/supabase/mood-service'
import { useAuth } from './use-auth'

interface UsePaginatedMoodDataOptions {
  initialLimit?: number
  enabled?: boolean
}

export function usePaginatedMoodData(options: UsePaginatedMoodDataOptions = {}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const {
    initialLimit = 20,
    enabled = true
  } = options

  // Fetch mood entries
  const moodQuery = useQuery({
    queryKey: ['mood-entries', user?.id],
    queryFn: () => moodService.getMoodEntries(initialLimit),
    enabled: enabled && !!user,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  })

  // Fetch mood statistics
  const statsQuery = useQuery({
    queryKey: ['mood-stats', user?.id],
    queryFn: () => moodService.getMoodStats(),
    enabled: enabled && !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })

  // Add new mood entry
  const addMoodEntry = useMutation({
    mutationFn: async (moodData: CreateMoodEntryData) => {
      const result = await moodService.createMoodEntry(moodData)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      // Invalidate and refetch queries
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] })
      queryClient.invalidateQueries({ queryKey: ['mood-stats'] })
    },
  })

  // Update mood entry
  const updateMoodEntry = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<CreateMoodEntryData> }) => {
      const result = await moodService.updateMoodEntry(id, updates)
      if (result.error) {
        throw new Error(result.error)
      }
      return result.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] })
      queryClient.invalidateQueries({ queryKey: ['mood-stats'] })
    },
  })

  // Delete mood entry
  const deleteMoodEntry = useMutation({
    mutationFn: async (id: string) => {
      const result = await moodService.deleteMoodEntry(id)
      if (result.error) {
        throw new Error(result.error)
      }
      return id
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mood-entries'] })
      queryClient.invalidateQueries({ queryKey: ['mood-stats'] })
    },
  })

  return {
    // Mood entries data
    moodData: moodQuery.data?.data || [],
    moodIsLoading: moodQuery.isLoading,
    moodIsError: moodQuery.isError,
    moodError: moodQuery.error,

    // Stats data
    statsData: statsQuery.data?.data || null,
    statsIsLoading: statsQuery.isLoading,
    statsIsError: statsQuery.isError,
    statsError: statsQuery.error,

    // Mutations
    addMoodEntry: addMoodEntry.mutate,
    updateMoodEntry: updateMoodEntry.mutate,
    deleteMoodEntry: deleteMoodEntry.mutate,
    isAdding: addMoodEntry.isPending,
    isUpdating: updateMoodEntry.isPending,
    isDeleting: deleteMoodEntry.isPending,

    // Utilities
    refetch: moodQuery.refetch,
  }
}