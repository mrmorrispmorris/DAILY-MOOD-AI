import { useState, useEffect } from 'react'
import { MoodEntry } from '@/types/database'
import { moodService } from '@/lib/supabase/mood-service'
import { useAuth } from './use-auth'

export function useMoodData() {
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        
        // Only fetch data if user is authenticated
        if (!user) {
          setMoodEntries([])
          setIsLoading(false)
          return
        }

        // Fetch real data from Supabase
        const { data, error: fetchError } = await moodService.getMoodEntries()
        
        if (fetchError) {
          console.error('Error fetching mood data:', fetchError)
          setError(fetchError)
          setMoodEntries([])
        } else {
          setMoodEntries(data || [])
          setError(null)
        }
      } catch (err) {
        console.error('Error loading mood data:', err)
        setError('Failed to load mood data')
        setMoodEntries([])
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user])

  const addMoodEntry = async (entry: { date: string; mood_score: number; emoji: string; notes: string; tags: string[] }) => {
    try {
      const { data, error: addError } = await moodService.createMoodEntry(entry)
      
      if (addError) {
        throw new Error(addError)
      }

      if (data) {
        setMoodEntries(prev => [data, ...prev])
        return { success: true, data }
      } else {
        // If no data returned (offline mode), create local entry
        const newEntry: MoodEntry = {
          id: `entry-${Date.now()}`,
          user_id: user?.id || 'unknown',
          mood_score: entry.mood_score,
          mood_label: entry.emoji,
          notes: entry.notes,
          activities: entry.tags,
          created_at: new Date().toISOString()
        }
        
        setMoodEntries(prev => [newEntry, ...prev])
        return { success: true, data: newEntry }
      }
    } catch (err) {
      setError('Failed to add mood entry')
      return { success: false, error: (err as Error).message }
    }
  }

  const updateMoodEntry = async (id: string, updates: Partial<MoodEntry>) => {
    try {
      setMoodEntries(prev => 
        prev.map(entry => 
          entry.id === id ? { ...entry, ...updates } : entry
        )
      )
    } catch (err) {
      setError('Failed to update mood entry')
      throw err
    }
  }

  const deleteMoodEntry = async (id: string) => {
    try {
      setMoodEntries(prev => prev.filter(entry => entry.id !== id))
    } catch (err) {
      setError('Failed to delete mood entry')
      throw err
    }
  }

  const getMoodTrend = () => {
    if (moodEntries.length < 2) return 'stable'
    
    const recent = moodEntries.slice(0, 7)
    const older = moodEntries.slice(7, 14)
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood_score, 0) / recent.length
    const olderAvg = older.reduce((sum, entry) => sum + entry.mood_score, 0) / older.length
    
    const difference = recentAvg - olderAvg
    
    if (difference > 0.5) return 'improving'
    if (difference < -0.5) return 'declining'
    return 'stable'
  }

  return {
    moodEntries,
    isLoading,
    error,
    addMoodEntry,
    updateMoodEntry,
    deleteMoodEntry,
    getMoodTrend
  }
}