import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/auth-helpers-nextjs'

export class SessionManager {
  private static instance: SessionManager
  private supabaseClient: any = null
  private supabaseInitialized = false

  private get supabase() {
    if (!this.supabaseInitialized) {
      try {
        this.supabaseClient = createClient()
        this.supabaseInitialized = true
      } catch (error) {
        console.warn('Supabase not configured, session manager disabled')
        this.supabaseClient = null
        this.supabaseInitialized = true
      }
    }
    return this.supabaseClient
  }
  
  static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager()
    }
    return SessionManager.instance
  }

  async establishSession(email: string, password: string): Promise<{
    success: boolean
    user?: User
    session?: any
    error?: string
    method?: string
  }> {
    if (!this.supabase) {
      return {
        success: false,
        error: 'Supabase not configured',
        method: 'none'
      }
    }

    console.log('🔐 SessionManager: Starting session establishment')
    
    // Method 1: Standard sign in
    try {
      console.log('📝 Method 1: Standard signInWithPassword')
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      
      if (error) throw error
      
      if (data.session && data.user) {
        console.log('✅ Method 1: Success with immediate session')
        return {
          success: true,
          user: data.user,
          session: data.session,
          method: 'standard'
        }
      }
    } catch (error: any) {
      console.log(`❌ Method 1 failed: ${error.message}`)
    }

    // Method 2: Sign in with retry and session polling
    try {
      console.log('🔄 Method 2: Sign in with session polling')
      
      // Clear any existing session first
      await this.supabase.auth.signOut()
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      })
      
      if (error) throw error
      
      // Poll for session establishment
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: sessionData } = await this.supabase.auth.getSession()
        if (sessionData.session) {
          console.log(`✅ Method 2: Session found after ${i + 1} attempts`)
          return {
            success: true,
            user: sessionData.session.user,
            session: sessionData.session,
            method: 'polling'
          }
        }
      }
    } catch (error: any) {
      console.log(`❌ Method 2 failed: ${error.message}`)
    }

    return {
      success: false,
      error: 'All session establishment methods failed',
      method: 'none'
    }
  }

  async verifySession(): Promise<{ valid: boolean; user?: User }> {
    if (!this.supabase) {
      return { valid: false }
    }

    try {
      const { data: { session }, error } = await this.supabase.auth.getSession()
      
      if (error || !session) {
        return { valid: false }
      }

      // Verify the session is actually valid by making an authenticated request
      const { data: userData, error: userError } = await this.supabase.auth.getUser()
      
      if (userError || !userData.user) {
        return { valid: false }
      }

      return { valid: true, user: userData.user }
    } catch (error) {
      return { valid: false }
    }
  }

  async forceSessionRefresh(): Promise<boolean> {
    if (!this.supabase) {
      return false
    }

    try {
      const { data, error } = await this.supabase.auth.refreshSession()
      return !error && !!data.session
    } catch (error) {
      return false
    }
  }
}

export const sessionManager = SessionManager.getInstance()