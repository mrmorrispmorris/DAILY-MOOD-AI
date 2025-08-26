'use client'

import Link from 'next/link'
import { useSubscription } from '@/hooks/use-subscription'

interface PremiumGateProps {
  children: React.ReactNode
  feature?: string
  className?: string
}

export default function PremiumGate({ 
  children, 
  feature = "Premium Feature",
  className = ""
}: PremiumGateProps) {
  const { isPremium, loading, upgradeToPremium } = useSubscription()
  
  // Show loading state
  if (loading) {
    return (
      <div className={`bg-gray-50 rounded-xl p-6 text-center animate-pulse ${className}`}>
        <div className="w-8 h-8 bg-gray-200 rounded-full mx-auto mb-4"></div>
        <div className="w-32 h-4 bg-gray-200 rounded mx-auto mb-2"></div>
        <div className="w-24 h-4 bg-gray-200 rounded mx-auto"></div>
      </div>
    )
  }
  
  // Show premium content if user has premium
  if (isPremium) {
    return <>{children}</>
  }
  
  // Show premium gate for free users
  return (
    <div className={`bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-dashed border-purple-200 rounded-xl p-8 text-center ${className}`}>
      <div className="text-5xl mb-4">🔒</div>
      <h3 className="text-xl font-bold text-gray-800 mb-2">{feature}</h3>
      <p className="text-gray-600 mb-6">
        Unlock unlimited features, AI predictions, and advanced analytics with Premium!
      </p>
      
      <div className="space-y-3">
        <button
          onClick={upgradeToPremium}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition shadow-lg"
        >
          Upgrade Now - $7.99/month
        </button>
        
        <Link href="/pricing" className="block">
          <button className="w-full bg-white text-purple-600 py-3 px-6 rounded-lg font-semibold hover:bg-gray-50 transition border-2 border-purple-200">
            View All Plans
          </button>
        </Link>
      </div>
      
      <p className="text-xs text-gray-500 mt-4">
        ✨ Join 1000+ users already tracking smarter
      </p>
    </div>
  )
}
