'use client'

import { useState, useEffect } from 'react'
import { authService } from '@/lib/auth/auth-service'
import type { User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  loading: boolean
  error: string | null
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  })

  useEffect(() => {
    let mounted = true
    let subscription: any = null

    const initializeAuth = async () => {
      try {
        // Get current user
        const { user, error } = await authService.getCurrentUser()
        
        if (!mounted) return

        if (error) {
          setState({ user: null, loading: false, error: error.message })
          return
        }

        setState({ user, loading: false, error: null })

        // Set up auth state listener
        const { data: { subscription: authSub } } = authService.onAuthStateChange(
          (event, session) => {
            if (!mounted) return

            console.log('🔄 useAuth: Auth state change:', event, session?.user?.email || 'No user')

            if (event === 'SIGNED_IN' && session?.user) {
              setState({ user: session.user, loading: false, error: null })
            } else if (event === 'SIGNED_OUT') {
              setState({ user: null, loading: false, error: null })
            } else if (event === 'TOKEN_REFRESHED' && session?.user) {
              setState({ user: session.user, loading: false, error: null })
            }
          }
        )

        subscription = authSub
      } catch (error) {
        if (mounted) {
          setState({ 
            user: null, 
            loading: false, 
            error: 'Failed to initialize authentication'
          })
        }
      }
    }

    initializeAuth()

    return () => {
      mounted = false
      if (subscription) {
        subscription.unsubscribe()
      }
    }
  }, [])

  const signUp = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { user, error } = await authService.signUp({ email, password })
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return { success: false, error: error.message }
    }

    setState({ user, loading: false, error: null })
    return { success: true, error: null }
  }

  const signIn = async (email: string, password: string) => {
    setState(prev => ({ ...prev, loading: true, error: null }))
    
    const { user, error } = await authService.signIn({ email, password })
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return { success: false, error: error.message }
    }

    setState({ user, loading: false, error: null })
    return { success: true, error: null }
  }

  const signOut = async () => {
    setState(prev => ({ ...prev, loading: true }))
    
    const { error } = await authService.signOut()
    
    if (error) {
      setState(prev => ({ ...prev, loading: false, error: error.message }))
      return { success: false, error: error.message }
    }

    setState({ user: null, loading: false, error: null })
    return { success: true, error: null }
  }

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signUp,
    signIn,
    signOut,
    isAuthenticated: !!state.user
  }
}