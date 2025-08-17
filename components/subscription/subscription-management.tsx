'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Crown, 
  CreditCard, 
  Calendar, 
  Settings, 
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Zap,
  Clock,
  TrendingUp,
  DollarSign,
  Shield,
  Users
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'

interface SubscriptionManagementProps {
  className?: string
}

interface SubscriptionDetails {
  id: string
  status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete'
  currentPeriodEnd: string
  trialEnd?: string
  plan: string
  price: number
  interval: 'month' | 'year'
  cancelAtPeriodEnd: boolean
}

export function SubscriptionManagement({ className }: SubscriptionManagementProps) {
  const { user } = useAuth()
  const { subscriptionLevel, isPremium, loading } = useSubscription()
  const [isProcessing, setIsProcessing] = useState(false)
  const [showCancelConfirm, setShowCancelConfirm] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [subscriptionDetails, setSubscriptionDetails] = useState<SubscriptionDetails | null>(null)
  const [trialDaysLeft, setTrialDaysLeft] = useState<number>(0)

  // Fetch subscription details from Stripe
  useEffect(() => {
    if (user && isPremium) {
      fetchSubscriptionDetails()
    }
  }, [user, isPremium])

  // Calculate trial days left
  useEffect(() => {
    if (subscriptionDetails?.trialEnd) {
      const trialEnd = new Date(subscriptionDetails.trialEnd)
      const now = new Date()
      const daysLeft = Math.ceil((trialEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      setTrialDaysLeft(Math.max(0, daysLeft))
    }
  }, [subscriptionDetails])

  const fetchSubscriptionDetails = async () => {
    try {
      const response = await fetch('/api/stripe/subscription-details', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id })
      })
      
      if (response.ok) {
        const data = await response.json()
        setSubscriptionDetails(data.subscription)
      }
    } catch (error) {
      console.error('Failed to fetch subscription details:', error)
    }
  }

  const getSubscriptionStatus = () => {
    if (!subscriptionDetails) return 'active'
    return subscriptionDetails.status
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'trialing': return 'bg-blue-100 text-blue-800'
      case 'past_due': return 'bg-red-100 text-red-800'
      case 'canceled': return 'bg-yellow-100 text-yellow-800'
      case 'incomplete': return 'bg-orange-100 text-orange-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'trialing': return <Clock className="h-4 w-4" />
      case 'past_due': return <AlertTriangle className="h-4 w-4" />
      case 'canceled': return <XCircle className="h-4 w-4" />
      case 'incomplete': return <AlertTriangle className="h-4 w-4" />
      default: return <XCircle className="h-4 w-4" />
    }
  }

  const handleCancelSubscription = async () => {
    setIsProcessing(true)
    try {
      // Call Stripe API to cancel subscription
      const response = await fetch('/api/stripe/cancel-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          subscriptionId: subscriptionDetails?.id 
        })
      })

      if (response.ok) {
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'subscription_cancelled', {
            event_category: 'subscription',
            event_label: 'user_cancelled',
            value: 1
          })
        }
        
        setShowCancelConfirm(false)
        // Refresh subscription details
        await fetchSubscriptionDetails()
      } else {
        throw new Error('Failed to cancel subscription')
      }
    } catch (error) {
      console.error('Failed to cancel subscription:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleReactivateSubscription = async () => {
    setIsProcessing(true)
    try {
      // Call Stripe API to reactivate subscription
      const response = await fetch('/api/stripe/reactivate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user?.id,
          subscriptionId: subscriptionDetails?.id 
        })
      })

      if (response.ok) {
        // Track analytics
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'subscription_reactivated', {
            event_category: 'subscription',
            event_label: 'user_reactivated',
            value: 1
          })
        }
        
        // Refresh subscription details
        await fetchSubscriptionDetails()
      } else {
        throw new Error('Failed to reactivate subscription')
      }
    } catch (error) {
      console.error('Failed to reactivate subscription:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const handleUpgrade = () => {
    // Track analytics
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'subscription_upgrade_click', {
        event_category: 'subscription',
        event_label: 'from_settings',
        value: 1
      })
    }
    setShowUpgradeModal(true)
  }

  const handleUpgradePlan = async (planName: string) => {
    setIsProcessing(true)
    try {
      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'subscription_upgrade_plan', {
          event_category: 'subscription',
          event_label: planName,
          value: 1
        })
      }

      // Redirect to Stripe checkout for upgrade
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          plan: planName.toLowerCase(),
          upgrade: true,
          currentSubscriptionId: subscriptionDetails?.id
        })
      })

      const { sessionId } = await response.json()
      
      // Redirect to Stripe checkout
      const stripe = await import('@stripe/stripe-js')
      const stripeInstance = await stripe.loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
      await stripeInstance?.redirectToCheckout({ sessionId })
      
    } catch (error) {
      console.error('Failed to upgrade plan:', error)
    } finally {
      setIsProcessing(false)
      setShowUpgradeModal(false)
    }
  }

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            Loading Subscription...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-20 bg-gray-100 rounded animate-pulse" />
        </CardContent>
      </Card>
    )
  }

  const status = getSubscriptionStatus()

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-yellow-500" />
          Subscription Management
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Current Plan Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Current Plan</span>
            <Badge className={getStatusColor(status)}>
              <div className="flex items-center gap-1">
                {getStatusIcon(status)}
                {status === 'trialing' ? 'Trial Active' : 
                 status === 'active' ? 'Premium Active' : 
                 status === 'canceled' ? 'Canceled' : 
                 status === 'past_due' ? 'Past Due' : 'Free'}
              </div>
            </Badge>
          </div>

          {isPremium && subscriptionDetails && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Plan</span>
                <span className="font-medium">{subscriptionDetails.plan}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Billing Cycle</span>
                <span className="font-medium capitalize">{subscriptionDetails.interval}ly</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Price</span>
                <span className="font-medium">${subscriptionDetails.price}/{subscriptionDetails.interval}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Next Billing</span>
                <span className="font-medium">
                  {new Date(subscriptionDetails.currentPeriodEnd).toLocaleDateString()}
                </span>
              </div>
            </>
          )}

          {/* Trial Status */}
          {status === 'trialing' && trialDaysLeft > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">
                  Trial ends in {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''}
                </span>
              </div>
              <Progress value={(7 - trialDaysLeft) / 7 * 100} className="h-2" />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          {!isPremium && (
            <Button onClick={handleUpgrade} className="w-full bg-gradient-to-r from-calm-blue to-calm-teal">
              <Crown className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
          )}

          {isPremium && (
            <div className="space-y-2">
              <Button onClick={handleUpgrade} variant="outline" className="w-full">
                <Settings className="h-4 w-4 mr-2" />
                Change Plan
              </Button>
              
              {subscriptionDetails?.cancelAtPeriodEnd ? (
                <Button 
                  onClick={handleReactivateSubscription}
                  variant="outline" 
                  className="w-full text-green-600 hover:text-green-700 hover:bg-green-50"
                  disabled={isProcessing}
                >
                  {isProcessing ? (
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="h-4 w-4 mr-2" />
                  )}
                  Reactivate Subscription
                </Button>
              ) : (
                <Button 
                  onClick={() => setShowCancelConfirm(true)} 
                  variant="outline" 
                  className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  Cancel Subscription
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Cancel Confirmation Modal */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-lg">Cancel Subscription?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm">
                  Your premium features will remain active until the end of your current billing period. 
                  You can reactivate anytime.
                </p>
                <div className="flex gap-3">
                  <Button 
                    onClick={handleCancelSubscription} 
                    variant="destructive" 
                    className="flex-1"
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Processing...' : 'Yes, Cancel'}
                  </Button>
                  <Button 
                    onClick={() => setShowCancelConfirm(false)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Keep Subscription
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Upgrade Plan Modal */}
        {showUpgradeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <Card className="w-full max-w-md mx-4">
              <CardHeader>
                <CardTitle className="text-lg">Upgrade Your Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <Button 
                    onClick={() => handleUpgradePlan('Pro')}
                    className="w-full justify-start"
                    variant="outline"
                    disabled={isProcessing}
                  >
                    <TrendingUp className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Pro Plan</div>
                      <div className="text-sm text-gray-500">$19.99/month - Advanced features</div>
                    </div>
                  </Button>
                  
                  <Button 
                    onClick={() => handleUpgradePlan('Premium')}
                    className="w-full justify-start"
                    variant="outline"
                    disabled={isProcessing}
                  >
                    <Crown className="h-4 w-4 mr-2" />
                    <div className="text-left">
                      <div className="font-medium">Premium Plan</div>
                      <div className="text-sm text-gray-500">$9.99/month - Most popular</div>
                    </div>
                  </Button>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowUpgradeModal(false)} 
                    variant="outline" 
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Additional Info */}
        <div className="text-xs text-gray-500 space-y-1">
          <p>• Cancel anytime - no commitment</p>
          <p>• 7-day free trial for new subscribers</p>
          <p>• Premium features unlock immediately</p>
          <p>• Secure payment via Stripe</p>
        </div>
      </CardContent>
    </Card>
  )
}
