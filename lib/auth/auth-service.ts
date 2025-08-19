import { supabase } from '@/app/lib/supabase-client'
import type { User, AuthError } from '@supabase/supabase-js'

export interface AuthResult {
  user: User | null
  error: AuthError | null
}

export interface SignUpData {
  email: string
  password: string
}

export interface SignInData {
  email: string
  password: string
}

export class AuthService {
  /**
   * Sign up a new user
   */
  async signUp({ email, password }: SignUpData): Promise<AuthResult> {
    try {
      console.log('🔐 AuthService: Starting sign up for:', email)
      
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(),
        password: password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`
        }
      })

      if (error) {
        console.error('❌ AuthService: Sign up error:', error.message)
        return { user: null, error }
      }

      console.log('✅ AuthService: Sign up successful for:', email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('💥 AuthService: Sign up exception:', error)
      return { 
        user: null, 
        error: { 
          message: 'Sign up failed', 
          name: 'SignUpError' 
        } as AuthError 
      }
    }
  }

  /**
   * Sign in an existing user
   */
  async signIn({ email, password }: SignInData): Promise<AuthResult> {
    try {
      console.log('🔐 AuthService: Starting sign in for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password: password
      })

      if (error) {
        console.error('❌ AuthService: Sign in error:', error.message)
        return { user: null, error }
      }

      console.log('✅ AuthService: Sign in successful for:', email)
      return { user: data.user, error: null }
    } catch (error) {
      console.error('💥 AuthService: Sign in exception:', error)
      return { 
        user: null, 
        error: { 
          message: 'Sign in failed', 
          name: 'SignInError' 
        } as AuthError 
      }
    }
  }

  /**
   * Sign out the current user
   */
  async signOut(): Promise<{ error: AuthError | null }> {
    try {
      console.log('🚪 AuthService: Starting sign out')
      
      const { error } = await supabase.auth.signOut()

      if (error) {
        console.error('❌ AuthService: Sign out error:', error.message)
        return { error }
      }

      console.log('✅ AuthService: Sign out successful')
      return { error: null }
    } catch (error) {
      console.error('💥 AuthService: Sign out exception:', error)
      return { 
        error: { 
          message: 'Sign out failed', 
          name: 'SignOutError' 
        } as AuthError 
      }
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<{ user: User | null; error: AuthError | null }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('❌ AuthService: Get user error:', error.message)
        return { user: null, error }
      }

      return { user, error: null }
    } catch (error) {
      console.error('💥 AuthService: Get user exception:', error)
      return { 
        user: null, 
        error: { 
          message: 'Failed to get user', 
          name: 'GetUserError' 
        } as AuthError 
      }
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.error('❌ AuthService: Get session error:', error.message)
        return { session: null, error }
      }

      return { session, error: null }
    } catch (error) {
      console.error('💥 AuthService: Get session exception:', error)
      return { 
        session: null, 
        error: { 
          message: 'Failed to get session', 
          name: 'GetSessionError' 
        } as AuthError 
      }
    }
  }

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 AuthService: Auth state changed:', event, session?.user?.email || 'No user')
      callback(event, session)
    })
  }
}

// Export singleton instance
export const authService = new AuthService()
