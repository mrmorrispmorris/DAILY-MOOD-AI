// Advanced analytics system for DailyMood AI
// Note: In production, install mixpanel-browser: npm install mixpanel-browser

interface AnalyticsEvent {
  event_name: string
  properties?: Record<string, any>
  user_id?: string
  timestamp?: string
}

// Core tracking events for the business
export const EVENTS = {
  // Onboarding & Acquisition
  SIGNUP_STARTED: 'Signup Started',
  SIGNUP_COMPLETED: 'Signup Completed',
  ONBOARDING_STARTED: 'Onboarding Started',
  ONBOARDING_COMPLETED: 'Onboarding Completed',
  EMAIL_VERIFIED: 'Email Verified',
  
  // Activation
  FIRST_MOOD_LOGGED: 'First Mood Logged',
  PROFILE_COMPLETED: 'Profile Completed',
  NOTIFICATION_ENABLED: 'Notifications Enabled',
  APP_INSTALLED: 'PWA Installed',
  
  // Engagement
  MOOD_LOGGED: 'Mood Logged',
  INSIGHT_VIEWED: 'Insight Viewed',
  PATTERN_DISCOVERED: 'Pattern Discovered',
  EXPORT_CREATED: 'Export Created',
  DASHBOARD_VIEWED: 'Dashboard Viewed',
  BLOG_POST_READ: 'Blog Post Read',
  
  // Social & Sharing
  MOOD_SHARED: 'Mood Shared',
  REFERRAL_SENT: 'Referral Sent',
  SOCIAL_LOGIN: 'Social Login',
  
  // Monetization
  TRIAL_STARTED: 'Trial Started',
  SUBSCRIPTION_CREATED: 'Subscription Created',
  SUBSCRIPTION_CANCELLED: 'Subscription Cancelled',
  PAYMENT_FAILED: 'Payment Failed',
  UPGRADE_PROMPT_SHOWN: 'Upgrade Prompt Shown',
  PRICING_PAGE_VIEWED: 'Pricing Page Viewed',
  
  // Retention
  DAILY_ACTIVE: 'Daily Active',
  WEEKLY_ACTIVE: 'Weekly Active',
  MONTHLY_ACTIVE: 'Monthly Active',
  STREAK_MILESTONE: 'Streak Milestone',
  RE_ENGAGED: 'User Re-engaged',
  FEATURE_DISCOVERED: 'Feature Discovered',
  
  // Product Usage
  AI_INSIGHT_GENERATED: 'AI Insight Generated',
  CHART_VIEWED: 'Chart Viewed',
  DATA_EXPORTED: 'Data Exported',
  SEARCH_PERFORMED: 'Search Performed',
  FILTER_APPLIED: 'Filter Applied',
  
  // Errors & Performance
  ERROR_OCCURRED: 'Error Occurred',
  PAGE_LOAD_SLOW: 'Page Load Slow',
  API_ERROR: 'API Error',
  
  // Content & Education
  TUTORIAL_STARTED: 'Tutorial Started',
  TUTORIAL_COMPLETED: 'Tutorial Completed',
  HELP_ACCESSED: 'Help Accessed',
  FAQ_VIEWED: 'FAQ Viewed'
}

class AnalyticsService {
  private mixpanel: any = null
  private isInitialized = false
  private eventQueue: AnalyticsEvent[] = []
  
  constructor() {
    // Initialize only on client side
    if (typeof window !== 'undefined') {
      this.initializeMixpanel()
    }
  }
  
  private async initializeMixpanel() {
    try {
      // In production: const mixpanel = (await import('mixpanel-browser')).default
      // For development, use localStorage tracking
      
      const MIXPANEL_TOKEN = process.env.NEXT_PUBLIC_MIXPANEL_TOKEN || 'dev-token'
      
      if (typeof (window as any).mixpanel !== 'undefined') {
        // Production Mixpanel initialization
        this.mixpanel = (window as any).mixpanel
        this.mixpanel.init(MIXPANEL_TOKEN, {
          debug: process.env.NODE_ENV === 'development',
          track_pageview: true,
          persistence: 'localStorage',
          property_blacklist: ['password', 'email'], // Privacy protection
          ignore_dnt: false
        })
      } else {
        // Development fallback
        this.mixpanel = {
          track: (event: string, properties: any) => {
            console.log('📊 Analytics Event:', event, properties)
            this.storeEventLocally(event, properties)
          },
          identify: (userId: string) => {
            console.log('👤 User Identified:', userId)
            localStorage.setItem('analytics_user_id', userId)
          },
          people: {
            set: (properties: any) => {
              console.log('👤 User Properties:', properties)
              const existing = JSON.parse(localStorage.getItem('analytics_user_props') || '{}')
              localStorage.setItem('analytics_user_props', JSON.stringify({...existing, ...properties}))
            },
            track_charge: (amount: number) => {
              console.log('💰 Revenue Tracked:', amount)
              this.storeRevenueLocally(amount)
            }
          }
        }
      }
      
      this.isInitialized = true
      this.flushEventQueue()
      
    } catch (error) {
      console.error('Analytics initialization failed:', error)
    }
  }
  
  private storeEventLocally(event: string, properties: any) {
    const eventData = {
      event_name: event,
      properties,
      timestamp: new Date().toISOString(),
      user_id: localStorage.getItem('analytics_user_id') || 'anonymous'
    }
    
    const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
    events.push(eventData)
    
    // Keep only last 1000 events
    if (events.length > 1000) {
      events.splice(0, events.length - 1000)
    }
    
    localStorage.setItem('analytics_events', JSON.stringify(events))
  }
  
  private storeRevenueLocally(amount: number) {
    const revenue = JSON.parse(localStorage.getItem('analytics_revenue') || '[]')
    revenue.push({
      amount,
      timestamp: new Date().toISOString(),
      user_id: localStorage.getItem('analytics_user_id')
    })
    localStorage.setItem('analytics_revenue', JSON.stringify(revenue))
  }
  
  // Track event with user context
  public trackEvent(eventName: string, properties?: any, userId?: string) {
    const eventData: AnalyticsEvent = {
      event_name: eventName,
      properties: {
        ...properties,
        timestamp: new Date().toISOString(),
        source: 'web_app',
        url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined,
        referrer: typeof window !== 'undefined' ? document.referrer : undefined
      },
      user_id: userId,
      timestamp: new Date().toISOString()
    }
    
    if (!this.isInitialized) {
      this.eventQueue.push(eventData)
      return
    }
    
    // Track with Mixpanel
    this.mixpanel?.track(eventName, eventData.properties)
    
    // Also store in Supabase for backup analytics
    this.trackInSupabase(eventData)
  }
  
  private async trackInSupabase(event: AnalyticsEvent) {
    try {
      if (typeof window !== 'undefined' && (window as any).supabase) {
        await (window as any).supabase.from('analytics_events').insert({
          event_name: event.event_name,
          properties: event.properties,
          user_id: event.user_id,
          timestamp: event.timestamp
        })
      }
    } catch (error) {
      console.error('Supabase analytics tracking failed:', error)
    }
  }
  
  // Identify user with properties
  public identifyUser(userId: string, traits?: any) {
    if (!this.isInitialized) {
      setTimeout(() => this.identifyUser(userId, traits), 1000)
      return
    }
    
    this.mixpanel?.identify(userId)
    
    if (traits) {
      const userProperties = {
        $email: traits.email,
        $name: traits.name,
        $created: traits.created_at,
        subscription_level: traits.subscription_level || 'free',
        signup_source: traits.signup_source,
        total_moods_logged: traits.total_moods_logged || 0,
        last_active: new Date().toISOString(),
        app_version: '1.0.0'
      }
      
      this.mixpanel?.people.set(userProperties)
    }
  }
  
  // Track revenue events
  public trackRevenue(amount: number, properties?: any) {
    this.trackEvent(EVENTS.SUBSCRIPTION_CREATED, {
      ...properties,
      revenue: amount,
      currency: 'USD'
    })
    
    // Track charge in Mixpanel
    this.mixpanel?.people.track_charge(amount, {
      time: new Date().toISOString(),
      ...properties
    })
  }
  
  // Track page views
  public trackPageView(page: string, properties?: any) {
    this.trackEvent('Page Viewed', {
      page,
      ...properties
    })
  }
  
  // Track user sessions
  public trackSession(action: 'start' | 'end', sessionData?: any) {
    this.trackEvent(`Session ${action === 'start' ? 'Started' : 'Ended'}`, {
      session_id: sessionData?.sessionId,
      duration: sessionData?.duration,
      pages_visited: sessionData?.pagesVisited
    })
  }
  
  // Flush queued events
  private flushEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()!
      this.trackEvent(event.event_name, event.properties, event.user_id)
    }
  }
  
  // Get analytics data for admin dashboard
  public getLocalAnalytics() {
    if (typeof window === 'undefined') return null
    
    return {
      events: JSON.parse(localStorage.getItem('analytics_events') || '[]'),
      revenue: JSON.parse(localStorage.getItem('analytics_revenue') || '[]'),
      userProps: JSON.parse(localStorage.getItem('analytics_user_props') || '{}'),
      userId: localStorage.getItem('analytics_user_id')
    }
  }
}

// Create singleton instance
export const analyticsService = new AnalyticsService()

// Convenience functions
export const trackEvent = (eventName: string, properties?: any, userId?: string) => {
  analyticsService.trackEvent(eventName, properties, userId)
}

export const identifyUser = (userId: string, traits?: any) => {
  analyticsService.identifyUser(userId, traits)
}

export const trackRevenue = (amount: number, properties?: any) => {
  analyticsService.trackRevenue(amount, properties)
}

export const trackPageView = (page: string, properties?: any) => {
  analyticsService.trackPageView(page, properties)
}

// Auto-track page views (optional)
if (typeof window !== 'undefined') {
  // Track initial page load
  window.addEventListener('load', () => {
    trackPageView(window.location.pathname)
  })
  
  // Track navigation changes (for SPAs)
  let lastPath = window.location.pathname
  const observer = new MutationObserver(() => {
    if (window.location.pathname !== lastPath) {
      lastPath = window.location.pathname
      trackPageView(window.location.pathname)
    }
  })
  observer.observe(document, { subtree: true, childList: true })
}


