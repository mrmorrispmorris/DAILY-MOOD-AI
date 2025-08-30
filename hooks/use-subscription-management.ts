'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/app/lib/supabase-client'
import { analyticsService } from '@/lib/analytics/analytics-service'

export interface Subscription {
  id: string
  user_id: string
  status: 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'trialing' | 'unpaid'
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at?: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionManagement {
  subscription: Subscription | null
  loading: boolean
  error: string | null
  isActive: boolean
  isPremium: boolean
  daysUntilRenewal: number
  cancelSubscription: () => Promise<boolean>
  reactivateSubscription: () => Promise<boolean>
  updateBillingInfo: () => void
  refreshSubscription: () => Promise<void>
}

export function useSubscriptionManagement(): SubscriptionManagement {
  const { user } = useAuth()
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load subscription data
  useEffect(() => {
    if (user?.id) {
      loadSubscription()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const loadSubscription = async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('status', 'active')
        .order('current_period_end', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (fetchError) {
        console.error('Error loading subscription:', fetchError)
        setError('Failed to load subscription')
        return
      }

      setSubscription(data)
    } catch (err) {
      console.error('Exception loading subscription:', err)
      setError('Failed to load subscription')
    } finally {
      setLoading(false)
    }
  }

  const refreshSubscription = async () => {
    await loadSubscription()
  }

  // Calculate derived values
  const isActive = subscription?.status === 'active' && 
                   new Date(subscription.current_period_end) > new Date()

  const isPremium = isActive

  const daysUntilRenewal = subscription 
    ? Math.ceil((new Date(subscription.current_period_end).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    : 0

  const cancelSubscription = async (): Promise<boolean> => {
    if (!subscription) return false

    try {
      // Call API to cancel subscription
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: subscription.id 
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Track cancellation
        await analyticsService.trackEvent('subscription_cancelled', user?.id || '', {
          subscription_id: subscription.id,
          cancellation_reason: 'user_initiated'
        })

        // Refresh subscription data
        await loadSubscription()
        return true
      } else {
        setError(result.error || 'Failed to cancel subscription')
        return false
      }
    } catch (err) {
      console.error('Error cancelling subscription:', err)
      setError('Failed to cancel subscription')
      return false
    }
  }

  const reactivateSubscription = async (): Promise<boolean> => {
    if (!subscription || !subscription.cancel_at_period_end) return false

    try {
      // Call API to reactivate subscription
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: subscription.id 
        })
      })

      const result = await response.json()

      if (response.ok && result.success) {
        // Track reactivation
        await analyticsService.trackEvent('subscription_reactivated', user?.id || '', {
          subscription_id: subscription.id
        })

        // Refresh subscription data
        await loadSubscription()
        return true
      } else {
        setError(result.error || 'Failed to reactivate subscription')
        return false
      }
    } catch (err) {
      console.error('Error reactivating subscription:', err)
      setError('Failed to reactivate subscription')
      return false
    }
  }

  const updateBillingInfo = () => {
    if (!subscription) return

    // Redirect to Stripe customer portal for billing management
    const customerPortalUrl = `/api/stripe/customer-portal?subscription_id=${subscription.id}`
    window.location.href = customerPortalUrl
  }

  return {
    subscription,
    loading,
    error,
    isActive,
    isPremium,
    daysUntilRenewal,
    cancelSubscription,
    reactivateSubscription,
    updateBillingInfo,
    refreshSubscription
  }
}


