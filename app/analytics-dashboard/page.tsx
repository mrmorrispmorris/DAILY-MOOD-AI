'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
// Using elegant symbols instead of Lucide icons for consistency

export default function AnalyticsDashboard() {
  const [stats] = useState({
    totalEntries: 42,
    averageMood: 7.2,
    streak: 5,
    bestDay: 'Monday',
    trends: {
      thisWeek: '+12%',
      thisMonth: '+8%'
    }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/working-dashboard" className="p-2 rounded-full bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Analytics</h1>
        </div>
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>◈</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-r from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>▲</span>
              <span className="text-sm text-teal-700 font-medium">Average Mood</span>
            </div>
            <p className="text-2xl font-bold text-teal-800">{stats.averageMood}</p>
            <p className="text-xs text-teal-600">This month {stats.trends.thisMonth}</p>
          </div>
          
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>◊</span>
              <span className="text-sm text-blue-700 font-medium">Streak</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">{stats.streak} days</p>
            <p className="text-xs text-blue-600">Keep it up!</p>
          </div>
        </div>

        {/* Chart Placeholder */}
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Mood Trends</h3>
          <div className="h-48 bg-gradient-to-r from-teal-50 to-blue-50 rounded-lg flex items-center justify-center">
            <div className="text-center">
              <span className="text-4xl font-light" style={{ color: 'var(--brand-tertiary)' }}>○</span>
              <p className="text-sm text-gray-500">Chart coming soon</p>
            </div>
          </div>
        </div>

        {/* Quick Insights */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900">Insights</h3>
          
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-amber-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-amber-800">Best Day</p>
                <p className="text-xs text-amber-700">Your mood is typically highest on {stats.bestDay}s</p>
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Progress</p>
                <p className="text-xs text-green-700">You've logged {stats.totalEntries} entries this month</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  )
}
