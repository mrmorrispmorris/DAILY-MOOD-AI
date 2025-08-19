import { supabase } from '@/app/lib/supabase-client'
import type { User } from '@supabase/supabase-js'

export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  mood_notes: string
  activities: string[]
  weather: string
  sleep_hours?: number
  stress_level: number
  energy_level: number
  created_at: string
  updated_at: string
}

export interface CreateMoodEntryData {
  mood_score: number
  mood_notes?: string
  activities?: string[]
  weather?: string
  sleep_hours?: number
  stress_level?: number
  energy_level?: number
}

export class MoodService {
  /**
   * Create a new mood entry for the authenticated user
   */
  async createMoodEntry(data: CreateMoodEntryData): Promise<{ data: MoodEntry | null; error: string | null }> {
    try {
      console.log('🔄 MoodService: Creating mood entry...', { mood_score: data.mood_score })
      
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.error('❌ MoodService: User not authenticated:', userError)
        return { data: null, error: 'User not authenticated' }
      }

      console.log('✅ MoodService: User authenticated:', user.email)

      // Prepare mood entry data
      const moodEntryData = {
        user_id: user.id,
        mood_score: data.mood_score,
        mood_notes: data.mood_notes || '',
        activities: data.activities || [],
        weather: data.weather || 'unknown',
        sleep_hours: data.sleep_hours || null,
        stress_level: data.stress_level || Math.round(data.mood_score / 2),
        energy_level: data.energy_level || Math.round(data.mood_score / 2),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('📝 MoodService: Inserting mood entry:', moodEntryData)

      const { data: insertedData, error: insertError } = await supabase
        .from('mood_entries')
        .insert(moodEntryData)
        .select()
        .single()

      if (insertError) {
        console.error('❌ MoodService: Database insert error:', insertError)
        
        // Fallback to localStorage if database fails
        console.log('📱 MoodService: Falling back to localStorage...')
        const localEntry = {
          id: `local-${Date.now()}`,
          ...moodEntryData
        }
        
        const existingEntries = this.getLocalEntries()
        const updatedEntries = [localEntry, ...existingEntries]
        localStorage.setItem('dailymood_entries', JSON.stringify(updatedEntries))
        
        return { data: localEntry as MoodEntry, error: null }
      }

      console.log('✅ MoodService: Mood entry created successfully:', insertedData)
      return { data: insertedData as MoodEntry, error: null }

    } catch (error) {
      console.error('💥 MoodService: Exception creating mood entry:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * Get mood entries for the authenticated user
   */
  async getMoodEntries(limit: number = 20): Promise<{ data: MoodEntry[]; error: string | null }> {
    try {
      console.log('📖 MoodService: Fetching mood entries...')
      
      // Get authenticated user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        console.log('📱 MoodService: No authenticated user, using localStorage')
        return { data: this.getLocalEntries().slice(0, limit), error: null }
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        console.error('❌ MoodService: Database fetch error:', error)
        console.log('📱 MoodService: Using localStorage fallback')
        return { data: this.getLocalEntries().slice(0, limit), error: null }
      }

      console.log('✅ MoodService: Successfully fetched', data.length, 'entries from database')
      return { data: data as MoodEntry[], error: null }

    } catch (error) {
      console.error('💥 MoodService: Exception fetching mood entries:', error)
      return { data: this.getLocalEntries().slice(0, 20), error: null }
    }
  }

  /**
   * Update a mood entry
   */
  async updateMoodEntry(id: string, updates: Partial<CreateMoodEntryData>): Promise<{ data: MoodEntry | null; error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { data: null, error: 'User not authenticated' }
      }

      const { data, error } = await supabase
        .from('mood_entries')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ MoodService: Update error:', error)
        return { data: null, error: error.message }
      }

      return { data: data as MoodEntry, error: null }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * Delete a mood entry
   */
  async deleteMoodEntry(id: string): Promise<{ error: string | null }> {
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        return { error: 'User not authenticated' }
      }

      const { error } = await supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('❌ MoodService: Delete error:', error)
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      return { error: (error as Error).message }
    }
  }

  /**
   * Get mood statistics for the authenticated user
   */
  async getMoodStats(): Promise<{ data: any; error: string | null }> {
    try {
      const { data: entries, error } = await this.getMoodEntries(100)
      
      if (error || !entries.length) {
        return { 
          data: {
            totalEntries: 0,
            averageMood: 0,
            currentStreak: 0,
            bestStreak: 0,
            weeklyProgress: 0,
            monthlyTrend: 'stable'
          }, 
          error: null 
        }
      }

      const totalEntries = entries.length
      const averageMood = entries.reduce((sum, entry) => sum + entry.mood_score, 0) / totalEntries
      
      return {
        data: {
          totalEntries,
          averageMood: Math.round(averageMood * 10) / 10,
          currentStreak: this.calculateCurrentStreak(entries),
          bestStreak: this.calculateBestStreak(entries),
          weeklyProgress: this.calculateWeeklyProgress(entries),
          monthlyTrend: this.calculateMonthlyTrend(entries)
        },
        error: null
      }
    } catch (error) {
      return { data: null, error: (error as Error).message }
    }
  }

  /**
   * Get entries from localStorage
   */
  private getLocalEntries(): MoodEntry[] {
    try {
      const stored = localStorage.getItem('dailymood_entries')
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error reading localStorage:', error)
      return []
    }
  }

  /**
   * Calculate current mood logging streak
   */
  private calculateCurrentStreak(entries: MoodEntry[]): number {
    if (!entries.length) return 0
    
    const sortedEntries = entries.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    
    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.created_at)
      entryDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
      } else if (daysDiff > streak) {
        break
      }
    }

    return streak
  }

  /**
   * Calculate best mood logging streak
   */
  private calculateBestStreak(entries: MoodEntry[]): number {
    if (!entries.length) return 0

    const sortedEntries = entries.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    let bestStreak = 0
    let currentStreak = 1
    let lastDate: Date | null = null

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.created_at)
      entryDate.setHours(0, 0, 0, 0)
      
      if (lastDate) {
        const daysDiff = Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          currentStreak++
        } else {
          bestStreak = Math.max(bestStreak, currentStreak)
          currentStreak = 1
        }
      }
      
      lastDate = entryDate
    }

    return Math.max(bestStreak, currentStreak)
  }

  /**
   * Calculate weekly mood progress
   */
  private calculateWeeklyProgress(entries: MoodEntry[]): number {
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyEntries = entries.filter(entry => 
      new Date(entry.created_at) >= oneWeekAgo
    )
    
    if (!weeklyEntries.length) return 0
    
    const weeklyAverage = weeklyEntries.reduce((sum, entry) => 
      sum + entry.mood_score, 0
    ) / weeklyEntries.length
    
    return Math.round(weeklyAverage * 10) / 10
  }

  /**
   * Calculate monthly mood trend
   */
  private calculateMonthlyTrend(entries: MoodEntry[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 10) return 'stable'

    const sortedEntries = entries.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
    
    const midPoint = Math.floor(sortedEntries.length / 2)
    const firstHalf = sortedEntries.slice(0, midPoint)
    const secondHalf = sortedEntries.slice(midPoint)

    const firstHalfAvg = firstHalf.reduce((sum, entry) => 
      sum + entry.mood_score, 0
    ) / firstHalf.length
    
    const secondHalfAvg = secondHalf.reduce((sum, entry) => 
      sum + entry.mood_score, 0
    ) / secondHalf.length

    const difference = secondHalfAvg - firstHalfAvg

    if (difference > 0.5) return 'improving'
    if (difference < -0.5) return 'declining'
    return 'stable'
  }
}

// Export singleton instance
export const moodService = new MoodService()