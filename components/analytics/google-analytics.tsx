'use client'

import { useEffect, useCallback } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'

interface GoogleAnalyticsProps {
  measurementId: string
}

declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export function GoogleAnalytics({ measurementId }: GoogleAnalyticsProps) {
  const { user } = useAuth()
  const { subscriptionLevel, isPremium } = useSubscription()

  useEffect(() => {
    // Initialize Google Analytics
    if (typeof window !== 'undefined' && !window.gtag) {
      // Load Google Analytics script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = function() {
        window.dataLayer.push(arguments)
      }
      window.gtag('js', new Date())
      window.gtag('config', measurementId, {
        page_title: document.title,
        page_location: window.location.href,
        custom_map: {
          dimension1: 'user_type',
          dimension2: 'subscription_status',
          dimension3: 'mood_count',
          dimension4: 'conversion_stage',
          dimension5: 'ab_test_variant',
          dimension6: 'user_engagement_level',
          dimension7: 'feature_usage_count',
          dimension8: 'trial_conversion_probability'
        }
      })
    }
  }, [measurementId])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag && user) {
      window.gtag('config', measurementId, { 
        user_id: user.id, 
        custom_map: { 
          dimension1: 'user_type', 
          dimension2: 'subscription_status', 
          dimension3: 'mood_count',
          dimension4: 'conversion_stage',
          dimension5: 'ab_test_variant',
          dimension6: 'user_engagement_level',
          dimension7: 'feature_usage_count',
          dimension8: 'trial_conversion_probability'
        } 
      })
      window.gtag('set', { 
        user_type: isPremium ? 'premium' : 'free', 
        subscription_status: subscriptionLevel, 
        user_id: user.id,
        conversion_stage: isPremium ? 'converted' : 'prospect',
        user_engagement_level: getEngagementLevel(),
        feature_usage_count: getFeatureUsageCount(),
        trial_conversion_probability: calculateTrialConversionProbability()
      })
      window.gtag('event', 'login', { method: 'supabase', user_id: user.id })
    }
  }, [user, isPremium, subscriptionLevel, measurementId])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      // Track page views
      const handleRouteChange = () => {
        window.gtag('config', measurementId, {
          page_title: document.title,
          page_location: window.location.href
        })
      }

      // Track current page
      handleRouteChange()

      // Listen for route changes (Next.js)
      window.addEventListener('popstate', handleRouteChange)
      
      return () => {
        window.removeEventListener('popstate', handleRouteChange)
      }
    }
  }, [measurementId])

  // Calculate user engagement level based on various metrics
  const getEngagementLevel = useCallback(() => {
    if (!user) return 'unknown'
    
    const moodCount = parseInt(localStorage.getItem(`dailymood-mood-count-${user.id}`) || '0')
    const featureUsage = parseInt(localStorage.getItem(`dailymood-feature-usage-${user.id}`) || '0')
    const sessionCount = parseInt(localStorage.getItem(`dailymood-sessions-${user.id}`) || '0')
    
    const score = moodCount * 0.4 + featureUsage * 0.3 + sessionCount * 0.3
    
    if (score >= 20) return 'high'
    if (score >= 10) return 'medium'
    if (score >= 5) return 'low'
    return 'minimal'
  }, [user])

  // Get feature usage count
  const getFeatureUsageCount = useCallback(() => {
    if (!user) return 0
    
    const features = ['mood_logging', 'charts', 'goals', 'insights', 'tags', 'streaks']
    let count = 0
    
    features.forEach(feature => {
      if (localStorage.getItem(`dailymood-${feature}-used-${user.id}`)) {
        count++
      }
    })
    
    return count
  }, [user])

  // Calculate trial conversion probability based on user behavior
  const calculateTrialConversionProbability = useCallback(() => {
    if (!user || isPremium) return 100
    
    const moodCount = parseInt(localStorage.getItem(`dailymood-mood-count-${user.id}`) || '0')
    const featureUsage = parseInt(localStorage.getItem(`dailymood-feature-usage-${user.id}`) || '0')
    const sessionCount = parseInt(localStorage.getItem(`dailymood-sessions-${user.id}`) || '0')
    const premiumTeaserClicks = parseInt(localStorage.getItem(`dailymood-teaser-clicks-${user.id}`) || '0')
    
    // Algorithm: Higher engagement = higher conversion probability
    let probability = 20 // Base 20%
    
    if (moodCount >= 20) probability += 25
    if (moodCount >= 50) probability += 15
    if (featureUsage >= 3) probability += 20
    if (sessionCount >= 10) probability += 15
    if (premiumTeaserClicks >= 1) probability += 5
    
    return Math.min(probability, 95) // Cap at 95%
  }, [user, isPremium])

  // Track custom events
  const trackEvent = useCallback((eventName: string, parameters: any = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, {
        ...parameters,
        user_type: isPremium ? 'premium' : 'free',
        subscription_status: subscriptionLevel,
        user_id: user?.id,
        conversion_stage: isPremium ? 'converted' : 'prospect',
        user_engagement_level: getEngagementLevel(),
        feature_usage_count: getFeatureUsageCount(),
        trial_conversion_probability: calculateTrialConversionProbability()
      })
    }
  }, [isPremium, subscriptionLevel, user, getEngagementLevel, getFeatureUsageCount, calculateTrialConversionProbability])

  // Track mood logging with enhanced metrics
  const trackMoodLog = useCallback((moodScore: number, tags: string[] = []) => {
    trackEvent('mood_logged', {
      mood_score: moodScore,
      tags: tags.join(','),
      event_category: 'engagement',
      event_label: 'mood_logging',
      mood_count: parseInt(localStorage.getItem(`dailymood-mood-count-${user?.id}`) || '0'),
      streak_count: parseInt(localStorage.getItem(`dailymood-streak-${user?.id}`) || '0')
    })
  }, [trackEvent, user])

  // Track feature usage with conversion intent
  const trackFeatureUsage = useCallback((featureName: string, action: string = 'used', conversionIntent?: boolean) => {
    trackEvent('feature_used', {
      feature_name: featureName,
      action: action,
      event_category: 'engagement',
      event_label: featureName,
      conversion_intent: conversionIntent || false,
      feature_usage_count: getFeatureUsageCount(),
      user_engagement_level: getEngagementLevel()
    })
  }, [trackEvent, getFeatureUsageCount, getEngagementLevel])

  // Track conversion funnel steps with enhanced analytics
  const trackConversionStep = useCallback((step: string, value?: number, metadata?: any) => {
    trackEvent('conversion_step', {
      step: step,
      value: value,
      event_category: 'conversion',
      event_label: step,
      funnel_position: getFunnelPosition(step),
      drop_off_rate: calculateDropOffRate(step),
      conversion_probability: calculateTrialConversionProbability(),
      ...metadata
    })
  }, [trackEvent, calculateTrialConversionProbability])

  // Track subscription events with revenue metrics
  const trackSubscriptionEvent = useCallback((action: string, plan?: string, price?: number, metadata?: any) => {
    trackEvent('subscription_event', {
      action: action,
      plan: plan,
      price: price,
      event_category: 'subscription',
      event_label: action,
      lifetime_value: calculateLifetimeValue(plan, price),
      churn_risk: calculateChurnRisk(),
      upgrade_potential: calculateUpgradePotential(),
      ...metadata
    })
  }, [trackEvent])

  // Track in-app purchase with conversion optimization
  const trackInAppPurchase = useCallback((itemId: string, itemName: string, price: number, metadata?: any) => {
    trackEvent('purchase', {
      transaction_id: `purchase_${Date.now()}`,
      value: price,
      currency: 'USD',
      items: [{
        item_id: itemId,
        item_name: itemName,
        price: price,
        quantity: 1
      }],
      purchase_funnel: getPurchaseFunnel(itemId),
      conversion_optimization: true,
      ...metadata
    })
  }, [trackEvent])

  // Track user engagement with predictive analytics
  const trackEngagement = useCallback((action: string, value?: number, metadata?: any) => {
    trackEvent('engagement', {
      action: action,
      value: value,
      event_category: 'engagement',
      event_label: action,
      engagement_score: calculateEngagementScore(),
      retention_probability: calculateRetentionProbability(),
      premium_upgrade_likelihood: calculatePremiumUpgradeLikelihood(),
      ...metadata
    })
  }, [trackEvent])

  // Track errors with user context
  const trackError = useCallback((error: string, context?: string, metadata?: any) => {
    trackEvent('error', {
      error_message: error,
      context: context,
      event_category: 'error',
      event_label: error,
      user_impact: calculateUserImpact(error),
      recovery_suggestion: getRecoverySuggestion(error),
      ...metadata
    })
  }, [trackEvent])

  // Helper functions for advanced analytics
  const getFunnelPosition = (step: string) => {
    const funnel = ['awareness', 'interest', 'consideration', 'intent', 'evaluation', 'purchase']
    return funnel.indexOf(step) + 1
  }

  const calculateDropOffRate = (step: string) => {
    // This would typically come from historical data
    const dropOffRates: { [key: string]: number } = {
      'awareness': 0,
      'interest': 15,
      'consideration': 25,
      'intent': 35,
      'evaluation': 45,
      'purchase': 0
    }
    return dropOffRates[step] || 0
  }

  const calculateLifetimeValue = (plan?: string, price?: number) => {
    if (!plan || !price) return 0
    
    const avgRetentionMonths = plan === 'premium' ? 18 : plan === 'pro' ? 24 : 12
    return price * avgRetentionMonths
  }

  const calculateChurnRisk = () => {
    if (!user) return 'unknown'
    
    const lastActivity = localStorage.getItem(`dailymood-last-activity-${user.id}`)
    if (!lastActivity) return 'high'
    
    const daysSinceActivity = (Date.now() - parseInt(lastActivity)) / (1000 * 60 * 60 * 24)
    
    if (daysSinceActivity > 30) return 'high'
    if (daysSinceActivity > 14) return 'medium'
    if (daysSinceActivity > 7) return 'low'
    return 'minimal'
  }

  const calculateUpgradePotential = () => {
    if (!user || isPremium) return 0
    
    const featureUsage = getFeatureUsageCount()
    const engagementLevel = getEngagementLevel()
    
    if (engagementLevel === 'high' && featureUsage >= 4) return 90
    if (engagementLevel === 'medium' && featureUsage >= 3) return 70
    if (engagementLevel === 'low' && featureUsage >= 2) return 50
    return 30
  }

  const getPurchaseFunnel = (itemId: string) => {
    const funnels: { [key: string]: string } = {
      'lifetime-ai': 'ai_insights_funnel',
      'premium-charts': 'analytics_funnel',
      'goal-mastery': 'goals_funnel',
      'productivity-boost': 'productivity_funnel',
      'community-access': 'social_funnel',
      'data-security': 'security_funnel'
    }
    return funnels[itemId] || 'general_funnel'
  }

  const calculateEngagementScore = () => {
    if (!user) return 0
    
    const moodCount = parseInt(localStorage.getItem(`dailymood-mood-count-${user.id}`) || '0')
    const featureUsage = getFeatureUsageCount()
    const sessionCount = parseInt(localStorage.getItem(`dailymood-sessions-${user.id}`) || '0')
    
    return Math.min((moodCount * 0.4 + featureUsage * 0.3 + sessionCount * 0.3) * 10, 100)
  }

  const calculateRetentionProbability = () => {
    if (!user) return 0
    
    const engagementScore = calculateEngagementScore()
    const moodCount = parseInt(localStorage.getItem(`dailymood-mood-count-${user.id}`) || '0')
    
    if (engagementScore >= 80 && moodCount >= 30) return 95
    if (engagementScore >= 60 && moodCount >= 20) return 85
    if (engagementScore >= 40 && moodCount >= 10) return 70
    if (engagementScore >= 20 && moodCount >= 5) return 50
    return 30
  }

  const calculatePremiumUpgradeLikelihood = () => {
    if (!user || isPremium) return 0
    
    const engagementScore = calculateEngagementScore()
    const featureUsage = getFeatureUsageCount()
    const premiumTeaserClicks = parseInt(localStorage.getItem(`dailymood-teaser-clicks-${user.id}`) || '0')
    
    let likelihood = 20 // Base 20%
    
    if (engagementScore >= 80) likelihood += 30
    if (engagementScore >= 60) likelihood += 20
    if (featureUsage >= 4) likelihood += 25
    if (premiumTeaserClicks >= 1) likelihood += 15
    
    return Math.min(likelihood, 90)
  }

  const calculateUserImpact = (error: string) => {
    const criticalErrors = ['payment_failed', 'data_loss', 'auth_error']
    const mediumErrors = ['api_timeout', 'network_error', 'validation_error']
    
    if (criticalErrors.some(e => error.includes(e))) return 'critical'
    if (mediumErrors.some(e => error.includes(e))) return 'medium'
    return 'low'
  }

  const getRecoverySuggestion = (error: string) => {
    const suggestions: { [key: string]: string } = {
      'payment_failed': 'Check payment method and try again',
      'data_loss': 'Data is backed up, refresh to restore',
      'auth_error': 'Please log in again',
      'api_timeout': 'Please try again in a moment',
      'network_error': 'Check your internet connection'
    }
    
    for (const [key, suggestion] of Object.entries(suggestions)) {
      if (error.includes(key)) return suggestion
    }
    
    return 'Please try again or contact support'
  }

  // Now add the useEffect that depends on these functions
  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      const status = subscriptionLevel
      const plan = subscriptionLevel === 'premium' ? 'Premium' : 'Free'
      const price = subscriptionLevel === 'premium' ? 9.99 : 0
      window.gtag('set', { 
        subscription_status: status, 
        subscription_plan: plan, 
        subscription_price: price,
        user_engagement_level: getEngagementLevel(),
        feature_usage_count: getFeatureUsageCount(),
        trial_conversion_probability: calculateTrialConversionProbability()
      })
      if (status === 'premium') {
        trackSubscriptionEvent('subscription_active', plan, price)
      } else {
        trackSubscriptionEvent('subscription_free', plan, price)
      }
    }
  }, [subscriptionLevel, trackSubscriptionEvent, getEngagementLevel, getFeatureUsageCount, calculateTrialConversionProbability])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        user_id: user?.id,
        user_engagement_level: getEngagementLevel(),
        conversion_stage: isPremium ? 'converted' : 'prospect'
      })
    }
  }, [user, trackEvent, getEngagementLevel, isPremium])

  // Expose tracking functions globally for other components
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).trackMoodLog = trackMoodLog
      ;(window as any).trackFeatureUsage = trackFeatureUsage
      ;(window as any).trackConversionStep = trackConversionStep
      ;(window as any).trackSubscriptionEvent = trackSubscriptionEvent
      ;(window as any).trackInAppPurchase = trackInAppPurchase
      ;(window as any).trackEngagement = trackEngagement
      ;(window as any).trackError = trackError
    }
  }, [trackMoodLog, trackFeatureUsage, trackConversionStep, trackSubscriptionEvent, trackInAppPurchase, trackEngagement, trackError])

  return null // This component doesn't render anything
}

// Analytics utility functions
export const analytics = {
  // Track page view
  pageView: (title: string, path: string) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('config', 'GA_MEASUREMENT_ID', {
        page_title: title,
        page_location: path
      })
    }
  },

  // Track custom event
  event: (eventName: string, parameters: any = {}) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', eventName, parameters)
    }
  },

  // Track conversion
  conversion: (conversionId: string, value?: number) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'conversion', {
        send_to: conversionId,
        value: value
      })
    }
  },

  // Track revenue optimization metrics
  trackRevenueMetrics: (metrics: {
    mrr?: number
    arr?: number
    churnRate?: number
    ltv?: number
    conversionRate?: number
  }) => {
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'revenue_metrics', {
        event_category: 'business',
        event_label: 'revenue_tracking',
        ...metrics
      })
    }
  }
}
