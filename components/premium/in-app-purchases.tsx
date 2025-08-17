'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Crown, 
  Brain, 
  Zap, 
  Target, 
  BarChart3, 
  Sparkles,
  CheckCircle,
  Lock,
  DollarSign,
  RefreshCw,
  Clock,
  TrendingUp,
  Users,
  Shield,
  Star
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'

interface InAppPurchaseProps {
  className?: string
}

interface PurchaseItem {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  icon: any
  features: string[]
  popular?: boolean
  limited?: boolean
  bestValue?: boolean
  discount?: number
  expiresAt?: string
  conversionRate?: number
  userCount?: number
}

const purchaseItems: PurchaseItem[] = [
  {
    id: 'lifetime-ai',
    name: 'Lifetime AI Access',
    description: 'Unlock unlimited AI insights forever',
    price: 9.99,
    originalPrice: 29.99,
    icon: Brain,
    features: [
      'Unlimited AI mood analysis',
      'Advanced pattern recognition',
      'Personalized recommendations',
      'Weekly AI reports',
      'Priority AI processing',
      'No monthly fees ever'
    ],
    popular: true,
    limited: true,
    bestValue: true,
    discount: 67,
    expiresAt: '2024-12-31',
    conversionRate: 85,
    userCount: 2500
  },
  {
    id: 'premium-charts',
    name: 'Premium Charts',
    description: 'Advanced analytics and visualizations',
    price: 4.99,
    originalPrice: 14.99,
    icon: BarChart3,
    features: [
      'Interactive chart types',
      'Custom date ranges',
      'Data export options',
      'Trend predictions',
      'Advanced filtering',
      'Mobile-optimized charts'
    ],
    discount: 67,
    conversionRate: 72,
    userCount: 1800
  },
  {
    id: 'goal-mastery',
    name: 'Goal Mastery Pack',
    description: 'Unlimited goals and advanced tracking',
    price: 6.99,
    originalPrice: 19.99,
    icon: Target,
    features: [
      'Unlimited goal categories',
      'Advanced progress tracking',
      'Goal templates library',
      'Community challenges',
      'Achievement badges',
      'Goal sharing features'
    ],
    discount: 65,
    conversionRate: 78,
    userCount: 2200
  },
  {
    id: 'productivity-boost',
    name: 'Productivity Boost',
    description: 'Enhanced features for power users',
    price: 7.99,
    originalPrice: 24.99,
    icon: Zap,
    features: [
      'Bulk mood entry',
      'Advanced scheduling',
      'Custom reminders',
      'Data backup',
      'Priority support',
      'API access'
    ],
    discount: 68,
    conversionRate: 68,
    userCount: 1500
  },
  {
    id: 'community-access',
    name: 'Community Access',
    description: 'Connect with wellness community',
    price: 3.99,
    originalPrice: 9.99,
    icon: Users,
    features: [
      'Community challenges',
      'Progress sharing',
      'Friend connections',
      'Group insights',
      'Expert Q&A',
      'Wellness events'
    ],
    discount: 60,
    conversionRate: 82,
    userCount: 3200
  },
  {
    id: 'data-security',
    name: 'Data Security Plus',
    description: 'Enhanced privacy and backup',
    price: 2.99,
    originalPrice: 7.99,
    icon: Shield,
    features: [
      'End-to-end encryption',
      'Advanced backup',
      'Data export',
      'Privacy controls',
      'GDPR compliance',
      'Audit logs'
    ],
    discount: 63,
    conversionRate: 75,
    userCount: 2100
  }
]

export function InAppPurchases({ className }: InAppPurchaseProps) {
  const { user } = useAuth()
  const { isPremium } = useSubscription()
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [purchasedItems, setPurchasedItems] = useState<string[]>([])
  const [showPurchaseModal, setShowPurchaseModal] = useState(false)
  const [currentItem, setCurrentItem] = useState<PurchaseItem | null>(null)
  const [timeLeft, setTimeLeft] = useState<string>('')

  // Load purchased items from localStorage
  useEffect(() => {
    if (user) {
      const stored = localStorage.getItem(`dailymood-purchases-${user.id}`)
      if (stored) {
        setPurchasedItems(JSON.parse(stored))
      }
    }
  }, [user])

  // Countdown timer for limited offers
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const endDate = new Date('2024-12-31')
      const diff = endDate.getTime() - now.getTime()
      
      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24))
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        setTimeLeft(`${days}d ${hours}h`)
      } else {
        setTimeLeft('Expired')
      }
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const handlePurchase = async (item: PurchaseItem) => {
    setCurrentItem(item)
    setShowPurchaseModal(true)
  }

  const confirmPurchase = async () => {
    if (!currentItem) return
    
    setIsProcessing(true)
    try {
      // Track analytics
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'in_app_purchase_click', {
          event_category: 'purchase',
          event_label: currentItem.id,
          value: currentItem.price
        })
      }

      // Simulate purchase process (replace with actual Stripe integration)
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Add to purchased items
      const newPurchased = [...purchasedItems, currentItem.id]
      setPurchasedItems(newPurchased)
      localStorage.setItem(`dailymood-purchases-${user.id}`, JSON.stringify(newPurchased))
      
      // Track successful purchase
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'purchase', {
          transaction_id: `purchase_${Date.now()}`,
          value: currentItem.price,
          currency: 'USD',
          items: [{
            item_id: currentItem.id,
            item_name: currentItem.name,
            price: currentItem.price,
            quantity: 1
          }]
        })
        
        // Track conversion funnel
        (window as any).gtag('event', 'conversion_step', {
          step: 'in_app_purchase_completed',
          event_category: 'conversion',
          event_label: currentItem.id,
          value: currentItem.price
        })
      }

      setShowPurchaseModal(false)
      setCurrentItem(null)
    } catch (error) {
      console.error('Purchase failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const isItemPurchased = (itemId: string) => {
    return purchasedItems.includes(itemId)
  }

  const isPremiumUser = isPremium

  return (
    <div className={className}>
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-3">
          Unlock Premium Features
        </h2>
        <p className="text-gray-600 text-lg mb-4">
          Choose individual features or upgrade to Premium for everything
        </p>
        
        {/* Limited Time Banner */}
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-full mb-4">
          <Clock className="h-5 w-5" />
          <span className="font-semibold">Limited Time Offers • {timeLeft} Left</span>
        </div>
        
        {/* Social Proof */}
        <div className="flex justify-center items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            <span>15,000+ users</span>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {purchaseItems.map((item) => {
          const Icon = item.icon
          const purchased = isItemPurchased(item.id)
          
          return (
            <Card 
              key={item.id} 
              className={`relative transition-all duration-200 hover:shadow-xl hover:scale-105 ${
                selectedItem === item.id ? 'ring-2 ring-calm-blue' : ''
              } ${purchased ? 'bg-green-50 border-green-200' : ''} ${
                item.bestValue ? 'ring-2 ring-yellow-400 bg-gradient-to-br from-yellow-50 to-orange-50' : ''
              }`}
            >
              {item.popular && (
                <Badge className="absolute -top-2 left-4 bg-gradient-to-r from-calm-blue to-calm-teal text-white">
                  Most Popular
                </Badge>
              )}
              
              {item.bestValue && (
                <Badge className="absolute -top-2 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white">
                  Best Value
                </Badge>
              )}
              
              {item.limited && (
                <Badge variant="destructive" className="absolute top-2 right-4 animate-pulse">
                  Limited Time
                </Badge>
              )}

              <CardHeader className="text-center pb-4">
                <div className="flex justify-center mb-3">
                  <div className={`p-3 rounded-full ${
                    purchased ? 'bg-green-100' : 'bg-calm-blue/10'
                  }`}>
                    {purchased ? (
                      <CheckCircle className="h-8 w-8 text-green-600" />
                    ) : (
                      <Icon className="h-8 w-8 text-calm-blue" />
                    )}
                  </div>
                </div>
                
                <CardTitle className="text-lg">
                  {item.name}
                </CardTitle>
                
                <p className="text-sm text-gray-600">
                  {item.description}
                </p>

                {purchased && (
                  <Badge variant="outline" className="mx-auto mt-2 border-green-300 text-green-700">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Purchased
                  </Badge>
                )}
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Features List */}
                <div className="space-y-2">
                  {item.features.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                      <Sparkles className="h-4 w-4 text-calm-blue flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Social Proof */}
                <div className="text-center text-xs text-gray-500 space-y-1">
                  <p>✓ {item.userCount?.toLocaleString()}+ users</p>
                  <p>✓ {item.conversionRate}% conversion rate</p>
                </div>

                {/* Pricing */}
                <div className="text-center">
                  {item.originalPrice && (
                    <p className="text-sm text-gray-500 line-through">
                      ${item.originalPrice}
                    </p>
                  )}
                  <p className="text-2xl font-bold text-gray-900">
                    ${item.price}
                  </p>
                  {item.discount && (
                    <p className="text-sm text-green-600 font-medium">
                      Save {item.discount}%
                    </p>
                  )}
                  <p className="text-xs text-gray-500">
                    One-time purchase
                  </p>
                </div>

                {/* Action Button */}
                {purchased ? (
                  <Button disabled className="w-full bg-green-100 text-green-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Already Purchased
                  </Button>
                ) : (
                  <Button 
                    onClick={() => handlePurchase(item)}
                    disabled={isProcessing}
                    className="w-full bg-gradient-to-r from-calm-blue to-calm-teal hover:from-calm-blue/90 hover:to-calm-teal/90"
                  >
                    <DollarSign className="h-4 w-4 mr-2" />
                    Purchase Now
                  </Button>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Premium Upgrade CTA */}
      {!isPremiumUser && (
        <Card className="mt-8 border-2 border-calm-blue/20 bg-gradient-to-r from-calm-blue/5 to-calm-teal/5">
          <CardContent className="text-center py-8">
            <Crown className="h-12 w-12 text-calm-blue mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Get Everything with Premium
            </h3>
            <p className="text-gray-600 mb-4">
              All features + unlimited access + priority support
            </p>
            <Button 
              onClick={() => window.open('/pricing', '_blank')}
              className="bg-gradient-to-r from-calm-blue to-calm-teal hover:from-calm-blue/90 hover:to-calm-teal/90 text-white font-semibold px-8 py-3"
            >
              <Crown className="h-4 w-4 mr-2" />
              Start 7-Day Free Trial
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Cancel anytime • No commitment
            </p>
          </CardContent>
        </Card>
      )}

      {/* Purchase Summary */}
      {purchasedItems.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Your Purchases</h4>
          <div className="flex flex-wrap gap-2">
            {purchasedItems.map((itemId) => {
              const item = purchaseItems.find(i => i.id === itemId)
              return item ? (
                <Badge key={itemId} variant="outline" className="bg-white">
                  <CheckCircle className="h-3 w-3 mr-1 text-green-600" />
                  {item.name}
                </Badge>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Purchase Confirmation Modal */}
      {showPurchaseModal && currentItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-lg">Confirm Purchase</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center">
                <div className="p-3 rounded-full bg-calm-blue/10 mx-auto mb-3 w-16 h-16 flex items-center justify-center">
                  <currentItem.icon className="h-8 w-8 text-calm-blue" />
                </div>
                <h3 className="text-lg font-semibold">{currentItem.name}</h3>
                <p className="text-gray-600 text-sm">{currentItem.description}</p>
              </div>
              
              <div className="text-center">
                {currentItem.originalPrice && (
                  <p className="text-sm text-gray-500 line-through">
                    ${currentItem.originalPrice}
                  </p>
                )}
                <p className="text-2xl font-bold text-gray-900">
                  ${currentItem.price}
                </p>
                {currentItem.discount && (
                  <p className="text-sm text-green-600 font-medium">
                    You save ${(currentItem.originalPrice || 0) - currentItem.price}!
                  </p>
                )}
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={confirmPurchase}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-calm-blue to-calm-teal"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4 mr-2" />
                      Confirm Purchase
                    </>
                  )}
                </Button>
                <Button 
                  onClick={() => setShowPurchaseModal(false)}
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
    </div>
  )
}
