// REAL AI INTEGRATION - OpenAI Service Layer
// Professional AI insights powered by GPT-4 with cost monitoring

import OpenAI from 'openai';

export interface MoodEntry {
  date: string;
  mood_score: number;
  notes: string;
  tags: string[];
  emoji: string;
}

export interface AIInsight {
  summary: string;
  patterns: string[];
  recommendations: string[];
  prediction: {
    tomorrow: number;
    confidence: number;
  };
  correlations: {
    factor: string;
    impact: string;
  }[];
}

export class AIService {
  private static instance: AIService;
  private openai: OpenAI;
  
  private constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });
  }
  
  static getInstance(): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService();
    }
    return AIService.instance;
  }
  
  async generateInsights(userId: string, moods: MoodEntry[]): Promise<AIInsight> {
    try {
      // Prepare context for AI
      const moodContext = this.prepareMoodContext(moods);
      
      // Generate insights using GPT-4
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-4-turbo-preview',
        messages: [
          {
            role: 'system',
            content: `You are a compassionate AI mental wellness assistant analyzing mood patterns. 
            Provide actionable insights in JSON format with these fields:
            - summary: Brief overview of mood patterns (2-3 sentences)
            - patterns: Array of 3 observed patterns
            - recommendations: Array of 3 personalized recommendations
            - prediction: Object with tomorrow (1-10 score) and confidence (0-1)
            - correlations: Array of factors that seem to affect mood`
          },
          {
            role: 'user',
            content: moodContext
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 500
      });
      
      const insights = JSON.parse(completion.choices[0].message.content!) as AIInsight;
      
      // Track API usage for cost management
      await this.trackUsage(userId, completion.usage!);
      
      return insights;
      
    } catch (error) {
      console.error('[AI Service] Error generating insights:', error);
      
      // Fallback to basic insights
      return this.generateBasicInsights(moods);
    }
  }
  
  private prepareMoodContext(moods: MoodEntry[]): string {
    const recentMoods = moods.slice(0, 30);
    
    return `Analyze these mood entries from the past ${recentMoods.length} days:
    
    ${recentMoods.map(m => `
    Date: ${m.date}
    Score: ${m.mood_score}/10 (${this.getMoodLabel(m.mood_score)})
    Emoji: ${m.emoji}
    Notes: ${m.notes || 'No notes'}
    Tags: ${m.tags?.join(', ') || 'No tags'}
    `).join('\n')}
    
    Provide personalized insights based on these patterns. Focus on:
    1. Trends and patterns in mood scores
    2. Common themes in notes and tags
    3. Actionable recommendations for improvement
    4. Factors that correlate with better/worse moods`;
  }
  
  private getMoodLabel(score: number): string {
    if (score >= 8) return 'Excellent';
    if (score >= 6) return 'Good';
    if (score >= 4) return 'Neutral';
    if (score >= 2) return 'Low';
    return 'Very Low';
  }
  
  private async trackUsage(userId: string, usage: any) {
    const cost = (usage.prompt_tokens * 0.01 + usage.completion_tokens * 0.03) / 1000;
    
    console.log(`[AI Usage] User ${userId}: ${usage.total_tokens} tokens, $${cost.toFixed(4)}`);
    
    // Could integrate with Redis or database for cost tracking
    // await redis.zincrby('ai_usage:daily', cost, userId);
    // await redis.hincrby('ai_usage:total', userId, Math.round(cost * 1000));
  }
  
  private generateBasicInsights(moods: MoodEntry[]): AIInsight {
    const avg = moods.reduce((a, m) => a + m.mood_score, 0) / moods.length;
    const trend = moods[0].mood_score > avg ? 'improving' : 'declining';
    
    return {
      summary: `Your mood has been ${trend} recently with an average of ${avg.toFixed(1)}/10. Keep tracking to discover more patterns.`,
      patterns: [
        'Mood tracking helps build awareness',
        'Consistent logging shows dedication to wellbeing', 
        'Pattern recognition improves over time'
      ],
      recommendations: [
        'Continue daily mood tracking for best insights',
        'Add notes to understand mood triggers better',
        'Try setting small daily wellness goals'
      ],
      prediction: {
        tomorrow: Math.round(avg),
        confidence: 0.6
      },
      correlations: [
        { factor: 'Consistency', impact: 'Regular tracking builds self-awareness' },
        { factor: 'Notes', impact: 'Detailed entries provide better insights' }
      ]
    };
  }
}


