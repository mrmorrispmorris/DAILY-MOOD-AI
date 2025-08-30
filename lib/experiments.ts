interface Experiment {
  id: string
  name: string
  description: string
  variants: {
    control: any
    treatment: any
  }
  allocation: number // percentage for treatment (0-100)
  metrics: string[]
  status: 'draft' | 'running' | 'paused' | 'completed'
  startDate: string
  endDate?: string
  targetSampleSize: number
}

export const experiments: Experiment[] = [
  {
    id: 'pricing_display',
    name: 'Pricing Page Optimization',
    description: 'Test different messaging on pricing page to improve conversions',
    variants: {
      control: { 
        headline: 'Choose Your Plan',
        cta: 'Start Free Trial',
        description: 'Select the plan that works best for you'
      },
      treatment: { 
        headline: 'Invest in Your Mental Health',
        cta: 'Start Your Journey',
        description: 'Transform your mental wellness with AI-powered insights'
      }
    },
    allocation: 50,
    metrics: ['conversion_rate', 'trial_starts', 'page_time'],
    status: 'running',
    startDate: '2025-01-29',
    targetSampleSize: 1000
  },
  {
    id: 'onboarding_flow',
    name: 'Onboarding Flow Test',
    description: 'Compare simplified vs detailed onboarding experience',
    variants: {
      control: { 
        steps: 3, 
        guided: false,
        showTips: false
      },
      treatment: { 
        steps: 5, 
        guided: true,
        showTips: true,
        personalizedQuestions: true
      }
    },
    allocation: 50,
    metrics: ['activation_rate', 'completion_rate', 'first_mood_logged'],
    status: 'running',
    startDate: '2025-01-29',
    targetSampleSize: 500
  },
  {
    id: 'landing_page_hero',
    name: 'Landing Page Hero Section',
    description: 'Test emotional vs rational messaging in hero section',
    variants: {
      control: {
        headline: 'Track Your Mood, Transform Your Life',
        subtitle: 'Understand your emotions with AI-powered insights',
        cta: 'Start Free Trial'
      },
      treatment: {
        headline: 'Finally Understand Why You Feel The Way You Do',
        subtitle: 'Stop guessing about your mental health. Get AI insights that actually help.',
        cta: 'Discover Your Patterns'
      }
    },
    allocation: 50,
    metrics: ['signup_rate', 'bounce_rate', 'scroll_depth'],
    status: 'running',
    startDate: '2025-01-29',
    targetSampleSize: 2000
  }
]

export function getVariant(experimentId: string, userId: string): { variant: 'control' | 'treatment', data: any } | null {
  const experiment = experiments.find(e => e.id === experimentId && e.status === 'running')
  if (!experiment) return null
  
  // Simple hash-based assignment for consistent user experience
  const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const isInTreatment = (hash % 100) < experiment.allocation
  
  return {
    variant: isInTreatment ? 'treatment' : 'control',
    data: isInTreatment ? experiment.variants.treatment : experiment.variants.control
  }
}

// Track experiment exposure and conversions
export async function trackExperiment(
  experimentId: string, 
  userId: string, 
  variant: 'control' | 'treatment',
  event: 'exposure' | 'conversion',
  additionalData?: any
) {
  try {
    // In a real app, this would send to your analytics service
    const eventData = {
      experiment_id: experimentId,
      user_id: userId,
      variant,
      event_type: event,
      timestamp: new Date().toISOString(),
      additional_data: additionalData
    }
    
    // Store in local storage for development
    const existingData = JSON.parse(localStorage.getItem('experiment_data') || '[]')
    existingData.push(eventData)
    localStorage.setItem('experiment_data', JSON.stringify(existingData))
    
    console.log('🧪 Experiment tracked:', eventData)
    
    // In production, also send to your database
    if (typeof window !== 'undefined' && (window as any).supabase) {
      await (window as any).supabase.from('experiment_events').insert({
        experiment_id: experimentId,
        user_id: userId,
        variant,
        event_type: event,
        additional_data: additionalData,
        timestamp: new Date().toISOString()
      })
    }
  } catch (error) {
    console.error('Experiment tracking failed:', error)
  }
}

// Get experiment results
export function getExperimentResults(experimentId: string) {
  const data = JSON.parse(localStorage.getItem('experiment_data') || '[]')
  const experimentData = data.filter((d: any) => d.experiment_id === experimentId)
  
  const results: any = {
    control: {
      exposures: experimentData.filter((d: any) => d.variant === 'control' && d.event_type === 'exposure').length,
      conversions: experimentData.filter((d: any) => d.variant === 'control' && d.event_type === 'conversion').length
    },
    treatment: {
      exposures: experimentData.filter((d: any) => d.variant === 'treatment' && d.event_type === 'exposure').length,
      conversions: experimentData.filter((d: any) => d.variant === 'treatment' && d.event_type === 'conversion').length
    }
  }
  
  results.control.conversion_rate = results.control.exposures > 0 ? 
    (results.control.conversions / results.control.exposures) * 100 : 0
  results.treatment.conversion_rate = results.treatment.exposures > 0 ? 
    (results.treatment.conversions / results.treatment.exposures) * 100 : 0
  
  const lift = results.control.conversion_rate > 0 ? 
    ((results.treatment.conversion_rate - results.control.conversion_rate) / results.control.conversion_rate) * 100 : 0
  
  return { ...results, lift }
}

// Statistical significance calculation
export function calculateSignificance(experimentId: string) {
  const results = getExperimentResults(experimentId)
  
  // Simple z-test for proportions
  const p1 = results.control.conversion_rate / 100
  const p2 = results.treatment.conversion_rate / 100
  const n1 = results.control.exposures
  const n2 = results.treatment.exposures
  
  if (n1 < 30 || n2 < 30) {
    return { significant: false, confidence: 0, message: 'Sample size too small' }
  }
  
  const pooled_p = (results.control.conversions + results.treatment.conversions) / (n1 + n2)
  const se = Math.sqrt(pooled_p * (1 - pooled_p) * (1/n1 + 1/n2))
  const z = (p2 - p1) / se
  
  // Two-tailed test
  const p_value = 2 * (1 - normalCDF(Math.abs(z)))
  const confidence = (1 - p_value) * 100
  const significant = p_value < 0.05
  
  return {
    significant,
    confidence: Math.round(confidence * 100) / 100,
    p_value: Math.round(p_value * 10000) / 10000,
    z_score: Math.round(z * 100) / 100
  }
}

// Approximation of normal CDF
function normalCDF(x: number): number {
  return 0.5 * (1 + Math.sign(x) * Math.sqrt(1 - Math.exp(-2 * x * x / Math.PI)))
}


