'use client'
import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getVariant, trackExperiment } from '@/lib/experiments'

interface ExperimentResult {
  variant: 'control' | 'treatment' | null
  data: any
  isLoading: boolean
  trackConversion: (additionalData?: any) => void
}

export function useExperiment(experimentId: string): ExperimentResult {
  const { user } = useAuth()
  const [result, setResult] = useState<{
    variant: 'control' | 'treatment' | null
    data: any
    isLoading: boolean
  }>({
    variant: null,
    data: null,
    isLoading: true
  })

  useEffect(() => {
    if (!user?.id) {
      setResult({ variant: null, data: null, isLoading: false })
      return
    }

    // Get the user's variant assignment
    const assignment = getVariant(experimentId, user.id)
    
    if (assignment) {
      setResult({
        variant: assignment.variant,
        data: assignment.data,
        isLoading: false
      })

      // Track exposure immediately
      trackExperiment(experimentId, user.id, assignment.variant, 'exposure')
    } else {
      setResult({ variant: null, data: null, isLoading: false })
    }
  }, [experimentId, user?.id])

  const trackConversion = (additionalData?: any) => {
    if (user?.id && result.variant) {
      trackExperiment(experimentId, user.id, result.variant, 'conversion', additionalData)
    }
  }

  return {
    ...result,
    trackConversion
  }
}

// Hook for multiple experiments
export function useExperiments(experimentIds: string[]) {
  const { user } = useAuth()
  const [results, setResults] = useState<Record<string, ExperimentResult>>({})
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false)
      return
    }

    const experimentResults: Record<string, ExperimentResult> = {}

    experimentIds.forEach(experimentId => {
      const assignment = getVariant(experimentId, user.id)
      
      if (assignment) {
        experimentResults[experimentId] = {
          variant: assignment.variant,
          data: assignment.data,
          isLoading: false,
          trackConversion: (additionalData?: any) => {
            trackExperiment(experimentId, user.id, assignment.variant, 'conversion', additionalData)
          }
        }

        // Track exposure
        trackExperiment(experimentId, user.id, assignment.variant, 'exposure')
      } else {
        experimentResults[experimentId] = {
          variant: null,
          data: null,
          isLoading: false,
          trackConversion: () => {}
        }
      }
    })

    setResults(experimentResults)
    setIsLoading(false)
  }, [experimentIds, user?.id])

  return { results, isLoading }
}

// Hook for A/B testing components
export function useABTest<T extends Record<string, any>>(
  experimentId: string,
  variants: { control: T; treatment: T }
): { variant: 'control' | 'treatment'; config: T; trackConversion: () => void } {
  const experiment = useExperiment(experimentId)
  
  const config = experiment.variant === 'treatment' ? variants.treatment : variants.control
  const variant = experiment.variant || 'control'
  
  return {
    variant,
    config,
    trackConversion: experiment.trackConversion
  }
}


