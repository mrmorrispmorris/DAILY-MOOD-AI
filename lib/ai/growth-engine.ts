import { createClient } from '@supabase/supabase-js'
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
  private supabase: any
  private openai: OpenAI

  constructor() {
    this.supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    })
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

      // Get user's feature usage
      const { data: userFeatures } = await this.supabase
        .from('user_features')
        .select('*')
        .eq('user_id', userId)

      // Calculate engagement score
      const engagementScore = this.calculateEngagementScore(moodEntries, userFeatures)
      
      // Calculate churn risk
      const churnRisk = this.calculateChurnRisk(userId, moodEntries)

      return {
        userId,
        moodEntries: moodEntries?.length || 0,
        daysActive: this.calculateDaysActive(userId),
        featuresUsed: userFeatures?.map(f => f.feature_name) || [],
        upgradeAttempts: this.getUpgradeAttempts(userId),
        lastUpgradePrompt: this.getLastUpgradePrompt(userId),
        engagementScore,
        churnRisk
      }
    } catch (error) {
      console.error('Error analyzing user behavior:', error)
      throw error
    }
  }

  /**
   * Predict optimal upgrade timing using AI
   */
  async predictUpgradeTiming(userId: string): Promise<UpgradePrediction> {
    try {
      const behavior = await this.analyzeUserBehavior(userId)
      
      // Use OpenAI to generate personalized upgrade prediction
      const prompt = this.createUpgradePredictionPrompt(behavior)
      
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert in user psychology and SaaS growth. Analyze user behavior and predict the optimal time to offer an upgrade.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      })

      const response = completion.choices[0]?.message?.content || ''
      
      // Parse AI response and create prediction
      return this.parseUpgradePrediction(response, behavior)
    } catch (error) {
      console.error('Error predicting upgrade timing:', error)
      throw error
    }
  }

  /**
   * Generate personalized upgrade prompts
   */
  async generatePersonalizedPrompt(userId: string): Promise<string> {
    try {
      const behavior = await this.analyzeUserBehavior(userId)
      const prediction = await this.predictUpgradeTiming(userId)

      const prompt = `Generate a personalized, compelling upgrade message for a user with the following characteristics:
        - Engagement Score: ${behavior.engagementScore}/100
        - Days Active: ${behavior.daysActive}
        - Features Used: ${behavior.featuresUsed.join(', ')}
        - Upgrade Probability: ${prediction.upgradeProbability}%
        - Recommended Plan: ${prediction.recommendedPlan}
        
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

  /**
   * Get growth metrics and predictions
   */
  async getGrowthMetrics(): Promise<GrowthMetrics> {
    try {
      // Get user counts
      const { count: totalUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact' })

      const { count: paidUsers } = await this.supabase
        .from('users')
        .select('*', { count: 'exact' })
        .eq('subscription_status', 'active')

      const freeUsers = totalUsers - paidUsers
      const conversionRate = (paidUsers / totalUsers) * 100

      // Calculate MRR
      const { data: subscriptions } = await this.supabase
        .from('subscriptions')
        .select('price_id, status')

      const monthlyRecurringRevenue = this.calculateMRR(subscriptions)
      const averageRevenuePerUser = monthlyRecurringRevenue / paidUsers

      // Predict growth
      const predictedGrowth = this.predictGrowth(conversionRate, totalUsers)

      return {
        totalUsers,
        freeUsers,
        paidUsers,
        conversionRate,
        monthlyRecurringRevenue,
        averageRevenuePerUser,
        churnRate: this.calculateChurnRate(),
        predictedGrowth
      }
    } catch (error) {
      console.error('Error getting growth metrics:', error)
      throw error
    }
  }

  /**
   * Send smart upgrade notifications
   */
  async sendSmartUpgradeNotification(userId: string): Promise<void> {
    try {
      const prediction = await this.predictUpgradeTiming(userId)
      
      // Only send if probability is high enough
      if (prediction.upgradeProbability > 70) {
        const message = await this.generatePersonalizedPrompt(userId)
        
        // Send push notification
        await this.sendPushNotification(userId, {
          title: 'Unlock Your Full Potential! 🌟',
          body: message,
          data: {
            type: 'upgrade_prompt',
            plan: prediction.recommendedPlan,
            probability: prediction.upgradeProbability
          }
        })

        // Log the notification
        await this.logUpgradePrompt(userId, prediction)
      }
    } catch (error) {
      console.error('Error sending smart upgrade notification:', error)
    }
  }

  // Helper methods
  private calculateEngagementScore(moodEntries: any[], userFeatures: any[]): number {
    const entryScore = Math.min(moodEntries.length * 2, 40) // Max 40 points
    const featureScore = Math.min(userFeatures.length * 5, 30) // Max 30 points
    const consistencyScore = this.calculateConsistencyScore(moodEntries) // Max 30 points
    
    return entryScore + featureScore + consistencyScore
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

    return Math.min(lastWeek * 4, 30) // Max 30 points
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

  private getUpgradeAttempts(userId: string): number {
    // Implementation would get upgrade attempt count
    return 0 // Placeholder
  }

  private getLastUpgradePrompt(userId: string): Date | null {
    // Implementation would get last upgrade prompt date
    return null // Placeholder
  }

  private createUpgradePredictionPrompt(behavior: UserBehavior): string {
    return `Analyze this user's behavior and predict upgrade likelihood:
      - Mood Entries: ${behavior.moodEntries}
      - Days Active: ${behavior.daysActive}
      - Engagement Score: ${behavior.engagementScore}/100
      - Features Used: ${behavior.featuresUsed.join(', ')}
      - Churn Risk: ${behavior.churnRisk}%
      
      Predict:
      1. Upgrade probability (0-100%)
      2. Optimal timing (when to offer upgrade)
      3. Recommended plan (Free, Pro, Premium, Enterprise)
      4. Personalized message
      5. Incentives to offer`
  }

  private parseUpgradePrediction(aiResponse: string, behavior: UserBehavior): UpgradePrediction {
    // Parse AI response and create structured prediction
    // This is a simplified version - in production you'd use more sophisticated parsing
    return {
      userId: behavior.userId,
      upgradeProbability: Math.min(behavior.engagementScore + 20, 95),
      optimalTiming: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
      recommendedPlan: 'Pro',
      personalizedMessage: 'Based on your engagement, you\'re ready for the next level!',
      incentives: ['7-day free trial', '20% off first month', 'Priority support']
    }
  }

  private calculateMRR(subscriptions: any[]): number {
    // Calculate Monthly Recurring Revenue
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active')
    return activeSubscriptions.length * 9.99 // Assuming $9.99 average price
  }

  private calculateChurnRate(): number {
    // Implementation would calculate actual churn rate
    return 5 // 5% placeholder
  }

  private predictGrowth(conversionRate: number, totalUsers: number): number {
    // Simple growth prediction
    const monthlyGrowth = totalUsers * 0.1 // 10% monthly growth
    const conversionGrowth = (conversionRate / 100) * monthlyGrowth
    return Math.round(conversionGrowth)
  }

  private async sendPushNotification(userId: string, notification: any): Promise<void> {
    // Implementation would send actual push notification
    console.log('Sending push notification:', notification)
  }

  private async logUpgradePrompt(userId: string, prediction: UpgradePrediction): Promise<void> {
    // Log upgrade prompt for analytics
    await this.supabase
      .from('upgrade_prompts')
      .insert({
        user_id: userId,
        upgrade_probability: prediction.upgradeProbability,
        recommended_plan: prediction.recommendedPlan,
        sent_at: new Date().toISOString()
      })
  }
}

export default GrowthEngine






