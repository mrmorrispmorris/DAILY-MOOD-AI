'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  analyticsService, 
  ConversionMetrics, 
  UserBehaviorMetrics, 
  ConversionFunnel 
} from '@/lib/analytics/analytics-service'

interface AnalyticsDashboardProps {
  isAdmin?: boolean
  userId?: string
}

export function AnalyticsDashboard({ isAdmin = false, userId }: AnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<ConversionMetrics | null>(null)
  const [behavior, setBehavior] = useState<UserBehaviorMetrics | null>(null)
  const [funnel, setFunnel] = useState<ConversionFunnel[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadAnalytics()
  }, [dateRange])

  const loadAnalytics = async () => {
    if (!isAdmin && !userId) return
    
    setLoading(true)
    try {
      const [metricsData, behaviorData, funnelData] = await Promise.all([
        analyticsService.getConversionMetrics(dateRange),
        analyticsService.getUserBehaviorMetrics(dateRange),
        analyticsService.getConversionFunnel(dateRange)
      ])

      setMetrics(metricsData)
      setBehavior(behaviorData)
      setFunnel(funnelData)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  if (!isAdmin && !userId) {
    return (
      <div className="p-8 text-center">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Analytics dashboard requires admin access.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">📊 Analytics Dashboard</h1>
            <p className="text-gray-600 mt-1">Revenue optimization and user behavior insights</p>
          </div>
          
          {/* Date Range Selector */}
          <div className="flex items-center space-x-4">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <span className="text-gray-500">to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            />
            <button
              onClick={loadAnalytics}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        {/* Revenue Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Monthly Recurring Revenue"
            value={`$${metrics?.monthlyRecurringRevenue.toLocaleString() || 0}`}
            subtitle={`${metrics?.premiumUsers || 0} premium users`}
            trend="+12.5%"
            trendUp={true}
            icon="💰"
          />
          
          <MetricCard
            title="Conversion Rate"
            value={`${metrics?.conversionRate.toFixed(1) || 0}%`}
            subtitle={`${metrics?.premiumUsers || 0} / ${metrics?.totalUsers || 0} users`}
            trend="+2.1%"
            trendUp={true}
            icon="🎯"
          />
          
          <MetricCard
            title="Average Revenue Per User"
            value={`$${metrics?.averageRevenuePerUser.toFixed(2) || 0}`}
            subtitle="Monthly ARPU"
            trend="+5.3%"
            trendUp={true}
            icon="📈"
          />
          
          <MetricCard
            title="Customer Lifetime Value"
            value={`$${metrics?.lifetimeValue.toFixed(0) || 0}`}
            subtitle={`${metrics?.churnRate}% monthly churn`}
            trend="+8.7%"
            trendUp={true}
            icon="⭐"
          />
        </div>

        {/* User Behavior Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Daily Active Users"
            value={behavior?.dailyActiveUsers.toLocaleString() || '0'}
            subtitle="Last 24 hours"
            trend="+15.2%"
            trendUp={true}
            icon="👥"
          />
          
          <MetricCard
            title="Weekly Active Users"
            value={behavior?.weeklyActiveUsers.toLocaleString() || '0'}
            subtitle="Last 7 days"
            trend="+8.9%"
            trendUp={true}
            icon="📊"
          />
          
          <MetricCard
            title="Retention Rate"
            value={`${behavior?.retentionRate || 0}%`}
            subtitle="30-day retention"
            trend="+3.1%"
            trendUp={true}
            icon="🔄"
          />
          
          <MetricCard
            title="Avg Mood Entries/User"
            value={behavior?.avgMoodEntriesPerUser.toFixed(1) || '0'}
            subtitle="Per month"
            trend="+22.4%"
            trendUp={true}
            icon="📝"
          />
        </div>

        {/* Conversion Funnel */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">🔍 Conversion Funnel</h3>
          <div className="space-y-4">
            {funnel.map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-2xl">{index + 1}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{step.step}</h4>
                    <p className="text-sm text-gray-600">{step.users.toLocaleString()} users</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-lg font-bold text-green-600">
                      {step.conversionRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-500">conversion</div>
                  </div>
                  
                  {step.dropoffRate > 0 && (
                    <div className="text-right">
                      <div className="text-lg font-bold text-red-600">
                        {step.dropoffRate.toFixed(1)}%
                      </div>
                      <div className="text-sm text-gray-500">dropoff</div>
                    </div>
                  )}
                  
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${step.conversionRate}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Revenue Goal Progress */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl shadow-lg p-6">
          <h3 className="text-xl font-bold mb-4">🎯 $10K/Month Revenue Goal</h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold">
                ${metrics?.monthlyRecurringRevenue.toLocaleString() || 0}
              </div>
              <div className="text-purple-100">
                {((metrics?.monthlyRecurringRevenue || 0) / 10000 * 100).toFixed(1)}% of goal reached
              </div>
            </div>
            
            <div className="w-1/2">
              <div className="bg-white/20 rounded-full h-4">
                <div 
                  className="bg-white h-4 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${Math.min(100, ((metrics?.monthlyRecurringRevenue || 0) / 10000 * 100))}%` 
                  }}
                />
              </div>
              <div className="text-right mt-2 text-purple-100">
                ${(10000 - (metrics?.monthlyRecurringRevenue || 0)).toLocaleString()} to go
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

interface MetricCardProps {
  title: string
  value: string
  subtitle: string
  trend: string
  trendUp: boolean
  icon: string
}

function MetricCard({ title, value, subtitle, trend, trendUp, icon }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`text-sm font-semibold px-2 py-1 rounded ${
          trendUp 
            ? 'text-green-700 bg-green-100' 
            : 'text-red-700 bg-red-100'
        }`}>
          {trend}
        </div>
      </div>
      
      <div className="text-2xl font-bold text-gray-900 mb-1">{value}</div>
      <div className="text-sm font-medium text-gray-900 mb-1">{title}</div>
      <div className="text-sm text-gray-600">{subtitle}</div>
    </motion.div>
  )
}


