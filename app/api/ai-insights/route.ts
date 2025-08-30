import { NextRequest, NextResponse } from 'next/server'
import { generateMoodInsights, predictMoodTrend, analyzeMoodCorrelations, MoodData } from '@/lib/openai-service'
import { supabase } from '@/app/lib/supabase-client'

export async function POST(request: NextRequest) {
  try {
    const { moods, userId } = await request.json()
    
    if (!moods || !Array.isArray(moods)) {
      return NextResponse.json(
        { error: 'Invalid mood data provided' },
        { status: 400 }
      )
    }

    // Transform mood data to expected format
    const moodData: MoodData[] = moods.map(mood => ({
      score: mood.mood_score || mood.score,
      notes: mood.notes,
      activities: mood.activities || [],
      timestamp: mood.created_at || mood.date || new Date().toISOString()
    }))

    if (moodData.length < 3) {
      return NextResponse.json({
        prediction: "Need more mood entries for AI analysis",
        average: "0.0",
        recommendation: "Track your mood for at least 3 days to unlock AI insights",
        nextDayPrediction: 5,
        insights: ["Start tracking daily to see patterns"],
        patterns: {},
        suggestions: ["Log your mood consistently for better insights"]
      })
    }

    console.log(`🤖 Generating AI insights for ${moodData.length} mood entries`)
    
    // Generate comprehensive AI insights using OpenAI service
    const [aiInsights, moodPrediction, correlations] = await Promise.all([
      generateMoodInsights(moodData, userId || 'anonymous'),
      predictMoodTrend(moodData, 1), // Predict 1 day ahead
      analyzeMoodCorrelations(moodData)
    ])

    // Calculate average mood
    const averageMood = moodData.reduce((sum, mood) => sum + mood.score, 0) / moodData.length

    // Create comprehensive response
    const response = {
      // Legacy format for existing component
      prediction: aiInsights.insights[0] || "Your mood patterns are being analyzed",
      average: averageMood.toFixed(1),
      recommendation: aiInsights.suggestions[0] || "Keep tracking your mood daily",
      nextDayPrediction: moodPrediction.prediction,
      
      // Enhanced data for future use
      insights: aiInsights.insights,
      patterns: aiInsights.patterns,
      suggestions: aiInsights.suggestions,
      predictions: aiInsights.predictions,
      confidence: aiInsights.confidence,
      moodPrediction: {
        value: moodPrediction.prediction,
        confidence: moodPrediction.confidence,
        factors: moodPrediction.factors
      },
      correlations: {
        activities: correlations.activityCorrelations,
        timePatterns: correlations.timePatterns
      },
      metadata: {
        dataPoints: moodData.length,
        generatedAt: new Date().toISOString(),
        analysisType: aiInsights.confidence > 0.7 ? 'AI-powered' : 'Pattern-based'
      }
    }

    // Cache insights for performance (if user is provided)
    if (userId) {
      try {
        await supabase
          .from('ai_insights_cache')
          .upsert({
            user_id: userId,
            insights_data: response,
            generated_at: new Date().toISOString(),
            mood_count: moodData.length
          })
      } catch (cacheError) {
        console.warn('Failed to cache AI insights:', cacheError)
        // Continue without caching - don't fail the request
      }
    }

    console.log(`✅ AI insights generated successfully (confidence: ${aiInsights.confidence})`)
    
    return NextResponse.json(response)
    
  } catch (error) {
    console.error('AI Insights API error:', error)
    
    // Return fallback response instead of failing completely
    return NextResponse.json({
      prediction: "Analyzing your mood patterns",
      average: "5.0",
      recommendation: "Keep logging your moods to improve insights accuracy",
      nextDayPrediction: 5.5,
      insights: ["Your mood data is being processed"],
      patterns: { weeklyTrend: "stable" },
      suggestions: ["Continue tracking daily for better insights"],
      confidence: 0.3,
      metadata: {
        analysisType: 'fallback',
        error: 'AI service temporarily unavailable'
      }
    })
  }
}