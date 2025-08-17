'use client'

import { useEffect, useState } from 'react'
import { User } from '@supabase/auth-helpers-nextjs'

// TRUE SINGLETON - Global state that exists only once
const AuthState = {
  user: null as User | null,
  loading: true,
  initialized: false,
  initializing: false,
  listeners: new Set<(user: User | null, loading: boolean) => void>(),
  supabase: null as any,
  subscription: null as any
}

// Notify all listeners when state changes
function notifyListeners(user: User | null, loading: boolean) {
  AuthState.user = user
  AuthState.loading = loading
  AuthState.listeners.forEach(listener => listener(user, loading))
}

// Initialize auth ONLY ONCE for the entire application
async function initializeAuth(): Promise<void> {
  // Prevent multiple initializations
  if (AuthState.initialized || AuthState.initializing) {
    return
  }

  AuthState.initializing = true
  console.log('🔧 AuthManager: Starting TRUE SINGLETON initialization')

  try {
    // Clear all emergency/demo data
    if (typeof window !== 'undefined') {
      console.log('🧹 Clearing all emergency/demo mode data (TRUE SINGLETON)')
      localStorage.removeItem('emergency_access')
      localStorage.removeItem('emergency_email')
      localStorage.removeItem('emergency_auth_type')
      localStorage.removeItem('emergency_auth_time')
      localStorage.removeItem('demo_mode')
      localStorage.removeItem('dailymood_auth_success')
      localStorage.removeItem('dailymood_user_email')
    }

    // Create Supabase client
    const { createClient } = await import('@/lib/supabase/client')
    AuthState.supabase = createClient()

    // Get current session
    const { data: { session }, error: sessionError } = await AuthState.supabase.auth.getSession()

    if (sessionError) {
      console.error('❌ AuthManager: Session error:', sessionError.message)
      notifyListeners(null, false)
    } else if (session?.user) {
      console.log('✅ AuthManager: Found existing session for:', session.user.email)
      await handleUserAuth(session.user)
    } else {
      console.log('ℹ️ AuthManager: No existing session found')
      notifyListeners(null, false)
    }

    // Set up auth state listener (ONLY ONCE EVER)
    if (!AuthState.subscription) {
      const { data: { subscription } } = AuthState.supabase.auth.onAuthStateChange(
        async (event: string, session: any) => {
          console.log('🔄 AuthManager: Auth state changed:', event, session?.user?.email || 'No user')

          if (session?.user) {
            await handleUserAuth(session.user)
          } else if (event === 'SIGNED_OUT') {
            console.log('🚪 AuthManager: User signed out')
            notifyListeners(null, false)
          }
        }
      )
      AuthState.subscription = subscription
    }

    AuthState.initialized = true
    console.log('✅ AuthManager: TRUE SINGLETON initialization complete')

  } catch (error) {
    console.error('💥 AuthManager: Failed to initialize:', error)
    notifyListeners(null, false)
  } finally {
    AuthState.initializing = false
  }
}

async function handleUserAuth(user: User) {
  console.log('✅ AuthManager: User authenticated:', user.email)

  // TEMPORARILY BYPASS user profile creation to test direct mood entry insertion
  console.log('⚠️ AuthManager: BYPASSING user profile creation for database testing')
  
  // Ensure user profile exists
  // try {
  //   const { userService } = await import('@/lib/supabase/user-service')
  //   const success = await userService.ensureUserProfile(user.id, user.email!)
  //   
  //   if (success) {
  //     console.log('✅ AuthManager: User profile ensured successfully')
  //   } else {
  //     console.warn('⚠️ AuthManager: Failed to ensure user profile, but continuing...')
  //   }
  // } catch (error) {
  //   console.error('❌ AuthManager: Failed to ensure user profile:', error)
  //   // Continue anyway - user is authenticated via Supabase auth
  // }

  notifyListeners(user, false)
}

async function signOut() {
  console.log('🚪 AuthManager: Signing out...')

  try {
    if (AuthState.supabase) {
      const { error } = await AuthState.supabase.auth.signOut()
      if (error) {
        console.error('❌ AuthManager: Sign out error:', error)
      } else {
        console.log('✅ AuthManager: Sign out successful')
      }
    }
  } catch (error) {
    console.error('💥 AuthManager: Error during sign out:', error)
  }

  // Clear localStorage
  if (typeof window !== 'undefined') {
    localStorage.clear()
  }

  notifyListeners(null, false)
  window.location.href = '/login'
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(AuthState.user)
  const [loading, setLoading] = useState(AuthState.loading)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    console.log('🔧 useAuth: Hook subscribing to global auth state')

    // Initialize auth if not already done
    if (!AuthState.initialized && !AuthState.initializing) {
      initializeAuth()
    }

    // Subscribe to auth state changes
    const listener = (newUser: User | null, newLoading: boolean) => {
      setUser(newUser)
      setLoading(newLoading)
    }

    AuthState.listeners.add(listener)

    // Set current state
    setUser(AuthState.user)
    setLoading(AuthState.loading)

    // Cleanup
    return () => {
      AuthState.listeners.delete(listener)
    }
  }, [mounted])

  return { user, loading, signOut }
}