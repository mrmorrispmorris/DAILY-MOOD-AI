'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionLevel, setSubscriptionLevel] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(true)

  // Check if we're in demo mode or Supabase is not configured
  const isDemoMode = typeof window !== 'undefined' && (
    window.location.search.includes('demo=true') ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your-project-url' ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your-anon-key' ||
    process.env.NEXT_PUBLIC_SUPABASE_URL === 'your_supabase_project_url' ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY === 'your_supabase_anon_key'
  )

  useEffect(() => {
    const fetchSubscription = async () => {
      // If in demo mode, set to free tier
      if (isDemoMode) {
        setSubscriptionLevel('free')
        setLoading(false)
        return
      }

      if (!user) {
        setSubscriptionLevel('free')
        setLoading(false)
        return
      }

      try {
        // DISABLED: Users table causing 406 errors - skip subscription check for now
        console.log('⚠️ Subscription check disabled - users table causing 406 errors')
        console.log('📱 Defaulting to free tier until users table is fixed')
        setSubscriptionLevel('free')
        
        // COMMENTED OUT: Problematic users table query
        // const { createClient } = await import('@/lib/supabase/client')
        // const supabase = createClient()
        // 
        // const { data, error } = await supabase
        //   .from('users')
        //   .select('subscription_level')
        //   .eq('id', user.id)
        //   .single()
        //
        // if (error || !data) {
        //   // If user doesn't exist in users table, assume free
        //   setSubscriptionLevel('free')
        // } else {
        //   setSubscriptionLevel(data.subscription_level || 'free')
        // }
      } catch (error: any) {
        console.error('Error in subscription hook:', error)
        setSubscriptionLevel('free')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user, isDemoMode])

  const isPremium = subscriptionLevel === 'premium'
  const isFree = subscriptionLevel === 'free'

  return {
    subscriptionLevel,
    isPremium,
    isFree,
    loading
  }
}