'use client'

import { useState } from 'react'
import { X, Gift } from 'lucide-react'
import Link from 'next/link'

export default function LaunchBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 relative">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Gift className="w-5 h-5" />
          <p className="text-sm font-medium">
            🎉 Launch Special: Get 50% off Premium for life! Use code LAUNCH50
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/pricing"
            className="bg-white text-purple-600 px-4 py-1 rounded-full text-sm font-semibold hover:bg-gray-100 transition"
          >
            Claim Offer
          </Link>
          <button
            onClick={() => setIsVisible(false)}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

