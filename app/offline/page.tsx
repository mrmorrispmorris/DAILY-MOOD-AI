'use client'

import Link from 'next/link'

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full mx-auto mb-6 flex items-center justify-center">
          <span className="text-3xl">📶</span>
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          You're Offline
        </h1>
        
        <p className="text-gray-600 mb-6">
          It looks like you're not connected to the internet. Don't worry, you can still:
        </p>
        
        <div className="space-y-3 mb-8 text-left">
          <div className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700">View your cached mood data</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700">Log moods (will sync when online)</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-green-500">✓</span>
            <span className="text-gray-700">Browse your analytics</span>
          </div>
        </div>
        
        <Link 
          href="/dashboard"
          className="w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 px-6 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all inline-block"
        >
          Continue to Dashboard
        </Link>
        
        <p className="text-sm text-gray-500 mt-4">
          Your data will automatically sync when you're back online.
        </p>
      </div>
    </div>
  )
}