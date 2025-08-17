'use client'

import { useState } from 'react'
import { Check, Star, Users, Zap, Crown, Gift } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

const pricingPlans = [
  {
    name: 'Free',
    price: 0,
    description: 'Perfect for getting started',
    features: [
      'Daily mood tracking',
      'Basic analytics',
      '7-day mood history',
      'Standard insights'
    ],
    popular: false,
    cta: 'Get Started Free'
  },
  {
    name: 'Pro',
    price: 4.99,
    annualPrice: 3.99,
    description: 'Most popular choice',
    features: [
      'Everything in Free',
      'Unlimited mood history',
      'Advanced AI insights',
      'Custom mood tags',
      'Data export (CSV)',
      'Priority support',
      'Ad-free experience'
    ],
    popular: true,
    cta: 'Start Pro Trial',
    badge: 'Most Popular'
  },
  {
    name: 'Premium',
    price: 9.99,
    annualPrice: 7.99,
    description: 'For serious mood optimization',
    features: [
      'Everything in Pro',
      'Personalized coaching',
      'Mood prediction AI',
      'Advanced analytics',
      'Custom reports',
      'API access',
      'White-label options'
    ],
    popular: false,
    cta: 'Go Premium',
    badge: 'Best Value'
  },
  {
    name: 'Enterprise',
    price: 19.99,
    annualPrice: 15.99,
    description: 'For teams and organizations',
    features: [
      'Everything in Premium',
      'Team management',
      'Admin dashboard',
      'Custom integrations',
      'Dedicated support',
      'SLA guarantee',
      'On-premise option'
    ],
    popular: false,
    cta: 'Contact Sales',
    badge: 'Enterprise'
  }
]

export default function AdvancedPricing() {
  const [isAnnual, setIsAnnual] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('Pro')

  const handleUpgrade = (planName: string) => {
    // Handle subscription upgrade
    console.log(`Upgrading to ${planName}`)
  }

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Start free, upgrade when you&apos;re ready. Cancel anytime.
          </p>
          
          {/* Annual Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-lg ${!isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isAnnual}
              onCheckedChange={setIsAnnual}
              className="data-[state=checked]:bg-blue-600"
            />
            <span className={`text-lg ${isAnnual ? 'text-gray-900' : 'text-gray-500'}`}>
              Annual
            </span>
            {isAnnual && (
              <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                Save 20%
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {pricingPlans.map((plan) => (
            <Card 
              key={plan.name}
              className={`relative ${
                plan.popular 
                  ? 'ring-2 ring-blue-500 shadow-lg scale-105' 
                  : 'hover:shadow-lg transition-shadow'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-blue-600 text-white px-3 py-1">
                    {plan.badge}
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">
                    ${isAnnual ? plan.annualPrice : plan.price}
                  </span>
                  <span className="text-gray-600">/month</span>
                  {isAnnual && (
                    <div className="text-sm text-green-600 mt-1">
                      Billed annually (${(plan.annualPrice * 12).toFixed(0)})
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                  onClick={() => handleUpgrade(plan.name)}
                >
                  {plan.cta}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Referral Program */}
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-0">
          <CardContent className="p-8 text-center">
            <div className="flex justify-center mb-4">
              <Gift className="h-12 w-12 text-purple-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              Refer Friends, Get Rewards!
            </h3>
            <p className="text-gray-600 mb-6">
              Invite friends to DailyMood AI and both of you get 1 month free on any paid plan!
            </p>
            <div className="flex justify-center space-x-4">
              <Button variant="outline" className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white">
                Get Referral Link
              </Button>
              <Button className="bg-purple-600 hover:bg-purple-700">
                View Rewards
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Social Proof */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-8">
            Join our growing community
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">$0</div>
              <div className="text-gray-600">Revenue Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

