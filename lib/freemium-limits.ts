'use client'

/**
 * Centralized Freemium Limits Configuration
 * Defines what free users can and cannot access
 */

export interface FreemiumLimits {
  // Mood Entry Limits
  maxMoodEntriesPerMonth: number
  maxTagsPerEntry: number
  maxNotesLength: number
  
  // Analytics Limits  
  maxChartHistory: number // days of history shown
  advancedChartsEnabled: boolean
  trendsAnalysisEnabled: boolean
  
  // AI Features
  aiPredictionsEnabled: boolean
  aiInsightsEnabled: boolean
  aiRecommendationsEnabled: boolean
  
  // Export & Data
  dataExportEnabled: boolean
  backupEnabled: boolean
  
  // Support
  prioritySupportEnabled: boolean
}

export const FREEMIUM_LIMITS: FreemiumLimits = {
  // FREE TIER LIMITS
  maxMoodEntriesPerMonth: 50,    // 50 entries per month (~1.6 per day)
  maxTagsPerEntry: 3,            // Up to 3 activities per entry (matches pricing page)
  maxNotesLength: 200,           // Short notes only
  
  // Basic analytics only
  maxChartHistory: 30,           // 30 days of history
  advancedChartsEnabled: false,  // No trends/correlations
  trendsAnalysisEnabled: false,  // No trend predictions
  
  // No AI features
  aiPredictionsEnabled: false,   // No AI predictions
  aiInsightsEnabled: false,      // No AI insights
  aiRecommendationsEnabled: false, // No AI recommendations
  
  // No data features
  dataExportEnabled: false,      // No CSV/PDF export
  backupEnabled: false,          // No data backup
  
  // Standard support only
  prioritySupportEnabled: false  // Email support only
}

export const PREMIUM_LIMITS: FreemiumLimits = {
  // UNLIMITED PREMIUM
  maxMoodEntriesPerMonth: Infinity,
  maxTagsPerEntry: Infinity,     // Unlimited activities
  maxNotesLength: Infinity,      // Unlimited notes
  
  // Advanced analytics
  maxChartHistory: 365,          // Full year history
  advancedChartsEnabled: true,   // Advanced charts
  trendsAnalysisEnabled: true,   // Trend predictions
  
  // Full AI features
  aiPredictionsEnabled: true,    // AI-powered predictions
  aiInsightsEnabled: true,       // AI insights
  aiRecommendationsEnabled: true, // AI recommendations
  
  // Full data features
  dataExportEnabled: true,       // CSV/PDF export
  backupEnabled: true,           // Automatic backups
  
  // Priority support
  prioritySupportEnabled: true   // Priority email & chat support
}

/**
 * Get limits based on subscription level
 */
export function getLimitsForSubscription(isPremium: boolean): FreemiumLimits {
  return isPremium ? PREMIUM_LIMITS : FREEMIUM_LIMITS
}

/**
 * Check if user has reached their monthly mood entry limit
 */
export function hasReachedMoodEntryLimit(
  currentCount: number, 
  isPremium: boolean
): boolean {
  const limits = getLimitsForSubscription(isPremium)
  return currentCount >= limits.maxMoodEntriesPerMonth
}

/**
 * Check if user can add more tags to a mood entry
 */
export function canAddMoreTags(
  currentTagCount: number, 
  isPremium: boolean
): boolean {
  const limits = getLimitsForSubscription(isPremium)
  return currentTagCount < limits.maxTagsPerEntry
}

/**
 * Check if notes exceed length limit
 */
export function isNotesWithinLimit(
  notesLength: number, 
  isPremium: boolean
): boolean {
  const limits = getLimitsForSubscription(isPremium)
  return notesLength <= limits.maxNotesLength
}

/**
 * Get upgrade prompts for different limit scenarios
 */
export const UPGRADE_PROMPTS = {
  MOOD_ENTRY_LIMIT: {
    title: "Monthly Limit Reached",
    message: "You've reached your 50 mood entries this month. Upgrade to Premium for unlimited tracking!",
    cta: "Upgrade for Unlimited Entries"
  },
  TAG_LIMIT: {
    title: "Activity Limit",
    message: "Free users can select up to 3 activities. Upgrade to Premium for unlimited activities!",
    cta: "Upgrade for Unlimited Activities"  
  },
  NOTES_LIMIT: {
    title: "Notes Too Long",
    message: "Free users are limited to 200 characters. Upgrade to Premium for unlimited notes!",
    cta: "Upgrade for Unlimited Notes"
  },
  AI_FEATURE: {
    title: "AI Feature",
    message: "AI predictions and insights are Premium features. Upgrade to unlock smart mood analysis!",
    cta: "Upgrade for AI Features"
  },
  ADVANCED_CHARTS: {
    title: "Advanced Analytics",
    message: "Advanced charts and trends are Premium features. Upgrade to see deeper insights!",
    cta: "Upgrade for Advanced Analytics"
  },
  DATA_EXPORT: {
    title: "Export Feature", 
    message: "Data export is a Premium feature. Upgrade to download your mood history!",
    cta: "Upgrade for Data Export"
  }
} as const

export type UpgradePromptType = keyof typeof UPGRADE_PROMPTS


