'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function PricingPage() {
  const [loading, setLoading] = useState(false)

  const handleSubscribe = async (priceId: string) => {
    setLoading(true)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: 'test-user', 
          priceId 
        })
      })
      
      const { url } = await response.json()
      if (url) {
        window.location.href = url
      }
    } catch (error) {
      console.error('Subscription error:', error)
      alert('Payment system temporarily unavailable')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Start tracking your mood with AI-powered insights
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg p-8 border-2 border-gray-200">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Free</h3>
              <div className="text-4xl font-bold text-blue-600 mb-4">
                $0<span className="text-lg text-gray-500">/month</span>
              </div>
              <p className="text-gray-600">Perfect for getting started</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Basic mood tracking
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Simple charts
              </li>
              <li className="flex items-center">
                <span className="text-green-500 mr-3">✓</span>
                Up to 3 activities per entry
              </li>
            </ul>
            
            <Link href="/login">
              <button className="w-full py-3 bg-gray-100 text-gray-800 rounded-lg font-semibold hover:bg-gray-200 transition">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-purple-600 to-blue-600 text-white rounded-2xl shadow-xl p-8 relative">
            <div className="absolute top-4 right-4 bg-yellow-400 text-purple-800 px-3 py-1 rounded-full text-sm font-bold">
              POPULAR
            </div>
            
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold mb-2">Premium</h3>
              <div className="text-4xl font-bold mb-4">
                $7.99<span className="text-lg opacity-80">/month</span>
              </div>
              <p className="opacity-90">Advanced insights & unlimited features</p>
            </div>
            
            <ul className="space-y-3 mb-8">
              <li className="flex items-center">
                <span className="text-yellow-300 mr-3">✓</span>
                Everything in Free
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-3">✓</span>
                AI-powered predictions
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-3">✓</span>
                Unlimited activities
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-3">✓</span>
                Advanced analytics
              </li>
              <li className="flex items-center">
                <span className="text-yellow-300 mr-3">✓</span>
                Priority support
              </li>
            </ul>
            
            <button
              onClick={() => handleSubscribe('price_test_premium')}
              disabled={loading}
              className="w-full py-3 bg-white text-purple-600 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Start Premium'}
            </button>
          </div>
        </div>
        
        {/* Back to Home */}
        <div className="text-center mt-12">
          <Link href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
