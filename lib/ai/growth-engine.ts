import { supabase } from '@/lib/supabase/client'
import OpenAI from 'openai'

export interface UserBehavior {
  userId: string
  moodEntries: number
  daysActive: number
  featuresUsed: string[]
  upgradeAttempts: number
  lastUpgradePrompt: Date | null
  engagementScore: number
  churnRisk: number
}

export interface UpgradePrediction {
  userId: string
  upgradeProbability: number
  optimalTiming: Date
  recommendedPlan: string
  personalizedMessage: string
  incentives: string[]
}

export interface GrowthMetrics {
  totalUsers: number
  freeUsers: number
  paidUsers: number
  conversionRate: number
  monthlyRecurringRevenue: number
  averageRevenuePerUser: number
  churnRate: number
  predictedGrowth: number
}

export class GrowthEngine {
  private supabase = supabase
  private openai: OpenAI | null = null

  constructor() {
    // Initialize OpenAI only if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    } else {
      console.warn('OpenAI API key not provided, AI features will be disabled')
    }
  }

  /**
   * Analyze user behavior to predict upgrade likelihood
   */
  async analyzeUserBehavior(userId: string): Promise<UserBehavior> {
    try {
      // Get user's mood entries
      const { data: moodEntries } = await this.supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(moodEntries || [])
      
      // Calculate churn risk
      const churnRisk = this.calculateChurnRisk(userId, moodEntries || [])

      return {
        userId,
        moodEntries: moodEntries?.length || 0,
        daysActive: this.calculateDaysActive(userId),
        featuresUsed: ['mood_tracking'], // Simplified for now
        upgradeAttempts: 0, // Simplified for now
        lastUpgradePrompt: null, // Simplified for now
        engagementScore,
        churnRisk
      }
    } catch (error) {
      console.error('Error analyzing user behavior:', error)
      // Return default values on error
      return {
        userId,
        moodEntries: 0,
        daysActive: 0,
        featuresUsed: [],
        upgradeAttempts: 0,
        lastUpgradePrompt: null,
        engagementScore: 0,
        churnRisk: 100
      }
    }
  }

  /**
   * Generate personalized upgrade prompts
   */
  async generatePersonalizedPrompt(userId: string): Promise<string> {
    try {
      if (!this.openai) {
        return 'Ready to unlock your full potential with premium features?'
      }

      const behavior = await this.analyzeUserBehavior(userId)

      const prompt = `Generate a personalized, compelling upgrade message for a user with the following characteristics:
        - Engagement Score: ${behavior.engagementScore}/100
        - Days Active: ${behavior.daysActive}
        - Mood Entries: ${behavior.moodEntries}
        
        Make it feel personal, highlight specific benefits they'll get, and include a sense of urgency without being pushy.`

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a master copywriter specializing in SaaS upgrades. Write compelling, personalized messages that convert.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.8
      })

      return completion.choices[0]?.message?.content || 'Ready to unlock your full potential?'
    } catch (error) {
      console.error('Error generating personalized prompt:', error)
      return 'Ready to unlock your full potential?'
    }
  }

  // Helper methods
  private calculateEngagementScore(moodEntries: any[]): number {
    const entryScore = Math.min(moodEntries.length * 2, 40) // Max 40 points
    const consistencyScore = this.calculateConsistencyScore(moodEntries) // Max 60 points
    
    return entryScore + consistencyScore
  }

  private calculateConsistencyScore(moodEntries: any[]): number {
    if (moodEntries.length < 7) return 0
    
    const lastWeek = moodEntries
      .filter(entry => {
        const entryDate = new Date(entry.created_at)
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        return entryDate > weekAgo
      })
      .length

    return Math.min(lastWeek * 8, 60) // Max 60 points
  }

  private calculateChurnRisk(userId: string, moodEntries: any[]): number {
    // Simple churn risk calculation
    const recentEntries = moodEntries.filter(entry => {
      const entryDate = new Date(entry.created_at)
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      return entryDate > weekAgo
    })

    if (recentEntries.length === 0) return 90 // High risk
    if (recentEntries.length < 3) return 60 // Medium risk
    return 20 // Low risk
  }

  private calculateDaysActive(userId: string): number {
    // Implementation would get user's first activity date
    return 30 // Placeholder
  }
}

export default GrowthEngine