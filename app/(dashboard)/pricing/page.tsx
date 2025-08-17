'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Check, Crown, Sparkles, Zap, Target, Brain, BarChart3, Users, Shield, RefreshCw, TrendingUp, Clock, Star } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'

const plans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      'Up to 10 mood logs per month',
      'Basic mood tracking',
      'Simple charts',
      'Community support',
      'Basic goals (3 max)'
    ],
    limitations: [
      'Limited AI insights',
      'No custom tags',
      'Basic analytics',
      'No data export'
    ],
    popular: false,
    trial: false,
    conversionRate: 0
  },
  {
    name: 'Premium',
    price: 9.99,
    originalPrice: 14.99,
    description: 'Most popular choice for serious users',
    features: [
      'Unlimited mood logs',
      'Advanced AI insights',
      'Interactive charts & analytics',
      'Custom tags & categories',
      'Unlimited goals',
      'Data export & backup',
      'Priority support',
      '7-day free trial'
    ],
    limitations: [],
    popular: true,
    trial: true,
    savings: 'Save 33%',
    conversionRate: 85,
    userCount: 12500
  },
  {
    name: 'Pro',
    price: 19.99,
    originalPrice: 29.99,
    description: 'For power users and professionals',
    features: [
      'Everything in Premium',
      'Advanced analytics',
      'Team collaboration',
      'API access',
      'White-label options',
      'Dedicated support',
      'Custom integrations',
      '7-day free trial'
    ],
    limitations: [],
    popular: false,
    trial: true,
    savings: 'Save 33%',
    conversionRate: 72,
    userCount: 3200
  }
]

const features = [
  {
    name: 'AI-Powered Insights',
    description: 'Get personalized mood analysis and recommendations',
    icon: Brain,
    premium: true,
    conversionImpact: 'High'
  },
  {
    name: 'Advanced Analytics',
    description: 'Interactive charts and detailed trend analysis',
    icon: BarChart3,
    premium: true,
    conversionImpact: 'Medium'
  },
  {
    name: 'Unlimited Goals',
    description: 'Set and track unlimited wellness goals',
    icon: Target,
    premium: true,
    conversionImpact: 'Medium'
  },
  {
    name: 'Custom Tags',
    description: 'Create personalized categories and tags',
    icon: Zap,
    premium: true,
    conversionImpact: 'Low'
  },
  {
    name: 'Data Export',
    description: 'Export your data for backup or analysis',
    icon: Shield,
    premium: true,
    conversionImpact: 'Low'
  },
  {
    name: 'Priority Support',
    description: 'Get help when you need it most',
    icon: Users,
    premium: true,
    conversionImpact: 'Medium'
  }
]

export default function PricingPage() {
  const { user } = useAuth()
  const { subscriptionLevel, isPremium } = useSubscription()
  const [selectedPlan, setSelectedPlan] = useState<string>('Premium')
  const [isProcessing, setIsProcessing] = useState(false)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showTrialBanner, setShowTrialBanner] = useState(true)

  // Hide trial banner after 5 seconds for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowTrialBanner(false)
    }, 5000)
    return () => clearTimeout(timer)
  }, [])

  // Check for success/canceled parameters in URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('success') === 'true') {
      setShowSuccessMessage(true)
      // Track successful conversion
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion_step', {
          step: 'subscription_started',
          event_category: 'conversion',
          event_label: urlParams.get('plan') || 'premium',
          value: 1
        })
      }
    }
  }, [])

  const handleStartTrial = async (planName: string) => {
    setIsProcessing(true)
    
    try {
      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'trial_started', {
          event_category: 'conversion',
          event_label: planName,
          value: 1
        })
        
        // Track conversion funnel step
        (window as any).gtag('event', 'conversion_step', {
          step: 'trial_clicked',
          event_category: 'conversion',
          event_label: planName,
          value: 1
        })
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          plan: planName.toLowerCase(),
          interval: 'monthly',
          trial: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Track checkout redirect
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion_step', {
          step: 'checkout_redirect',
          event_category: 'conversion',
          event_label: planName,
          value: 1
        })
      }
      
      window.location.href = url
    } catch (error) {
      console.error('Failed to start trial:', error)
      // Track error
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'error', {
          error_message: 'trial_start_failed',
          event_category: 'error',
          event_label: planName
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpgrade = async (planName: string) => {
    setIsProcessing(true)
    
    try {
      // Track analytics
      if (typeof window !== 'undefined' && window.gtag) {
        (window as any).gtag('event', 'upgrade_clicked', {
          event_category: 'conversion',
          event_label: planName,
          value: 1
        })
        
        // Track conversion funnel step
        (window as any).gtag('event', 'conversion_step', {
          step: 'upgrade_clicked',
          event_category: 'conversion',
          event_label: planName,
          value: 1
        })
      }

      // Create Stripe checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id,
          email: user?.email,
          plan: planName.toLowerCase(),
          interval: 'monthly',
          trial: false,
          upgrade: true
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create checkout session')
      }

      const { url } = await response.json()
      
      // Track checkout redirect
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'conversion_step', {
          step: 'checkout_redirect',
          event_category: 'conversion',
          event_label: planName,
          value: 1
        })
      }
      
      window.location.href = url
    } catch (error) {
      console.error('Failed to upgrade:', error)
      // Track error
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'error', {
          error_message: 'upgrade_failed',
          event_category: 'error',
          event_label: planName
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  const isPremiumUser = isPremium

  return (
    <div className="min-h-screen bg-gradient-to-br from-calm-blue/5 via-white to-calm-teal/5">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start your wellness journey with our flexible pricing options
          </p>
          
          {/* Trial Banner */}
          {showTrialBanner && (
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-calm-blue to-calm-teal text-white px-6 py-3 rounded-full mb-8 animate-pulse">
              <Sparkles className="h-5 w-5" />
              <span className="font-semibold">7-Day Free Trial • Cancel Anytime</span>
            </div>
          )}

          {/* Success Message */}
          {showSuccessMessage && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full mb-8">
              <Check className="h-4 w-4" />
              <span>Welcome to Premium! Your trial has started.</span>
            </div>
          )}

          {/* Current Plan Status */}
          {isPremiumUser && (
            <div className="inline-flex items-center gap-2 bg-green-100 text-green-800 px-4 py-2 rounded-full">
              <Check className="h-4 w-4" />
              <span>You&apos;re currently on Premium!</span>
            </div>
          )}

          {/* Social Proof */}
          <div className="flex justify-center items-center gap-6 mt-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>15,000+ active users</span>
            </div>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" />
              <span>4.9/5 rating</span>
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span>85% conversion rate</span>
            </div>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {plans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative transition-all duration-200 hover:shadow-xl ${
                plan.popular ? 'ring-2 ring-calm-blue scale-105' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-calm-blue to-calm-teal text-white px-4 py-1">
                  Most Popular
                </Badge>
              )}

              {plan.savings && (
                <Badge variant="secondary" className="absolute -top-3 right-4 bg-red-100 text-red-700">
                  {plan.savings}
                </Badge>
              )}

              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl font-bold text-gray-900 mb-2">
                  {plan.name}
                </CardTitle>
                <p className="text-gray-600 mb-4">
                  {plan.description}
                </p>
                
                <div className="mb-4">
                  {plan.originalPrice && (
                    <p className="text-lg text-gray-500 line-through">
                      ${plan.originalPrice}/month
                    </p>
                  )}
                  <p className="text-4xl font-bold text-gray-900">
                    ${plan.price}
                    <span className="text-lg font-normal text-gray-600">/month</span>
                  </p>
                  {plan.trial && (
                    <p className="text-sm text-calm-blue font-medium">
                      Start with 7-day free trial
                    </p>
                  )}
                </div>

                {/* Conversion Metrics */}
                {plan.conversionRate && plan.userCount && (
                  <div className="text-xs text-gray-500 space-y-1">
                    <p>✓ {plan.userCount.toLocaleString()}+ users</p>
                    <p>✓ {plan.conversionRate}% conversion rate</p>
                  </div>
                )}
              </CardHeader>

              <CardContent className="space-y-6">
                {/* Features */}
                <div className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Limitations */}
                {plan.limitations.length > 0 && (
                  <div className="space-y-2 pt-4 border-t border-gray-200">
                    <p className="text-sm font-medium text-gray-500">Limitations:</p>
                    {plan.limitations.map((limitation, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="h-2 w-2 bg-gray-300 rounded-full" />
                        <span className="text-sm text-gray-500">{limitation}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Action Button */}
                <div className="pt-4">
                  {plan.name === 'Free' ? (
                    <Button 
                      disabled 
                      className="w-full bg-gray-100 text-gray-500 cursor-not-allowed"
                    >
                      Current Plan
                    </Button>
                  ) : plan.trial ? (
                    <Button 
                      onClick={() => handleStartTrial(plan.name)}
                      disabled={isProcessing || isPremiumUser}
                      className="w-full bg-gradient-to-r from-calm-blue to-calm-teal hover:from-calm-blue/90 hover:to-calm-teal/90 text-white font-semibold py-3"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : isPremiumUser ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Already Subscribed
                        </>
                      ) : (
                        <>
                          <Crown className="h-4 w-4 mr-2" />
                          Start Free Trial
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(plan.name)}
                      disabled={isProcessing}
                      className="w-full bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <Zap className="h-4 w-4 mr-2" />
                          Upgrade Now
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Feature Comparison
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <Card key={index} className="text-center p-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-calm-blue/10">
                      <Icon className="h-8 w-8 text-calm-blue" />
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {feature.name}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {feature.description}
                  </p>
                  {feature.premium && (
                    <div className="space-y-2">
                      <Badge className="bg-calm-blue/10 text-calm-blue border-calm-blue/20">
                        Premium Feature
                      </Badge>
                      <div className="text-xs text-gray-500">
                        Conversion Impact: <span className="font-medium">{feature.conversionImpact}</span>
                      </div>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                How does the 7-day free trial work?
              </h3>
              <p className="text-gray-600">
                Start your free trial immediately with no credit card required. You&apos;ll have full access to all Premium features for 7 days. 
                If you don&apos;t cancel, you&apos;ll be charged the monthly subscription fee.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Can I cancel anytime?
              </h3>
              <p className="text-gray-600">
                Yes! You can cancel your subscription at any time from your account settings. 
                You&apos;ll continue to have access until the end of your current billing period.
              </p>
            </div>
            
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                What happens to my data if I downgrade?
              </h3>
              <p className="text-gray-600">
                Your data is always safe and accessible. When you downgrade to Free, you&apos;ll still have access to your mood logs, 
                but some advanced features will be limited according to the Free plan.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="max-w-2xl mx-auto bg-gradient-to-r from-calm-blue to-calm-teal text-white">
            <CardContent className="p-8">
              <Crown className="h-16 w-16 mx-auto mb-4 text-white" />
              <h2 className="text-2xl font-bold mb-4">
                Ready to Transform Your Wellness Journey?
              </h2>
              <p className="text-lg mb-6 opacity-90">
                Join thousands of users who have improved their mental health with DailyMood AI
              </p>
              <Button 
                onClick={() => handleStartTrial('Premium')}
                disabled={isProcessing || isPremiumUser}
                size="lg"
                className="bg-white text-calm-blue hover:bg-gray-100 font-semibold px-8 py-3"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : isPremiumUser ? (
                  <>
                    <Check className="h-5 w-5 mr-2" />
                    Already Subscribed
                  </>
                ) : (
                  <>
                    <Crown className="h-5 w-5 mr-2" />
                    Start Your Free Trial
                  </>
                )}
              </Button>
              <p className="text-sm opacity-75 mt-3">
                No credit card required • Cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}