'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/app/lib/supabase-client'

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
        console.log('🔧 Subscription: Fetching subscription status for:', user.email)
        
        // First try to get from users table (synced from subscriptions)
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('subscription_status, current_period_end')
          .eq('auth_user_id', user.id)
          .single()

        if (userError) {
          console.log('⚠️ User not found in users table, checking subscriptions directly')
          
          // Fallback: Check subscriptions table directly
          const { data: subData, error: subError } = await supabase
            .from('subscriptions')
            .select('status, current_period_end')
            .eq('user_id', user.id)
            .eq('status', 'active')
            .single()

          if (subError || !subData) {
            console.log('ℹ️ No active subscription found, defaulting to free')
            setSubscriptionLevel('free')
          } else {
            // Check if subscription is still valid
            const periodEnd = new Date(subData.current_period_end)
            const now = new Date()
            
            if (periodEnd > now && subData.status === 'active') {
              console.log('✅ Active subscription found')
              setSubscriptionLevel('premium')
            } else {
              console.log('⚠️ Subscription expired or inactive')
              setSubscriptionLevel('free')
            }
          }
        } else {
          // Check users table subscription status
          if (userData.subscription_status === 'active') {
            // Verify subscription is still valid
            const periodEnd = userData.current_period_end ? new Date(userData.current_period_end) : null
            const now = new Date()
            
            if (!periodEnd || periodEnd > now) {
              console.log('✅ Active subscription from users table')
              setSubscriptionLevel('premium')
            } else {
              console.log('⚠️ Subscription period ended')
              setSubscriptionLevel('free')
            }
          } else {
            console.log('ℹ️ User subscription status:', userData.subscription_status)
            setSubscriptionLevel('free')
          }
        }
      } catch (error: any) {
        console.error('❌ Error fetching subscription:', error)
        setSubscriptionLevel('free')
      } finally {
        setLoading(false)
      }
    }

    fetchSubscription()
  }, [user])

  const isPremium = subscriptionLevel === 'premium'
  const isFree = subscriptionLevel === 'free'

  // Function to initiate subscription upgrade
  const upgradeToPremium = async () => {
    if (!user) {
      throw new Error('User must be authenticated to upgrade')
    }

    try {
      console.log('💳 Initiating premium upgrade for:', user.email)
      
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          email: user.email,
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1234567890'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create checkout session')
      }

      const { sessionId } = await response.json()
      
      // Redirect to Stripe Checkout
      const stripe = await import('@stripe/stripe-js').then(mod => 
        mod.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      )
      
      if (stripe) {
        await stripe.redirectToCheckout({ sessionId })
      } else {
        throw new Error('Stripe failed to load')
      }
      
    } catch (error: any) {
      console.error('❌ Error upgrading to premium:', error)
      throw error
    }
  }

  // Function to cancel subscription
  const cancelSubscription = async () => {
    if (!user) {
      throw new Error('User must be authenticated to cancel subscription')
    }

    try {
      console.log('🗑️ Canceling subscription for:', user.email)
      
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to cancel subscription')
      }

      console.log('✅ Subscription cancellation initiated')
      
      // Refresh subscription status
      window.location.reload()
      
    } catch (error: any) {
      console.error('❌ Error canceling subscription:', error)
      throw error
    }
  }

  return {
    subscriptionLevel,
    isPremium,
    isFree,
    loading,
    upgradeToPremium,
    cancelSubscription
  }
}