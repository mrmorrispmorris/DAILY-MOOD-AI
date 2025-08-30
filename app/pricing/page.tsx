'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import Link from 'next/link'
import { Check, X, Sparkles, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function PricingPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
  }, [])

  const handleCheckout = async (priceId: string) => {
    setLoading(true)
    
    if (!user) {
      window.location.href = '/signup'
      return
    }

    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId
        })
      })

      const { sessionId } = await response.json()
      const stripe = await stripePromise
      
      if (stripe) {
        const { error } = await stripe.redirectToCheckout({ sessionId })
        if (error) console.error(error)
      }
    } catch (error) {
      console.error('Checkout error:', error)
      toast.error('Failed to start checkout. Please try again.', {
        duration: 5000,
        icon: '💳'
      })
    } finally {
      setLoading(false)
    }
  }

  const plans = {
    free: {
      name: 'Free',
      price: { monthly: 0, yearly: 0 },
      features: [
        'Daily mood tracking',
        'Basic mood charts',
        '30-day history',
        'Simple activity tracking',
        'Basic insights',
        'Mobile web app'
      ],
      limitations: [
        'No AI insights',
        'No data export',
        'No advanced analytics',
        'No push notifications',
        'Limited customization'
      ]
    },
    premium: {
      name: 'Premium',
      price: { monthly: 9.99, yearly: 99 },
      priceId: {
        monthly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_MONTHLY_PRICE_ID,
        yearly: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_YEARLY_PRICE_ID
      },
      features: [
        'Everything in Free',
        '✨ GPT-4 AI insights',
        '📊 Advanced analytics',
        '📈 Mood predictions',
        '🔔 Smart notifications',
        '📱 iOS & Android apps (coming)',
        '💾 Export to CSV/PDF',
        '🎯 Correlation analysis',
        '🏆 Achievement system',
        '🔒 Encrypted backups',
        '⚡ Priority support',
        '🎨 Custom themes'
      ],
      popular: true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>

        <div className="text-center mb-12">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold mb-4"
          >
            Choose Your Mental Wellness Plan
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 mb-8"
          >
            Start free, upgrade when you're ready
          </motion.p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'monthly' 
                  ? 'bg-white shadow-sm text-purple-600' 
                  : 'text-gray-600'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod('yearly')}
              className={`px-4 py-2 rounded-md transition-all ${
                billingPeriod === 'yearly' 
                  ? 'bg-white shadow-sm text-purple-600' 
                  : 'text-gray-600'
              }`}
            >
              Yearly
              <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                Save 17%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-8 relative"
          >
            <h3 className="text-2xl font-bold mb-2">{plans.free.name}</h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-gray-500">/forever</span>
            </div>

            <Link
              href={user ? '/dashboard' : '/signup'}
              className="w-full block text-center py-3 px-6 border-2 border-gray-300 rounded-xl font-semibold hover:bg-gray-50 transition-colors mb-6"
            >
              {user ? 'Current Plan' : 'Start Free'}
            </Link>

            <div className="space-y-3">
              {plans.free.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
              {plans.free.limitations.map((limitation, i) => (
                <div key={i} className="flex items-start gap-3 opacity-60">
                  <X className="w-5 h-5 text-gray-400 mt-0.5" />
                  <span className="text-gray-500">{limitation}</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Premium Plan */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-2xl shadow-xl p-8 relative transform scale-105"
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-400 text-black text-sm font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>

            <h3 className="text-2xl font-bold mb-2 flex items-center gap-2">
              {plans.premium.name}
              <Sparkles className="w-6 h-6" />
            </h3>
            <div className="mb-6">
              <span className="text-4xl font-bold">
                ${plans.premium.price[billingPeriod]}
              </span>
              <span className="opacity-90">
                /{billingPeriod === 'monthly' ? 'month' : 'year'}
              </span>
              {billingPeriod === 'yearly' && (
                <div className="text-sm opacity-90 mt-1">
                  That's only $8.25/month!
                </div>
              )}
            </div>

            <button
              onClick={() => handleCheckout(plans.premium.priceId[billingPeriod]!)}
              disabled={loading}
              className="w-full py-3 px-6 bg-white text-purple-600 rounded-xl font-bold hover:bg-gray-50 transition-all transform hover:scale-[1.02] disabled:opacity-50 mb-6"
            >
              {loading ? 'Processing...' : user ? 'Upgrade Now →' : 'Start 14-Day Trial →'}
            </button>

            <div className="space-y-3">
              {plans.premium.features.map((feature, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white mt-0.5" />
                  <span>{feature}</span>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 bg-white/10 rounded-lg">
              <p className="text-sm font-semibold mb-1">🎁 Special Offer</p>
              <p className="text-xs opacity-90">
                14-day free trial. Cancel anytime. No questions asked.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Trust Badges */}
        <div className="mt-16 text-center">
          <p className="text-gray-500 mb-4">Trusted by 10,000+ users worldwide</p>
          <div className="flex justify-center gap-8 items-center opacity-60">
            <span className="text-2xl">🔒</span>
            <span className="text-sm">256-bit encryption</span>
            <span className="text-2xl">🇪🇺</span>
            <span className="text-sm">GDPR compliant</span>
            <span className="text-2xl">💳</span>
            <span className="text-sm">Secure payments</span>
          </div>
        </div>
      </div>
    </div>
  )
}