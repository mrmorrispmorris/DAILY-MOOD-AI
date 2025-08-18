'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'

export function useSubscription() {
  const { user } = useAuth()
  const [subscriptionLevel, setSubscriptionLevel] = useState<'free' | 'premium'>('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) {
        setSubscriptionLevel('free')
        setLoading(false)
        return
      }

      try {
        // For now, default all users to free tier
        // This can be extended later to check a users table or subscription service
        console.log('🔧 Subscription: Defaulting to free tier for user:', user.email)
        setSubscriptionLevel('free')
      } catch (error: any) {
        console.error('Error in subscription hook:', error)
        setSubscriptionLevel('free')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const isPremium = subscriptionLevel === 'premium'
  const isFree = subscriptionLevel === 'free'

  return {
    subscriptionLevel,
    isPremium,
    isFree,
    loading
  }
}