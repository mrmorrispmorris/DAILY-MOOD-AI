'use client'

import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/app/lib/supabase-client'
import { useAuth } from '@/hooks/use-auth'

interface MoodEntry {
  id: string
  user_id: string
  date: string
  mood_score: number
  emoji: string
  notes?: string
  tags?: string[]
  created_at: string
}

interface UseMoodDataOptions {
  page?: number
  limit?: number
  enabled?: boolean
}

export function useMoodData(options: UseMoodDataOptions = {}) {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  
  const { page = 1, limit = 10, enabled = true } = options

  const query = useQuery({
    queryKey: ['mood-entries', user?.id, page, limit],
    queryFn: async (): Promise<MoodEntry[]> => {
      if (!user?.id) return []
      
      const start = (page - 1) * limit
      const end = start + limit - 1
      
      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false })
        .range(start, end)
      
      if (error) {
        console.error('Error fetching mood data:', error)
        throw error
      }
      
      return data || []
    },
    enabled: enabled && !!user?.id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes (previously cacheTime)
    refetchOnWindowFocus: false,
    retry: 2
  })

  const invalidateCache = () => {
    queryClient.invalidateQueries({ queryKey: ['mood-entries', user?.id] })
  }

  const updateCache = (updatedEntry: MoodEntry) => {
    queryClient.setQueriesData(
      { queryKey: ['mood-entries', user?.id] },
      (oldData: MoodEntry[] | undefined) => {
        if (!oldData) return [updatedEntry]
        
        const existingIndex = oldData.findIndex(entry => entry.id === updatedEntry.id)
        if (existingIndex >= 0) {
          const newData = [...oldData]
          newData[existingIndex] = updatedEntry
          return newData
        }
        
        return [updatedEntry, ...oldData]
      }
    )
  }

  return {
    data: query.data || [],
    isLoading: query.isLoading,
    error: query.error,
    isError: query.isError,
    refetch: query.refetch,
    invalidateCache,
    updateCache,
    hasData: (query.data?.length || 0) > 0
  }
}

export default useMoodData
