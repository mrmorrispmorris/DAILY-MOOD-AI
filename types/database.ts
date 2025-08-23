// Database types for the Daily Mood AI application
// Centralized type definitions to ensure consistency across the app

export interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  mood_label?: string
  mood_notes?: string
  notes?: string  // Alternative field name for compatibility
  activities?: string[]
  weather?: string
  sleep_hours?: number
  stress_level?: number
  energy_level?: number
  created_at: string
  updated_at?: string
}

export interface CreateMoodEntryData {
  mood_score: number
  mood_label?: string
  mood_notes?: string
  notes?: string
  activities?: string[]
  weather?: string
  sleep_hours?: number
  stress_level?: number
  energy_level?: number
}

export interface UpdateMoodEntryData extends Partial<CreateMoodEntryData> {
  id: string
}

// User profile and subscription types
export interface UserProfile {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  subscription_status: 'free' | 'premium' | 'trial'
  subscription_expires_at?: string
  created_at: string
  updated_at: string
}

export interface SubscriptionTier {
  id: string
  name: string
  description: string
  price: number
  currency: string
  features: string[]
  stripe_price_id?: string
  is_popular?: boolean
  max_mood_entries?: number
  ai_insights_included: boolean
}

// AI Insights types (for compatibility with enhanced-insights-service)
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

// Database table names (for consistency)
export const TABLE_NAMES = {
  MOODS: 'moods',
  MOOD_ENTRIES: 'mood_entries', 
  PROFILES: 'profiles',
  SUBSCRIPTIONS: 'subscriptions'
} as const

// Mood-related constants
export const MOOD_SCALE = {
  MIN: 1,
  MAX: 10,
  DEFAULT: 5
} as const

export const MOOD_LABELS = [
  '😢', '😕', '😐', '🙂', '😊', 
  '😄', '🤗', '😍', '🤩', '🥳'
] as const

export const ACTIVITY_CATEGORIES = [
  'work', 'exercise', 'social', 'hobbies', 'rest',
  'family', 'learning', 'entertainment', 'chores', 'travel'
] as const

// Type guards for runtime type checking
export function isMoodEntry(obj: any): obj is MoodEntry {
  return obj && 
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    typeof obj.mood_score === 'number' &&
    obj.mood_score >= MOOD_SCALE.MIN &&
    obj.mood_score <= MOOD_SCALE.MAX &&
    typeof obj.created_at === 'string'
}

export function isValidMoodScore(score: number): boolean {
  return Number.isInteger(score) && 
    score >= MOOD_SCALE.MIN && 
    score <= MOOD_SCALE.MAX
}

// Utility types
export type MoodTrend = 'improving' | 'declining' | 'stable'
export type SubscriptionStatus = 'free' | 'premium' | 'trial' | 'cancelled'
export type InsightType = 'trend' | 'correlation' | 'anomaly' | 'cycle'
export type RecommendationCategory = 'activity' | 'lifestyle' | 'timing' | 'mindfulness'
export type Priority = 'high' | 'medium' | 'low'
