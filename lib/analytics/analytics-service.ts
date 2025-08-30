'use client'

import { supabase } from '@/app/lib/supabase-client'

export interface AnalyticsEvent {
  id?: string
  user_id: string
  event_name: string
  event_data?: Record<string, any>
  timestamp: string
  session_id?: string
  page_url?: string
  user_agent?: string
}

export interface ConversionMetrics {
  totalUsers: number
  premiumUsers: number
  conversionRate: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  lifetimeValue: number
}

export interface UserBehaviorMetrics {
  dailyActiveUsers: number
  weeklyActiveUsers: number
  monthlyActiveUsers: number
  avgSessionDuration: number
  avgMoodEntriesPerUser: number
  retentionRate: number
}

export interface ConversionFunnel {
  step: string
  users: number
  conversionRate: number
  dropoffRate: number
}

export class AnalyticsService {
  private static instance: AnalyticsService
  private sessionId: string

  constructor() {
    this.sessionId = this.generateSessionId()
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService()
    }
    return AnalyticsService.instance
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  /**
   * Track user events for conversion analysis
   */
  async trackEvent(eventName: string, userId: string, eventData?: Record<string, any>): Promise<void> {
    try {
      const event: AnalyticsEvent = {
        user_id: userId,
        event_name: eventName,
        event_data: eventData || {},
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
        page_url: typeof window !== 'undefined' ? window.location.href : undefined,
        user_agent: typeof window !== 'undefined' ? window.navigator.userAgent : undefined
      }

      // Store in Supabase analytics table
      const { error } = await supabase
        .from('analytics_events')
        .insert(event)

      if (error) {
        console.warn('Analytics tracking failed:', error)
        // Fallback to localStorage for offline analytics
        this.storeEventLocally(event)
      }
    } catch (error) {
      console.warn('Analytics service error:', error)
    }
  }

  private storeEventLocally(event: AnalyticsEvent): void {
    try {
      const events = JSON.parse(localStorage.getItem('analytics_events') || '[]')
      events.push(event)
      // Keep only last 1000 events to prevent storage bloat
      if (events.length > 1000) {
        events.splice(0, events.length - 1000)
      }
      localStorage.setItem('analytics_events', JSON.stringify(events))
    } catch (error) {
      console.warn('Local analytics storage failed:', error)
    }
  }

  /**
   * Get conversion metrics for revenue tracking
   */
  async getConversionMetrics(dateRange: { start: string; end: string }): Promise<ConversionMetrics> {
    try {
      // Get total users
      const { count: totalUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      // Get premium users
      const { count: premiumUsers } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('subscription_level', 'premium')
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      const conversionRate = totalUsers ? (premiumUsers! / totalUsers!) * 100 : 0
      const monthlyRecurringRevenue = (premiumUsers || 0) * 10 // $10/month
      const averageRevenuePerUser = totalUsers ? monthlyRecurringRevenue / totalUsers! : 0

      // Simplified churn calculation (would need subscription history in real implementation)
      const churnRate = 2.5 // Estimated 2.5% monthly churn
      const lifetimeValue = averageRevenuePerUser * (1 / (churnRate / 100))

      return {
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        conversionRate,
        monthlyRecurringRevenue,
        averageRevenuePerUser,
        churnRate,
        lifetimeValue
      }
    } catch (error) {
      console.error('Error fetching conversion metrics:', error)
      return this.getDefaultMetrics()
    }
  }

  /**
   * Get user behavior metrics
   */
  async getUserBehaviorMetrics(dateRange: { start: string; end: string }): Promise<UserBehaviorMetrics> {
    try {
      // Get daily active users (users who logged mood in last 24h)
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const { count: dailyActiveUsers } = await supabase
        .from('mood_entries')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneDayAgo)

      // Get weekly active users
      const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      const { count: weeklyActiveUsers } = await supabase
        .from('mood_entries')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneWeekAgo)

      // Get monthly active users
      const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      const { count: monthlyActiveUsers } = await supabase
        .from('mood_entries')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', oneMonthAgo)

      // Calculate average mood entries per user
      const { count: totalMoodEntries } = await supabase
        .from('mood_entries')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      const { count: uniqueUsers } = await supabase
        .from('mood_entries')
        .select('user_id', { count: 'exact', head: true })
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end)

      const avgMoodEntriesPerUser = uniqueUsers ? (totalMoodEntries! / uniqueUsers!) : 0

      return {
        dailyActiveUsers: dailyActiveUsers || 0,
        weeklyActiveUsers: weeklyActiveUsers || 0,
        monthlyActiveUsers: monthlyActiveUsers || 0,
        avgSessionDuration: 300, // 5 minutes average (would calculate from session data)
        avgMoodEntriesPerUser,
        retentionRate: 65 // Estimated 65% retention (would calculate from user activity)
      }
    } catch (error) {
      console.error('Error fetching user behavior metrics:', error)
      return this.getDefaultBehaviorMetrics()
    }
  }

  /**
   * Get conversion funnel analysis
   */
  async getConversionFunnel(dateRange: { start: string; end: string }): Promise<ConversionFunnel[]> {
    try {
      // Get funnel data from analytics events
      const funnelSteps = [
        'page_visited',
        'signup_started', 
        'first_mood_logged',
        'premium_prompt_shown',
        'premium_upgrade_clicked',
        'subscription_completed'
      ]

      const funnelData: ConversionFunnel[] = []
      let previousUsers = 0

      for (let i = 0; i < funnelSteps.length; i++) {
        const step = funnelSteps[i]
        
        const { count: users } = await supabase
          .from('analytics_events')
          .select('user_id', { count: 'exact', head: true })
          .eq('event_name', step)
          .gte('timestamp', dateRange.start)
          .lte('timestamp', dateRange.end)

        const currentUsers = users || 0
        const conversionRate = i === 0 ? 100 : previousUsers ? (currentUsers / previousUsers) * 100 : 0
        const dropoffRate = 100 - conversionRate

        funnelData.push({
          step: step.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
          users: currentUsers,
          conversionRate,
          dropoffRate
        })

        previousUsers = currentUsers
      }

      return funnelData
    } catch (error) {
      console.error('Error fetching conversion funnel:', error)
      return this.getDefaultFunnelData()
    }
  }

  private getDefaultMetrics(): ConversionMetrics {
    return {
      totalUsers: 0,
      premiumUsers: 0,
      conversionRate: 0,
      monthlyRecurringRevenue: 0,
      averageRevenuePerUser: 0,
      churnRate: 2.5,
      lifetimeValue: 0
    }
  }

  private getDefaultBehaviorMetrics(): UserBehaviorMetrics {
    return {
      dailyActiveUsers: 0,
      weeklyActiveUsers: 0,
      monthlyActiveUsers: 0,
      avgSessionDuration: 0,
      avgMoodEntriesPerUser: 0,
      retentionRate: 0
    }
  }

  private getDefaultFunnelData(): ConversionFunnel[] {
    return [
      { step: 'Page Visited', users: 0, conversionRate: 100, dropoffRate: 0 },
      { step: 'Signup Started', users: 0, conversionRate: 0, dropoffRate: 100 },
      { step: 'First Mood Logged', users: 0, conversionRate: 0, dropoffRate: 100 },
      { step: 'Premium Prompt Shown', users: 0, conversionRate: 0, dropoffRate: 100 },
      { step: 'Premium Upgrade Clicked', users: 0, conversionRate: 0, dropoffRate: 100 },
      { step: 'Subscription Completed', users: 0, conversionRate: 0, dropoffRate: 100 }
    ]
  }
}

// Export singleton instance
export const analyticsService = AnalyticsService.getInstance()


