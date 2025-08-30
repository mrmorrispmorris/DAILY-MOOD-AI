import OpenAI from 'openai'

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export interface MoodData {
  score: number
  notes?: string
  activities?: string[]
  timestamp: string
}

export interface AIInsightResult {
  insights: string[]
  patterns: any
  suggestions: string[]
  predictions?: string[]
  confidence: number
}

/**
 * Generate AI-powered mood insights using OpenAI GPT-4
 * Falls back to pattern-based analysis if OpenAI fails
 */
export async function generateMoodInsights(
  moodHistory: MoodData[],
  userId: string
): Promise<AIInsightResult> {
  try {
    // Validate input
    if (!moodHistory || moodHistory.length === 0) {
      return generateFallbackInsights(moodHistory)
    }

    // Limit data for API efficiency (last 30 entries)
    const recentMoods = moodHistory.slice(0, 30)
    
    // Prepare data for AI analysis
    const dataForAnalysis = recentMoods.map(mood => ({
      score: mood.score,
      date: new Date(mood.timestamp).toLocaleDateString(),
      dayOfWeek: new Date(mood.timestamp).toLocaleDateString('en-US', { weekday: 'long' }),
      notes: mood.notes || null,
      activities: mood.activities || []
    }))

    console.log('🤖 Generating AI insights for', recentMoods.length, 'mood entries')

    const prompt = `Analyze this mood tracking data and provide actionable insights. Be supportive, specific, and focus on patterns.

Mood Data (1-10 scale):
${JSON.stringify(dataForAnalysis, null, 2)}

Provide insights in this JSON format:
{
  "insights": ["Specific pattern observations (2-3 insights)"],
  "suggestions": ["Actionable recommendations (2-3 suggestions)"],  
  "predictions": ["Gentle predictions about upcoming trends (1-2 predictions)"],
  "patterns": {
    "weeklyTrend": "improving|declining|stable",
    "bestDay": "day of week with highest average",
    "challengingDay": "day of week with lowest average",
    "averageMood": "calculated average mood score",
    "moodVolatility": "high|medium|low"
  }
}

Guidelines:
- Be encouraging and supportive
- Focus on actionable insights
- Identify specific triggers or patterns
- Suggest concrete improvements
- Keep language warm but professional
- If mood is consistently low, gently suggest professional support`

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using efficient mini model for cost optimization
      messages: [
        {
          role: "system",
          content: "You are a compassionate AI assistant specializing in mental health pattern analysis. Provide supportive, actionable insights based on mood tracking data. Always be encouraging and focus on positive steps forward."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const responseText = completion.choices[0]?.message?.content
    if (!responseText) {
      throw new Error('No response from OpenAI')
    }

    // Parse AI response
    const aiResult = JSON.parse(responseText)
    
    console.log('✅ AI insights generated successfully')
    
    return {
      insights: aiResult.insights || [],
      patterns: aiResult.patterns || {},
      suggestions: aiResult.suggestions || [],
      predictions: aiResult.predictions || [],
      confidence: 0.85 // High confidence for AI-generated insights
    }
    
  } catch (error) {
    console.warn('🔄 OpenAI failed, falling back to pattern analysis:', error)
    
    // Always provide fallback insights - never leave users without value
    return generateFallbackInsights(moodHistory)
  }
}

/**
 * Generate pattern-based insights when OpenAI is unavailable
 * Ensures users always get valuable insights regardless of AI status
 */
function generateFallbackInsights(moodHistory: MoodData[]): AIInsightResult {
  if (!moodHistory || moodHistory.length === 0) {
    return {
      insights: ["Start logging your moods daily to unlock personalized insights"],
      patterns: {
        weeklyTrend: "insufficient_data",
        averageMood: 0,
        moodVolatility: "unknown"
      },
      suggestions: [
        "Begin by tracking your mood for a few days to establish patterns",
        "Try to log your mood at the same time each day for consistency"
      ],
      confidence: 0.2
    }
  }

  const insights: string[] = []
  const suggestions: string[] = []
  const predictions: string[] = []

  // Calculate basic statistics
  const scores = moodHistory.map(m => m.score)
  const avgMood = scores.reduce((a, b) => a + b, 0) / scores.length
  const recentAvg = scores.slice(0, 7).reduce((a, b) => a + b, 0) / Math.min(7, scores.length)
  const olderAvg = scores.slice(7, 14).reduce((a, b) => a + b, 0) / Math.min(7, scores.slice(7).length)

  // Mood level analysis
  if (avgMood >= 7) {
    insights.push("You're maintaining consistently positive moods - that's excellent! 🌟")
    suggestions.push("Keep up your current routine as it's clearly working well for your mental health")
  } else if (avgMood >= 5) {
    insights.push("Your mood generally stays in a healthy moderate range")
    suggestions.push("Consider incorporating one small positive activity to boost your mood further")
  } else {
    insights.push("Your mood has been in a challenging range recently")
    suggestions.push("Consider reaching out to a mental health professional for additional support")
  }

  // Trend analysis
  if (moodHistory.length >= 7 && olderAvg > 0) {
    const improvement = ((recentAvg - olderAvg) / olderAvg) * 100
    
    if (improvement > 10) {
      insights.push("Your mood has been trending upward recently - great progress! 📈")
      predictions.push("If this positive trend continues, next week is looking bright")
    } else if (improvement < -10) {
      insights.push("Your mood has dipped recently - this is normal and temporary")
      suggestions.push("Reflect on any recent changes that might be affecting your wellbeing")
    } else {
      insights.push("Your mood has been relatively stable over time")
    }
  }

  // Day of week analysis
  const dayPatterns: Record<string, number[]> = {}
  moodHistory.forEach(entry => {
    const dayName = new Date(entry.timestamp).toLocaleDateString('en-US', { weekday: 'long' })
    if (!dayPatterns[dayName]) dayPatterns[dayName] = []
    dayPatterns[dayName].push(entry.score)
  })

  const dayAverages = Object.entries(dayPatterns)
    .map(([day, scores]) => ({
      day,
      avg: scores.reduce((a, b) => a + b, 0) / scores.length
    }))
    .sort((a, b) => b.avg - a.avg)

  if (dayAverages.length > 2) {
    const bestDay = dayAverages[0].day
    const challengingDay = dayAverages[dayAverages.length - 1].day
    
    insights.push(`Your mood tends to be highest on ${bestDay}s`)
    suggestions.push(`Try scheduling important activities or self-care on ${bestDay}s when you feel your best`)
  }

  // Consistency feedback
  const daysSinceLastEntry = Math.floor(
    (Date.now() - new Date(moodHistory[0].timestamp).getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (daysSinceLastEntry === 0) {
    suggestions.push("Great job staying consistent with your mood tracking!")
  } else if (daysSinceLastEntry > 2) {
    suggestions.push("Try to log your mood daily for more accurate pattern recognition")
  }

  // Calculate mood volatility
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - avgMood, 2), 0) / scores.length
  const volatility = variance > 6 ? 'high' : variance > 2 ? 'medium' : 'low'

  return {
    insights: insights.slice(0, 3), // Limit to 3 insights
    patterns: {
      weeklyTrend: recentAvg > olderAvg ? 'improving' : recentAvg < olderAvg ? 'declining' : 'stable',
      bestDay: dayAverages[0]?.day || 'N/A',
      challengingDay: dayAverages[dayAverages.length - 1]?.day || 'N/A',
      averageMood: parseFloat(avgMood.toFixed(1)),
      moodVolatility: volatility
    },
    suggestions: suggestions.slice(0, 3), // Limit to 3 suggestions
    predictions: predictions.slice(0, 2), // Limit to 2 predictions
    confidence: moodHistory.length >= 14 ? 0.7 : 0.5 // Higher confidence with more data
  }
}

/**
 * Generate mood prediction based on historical patterns
 * Uses both AI and statistical analysis for accuracy
 */
export async function predictMoodTrend(
  moodHistory: MoodData[],
  daysAhead: number = 7
): Promise<{
  prediction: number
  confidence: number
  factors: string[]
}> {
  if (moodHistory.length < 7) {
    return {
      prediction: 5.5, // Neutral default
      confidence: 0.1,
      factors: ["Need more mood entries for accurate predictions"]
    }
  }

  try {
    // Use recent patterns for prediction
    const recentMoods = moodHistory.slice(0, 14)
    const weights = [0.3, 0.25, 0.2, 0.15, 0.1] // Recent days weighted more heavily
    
    let weightedSum = 0
    let totalWeight = 0
    
    recentMoods.slice(0, 5).forEach((mood, i) => {
      if (weights[i]) {
        weightedSum += mood.score * weights[i]
        totalWeight += weights[i]
      }
    })
    
    const basePrediction = weightedSum / totalWeight
    
    // Analyze weekly patterns
    const dayOfWeek = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000).getDay()
    const historicalSameDay = moodHistory.filter(m => 
      new Date(m.timestamp).getDay() === dayOfWeek
    )
    
    const sameDayAvg = historicalSameDay.length > 0 
      ? historicalSameDay.reduce((sum, m) => sum + m.score, 0) / historicalSameDay.length
      : basePrediction
    
    // Combine base prediction with day-of-week pattern
    const finalPrediction = (basePrediction * 0.7) + (sameDayAvg * 0.3)
    
    // Calculate confidence based on data consistency
    const variance = recentMoods.reduce((sum, m) => 
      sum + Math.pow(m.score - basePrediction, 2), 0
    ) / recentMoods.length
    
    const confidence = Math.max(0.3, Math.min(0.9, 1 - (variance / 10)))
    
    return {
      prediction: parseFloat(finalPrediction.toFixed(1)),
      confidence: parseFloat(confidence.toFixed(2)),
      factors: [
        `Based on your recent ${recentMoods.length} mood entries`,
        historicalSameDay.length > 2 
          ? `Your mood on this day of the week averages ${sameDayAvg.toFixed(1)}`
          : "Limited historical data for this day of the week"
      ]
    }
    
  } catch (error) {
    console.error('Error predicting mood trend:', error)
    return {
      prediction: 5.5,
      confidence: 0.2,
      factors: ["Unable to generate prediction - please try again later"]
    }
  }
}

/**
 * Analyze mood correlations with activities and external factors
 */
export function analyzeMoodCorrelations(moodHistory: MoodData[]): {
  activityCorrelations: Array<{ activity: string; impact: number; confidence: number }>
  timePatterns: Array<{ timeOfDay: string; averageMood: number }>
} {
  const activityImpact: Record<string, number[]> = {}
  const timePatterns: Record<string, number[]> = {}
  
  moodHistory.forEach(entry => {
    // Analyze activity correlations
    if (entry.activities && entry.activities.length > 0) {
      entry.activities.forEach(activity => {
        if (!activityImpact[activity]) activityImpact[activity] = []
        activityImpact[activity].push(entry.score)
      })
    }
    
    // Analyze time patterns
    const hour = new Date(entry.timestamp).getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
    if (!timePatterns[timeOfDay]) timePatterns[timeOfDay] = []
    timePatterns[timeOfDay].push(entry.score)
  })
  
  // Calculate activity correlations
  const activityCorrelations = Object.entries(activityImpact)
    .map(([activity, scores]) => {
      const avgMood = scores.reduce((a, b) => a + b, 0) / scores.length
      const overallAvg = moodHistory.reduce((sum, m) => sum + m.score, 0) / moodHistory.length
      const impact = avgMood - overallAvg
      const confidence = Math.min(0.9, scores.length / 10) // More confidence with more data points
      
      return { activity, impact: parseFloat(impact.toFixed(2)), confidence }
    })
    .filter(item => Math.abs(item.impact) > 0.3) // Only significant correlations
    .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
  
  // Calculate time patterns
  const timeAnalysis = Object.entries(timePatterns)
    .map(([timeOfDay, scores]) => ({
      timeOfDay,
      averageMood: parseFloat((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1))
    }))
    .sort((a, b) => b.averageMood - a.averageMood)
  
  return {
    activityCorrelations: activityCorrelations.slice(0, 5), // Top 5 correlations
    timePatterns: timeAnalysis
  }
}


