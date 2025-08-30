/**
 * Advanced Mood Prediction Engine
 * Uses statistical analysis, pattern recognition, and machine learning concepts
 * to forecast future mood trends with confidence intervals
 */

export interface MoodEntry {
  score: number
  notes?: string
  activities?: string[]
  timestamp: string
}

export interface PredictionResult {
  predictedScore: number
  confidence: number
  trend: 'improving' | 'declining' | 'stable'
  factors: string[]
  recommendations: string[]
  nextWeekForecast: Array<{
    date: string
    predictedMood: number
    dayOfWeek: string
  }>
}

export interface PatternAnalysis {
  weeklyPattern: Record<string, number>
  monthlyTrend: 'upward' | 'downward' | 'stable'
  volatility: 'high' | 'medium' | 'low'
  consistencyScore: number
  seasonalFactors: Record<string, number>
}

/**
 * Predict future mood based on comprehensive historical analysis
 */
export function predictMoodTrend(
  moodHistory: MoodEntry[],
  daysAhead: number = 7,
  targetDate?: Date
): PredictionResult {
  if (moodHistory.length < 3) {
    return getInsufficientDataPrediction()
  }

  // Sort entries by date (most recent first)
  const sortedHistory = moodHistory
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

  // Analyze patterns
  const patterns = analyzePatterns(sortedHistory)
  
  // Calculate base prediction using multiple algorithms
  const basePrediction = calculateBasePrediction(sortedHistory)
  
  // Apply pattern adjustments
  const patternAdjustedPrediction = applyPatternAdjustments(
    basePrediction, 
    patterns, 
    targetDate || new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000)
  )
  
  // Calculate confidence based on data quality and consistency
  const confidence = calculateConfidence(sortedHistory, patterns)
  
  // Determine trend
  const trend = determineTrend(sortedHistory)
  
  // Generate explanatory factors
  const factors = generatePredictionFactors(sortedHistory, patterns, trend)
  
  // Generate recommendations
  const recommendations = generateRecommendations(sortedHistory, patterns, trend)
  
  // Generate 7-day forecast
  const nextWeekForecast = generateWeekForecast(sortedHistory, patterns)

  return {
    predictedScore: Math.max(1, Math.min(10, Math.round(patternAdjustedPrediction * 10) / 10)),
    confidence: Math.round(confidence * 100) / 100,
    trend,
    factors,
    recommendations,
    nextWeekForecast
  }
}

/**
 * Analyze patterns in mood data
 */
function analyzePatterns(moodHistory: MoodEntry[]): PatternAnalysis {
  const weeklyPattern: Record<string, number> = {}
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  // Initialize weekly pattern
  dayNames.forEach(day => {
    weeklyPattern[day] = 0
  })
  
  // Calculate daily averages
  const dayGroups: Record<string, number[]> = {}
  moodHistory.forEach(entry => {
    const date = new Date(entry.timestamp)
    const dayName = dayNames[date.getDay()]
    
    if (!dayGroups[dayName]) dayGroups[dayName] = []
    dayGroups[dayName].push(entry.score)
  })
  
  Object.entries(dayGroups).forEach(([day, scores]) => {
    weeklyPattern[day] = scores.reduce((sum, score) => sum + score, 0) / scores.length
  })
  
  // Calculate monthly trend
  const recent30 = moodHistory.slice(0, 30)
  const older30 = moodHistory.slice(30, 60)
  
  let monthlyTrend: 'upward' | 'downward' | 'stable' = 'stable'
  if (recent30.length > 10 && older30.length > 10) {
    const recentAvg = recent30.reduce((sum, e) => sum + e.score, 0) / recent30.length
    const olderAvg = older30.reduce((sum, e) => sum + e.score, 0) / older30.length
    
    const change = (recentAvg - olderAvg) / olderAvg
    if (change > 0.05) monthlyTrend = 'upward'
    else if (change < -0.05) monthlyTrend = 'downward'
  }
  
  // Calculate volatility
  const scores = moodHistory.map(e => e.score)
  const mean = scores.reduce((sum, score) => sum + score, 0) / scores.length
  const variance = scores.reduce((sum, score) => sum + Math.pow(score - mean, 2), 0) / scores.length
  const standardDeviation = Math.sqrt(variance)
  
  let volatility: 'high' | 'medium' | 'low' = 'medium'
  if (standardDeviation > 2.5) volatility = 'high'
  else if (standardDeviation < 1.5) volatility = 'low'
  
  // Calculate consistency score (how predictable the mood patterns are)
  const consistencyScore = Math.max(0, Math.min(1, 1 - (standardDeviation / 4)))
  
  return {
    weeklyPattern,
    monthlyTrend,
    volatility,
    consistencyScore,
    seasonalFactors: {} // TODO: Implement seasonal analysis with more data
  }
}

/**
 * Calculate base prediction using multiple algorithms
 */
function calculateBasePrediction(moodHistory: MoodEntry[]): number {
  const recentEntries = moodHistory.slice(0, 14) // Last 2 weeks
  
  // Weighted average (recent entries have more weight)
  const weights = [0.3, 0.25, 0.2, 0.1, 0.05, 0.03, 0.02, 0.015, 0.01, 0.005, 0.004, 0.003, 0.002, 0.001]
  let weightedSum = 0
  let totalWeight = 0
  
  recentEntries.forEach((entry, i) => {
    if (weights[i]) {
      weightedSum += entry.score * weights[i]
      totalWeight += weights[i]
    }
  })
  
  const weightedAverage = totalWeight > 0 ? weightedSum / totalWeight : 5
  
  // Moving average
  const movingAverage = recentEntries
    .slice(0, 7)
    .reduce((sum, entry) => sum + entry.score, 0) / Math.min(7, recentEntries.length)
  
  // Trend-adjusted prediction
  const recent3 = recentEntries.slice(0, 3)
  const previous3 = recentEntries.slice(3, 6)
  let trendAdjustment = 0
  
  if (recent3.length === 3 && previous3.length === 3) {
    const recentAvg = recent3.reduce((sum, e) => sum + e.score, 0) / 3
    const previousAvg = previous3.reduce((sum, e) => sum + e.score, 0) / 3
    trendAdjustment = (recentAvg - previousAvg) * 0.3 // 30% trend influence
  }
  
  // Combine predictions
  return (weightedAverage * 0.5) + (movingAverage * 0.3) + ((movingAverage + trendAdjustment) * 0.2)
}

/**
 * Apply pattern-based adjustments to base prediction
 */
function applyPatternAdjustments(
  basePrediction: number, 
  patterns: PatternAnalysis, 
  targetDate: Date
): number {
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][targetDate.getDay()]
  
  // Get day-of-week adjustment
  const dayPattern = patterns.weeklyPattern[dayName] || basePrediction
  const overallAverage = Object.values(patterns.weeklyPattern)
    .filter(val => val > 0)
    .reduce((sum, val, _, arr) => sum + val / arr.length, 0)
  
  const dayAdjustment = overallAverage > 0 ? ((dayPattern - overallAverage) * 0.2) : 0
  
  // Apply monthly trend adjustment
  let trendAdjustment = 0
  if (patterns.monthlyTrend === 'upward') trendAdjustment = 0.1
  else if (patterns.monthlyTrend === 'downward') trendAdjustment = -0.1
  
  return basePrediction + dayAdjustment + trendAdjustment
}

/**
 * Calculate prediction confidence based on data quality
 */
function calculateConfidence(moodHistory: MoodEntry[], patterns: PatternAnalysis): number {
  // Base confidence on data quantity
  const dataQuantityScore = Math.min(1, moodHistory.length / 30) * 0.4
  
  // Base confidence on consistency
  const consistencyScore = patterns.consistencyScore * 0.3
  
  // Base confidence on recency
  const mostRecentEntry = moodHistory[0]
  const daysSinceLastEntry = Math.floor(
    (Date.now() - new Date(mostRecentEntry.timestamp).getTime()) / (1000 * 60 * 60 * 24)
  )
  const recencyScore = Math.max(0, (7 - daysSinceLastEntry) / 7) * 0.2
  
  // Base confidence on volatility (lower volatility = higher confidence)
  const volatilityScore = patterns.volatility === 'low' ? 0.1 : patterns.volatility === 'medium' ? 0.05 : 0
  
  return Math.max(0.1, Math.min(0.95, dataQuantityScore + consistencyScore + recencyScore + volatilityScore))
}

/**
 * Determine overall mood trend
 */
function determineTrend(moodHistory: MoodEntry[]): 'improving' | 'declining' | 'stable' {
  if (moodHistory.length < 6) return 'stable'
  
  const recent = moodHistory.slice(0, 7)
  const previous = moodHistory.slice(7, 14)
  
  if (recent.length < 3 || previous.length < 3) return 'stable'
  
  const recentAvg = recent.reduce((sum, e) => sum + e.score, 0) / recent.length
  const previousAvg = previous.reduce((sum, e) => sum + e.score, 0) / previous.length
  
  const change = (recentAvg - previousAvg) / previousAvg
  
  if (change > 0.08) return 'improving'
  if (change < -0.08) return 'declining'
  return 'stable'
}

/**
 * Generate explanatory factors for the prediction
 */
function generatePredictionFactors(
  moodHistory: MoodEntry[], 
  patterns: PatternAnalysis, 
  trend: string
): string[] {
  const factors: string[] = []
  
  // Data quality factor
  if (moodHistory.length >= 20) {
    factors.push(`Based on ${moodHistory.length} recent mood entries`)
  } else {
    factors.push(`Based on limited data (${moodHistory.length} entries) - confidence may be lower`)
  }
  
  // Trend factor
  if (trend === 'improving') {
    factors.push('Your mood has been trending upward recently')
  } else if (trend === 'declining') {
    factors.push('Your mood has been declining - this is temporary and normal')
  } else {
    factors.push('Your mood has been relatively stable')
  }
  
  // Volatility factor
  if (patterns.volatility === 'low') {
    factors.push('Your mood patterns are very consistent and predictable')
  } else if (patterns.volatility === 'high') {
    factors.push('Your mood varies significantly - predictions have lower confidence')
  }
  
  // Weekly pattern factor
  const bestDay = Object.entries(patterns.weeklyPattern)
    .filter(([_, score]) => score > 0)
    .sort(([_, a], [__, b]) => b - a)[0]
  
  if (bestDay) {
    factors.push(`Your mood is typically best on ${bestDay[0]}s`)
  }
  
  return factors
}

/**
 * Generate actionable recommendations
 */
function generateRecommendations(
  moodHistory: MoodEntry[], 
  patterns: PatternAnalysis, 
  trend: string
): string[] {
  const recommendations: string[] = []
  
  // Trend-based recommendations
  if (trend === 'improving') {
    recommendations.push('Keep up the great work! Your current strategies are working well')
  } else if (trend === 'declining') {
    recommendations.push('Consider what has changed recently and focus on self-care activities')
  }
  
  // Volatility-based recommendations
  if (patterns.volatility === 'high') {
    recommendations.push('Try establishing consistent daily routines to stabilize your mood')
    recommendations.push('Consider identifying and avoiding your main mood triggers')
  }
  
  // Weekly pattern recommendations
  const sortedDays = Object.entries(patterns.weeklyPattern)
    .filter(([_, score]) => score > 0)
    .sort(([_, a], [__, b]) => b - a)
  
  if (sortedDays.length >= 3) {
    const bestDay = sortedDays[0][0]
    const worstDay = sortedDays[sortedDays.length - 1][0]
    
    recommendations.push(`Plan important activities on ${bestDay}s when your mood is typically highest`)
    recommendations.push(`Practice extra self-care on ${worstDay}s which tend to be more challenging`)
  }
  
  // General recommendations
  recommendations.push('Continue daily mood tracking to improve prediction accuracy')
  
  return recommendations.slice(0, 3)
}

/**
 * Generate 7-day mood forecast
 */
function generateWeekForecast(
  moodHistory: MoodEntry[], 
  patterns: PatternAnalysis
): Array<{date: string, predictedMood: number, dayOfWeek: string}> {
  const forecast = []
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  
  for (let i = 1; i <= 7; i++) {
    const futureDate = new Date(Date.now() + i * 24 * 60 * 60 * 1000)
    const dayOfWeek = dayNames[futureDate.getDay()]
    
    // Get base prediction for each day
    const basePrediction = calculateBasePrediction(moodHistory)
    const adjustedPrediction = applyPatternAdjustments(basePrediction, patterns, futureDate)
    
    forecast.push({
      date: futureDate.toISOString().split('T')[0],
      predictedMood: Math.max(1, Math.min(10, Math.round(adjustedPrediction * 10) / 10)),
      dayOfWeek
    })
  }
  
  return forecast
}

/**
 * Fallback for insufficient data
 */
function getInsufficientDataPrediction(): PredictionResult {
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
  
  return {
    predictedScore: 5.5,
    confidence: 0.1,
    trend: 'stable',
    factors: ['Insufficient data for accurate prediction'],
    recommendations: [
      'Track your mood for at least 7 days to get better predictions',
      'Try to log your mood at the same time each day',
      'Include notes about what affects your mood'
    ],
    nextWeekForecast: [{
      date: tomorrow.toISOString().split('T')[0],
      predictedMood: 5.5,
      dayOfWeek: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][tomorrow.getDay()]
    }]
  }
}


