import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: false // Ensure this runs server-side only
})

// Types for the service
export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  mood_label?: string
  notes?: string
  activities?: string[]
  created_at: string
}

export interface AnalysisOptions {
  userId?: string
  includePersonalizations?: boolean
  analysisDepth?: 'basic' | 'detailed' | 'comprehensive'
}

export interface InsightPattern {
  type: 'trend' | 'correlation' | 'anomaly' | 'cycle'
  description: string
  confidence: number
  impact: 'positive' | 'negative' | 'neutral'
  frequency?: string
}

export interface Recommendation {
  category: 'activity' | 'lifestyle' | 'timing' | 'mindfulness'
  suggestion: string
  reasoning: string
  priority: 'high' | 'medium' | 'low'
  actionable: boolean
}

export interface AnalysisResult {
  entryCount: number
  insights: {
    patterns: InsightPattern[]
    recommendations: Recommendation[]
    summary: string
    averageMood: number
    trendDirection: 'improving' | 'declining' | 'stable'
    nextDayPrediction: number
  }
  metadata: {
    analysisDate: string
    userId?: string
    confidence: number
  }
}

class EnhancedInsightsService {
  /**
   * Analyze mood data and generate AI-powered insights
   */
  async analyzeMoodData(
    moodEntries: MoodEntry[], 
    options: AnalysisOptions = {}
  ): Promise<AnalysisResult> {
    try {
      // Validate input
      if (!moodEntries || moodEntries.length === 0) {
        throw new Error('No mood entries provided for analysis')
      }

      // Check if we have enough data for meaningful analysis
      if (moodEntries.length < 3) {
        return this.generateBasicInsights(moodEntries, options)
      }

      // Prepare data for OpenAI analysis
      const moodSummary = this.prepareMoodSummary(moodEntries)
      
      // Generate AI insights if OpenAI API key is available
      if (process.env.OPENAI_API_KEY) {
        return await this.generateAIInsights(moodSummary, moodEntries, options)
      } else {
        // Fallback to advanced algorithmic analysis
        return this.generateAdvancedAlgorithmicInsights(moodEntries, options)
      }

    } catch (error) {
      console.error('Enhanced insights analysis failed:', error)
      
      // Fallback to basic analysis on any error
      return this.generateBasicInsights(moodEntries, options)
    }
  }

  /**
   * Generate AI-powered insights using OpenAI
   */
  private async generateAIInsights(
    moodSummary: string, 
    moodEntries: MoodEntry[], 
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const prompt = this.buildAnalysisPrompt(moodSummary, options)

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a mental health insights specialist. Analyze mood patterns and provide helpful, actionable insights. Be empathetic and professional."
        },
        {
          role: "user", 
          content: prompt
        }
      ],
      max_tokens: 800,
      temperature: 0.3,
      response_format: { type: "json_object" }
    })

    const aiResponse = completion.choices[0]?.message?.content
    if (!aiResponse) {
      throw new Error('No response from OpenAI')
    }

    return await this.parseAIResponse(aiResponse, moodEntries, options)
  }

  /**
   * Advanced algorithmic analysis (fallback when no OpenAI API)
   */
  private generateAdvancedAlgorithmicInsights(
    moodEntries: MoodEntry[], 
    options: AnalysisOptions
  ): Promise<AnalysisResult> {
    const sortedEntries = moodEntries.sort((a, b) => 
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )

    const scores = sortedEntries.map(entry => entry.mood_score)
    const avgMood = scores.reduce((sum, score) => sum + score, 0) / scores.length
    
    // Trend analysis
    const recentScores = scores.slice(-7) // Last 7 entries
    const earlierScores = scores.slice(0, Math.min(7, scores.length - 7))
    const recentAvg = recentScores.reduce((sum, score) => sum + score, 0) / recentScores.length
    const earlierAvg = earlierScores.length > 0 
      ? earlierScores.reduce((sum, score) => sum + score, 0) / earlierScores.length 
      : avgMood

    let trendDirection: 'improving' | 'declining' | 'stable' = 'stable'
    if (recentAvg > earlierAvg + 0.5) trendDirection = 'improving'
    else if (recentAvg < earlierAvg - 0.5) trendDirection = 'declining'

    // Pattern detection
    const patterns: InsightPattern[] = this.detectPatterns(sortedEntries)
    
    // Generate recommendations
    const recommendations: Recommendation[] = this.generateRecommendations(
      avgMood, 
      trendDirection, 
      sortedEntries
    )

    const result: AnalysisResult = {
      entryCount: moodEntries.length,
      insights: {
        patterns,
        recommendations,
        summary: this.generateSummary(avgMood, trendDirection, moodEntries.length),
        averageMood: Math.round(avgMood * 10) / 10,
        trendDirection,
        nextDayPrediction: this.predictNextMood(scores)
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        userId: options.userId,
        confidence: 0.75 // Algorithmic confidence
      }
    }

    return Promise.resolve(result)
  }

  /**
   * Basic insights for insufficient data
   */
  private generateBasicInsights(
    moodEntries: MoodEntry[], 
    options: AnalysisOptions
  ): AnalysisResult {
    const avgMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
      : 5

    return {
      entryCount: moodEntries.length,
      insights: {
        patterns: [],
        recommendations: [{
          category: 'lifestyle',
          suggestion: 'Keep tracking your mood daily to unlock deeper insights',
          reasoning: 'More data points will help identify meaningful patterns',
          priority: 'medium',
          actionable: true
        }],
        summary: `Started tracking with ${moodEntries.length} entries. Keep logging to see patterns!`,
        averageMood: Math.round(avgMood * 10) / 10,
        trendDirection: 'stable',
        nextDayPrediction: Math.round(avgMood)
      },
      metadata: {
        analysisDate: new Date().toISOString(),
        userId: options.userId,
        confidence: 0.3
      }
    }
  }

  // Helper methods
  private prepareMoodSummary(entries: MoodEntry[]): string {
    return entries.map(entry => 
      `Date: ${entry.created_at}, Score: ${entry.mood_score}, Notes: ${entry.notes || 'None'}`
    ).join('; ')
  }

  private buildAnalysisPrompt(moodSummary: string, options: AnalysisOptions): string {
    return `Analyze these mood entries and provide insights in JSON format: ${moodSummary}. 
    
    Please return a JSON object with:
    - patterns: array of insight patterns
    - recommendations: array of actionable suggestions  
    - summary: brief analysis summary
    - trendDirection: "improving", "declining", or "stable"
    
    Focus on being helpful and actionable.`
  }

  private async parseAIResponse(response: string, entries: MoodEntry[], options: AnalysisOptions): Promise<AnalysisResult> {
    try {
      const aiData = JSON.parse(response)
      const avgMood = entries.reduce((sum, e) => sum + e.mood_score, 0) / entries.length
      
      return {
        entryCount: entries.length,
        insights: {
          patterns: aiData.patterns || [],
          recommendations: aiData.recommendations || [],
          summary: aiData.summary || 'AI analysis completed',
          averageMood: Math.round(avgMood * 10) / 10,
          trendDirection: aiData.trendDirection || 'stable',
          nextDayPrediction: Math.min(10, Math.max(1, Math.round(avgMood)))
        },
        metadata: {
          analysisDate: new Date().toISOString(),
          userId: options.userId,
          confidence: 0.9 // High confidence for AI analysis
        }
      }
    } catch (error) {
      // Fallback if AI response parsing fails
      return await this.generateAdvancedAlgorithmicInsights(entries, options)
    }
  }

  private detectPatterns(entries: MoodEntry[]): InsightPattern[] {
    const patterns: InsightPattern[] = []
    
    // Weekly pattern detection
    const weeklyScores = this.groupByWeekday(entries)
    const bestDay = Object.entries(weeklyScores).sort(([,a], [,b]) => b - a)[0]
    
    if (bestDay && bestDay[1] > 6) {
      patterns.push({
        type: 'cycle',
        description: `${bestDay[0]}s tend to be your best days`,
        confidence: 0.8,
        impact: 'positive',
        frequency: 'weekly'
      })
    }

    return patterns
  }

  private generateRecommendations(
    avgMood: number, 
    trend: string, 
    entries: MoodEntry[]
  ): Recommendation[] {
    const recommendations: Recommendation[] = []

    if (avgMood < 5) {
      recommendations.push({
        category: 'mindfulness',
        suggestion: 'Try a 5-minute daily meditation or breathing exercise',
        reasoning: 'Your average mood suggests you might benefit from stress reduction techniques',
        priority: 'high',
        actionable: true
      })
    }

    if (trend === 'declining') {
      recommendations.push({
        category: 'lifestyle', 
        suggestion: 'Consider reaching out to a friend or loved one',
        reasoning: 'Social connection can help improve mood when experiencing a downward trend',
        priority: 'high',
        actionable: true
      })
    }

    return recommendations
  }

  private generateSummary(avgMood: number, trend: string, entryCount: number): string {
    const moodDescriptor = avgMood >= 7 ? 'positive' : avgMood >= 5 ? 'balanced' : 'challenging'
    return `Over ${entryCount} entries, your mood has been ${moodDescriptor} with a ${trend} trend.`
  }

  private predictNextMood(scores: number[]): number {
    const recent = scores.slice(-3) // Last 3 entries
    const avg = recent.reduce((sum, score) => sum + score, 0) / recent.length
    return Math.min(10, Math.max(1, Math.round(avg)))
  }

  private groupByWeekday(entries: MoodEntry[]): Record<string, number> {
    const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const grouped: Record<string, number[]> = {}

    entries.forEach(entry => {
      const date = new Date(entry.created_at)
      const weekday = weekdays[date.getDay()]
      if (!grouped[weekday]) grouped[weekday] = []
      grouped[weekday].push(entry.mood_score)
    })

    const averages: Record<string, number> = {}
    Object.entries(grouped).forEach(([day, scores]) => {
      averages[day] = scores.reduce((sum, score) => sum + score, 0) / scores.length
    })

    return averages
  }
}

// Export singleton instance
export const enhancedInsightsService = new EnhancedInsightsService()
