'use client'
import { useExperiment, useABTest } from '@/hooks/use-experiment'

// Example: A/B test for pricing page headline
export function PricingPageTest() {
  const experiment = useExperiment('pricing_display')
  
  if (experiment.isLoading) {
    return <div className="animate-pulse bg-gray-200 h-20 rounded"></div>
  }
  
  // Default to control if no experiment running
  const config = experiment.data || {
    headline: 'Choose Your Plan',
    cta: 'Start Free Trial',
    description: 'Select the plan that works best for you'
  }
  
  const handleCTAClick = () => {
    // Track conversion when user clicks CTA
    experiment.trackConversion({ action: 'cta_click' })
    // Continue with normal CTA logic
    window.location.href = '/login'
  }
  
  return (
    <div className="text-center py-12">
      <h1 className="text-4xl font-bold text-gray-900 mb-4">
        {config.headline}
      </h1>
      <p className="text-xl text-gray-600 mb-8">
        {config.description}
      </p>
      <button
        onClick={handleCTAClick}
        className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
      >
        {config.cta}
      </button>
      
      {/* Debug info in development */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 p-4 bg-gray-100 rounded text-sm text-gray-600">
          <p>A/B Test: {experiment.variant || 'no-experiment'}</p>
        </div>
      )}
    </div>
  )
}

// Example: Landing page hero A/B test
export function LandingPageHeroTest() {
  const { variant, config, trackConversion } = useABTest('landing_page_hero', {
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
  })
  
  const handleSignup = () => {
    // Track conversion (function expects no arguments based on TypeScript error)
    trackConversion()
    window.location.href = '/login'
  }
  
  return (
    <div className="text-center py-20">
      <h1 className="text-5xl font-bold mb-6">
        {config.headline}
      </h1>
      <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
        {config.subtitle}
      </p>
      <button
        onClick={handleSignup}
        className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors"
      >
        {config.cta}
      </button>
      
      {/* Development debug */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 text-sm text-gray-500">
          Variant: {variant}
        </div>
      )}
    </div>
  )
}

// Example: Multi-experiment component
export function OnboardingFlowTest({ children }: { children: React.ReactNode }) {
  const experiment = useExperiment('onboarding_flow')
  
  if (experiment.isLoading) return <div>Loading...</div>
  
  // Default to control settings
  const config = experiment.data || { steps: 3, guided: false, showTips: false }
  
  const handleComplete = () => {
    experiment.trackConversion({ 
      onboarding_completed: true,
      steps_completed: config.steps 
    })
  }
  
  return (
    <div className="max-w-2xl mx-auto">
      {config.guided && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800">
            👋 Welcome! We'll guide you through {config.steps} simple steps to set up your mood tracking.
          </p>
        </div>
      )}
      
      <div className="space-y-6">
        {children}
        
        {config.showTips && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h3 className="font-semibold text-purple-800 mb-2">💡 Pro Tips</h3>
            <ul className="text-purple-700 text-sm space-y-1">
              <li>• Track your mood at the same time each day</li>
              <li>• Be honest about your feelings</li>
              <li>• Look for patterns after a week of tracking</li>
            </ul>
          </div>
        )}
      </div>
      
      <button
        onClick={handleComplete}
        className="w-full mt-8 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
      >
        Complete Setup
      </button>
      
      {/* Development info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-4 p-2 bg-gray-100 rounded text-xs text-gray-600">
          Experiment: {experiment.variant || 'control'} | Steps: {config.steps} | Guided: {config.guided ? 'Yes' : 'No'}
        </div>
      )}
    </div>
  )
}


