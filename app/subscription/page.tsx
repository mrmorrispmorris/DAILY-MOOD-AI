'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useSubscription } from '@/hooks/use-subscription'
import Link from 'next/link'

export default function SubscriptionPage() {
  const { user } = useAuth()
  const { isPremium, loading } = useSubscription()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="mb-6">Please log in to view your subscription.</p>
          <Link href="/login?redirect=subscription" className="bg-purple-600 text-white px-6 py-3 rounded-lg">
            Login
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-4">Subscription Management</h1>
          <p className="text-xl text-gray-600">Manage your DailyMood AI subscription</p>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6">Current Plan</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between">
              <span>Plan Type:</span>
              <span className="font-semibold">{isPremium ? 'Premium' : 'Free'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Monthly Cost:</span>
              <span className="font-semibold">{isPremium ? '$10.00' : '$0.00'}</span>
            </div>
            
            <div className="flex justify-between">
              <span>Status:</span>
              <span className="font-semibold">{isPremium ? 'Active' : 'Inactive'}</span>
            </div>

            <div className="flex justify-between">
              <span>Account:</span>
              <span className="text-sm text-gray-500">{user.email}</span>
            </div>
          </div>

          <div className="mt-8">
            {!isPremium ? (
              <Link href="/pricing">
                <button className="w-full bg-purple-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-purple-700">
                  Upgrade to Premium - $10.00/month
                </button>
              </Link>
            ) : (
              <p className="text-green-600 font-semibold">You have an active Premium subscription!</p>
            )}
          </div>

          <div className="mt-6">
            <Link href="/dashboard" className="text-purple-600 hover:text-purple-700">
              Back to Dashboard →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}