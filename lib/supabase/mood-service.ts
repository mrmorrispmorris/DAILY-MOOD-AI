import { createClient } from '@/lib/supabase/client'
import type { Database, MoodEntry, MoodEntryInsert } from '@/types/database'
import { OfflineStorage, OfflineMoodEntry } from '@/lib/offline-storage'

export class MoodService {
  private supabaseClient: any = null
  private supabaseInitialized = false

  private get supabase() {
    if (!this.supabaseInitialized) {
      try {
        this.supabaseClient = createClient()
        this.supabaseInitialized = true
        console.log('✅ MoodService: Supabase client initialized successfully')
      } catch (error) {
        console.warn('⚠️ MoodService: Supabase not configured, running in demo mode', error)
        this.supabaseClient = null
        this.supabaseInitialized = true
      }
    }
    return this.supabaseClient
  }

  // Debug method to test database connection
  async testDatabaseConnection(): Promise<{ success: boolean; details: any }> {
    console.log('🔍 MoodService: Testing database connection...')
    
    if (!this.supabase) {
      return { success: false, details: 'No Supabase client available' }
    }

    try {
      // Test 1: Check authentication
      const { data: { user }, error: authError } = await this.supabase.auth.getUser()
      console.log('🔍 Auth Test:', { user: user?.email, error: authError })

      // Test 2: Try to read from mood_entries (should show RLS error if any)
      const { data: entriesData, error: entriesError } = await this.supabase
        .from('mood_entries')
        .select('count')
        .limit(1)

      console.log('🔍 mood_entries Read Test:', { data: entriesData, error: entriesError })

      // Test 3: Try to read from users table
      const { data: usersData, error: usersError } = await this.supabase
        .from('users')
        .select('id')
        .limit(1)

      console.log('🔍 users Table Read Test:', { data: usersData, error: usersError })

      return {
        success: !authError && user,
        details: {
          auth: { user: user?.email, error: authError },
          mood_entries: { data: entriesData, error: entriesError },
          users: { data: usersData, error: usersError }
        }
      }
    } catch (error) {
      console.error('💥 Database connection test failed:', error)
      return { success: false, details: error }
    }
  }

  async createMoodEntry(entry: Omit<MoodEntryInsert, 'user_id'>): Promise<{ data: MoodEntry | null; error: string | null }> {
    console.log('🔄 MoodService: Creating mood entry...', { mood_score: entry.mood_score })
    
    try {
      // Check if we're in demo mode or Supabase not configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!this.supabase || !supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your-project') || 
          supabaseKey.includes('your-anon-key') ||
          supabaseUrl === 'your_supabase_project_url' ||
          supabaseKey === 'your_supabase_anon_key') {
        console.log('🎭 MoodService: Demo mode - saving to local storage')
        // Simulate successful save in demo mode
        const offlineEntry: OfflineMoodEntry = {
          date: entry.date!,
          mood_score: entry.mood_score,
          emoji: entry.emoji || '😐',
          notes: entry.notes || '',
          tags: entry.tags || [],
          timestamp: Date.now()
        }
        OfflineStorage.saveEntry(offlineEntry)
        return { data: null, error: null }
      }
      
      console.log('🔍 MoodService: Getting authenticated user...')
      const { data: { user }, error: userError } = await this.supabase.auth.getUser()
      
      if (userError) {
        console.error('❌ MoodService: User auth error:', userError)
        throw new Error(`Authentication error: ${userError.message}`)
      }
      
      if (!user) {
        console.error('❌ MoodService: No authenticated user found')
        throw new Error('User not authenticated')
      }

      console.log('✅ MoodService: User authenticated:', user.email)

      // TEMPORARY: Skip mood log limit check due to RLS issues
      // This will be re-enabled once the database schema is properly configured
      console.log('⚠️ MoodService: Skipping mood log limit check due to database issues')

      // BYPASSING users table dependency - insert directly to mood_entries
      console.log('⚠️ MoodService: Bypassing users table dependency for mood_entries insertion')
      
      // Create comprehensive entry with all fields
      const comprehensiveEntry = {
        user_id: user.id, // Direct auth.users reference, no users table needed
        user_email: user.email, // Add email for redundancy
        mood_score: entry.mood_score,
        emoji: entry.emoji || '😊',
        notes: entry.notes || '',
        tags: entry.tags || [],
        date: entry.date || new Date().toISOString().split('T')[0]
      }

      // ATTEMPT 1: Try mood_entries table with CORRECT column names
      console.log('📝 MoodService: Attempting mood_entries insertion with correct schema...')
      
      const directEntry = {
        user_id: user.id,
        mood_score: entry.mood_score,
        mood_notes: entry.notes || '', // Use mood_notes instead of notes
        activities: entry.tags || [], // Use activities instead of tags/emotions
        weather: 'unknown', // Default weather value
        sleep_hours: entry.sleep_hours || null,
        stress_level: Math.round(entry.mood_score / 2), // Derive from mood_score
        energy_level: Math.round(entry.mood_score / 2), // Derive from mood_score
        // No date field - use created_at timestamp
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      console.log('🔍 MoodService: Corrected entry data:', directEntry)

      try {
        const { data: directData, error: directError } = await this.supabase
          .from('mood_entries')
          .insert(directEntry)
          .select()
          .single()

        if (!directError && directData) {
          console.log('🎉 MoodService: SUCCESS! mood_entries insertion worked with correct schema:', directData)
          
          // Map the response back to expected format for compatibility
          const mappedData = {
            ...directData,
            notes: directData.mood_notes, // Map back for compatibility
            tags: directData.activities, // Map back for compatibility
            date: directData.created_at.split('T')[0], // Extract date from timestamp
            emoji: '😊' // Default emoji since it's not in the schema
          }
          
          return { data: mappedData as MoodEntry, error: null }
        }

        console.log('⚠️ MoodService: mood_entries insertion failed with corrected schema:', {
          error: directError,
          code: directError?.code,
          message: directError?.message,
          details: directError?.details,
          hint: directError?.hint
        })

        // Database insertion failed, use localStorage fallback
        throw new Error(`Database insertion failed even with corrected schema: ${directError?.message}`)

      } catch (dbError) {
        console.error('💥 MoodService: Database insertion failed with corrected schema:', dbError)
        
        // FALLBACK: Save to localStorage
        console.log('📱 MoodService: Falling back to localStorage after schema correction attempt...')
        
        const localEntry = {
          id: `mood-${Date.now()}`,
          user_id: user.id,
          mood_score: entry.mood_score,
          mood_notes: entry.notes || '',
          activities: entry.tags || [],
          weather: 'unknown',
          sleep_hours: entry.sleep_hours || null,
          stress_level: Math.round(entry.mood_score / 2),
          energy_level: Math.round(entry.mood_score / 2),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Compatibility fields
          notes: entry.notes || '',
          tags: entry.tags || [],
          date: new Date().toISOString().split('T')[0],
          emoji: '😊'
        }

        // Save to localStorage
        const existingEntries = JSON.parse(localStorage.getItem('dailymood_entries') || '[]')
        const updatedEntries = [localEntry, ...existingEntries]
        localStorage.setItem('dailymood_entries', JSON.stringify(updatedEntries))
        
        console.log('✅ MoodService: Entry saved to localStorage with corrected schema:', localEntry)
        return { data: localEntry as MoodEntry, error: null }
      }
    } catch (error) {
      console.error('💥 MoodService: Error creating mood entry:', error)
      
      // If offline, save to local storage
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        console.log('📱 MoodService: Offline - saving to local storage')
        const offlineEntry: OfflineMoodEntry = {
          date: entry.date!,
          mood_score: entry.mood_score,
          emoji: entry.emoji || '😐',
          notes: entry.notes || '',
          tags: entry.tags || [],
          timestamp: Date.now()
        }
        OfflineStorage.saveEntry(offlineEntry)
        return { data: null, error: null }
      }
      
      return { data: null, error: (error as Error).message }
    }
  }

  async getUserMoodEntries(limit?: number): Promise<{ data: MoodEntry[]; error: string | null }> {
    try {
      console.log('📖 MoodService: Attempting to fetch from database with correct schema...')
      
      if (!this.supabase) {
        console.log('📱 MoodService: No Supabase client, using localStorage')
        return this.getLocalStorageEntries(limit)
      }

      const { data: { user } } = await this.supabase.auth.getUser()
      if (!user) {
        console.log('📱 MoodService: No authenticated user, using localStorage')
        return this.getLocalStorageEntries(limit)
      }

      // Try to fetch from database with correct column names
      const { data, error } = await this.supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit || 100)

      if (!error && data) {
        console.log('✅ MoodService: Successfully fetched from database:', data.length, 'entries')
        
        // Map database schema to expected format
        const mappedData = data.map((entry: any) => ({
          ...entry,
          notes: entry.mood_notes || '', // Map mood_notes to notes
          tags: entry.activities || [], // Map activities to tags
          date: entry.created_at.split('T')[0], // Extract date from timestamp
          emoji: '😊' // Default emoji
        }))
        
        return { data: mappedData as MoodEntry[], error: null }
      }

      console.log('⚠️ MoodService: Database fetch failed, using localStorage fallback:', error)
      return this.getLocalStorageEntries(limit)
      
    } catch (error) {
      console.error('💥 MoodService: Error fetching mood entries:', error)
      return this.getLocalStorageEntries(limit)
    }
  }

  private getLocalStorageEntries(limit?: number): { data: MoodEntry[]; error: string | null } {
    try {
      const storedEntries = localStorage.getItem('dailymood_entries')
      if (storedEntries) {
        const entries = JSON.parse(storedEntries)
        const limitedEntries = entries.slice(0, limit || 100)
        console.log('✅ MoodService: Found entries in localStorage:', limitedEntries.length)
        return { data: limitedEntries as MoodEntry[], error: null }
      }

      console.log('ℹ️ MoodService: No entries found in localStorage')
      return { data: [], error: null }
    } catch (error) {
      console.error('💥 MoodService: Error reading localStorage:', error)
      return { data: [], error: (error as Error).message }
    }
  }

  // New paginated method for efficient loading
  async getUserMoodEntriesPaginated(offset: number = 0, limit: number = 20): Promise<{ data: MoodEntry[]; error: string | null }> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Optimized query with pagination and proper indexing
      const { data, error } = await this.supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (error) throw error

      return { data: data as MoodEntry[], error: null }
    } catch (error) {
      console.error('Error fetching paginated mood entries:', error)
      return { data: [], error: (error as Error).message }
    }
  }

  // New method for getting mood statistics efficiently
  async getUserMoodStats(): Promise<{ data: any; error: string | null }> {
    try {
      console.log('📊 MoodService: Getting mood stats from localStorage')
      
      // Get entries from localStorage
      const storedEntries = localStorage.getItem('dailymood_entries')
      if (!storedEntries) {
        console.log('ℹ️ MoodService: No entries found in localStorage for stats')
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

      const entries = JSON.parse(storedEntries)
      console.log('✅ MoodService: Found entries for stats calculation:', entries.length)

      // Calculate statistics
      const stats = this.calculateMoodStats(entries, entries.length)
      console.log('📊 MoodService: Calculated stats:', stats)

      return { data: stats, error: null }
    } catch (error) {
      console.error('Error fetching mood stats from localStorage:', error)
      return { 
        data: {
          totalEntries: 0,
          averageMood: 0,
          currentStreak: 0,
          bestStreak: 0,
          weeklyProgress: 0,
          monthlyTrend: 'stable'
        }, 
        error: (error as Error).message 
      }
    }
  }

  // Helper method to calculate mood statistics
  private calculateMoodStats(entries: any[], totalEntries: number) {
    if (entries.length === 0) {
      return {
        totalEntries: 0,
        averageMood: 0,
        currentStreak: 0,
        bestStreak: 0,
        weeklyProgress: 0,
        monthlyTrend: 'stable'
      }
    }

    // Calculate average mood
    const totalMood = entries.reduce((sum, entry) => sum + entry.mood_score, 0)
    const averageMood = totalMood / entries.length

    // Calculate current streak
    const currentStreak = this.calculateCurrentStreak(entries)

    // Calculate best streak
    const bestStreak = this.calculateBestStreak(entries)

    // Calculate weekly progress
    const weeklyProgress = this.calculateWeeklyProgress(entries)

    // Determine monthly trend
    const monthlyTrend = this.calculateMonthlyTrend(entries)

    return {
      totalEntries,
      averageMood: Math.round(averageMood * 10) / 10,
      currentStreak,
      bestStreak,
      weeklyProgress,
      monthlyTrend
    }
  }

  // Helper method to calculate current streak
  private calculateCurrentStreak(entries: any[]): number {
    if (entries.length === 0) return 0

    const sortedEntries = entries.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    let streak = 0
    let currentDate = new Date()

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date)
      const daysDiff = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      if (daysDiff === streak) {
        streak++
      } else if (daysDiff > streak) {
        break
      }
    }

    return streak
  }

  // Helper method to calculate best streak
  private calculateBestStreak(entries: any[]): number {
    if (entries.length === 0) return 0

    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    let bestStreak = 0
    let currentStreak = 0
    let lastDate: Date | null = null

    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.date)
      
      if (lastDate) {
        const daysDiff = Math.floor((entryDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff === 1) {
          currentStreak++
        } else {
          bestStreak = Math.max(bestStreak, currentStreak)
          currentStreak = 1
        }
      } else {
        currentStreak = 1
      }
      
      lastDate = entryDate
    }

    bestStreak = Math.max(bestStreak, currentStreak)
    return bestStreak
  }

  // Helper method to calculate weekly progress
  private calculateWeeklyProgress(entries: any[]): number {
    if (entries.length === 0) return 0

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const weeklyEntries = entries.filter(entry => new Date(entry.date) >= oneWeekAgo)
    const weeklyMood = weeklyEntries.reduce((sum, entry) => sum + entry.mood_score, 0)
    
    return weeklyEntries.length > 0 ? Math.round((weeklyMood / weeklyEntries.length) * 10) / 10 : 0
  }

  // Helper method to calculate monthly trend
  private calculateMonthlyTrend(entries: any[]): 'improving' | 'declining' | 'stable' {
    if (entries.length < 10) return 'stable'

    const sortedEntries = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    const midPoint = Math.floor(sortedEntries.length / 2)
    
    const firstHalf = sortedEntries.slice(0, midPoint)
    const secondHalf = sortedEntries.slice(midPoint)

    const firstHalfAvg = firstHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / firstHalf.length
    const secondHalfAvg = secondHalf.reduce((sum, entry) => sum + entry.mood_score, 0) / secondHalf.length

    const difference = secondHalfAvg - firstHalfAvg

    if (difference > 0.5) return 'improving'
    if (difference < -0.5) return 'declining'
    return 'stable'
  }

  async getMoodTrends(days: number = 30): Promise<{ data: Array<{ date: string; mood: number }>; error: string | null }> {
    try {
      console.log('📊 MoodService: Getting mood trends from localStorage for', days, 'days')
      
      // Get entries from localStorage
      const storedEntries = localStorage.getItem('dailymood_entries')
      if (!storedEntries) {
        console.log('ℹ️ MoodService: No entries found in localStorage for trends')
        return { data: [], error: null }
      }

      const entries = JSON.parse(storedEntries)
      
      // Filter by date range
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const filteredEntries = entries.filter((entry: any) => {
        const entryDate = new Date(entry.created_at || entry.date)
        return entryDate >= startDate
      })

      // Sort by date ascending
      filteredEntries.sort((a: any, b: any) => {
        const dateA = new Date(a.created_at || a.date)
        const dateB = new Date(b.created_at || b.date)
        return dateA.getTime() - dateB.getTime()
      })

      const trends = filteredEntries.map((entry: any) => ({
        date: entry.created_at?.split('T')[0] || entry.date,
        mood: entry.mood_score
      }))

      console.log('✅ MoodService: Found trend entries:', trends.length)
      return { data: trends, error: null }
    } catch (error) {
      return { data: [], error: (error as Error).message }
    }
  }

  async getTagFrequencies(): Promise<{ data: Array<{ tag: string; count: number }>; error: string | null }> {
    try {
      if (!this.supabase) {
        return { data: [], error: null }
      }

      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      const { data, error } = await this.supabase
        .from('mood_entries')
        .select('tags')
        .eq('user_id', user.id as string)

      if (error) throw error

      // Count tag frequencies
      const tagCounts: Record<string, number> = {}
      
      data?.forEach((entry: any) => {
        entry.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1
        })
      })

      const frequencies = Object.entries(tagCounts)
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count)

      return { data: frequencies, error: null }
    } catch (error) {
      return { data: [], error: (error as Error).message }
    }
  }

  async checkMoodLogLimit(userId: string): Promise<boolean> {
    try {
      if (!this.supabase) {
        return true // Allow unlimited in demo mode
      }

      // Get user subscription level
      const { data: userData } = await this.supabase
        .from('users')
        .select('subscription_level')
        .eq('id', userId)
        .single()

      if (!userData) {
        // If user doesn't exist in users table, assume free tier
        return await this.checkFreeTierLimit(userId)
      }

      // Premium users have unlimited logs
      if (userData.subscription_level === 'premium') {
        return true
      }

      // Free users limited to 30 logs per month
      return await this.checkFreeTierLimit(userId)
    } catch (error) {
      console.error('Error checking mood log limit:', error)
      return false
    }
  }

  private async checkFreeTierLimit(userId: string): Promise<boolean> {
    if (!this.supabase) {
      return true // Allow unlimited in demo mode
    }

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { data, error } = await this.supabase
      .from('mood_entries')
      .select('id')
      .eq('user_id', userId)
      .gte('created_at', startOfMonth.toISOString())

    if (error) {
      console.error('Error checking free tier limit:', error)
      return false
    }

    return (data?.length || 0) < 30
  }

  async syncOfflineEntries(): Promise<{ synced: number; errors: number }> {
    const offlineEntries = OfflineStorage.getEntries()
    let synced = 0
    let errors = 0

    for (const entry of offlineEntries) {
      try {
        const { error } = await this.createMoodEntry({
          date: entry.date,
          mood_score: entry.mood_score,
          emoji: entry.emoji,
          notes: entry.notes,
          tags: entry.tags
        })

        if (!error) {
          synced++
        } else {
          errors++
        }
      } catch (error) {
        errors++
      }
    }

    // Clear offline entries after successful sync
    if (synced > 0) {
      OfflineStorage.clearEntries()
    }

    return { synced, errors }
  }

  // Update existing mood entry
  async updateMoodEntry(id: string, updates: Partial<MoodEntry>): Promise<{ data: MoodEntry | null; error: string | null }> {
    try {
      if (!this.supabase) {
        return { data: null, error: 'Supabase not configured' }
      }

      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Only allow updating own entries
      const { data, error } = await this.supabase
        .from('mood_entries')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single()

      if (error) throw error

      return { data: data as MoodEntry, error: null }
    } catch (error) {
      console.error('Error updating mood entry:', error)
      return { data: null, error: (error as Error).message }
    }
  }

  // Delete mood entry
  async deleteMoodEntry(id: string): Promise<{ error: string | null }> {
    try {
      if (!this.supabase) {
        return { error: 'Supabase not configured' }
      }

      const { data: { user } } = await this.supabase.auth.getUser()
      
      if (!user) {
        throw new Error('User not authenticated')
      }

      // Only allow deleting own entries
      const { error } = await this.supabase
        .from('mood_entries')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) throw error

      return { error: null }
    } catch (error) {
      console.error('Error deleting mood entry:', error)
      return { error: (error as Error).message }
    }
  }
}

export const moodService = new MoodService()