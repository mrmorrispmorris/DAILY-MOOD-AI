'use client'
import { useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { trackEvent, identifyUser, trackPageView, trackRevenue, EVENTS } from '@/lib/analytics'

export function useAnalytics() {
  const { user } = useAuth()
  
  // Auto-identify user when they log in
  useEffect(() => {
    if (user?.id) {
      identifyUser(user.id, {
        email: user.email,
        name: user.user_metadata?.name,
        created_at: user.created_at,
        subscription_level: user.user_metadata?.subscription_level || 'free',
        signup_source: user.user_metadata?.signup_source || 'direct'
      })
    }
  }, [user])
  
  return {
    // Core tracking functions
    track: trackEvent,
    identify: identifyUser,
    trackPage: trackPageView,
    trackRevenue,
    
    // Convenience functions for common events
    trackSignup: (method?: string) => {
      trackEvent(EVENTS.SIGNUP_COMPLETED, { method })
    },
    
    trackMoodLogged: (mood: number, tags?: string[], notes?: string) => {
      trackEvent(EVENTS.MOOD_LOGGED, {
        mood_score: mood,
        has_tags: tags && tags.length > 0,
        tag_count: tags?.length || 0,
        has_notes: !!notes,
        note_length: notes?.length || 0
      })
    },
    
    trackFirstMood: (mood: number) => {
      trackEvent(EVENTS.FIRST_MOOD_LOGGED, {
        mood_score: mood,
        days_since_signup: user?.created_at ? 
          Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
      })
    },
    
    trackInsightViewed: (insightType: string, source: string) => {
      trackEvent(EVENTS.INSIGHT_VIEWED, {
        insight_type: insightType,
        source
      })
    },
    
    trackPatternDiscovered: (patternType: string, confidence: number) => {
      trackEvent(EVENTS.PATTERN_DISCOVERED, {
        pattern_type: patternType,
        confidence_score: confidence
      })
    },
    
    trackSubscription: (plan: string, amount: number) => {
      trackRevenue(amount, {
        plan,
        billing_cycle: plan.includes('annual') ? 'annual' : 'monthly'
      })
    },
    
    trackUpgradePrompt: (trigger: string, location: string) => {
      trackEvent(EVENTS.UPGRADE_PROMPT_SHOWN, {
        trigger,
        location
      })
    },
    
    trackError: (error: Error, context?: string) => {
      trackEvent(EVENTS.ERROR_OCCURRED, {
        error_message: error.message,
        error_stack: error.stack,
        context,
        url: window.location.href
      })
    },
    
    trackPerformance: (metric: string, value: number, threshold?: number) => {
      const isSlowLoad = threshold && value > threshold
      
      trackEvent(isSlowLoad ? EVENTS.PAGE_LOAD_SLOW : 'Performance Metric', {
        metric,
        value,
        threshold,
        is_slow: isSlowLoad
      })
    },
    
    trackEngagement: (action: string, duration?: number) => {
      trackEvent('User Engagement', {
        action,
        duration_seconds: duration,
        engagement_level: duration ? (
          duration < 10 ? 'low' : 
          duration < 60 ? 'medium' : 'high'
        ) : undefined
      })
    }
  }
}

// Hook for tracking component mount/unmount
export function usePageAnalytics(pageName: string, additionalProps?: any) {
  useEffect(() => {
    trackPageView(pageName, additionalProps)
  }, [pageName, additionalProps])
}

// Hook for tracking user interactions
export function useInteractionTracking() {
  return {
    trackClick: (element: string, location?: string) => {
      trackEvent('Element Clicked', { element, location })
    },
    
    trackFormSubmit: (formName: string, success: boolean, errors?: string[]) => {
      trackEvent('Form Submitted', {
        form_name: formName,
        success,
        errors,
        error_count: errors?.length || 0
      })
    },
    
    trackDownload: (fileName: string, fileType: string) => {
      trackEvent('File Downloaded', {
        file_name: fileName,
        file_type: fileType
      })
    },
    
    trackSearch: (query: string, resultCount?: number) => {
      trackEvent('Search Performed', {
        query: query.toLowerCase(),
        query_length: query.length,
        result_count: resultCount
      })
    },
    
    trackShare: (content: string, platform: string) => {
      trackEvent('Content Shared', {
        content_type: content,
        platform
      })
    }
  }
}

// Hook for tracking business metrics
export function useBusinessMetrics() {
  const { user } = useAuth()
  
  return {
    trackActivation: () => {
      if (user?.id) {
        trackEvent('User Activated', {
          user_id: user.id,
          days_to_activation: user.created_at ? 
            Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
        })
      }
    },
    
    trackRetention: (daysSinceLastVisit: number) => {
      trackEvent('User Returned', {
        days_since_last_visit: daysSinceLastVisit,
        retention_bucket: daysSinceLastVisit <= 1 ? 'daily' :
                         daysSinceLastVisit <= 7 ? 'weekly' :
                         daysSinceLastVisit <= 30 ? 'monthly' : 'at_risk'
      })
    },
    
    trackFeatureDiscovery: (feature: string, timeToDiscover?: number) => {
      trackEvent(EVENTS.FEATURE_DISCOVERED, {
        feature,
        time_to_discover_days: timeToDiscover
      })
    },
    
    trackChurn: (reason?: string, feedback?: string) => {
      trackEvent('User Churned', {
        reason,
        feedback,
        lifetime_value_days: user?.created_at ? 
          Math.floor((Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0
      })
    }
  }
}