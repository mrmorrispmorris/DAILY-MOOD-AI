'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import { supabase } from '@/app/lib/supabase-client'
import { 
  FreemiumLimits, 
  getLimitsForSubscription,
  hasReachedMoodEntryLimit,
  canAddMoreTags,
  isNotesWithinLimit,
  UPGRADE_PROMPTS,
  UpgradePromptType
} from '@/lib/freemium-limits'

interface FreemiumState {
  limits: FreemiumLimits
  monthlyMoodCount: number
  loading: boolean
}

export function useFreemiumLimits() {
  const { user } = useAuth()
  const { isPremium, loading: subscriptionLoading } = useSubscription()
  
  const [state, setState] = useState<FreemiumState>({
    limits: getLimitsForSubscription(false), // Default to free limits
    monthlyMoodCount: 0,
    loading: true
  })

  // Update limits when subscription status changes
  useEffect(() => {
    const newLimits = getLimitsForSubscription(isPremium)
    setState(prev => ({
      ...prev,
      limits: newLimits,
      loading: subscriptionLoading
    }))
  }, [isPremium, subscriptionLoading])

  // Load monthly mood entry count
  useEffect(() => {
    if (!user || subscriptionLoading) return

    const loadMonthlyCount = async () => {
      try {
        // Get first and last day of current month
        const now = new Date()
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
        
        const firstDayStr = firstDay.toISOString().split('T')[0]
        const lastDayStr = lastDay.toISOString().split('T')[0]

        const { count, error } = await supabase
          .from('mood_entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .gte('date', firstDayStr)
          .lte('date', lastDayStr)

        if (error) {
          console.error('Error loading monthly mood count:', error)
          return
        }

        setState(prev => ({
          ...prev,
          monthlyMoodCount: count || 0,
          loading: false
        }))

      } catch (error) {
        console.error('Exception loading monthly count:', error)
        setState(prev => ({ ...prev, loading: false }))
      }
    }

    loadMonthlyCount()
  }, [user, subscriptionLoading])

  // Limit checking functions
  const checkMoodEntryLimit = () => {
    return hasReachedMoodEntryLimit(state.monthlyMoodCount, isPremium)
  }

  const checkTagLimit = (currentTagCount: number) => {
    return !canAddMoreTags(currentTagCount, isPremium)
  }

  const checkNotesLimit = (notesLength: number) => {
    return !isNotesWithinLimit(notesLength, isPremium)
  }

  const checkFeatureAccess = (feature: keyof FreemiumLimits) => {
    return state.limits[feature] === true || isPremium
  }

  // Get upgrade prompt for specific limit
  const getUpgradePrompt = (promptType: UpgradePromptType) => {
    return UPGRADE_PROMPTS[promptType]
  }

  // Utility functions for common checks
  const canCreateMoodEntry = () => !checkMoodEntryLimit()
  const canUseAI = () => isPremium
  const canExportData = () => isPremium
  const canAccessAdvancedCharts = () => isPremium

  return {
    // State
    limits: state.limits,
    monthlyMoodCount: state.monthlyMoodCount,
    loading: state.loading,
    isPremium,
    
    // Limit checks
    checkMoodEntryLimit,
    checkTagLimit,
    checkNotesLimit,
    checkFeatureAccess,
    
    // Convenience functions
    canCreateMoodEntry,
    canUseAI,
    canExportData,
    canAccessAdvancedCharts,
    
    // Prompts
    getUpgradePrompt,
    
    // Remaining counts for UI
    remainingMoodEntries: isPremium 
      ? Infinity 
      : Math.max(0, state.limits.maxMoodEntriesPerMonth - state.monthlyMoodCount),
    
    // Progress percentages for UI
    moodEntryProgress: isPremium 
      ? 0 
      : Math.min(100, (state.monthlyMoodCount / state.limits.maxMoodEntriesPerMonth) * 100)
  }
}


