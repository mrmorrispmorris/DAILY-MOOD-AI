import { createClient } from '@/lib/supabase/client'

export class UserService {
  private supabase: any = null

  constructor() {
    try {
      this.supabase = createClient()
      console.log('✅ UserService: Supabase client created successfully')
    } catch (error) {
      console.error('❌ UserService: Failed to create Supabase client:', error)
      this.supabase = null
    }
  }

  async ensureUserProfile(userId: string, email: string): Promise<boolean> {
    console.log('🔧 UserService: Ensuring user profile exists for:', email)
    
    if (!this.supabase) {
      console.log('⚠️ UserService: No Supabase client available')
      return false
    }

    try {
      // First, check if user already exists
      const { data: existingUser, error: checkError } = await this.supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingUser) {
        console.log('✅ UserService: User profile already exists')
        return true
      }

      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
        console.error('❌ UserService: Error checking user existence:', checkError)
        // Continue to try creating the user anyway
      }

      // Create user profile
      console.log('📝 UserService: Creating user profile...')
      const { data, error } = await this.supabase
        .from('users')
        .insert({
          id: userId,
          email: email,
          subscription_level: 'free',
          created_at: new Date().toISOString()
        })
        .select()
        .single()

      if (error) {
        console.error('❌ UserService: Failed to create user profile:', error)
        
        // If it's a duplicate key error, that's actually OK - user exists
        if (error.code === '23505') {
          console.log('✅ UserService: User profile already exists (duplicate key)')
          return true
        }
        
        return false
      }

      console.log('✅ UserService: User profile created successfully:', data)
      return true

    } catch (error) {
      console.error('💥 UserService: Exception ensuring user profile:', error)
      return false
    }
  }

  async getUserProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (error) {
        console.error('Error fetching user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Exception fetching user profile:', error)
      return null
    }
  }

  async updateUserProfile(userId: string, updates: any) {
    try {
      const { data, error } = await this.supabase
        .from('users')
        .update(updates)
        .eq('id', userId)
        .select()
        .single()

      if (error) {
        console.error('Error updating user profile:', error)
        return null
      }

      return data
    } catch (error) {
      console.error('Exception updating user profile:', error)
      return null
    }
  }
}

export const userService = new UserService()
