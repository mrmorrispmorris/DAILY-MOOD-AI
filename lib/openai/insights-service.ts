import OpenAI from 'openai'
import { MoodEntry } from '@/types/database'
import { InsightsCache } from '@/lib/cache/insights-cache'
import { ErrorService } from '@/lib/error-handling/error-service'

export interface AIInsight {
  patterns: string[]
  recommendations: string[]
  summary: string
  trends: string
  actionItems: string[]
}

export class InsightsService {
  private openai: OpenAI | null = null

  constructor() {
    const apiKey = process.env.NEXT_PUBLIC_OPENAI_API_KEY || process.env.OPENAI_API_KEY
    
    if (apiKey && !apiKey.includes('your_openai_api_key')) {
      console.log('✅ OpenAI API key found, initializing client')
      this.openai = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true // Only for demo - in production, use server-side API routes
      })
    } else {
      console.log('⚠️ OpenAI API key not found or placeholder value, will use mock insights')
    }
  }

  async generateInsights(moodEntries: MoodEntry[], userId: string): Promise<AIInsight> {
    console.log(`🧠 Generating insights for user ${userId} with ${moodEntries.length} entries`)
    
    // Check cache first
    const cachedInsights = InsightsCache.getCachedInsights(userId)
    if (cachedInsights) {
      console.log('Using cached insights')
      return cachedInsights
    }

    if (!this.openai) {
      // Return mock insights if OpenAI is not configured
      console.log('🎭 Using mock insights (OpenAI not configured)')
      const mockInsights = this.getMockInsights(moodEntries)
      InsightsCache.saveInsights(userId, mockInsights)
      return mockInsights
    }

    try {
      console.log('🤖 Calling OpenAI API for insights generation')
      const prompt = this.buildAnalysisPrompt(moodEntries)
      
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a mental health insights AI assistant. Analyze mood data and provide evidence-based recommendations. Be supportive, professional, and focus on actionable advice."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })

      const response = completion.choices[0]?.message?.content || ''
      console.log('✅ OpenAI API response received')
      const insights = this.parseAIResponse(response)
      
      // Cache the insights
      InsightsCache.saveInsights(userId, insights)
      
      return insights
      
    } catch (error) {
      console.error('OpenAI API error:', error)
      ErrorService.handleError(error, 'AI Insights Generation')
      // Fallback to mock insights if API fails
      const mockInsights = this.getMockInsights(moodEntries)
      InsightsCache.saveInsights(userId, mockInsights)
      return mockInsights
    }
  }

  private buildAnalysisPrompt(moodEntries: MoodEntry[]): string {
    const moodData = moodEntries.map(entry => ({
      date: entry.date,
      mood_score: entry.mood_score,
      emoji: entry.emoji,
      notes: entry.notes,
      tags: entry.tags
    }))

    return `Analyze this mood tracking data and provide personalized insights:

${JSON.stringify(moodData, null, 2)}

Please provide:
1. PATTERNS: Identify patterns like low moods on certain days, correlation with tags, or recurring themes
2. RECOMMENDATIONS: Suggest personalized tips based on evidence-based mental health advice (e.g., "Try exercise for stress", "Mindfulness for work-related anxiety")
3. SUMMARY: Overall mood trend and key observations
4. TRENDS: Notable trends in mood scores over time
5. ACTION_ITEMS: Specific, actionable steps the user can take

Format your response as:
PATTERNS:
- [pattern 1]
- [pattern 2]

RECOMMENDATIONS:
- [recommendation 1]
- [recommendation 2]

SUMMARY:
[overall summary]

TRENDS:
[trend analysis]

ACTION_ITEMS:
- [action 1]
- [action 2]`
  }

  private parseAIResponse(response: string): AIInsight {
    const sections = {
      patterns: [] as string[],
      recommendations: [] as string[],
      summary: '',
      trends: '',
      actionItems: [] as string[]
    }

    const lines = response.split('\n')
    let currentSection = ''

    for (const line of lines) {
      const trimmed = line.trim()
      
      if (trimmed.startsWith('PATTERNS:')) {
        currentSection = 'patterns'
        continue
      } else if (trimmed.startsWith('RECOMMENDATIONS:')) {
        currentSection = 'recommendations'
        continue
      } else if (trimmed.startsWith('SUMMARY:')) {
        currentSection = 'summary'
        continue
      } else if (trimmed.startsWith('TRENDS:')) {
        currentSection = 'trends'
        continue
      } else if (trimmed.startsWith('ACTION_ITEMS:')) {
        currentSection = 'actionItems'
        continue
      }

      if (trimmed.startsWith('- ')) {
        const item = trimmed.substring(2)
        if (currentSection === 'patterns') {
          sections.patterns.push(item)
        } else if (currentSection === 'recommendations') {
          sections.recommendations.push(item)
        } else if (currentSection === 'actionItems') {
          sections.actionItems.push(item)
        }
      } else if (trimmed && currentSection === 'summary') {
        sections.summary += trimmed + ' '
      } else if (trimmed && currentSection === 'trends') {
        sections.trends += trimmed + ' '
      }
    }

    return {
      patterns: sections.patterns,
      recommendations: sections.recommendations,
      summary: sections.summary.trim(),
      trends: sections.trends.trim(),
      actionItems: sections.actionItems
    }
  }

  private getMockInsights(moodEntries: MoodEntry[]): AIInsight {
    const avgMood = moodEntries.length > 0 
      ? moodEntries.reduce((sum, entry) => sum + entry.mood_score, 0) / moodEntries.length 
      : 7

    const commonTags = this.getCommonTags(moodEntries)
    const hasWorkStress = commonTags.includes('work') || commonTags.includes('stress')
    const hasExercise = commonTags.includes('exercise')

    return {
      patterns: [
        avgMood < 6 
          ? "Your mood tends to be lower on weekdays, particularly when 'work' or 'stress' tags are present"
          : "You maintain consistently positive moods, with occasional dips during stressful periods",
        hasWorkStress 
          ? "Work-related stress appears to be a significant factor affecting your mood"
          : "Your mood patterns show good emotional regulation across different activities",
        hasExercise 
          ? "Days with exercise consistently show higher mood scores"
          : "Physical activity could be a beneficial addition to your routine"
      ],
      recommendations: [
        hasWorkStress 
          ? "Try the 4-7-8 breathing technique during work breaks to manage stress"
          : "Continue your current positive habits and consider mindfulness practices",
        !hasExercise 
          ? "Research shows 20-30 minutes of daily exercise can significantly improve mood"
          : "Maintain your exercise routine as it's clearly benefiting your mental wellbeing",
        "Consider keeping a gratitude journal - writing 3 things you're grateful for daily can boost mood by 25%"
      ],
      summary: avgMood >= 7 
        ? `Your overall mood trend is positive with an average score of ${avgMood.toFixed(1)}/10. You show good emotional awareness and self-care habits.`
        : `Your mood data shows room for improvement with an average of ${avgMood.toFixed(1)}/10. The patterns suggest specific areas where targeted interventions could help.`,
      trends: moodEntries.length > 7 
        ? "Your mood shows an upward trend over the past week, indicating positive momentum in your mental wellbeing."
        : "Based on your recent entries, your mood appears stable with opportunities for enhancement through targeted strategies.",
      actionItems: [
        "Set a daily 10-minute mindfulness reminder",
        hasWorkStress ? "Practice stress management techniques before work" : "Continue current positive routines",
        "Track sleep quality alongside mood to identify correlations",
        !hasExercise ? "Start with 15-minute daily walks" : "Maintain current exercise schedule"
      ]
    }
  }

  private getCommonTags(moodEntries: MoodEntry[]): string[] {
    const tagCounts: Record<string, number> = {}
    
    moodEntries.forEach(entry => {
      entry.tags?.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1
      })
    })

    return Object.entries(tagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag)
  }

  generateShareText(insights: AIInsight): string {
    return `🧠 My DailyMood AI Insights:

📈 Mood Trend: ${insights.summary}

🎯 Key Patterns:
${insights.patterns.slice(0, 2).map(p => `• ${p}`).join('\n')}

💡 Personalized Tips:
${insights.recommendations.slice(0, 2).map(r => `• ${r}`).join('\n')}

Track your mood with AI insights at DailyMood AI! #MoodTracking #MentalHealth #AI`
  }
}

export const insightsService = new InsightsService()