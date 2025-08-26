import { NextRequest, NextResponse } from 'next/server'
import { rateLimit, RateLimits } from '@/lib/security/rate-limit'
import { InputValidator } from '@/lib/security/input-validation'

// Apply rate limiting
const limiter = rateLimit({
  ...RateLimits.moderate,
  message: 'Too many AI insight requests. Please wait before trying again.'
})

export async function POST(req: NextRequest) {
  const startTime = Date.now() // Performance monitoring
  
  // Apply rate limiting
  const rateLimitResult = limiter(req)
  if (rateLimitResult) {
    return rateLimitResult
  }
  
  try {
    const rawData = await req.json()
    
    // Input validation and sanitization
    if (!rawData || typeof rawData !== 'object' || !rawData.moods) {
      return NextResponse.json({
        error: 'Invalid request format'
      }, { status: 400 })
    }

    const { moods } = rawData
    
    // Handle empty or invalid moods array
    if (!moods || !Array.isArray(moods) || moods.length === 0) {
      return NextResponse.json({
        prediction: "Start tracking to see insights",
        average: "0.0",
        recommendation: "Begin your mood tracking journey!",
        nextDayPrediction: 5
      })
    }
    
    // Validate and sanitize mood entries with enhanced security
    const validMoods = moods
      .slice(0, 100) // Limit array size to prevent DoS
      .filter((mood: any) => mood && typeof mood === 'object')
      .map((mood: any) => ({
        mood_score: mood.mood_score,
        notes: InputValidator.sanitizeString(mood.notes || ''),
        created_at: mood.created_at || new Date().toISOString()
      }))
      .filter((mood) => InputValidator.validateMoodScore(mood.mood_score))
    
    // Handle case where no valid moods found
    if (validMoods.length === 0) {
      return NextResponse.json({
        prediction: "No valid mood data found",
        average: "0.0", 
        recommendation: "Ensure mood scores are between 1-10",
        nextDayPrediction: 5
      })
    }
    
    // Calculate average mood from valid entries
    const avgMood = validMoods.reduce((sum: number, mood: any) => sum + mood.mood_score, 0) / validMoods.length
    
    // Determine trend (compare most recent to average)
    const recentMood = validMoods[0].mood_score
    const trend = recentMood > avgMood ? 'improving' : 'declining'
    
    // Generate insights
    const insights = {
      prediction: `Your mood is ${trend} (${validMoods.length} entries analyzed)`,
      average: avgMood.toFixed(1),
      recommendation: avgMood < 5 
        ? "Consider taking a short walk or calling a friend"
        : "Keep up the positive momentum!",
      nextDayPrediction: Math.min(10, Math.max(1, Math.round(avgMood + (trend === 'improving' ? 0.5 : -0.5))))
    }
    
    // Performance monitoring
    const processingTime = Date.now() - startTime
    console.log(`✅ AI Insights processed in ${processingTime}ms (${validMoods.length} moods)`)
    
    return NextResponse.json(insights)
    
  } catch (error) {
    console.error('AI Insights API Error:', error)
    return NextResponse.json({
      prediction: "Unable to analyze mood data",
      average: "0.0",
      recommendation: "Please try again later",
      nextDayPrediction: 5
    }, { status: 500 })
  }
}
