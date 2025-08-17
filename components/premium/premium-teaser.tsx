'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { X, Crown, Sparkles, Target, BarChart3, Brain, Zap, TrendingUp, Users, Clock } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'

interface PremiumTeaserProps {
  isOpen: boolean
  onClose: () => void
  triggerType: 'mood-logs' | 'goals' | 'insights' | 'charts' | 'streak' | 'social'
}

const teaserContent = {
  'mood-logs': {
    title: 'Unlock Your Full Potential! 👑',
    subtitle: 'You\'ve logged 20+ moods - time to upgrade!',
    features: [
      { icon: Target, text: 'Unlimited custom goals', premium: true },
      { icon: BarChart3, text: 'Advanced analytics & trends', premium: true },
      { icon: Brain, text: 'AI-powered insights', premium: true },
      { icon: Zap, text: 'Priority support', premium: true }
    ],
    cta: 'Start 7-Day Free Trial',
    badge: 'Most Popular',
    urgency: 'Limited Time Offer',
    socialProof: 'Join 10,000+ premium users'
  },
  'goals': {
    title: 'Achieve More with Premium Goals! 🎯',
    subtitle: 'Take your wellness journey to the next level',
    features: [
      { icon: Target, text: 'Unlimited goal categories', premium: true },
      { icon: BarChart3, text: 'Goal progress tracking', premium: true },
      { icon: Brain, text: 'AI goal recommendations', premium: true },
      { icon: Zap, text: 'Goal sharing & community', premium: true }
    ],
    cta: 'Upgrade Now',
    badge: 'Limited Time',
    urgency: 'Special Launch Price',
    socialProof: '95% of users achieve their goals'
  },
  'insights': {
    title: 'Discover Deeper Insights! 🧠',
    subtitle: 'Unlock AI-powered mood analysis',
    features: [
      { icon: Brain, text: 'Advanced AI insights', premium: true },
      { icon: BarChart3, text: 'Pattern recognition', premium: true },
      { icon: Target, text: 'Personalized recommendations', premium: true },
      { icon: Zap, text: 'Weekly reports', premium: true }
    ],
    cta: 'Get Premium Insights',
    badge: 'AI Powered',
    urgency: 'Exclusive Access',
    socialProof: 'AI insights improve mood by 40%'
  },
  'charts': {
    title: 'Visualize Your Journey! 📊',
    subtitle: 'Advanced charts and analytics await',
    features: [
      { icon: BarChart3, text: 'Interactive charts', premium: true },
      { icon: Target, text: 'Custom date ranges', premium: true },
      { icon: Brain, text: 'Trend predictions', premium: true },
      { icon: Zap, text: 'Export capabilities', premium: true }
    ],
    cta: 'Unlock Charts',
    badge: 'Pro Feature',
    urgency: 'Premium Only',
    socialProof: 'Charts help 80% track progress better'
  },
  'streak': {
    title: 'Keep Your Streak Alive! 🔥',
    subtitle: 'Don\'t break your momentum - upgrade now!',
    features: [
      { icon: TrendingUp, text: 'Streak protection', premium: true },
      { icon: Clock, text: 'Flexible logging times', premium: true },
      { icon: Brain, text: 'AI streak insights', premium: true },
      { icon: Zap, text: 'Motivation reminders', premium: true }
    ],
    cta: 'Protect My Streak',
    badge: 'Streak Saver',
    urgency: 'Act Now',
    socialProof: 'Premium users maintain 3x longer streaks'
  },
  'social': {
    title: 'Share Your Success! 🌟',
    subtitle: 'Connect with the wellness community',
    features: [
      { icon: Users, text: 'Community challenges', premium: true },
      { icon: TrendingUp, text: 'Progress sharing', premium: true },
      { icon: Brain, text: 'Group insights', premium: true },
      { icon: Zap, text: 'Friend connections', premium: true }
    ],
    cta: 'Join Community',
    badge: 'Social',
    urgency: 'Community Access',
    socialProof: '10,000+ active community members'
  }
}

export function PremiumTeaser({ isOpen, onClose, triggerType }: PremiumTeaserProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [showTeaser, setShowTeaser] = useState(false)
  const [moodCount, setMoodCount] = useState(0)
  const [showUrgency, setShowUrgency] = useState(false)
  const [abTestVariant, setAbTestVariant] = useState<'A' | 'B'>('A')

  // Check mood count from localStorage and set up A/B testing
  useEffect(() => {
    if (user) {
      const storedCount = localStorage.getItem(`dailymood-mood-count-${user.id}`)
      const count = storedCount ? parseInt(storedCount) : 0
      setMoodCount(count)
      
      // A/B test variant (50/50 split)
      const variant = Math.random() > 0.5 ? 'A' : 'B'
      setAbTestVariant(variant)
      
      // Show teaser after 20 logs for mood-logs trigger
      if (triggerType === 'mood-logs' && count >= 20 && !localStorage.getItem(`dailymood-teaser-shown-${user.id}`)) {
        setShowTeaser(true)
        localStorage.setItem(`dailymood-teaser-shown-${user.id}`, 'true')
        
        // Track teaser shown
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'premium_teaser_shown', {
            event_category: 'engagement',
            event_label: triggerType,
            custom_parameter: variant,
            value: 1
          })
        }
      }
      
      // Show urgency after 3 seconds for variant B
      if (variant === 'B') {
        setTimeout(() => setShowUrgency(true), 3000)
      }
    }
  }, [user, triggerType])

  // Don't show if not open or no user
  if (!isOpen || !user || !showTeaser) return null

  const content = teaserContent[triggerType]

  const handleUpgrade = () => {
    // Track analytics event with A/B test data
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'premium_teaser_click', {
        event_category: 'engagement',
        event_label: triggerType,
        custom_parameter: abTestVariant,
        value: 1
      })
      
      // Track conversion funnel step
      (window as any).gtag('event', 'conversion_step', {
        step: 'teaser_click',
        event_category: 'conversion',
        event_label: triggerType,
        value: 1
      })
    }
    
    router.push('/pricing')
    onClose()
  }

  const handleClose = () => {
    // Track dismiss event with A/B test data
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'premium_teaser_dismiss', {
        event_category: 'engagement',
        event_label: triggerType,
        custom_parameter: abTestVariant,
        value: 1
      })
    }
    
    onClose()
  }

  const handleMaybeLater = () => {
    // Track maybe later event
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'premium_teaser_maybe_later', {
        event_category: 'engagement',
        event_label: triggerType,
        custom_parameter: abTestVariant,
        value: 1
      })
    }
    
    // Set a reminder for later
    localStorage.setItem(`dailymood-reminder-${user.id}`, Date.now().toString())
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <Card className="w-full max-w-md mx-4 relative animate-in slide-in-from-bottom-4 duration-300">
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 h-8 w-8"
          onClick={handleClose}
        >
          <X className="h-4 w-4" />
        </Button>

        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-2">
            <Crown className="h-12 w-12 text-yellow-500" />
          </div>
          <CardTitle className="text-xl font-bold text-gray-900">
            {content.title}
          </CardTitle>
          <p className="text-gray-600 text-sm">
            {content.subtitle}
          </p>
          
          {/* Badge and Urgency */}
          <div className="flex justify-center gap-2 mt-2">
            {content.badge && (
              <Badge variant="secondary" className="bg-gradient-to-r from-calm-blue to-calm-teal text-white">
                {content.badge}
              </Badge>
            )}
            {showUrgency && (
              <Badge variant="destructive" className="animate-pulse">
                {content.urgency}
              </Badge>
            )}
          </div>
          
          {/* Social Proof */}
          <p className="text-xs text-gray-500 mt-2">
            {content.socialProof}
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Features List */}
          <div className="space-y-3">
            {content.features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <feature.icon className="h-5 w-5 text-calm-blue" />
                <span className="text-sm text-gray-700">{feature.text}</span>
                {feature.premium && (
                  <Sparkles className="h-4 w-4 text-yellow-500 ml-auto" />
                )}
              </div>
            ))}
          </div>

          {/* A/B Test Variant B: Add urgency timer */}
          {abTestVariant === 'B' && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-center">
              <Clock className="h-4 w-4 text-red-500 mx-auto mb-1" />
              <p className="text-xs text-red-700 font-medium">
                Special offer expires in 24 hours
              </p>
            </div>
          )}

          {/* CTA Button */}
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-calm-blue to-calm-teal hover:from-calm-blue/90 hover:to-calm-teal/90 text-white font-semibold py-3"
          >
            {content.cta}
          </Button>

          {/* Maybe Later Button for Variant B */}
          {abTestVariant === 'B' && (
            <Button 
              onClick={handleMaybeLater}
              variant="outline"
              className="w-full"
            >
              Maybe Later
            </Button>
          )}

          {/* Trial Info */}
          <p className="text-xs text-gray-500 text-center">
            Start your 7-day free trial. Cancel anytime.
          </p>
          
          {/* A/B Test Variant A: Add social proof */}
          {abTestVariant === 'A' && (
            <div className="text-center">
              <div className="flex justify-center items-center gap-1 text-xs text-gray-500">
                <Users className="h-3 w-3" />
                <span>Trusted by 50,000+ users worldwide</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
