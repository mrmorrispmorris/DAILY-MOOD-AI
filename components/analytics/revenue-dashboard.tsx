'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  DollarSign, 
  Target, 
  BarChart3, 
  Zap,
  Crown,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Minus
} from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

interface RevenueMetrics {
  mrr: number
  arr: number
  totalUsers: number
  premiumUsers: number
  conversionRate: number
  churnRate: number
  ltv: number
  trialConversionRate: number
  abTestResults: {
    variant: string
    conversionRate: number
    revenue: number
    users: number
  }[]
  topConvertingFeatures: {
    feature: string
    conversionRate: number
    revenue: number
  }[]
  monthlyGrowth: number
  targetRevenue: number
}

export function RevenueDashboard() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<RevenueMetrics | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'7d' | '30d' | '90d'>('30d')

  // Mock data for demonstration - replace with actual API calls
  useEffect(() => {
    const fetchMetrics = async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const mockMetrics: RevenueMetrics = {
        mrr: 18500,
        arr: 222000,
        totalUsers: 15750,
        premiumUsers: 3150,
        conversionRate: 20.0,
        churnRate: 3.2,
        ltv: 89.50,
        trialConversionRate: 68.5,
        abTestResults: [
          { variant: 'A', conversionRate: 18.5, revenue: 9250, users: 500 },
          { variant: 'B', conversionRate: 22.3, revenue: 9250, users: 500 }
        ],
        topConvertingFeatures: [
          { feature: 'AI Insights', conversionRate: 85, revenue: 7850 },
          { feature: 'Advanced Charts', conversionRate: 72, revenue: 6800 },
          { feature: 'Goal Tracking', conversionRate: 78, revenue: 6200 },
          { feature: 'Community Access', conversionRate: 82, revenue: 5800 }
        ],
        monthlyGrowth: 12.5,
        targetRevenue: 20000
      }
      
      setMetrics(mockMetrics)
      setLoading(false)
    }

    fetchMetrics()
  }, [selectedPeriod])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse" />
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) return null

  const revenueProgress = (metrics.mrr / metrics.targetRevenue) * 100
  const isOnTrack = metrics.mrr >= metrics.targetRevenue * 0.9

  const getGrowthIcon = (value: number) => {
    if (value > 0) return <ArrowUpRight className="h-4 w-4 text-green-500" />
    if (value < 0) return <ArrowDownRight className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-gray-500" />
  }

  const getGrowthColor = (value: number) => {
    if (value > 0) return 'text-green-600'
    if (value < 0) return 'text-red-600'
    return 'text-gray-600'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Revenue Dashboard</h2>
          <p className="text-gray-600">Track progress toward $20K/month goal</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Badge variant={isOnTrack ? 'default' : 'secondary'}>
            {isOnTrack ? 'On Track' : 'Needs Attention'}
          </Badge>
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value as any)}
            className="border border-gray-300 rounded-md px-3 py-1 text-sm"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
        </div>
      </div>

      {/* Revenue Progress */}
      <Card className="bg-gradient-to-r from-calm-blue to-calm-teal text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm opacity-90">Monthly Recurring Revenue</p>
              <p className="text-3xl font-bold">${metrics.mrr.toLocaleString()}</p>
            </div>
            <Target className="h-12 w-12 opacity-80" />
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Target: ${metrics.targetRevenue.toLocaleString()}</span>
              <span>{revenueProgress.toFixed(1)}%</span>
            </div>
            <Progress value={revenueProgress} className="h-2 bg-white/20" />
            <p className="text-sm opacity-90">
              {isOnTrack ? '🎉 On track to reach $20K/month!' : '📈 Need ${(metrics.targetRevenue - metrics.mrr).toLocaleString()} more to reach goal'}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.totalUsers.toLocaleString()}</p>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex items-center gap-1 mt-2">
              {getGrowthIcon(metrics.monthlyGrowth)}
              <span className={`text-sm ${getGrowthColor(metrics.monthlyGrowth)}`}>
                {Math.abs(metrics.monthlyGrowth)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Premium Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.premiumUsers.toLocaleString()}</p>
              <Crown className="h-5 w-5 text-yellow-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              {metrics.conversionRate}% conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Trial Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">{metrics.trialConversionRate}%</p>
              <Zap className="h-5 w-5 text-blue-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              From free trials
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">Customer LTV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <p className="text-2xl font-bold">${metrics.ltv}</p>
              <DollarSign className="h-5 w-5 text-green-500" />
            </div>
            <p className="text-sm text-gray-500 mt-2">
              Lifetime value
            </p>
          </CardContent>
        </Card>
      </div>

      {/* A/B Test Results */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            A/B Test Results
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {metrics.abTestResults.map((result) => (
              <div key={result.variant} className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium">Variant {result.variant}</h4>
                  <Badge variant={result.variant === 'B' ? 'default' : 'secondary'}>
                    {result.variant === 'B' ? 'Winner' : 'Control'}
                  </Badge>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Conversion Rate:</span>
                    <span className="font-medium">{result.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Revenue:</span>
                    <span className="font-medium">${result.revenue.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Users:</span>
                    <span className="font-medium">{result.users}</span>
                  </div>
                </div>
                
                {result.variant === 'B' && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-center">
                    <p className="text-sm text-green-700 font-medium">
                      🎉 {((result.conversionRate / metrics.abTestResults[0].conversionRate - 1) * 100).toFixed(1)}% improvement
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Top Converting Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="h-5 w-5" />
            Top Converting Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {metrics.topConvertingFeatures.map((feature, index) => (
              <div key={feature.feature} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-calm-blue/10 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-calm-blue">{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium">{feature.feature}</p>
                    <p className="text-sm text-gray-500">{feature.conversionRate}% conversion</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold">${feature.revenue.toLocaleString()}</p>
                  <p className="text-sm text-gray-500">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Growth Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Growth Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Current Performance</h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Monthly Growth:</span>
                  <span className={`font-medium ${getGrowthColor(metrics.monthlyGrowth)}`}>
                    {metrics.monthlyGrowth > 0 ? '+' : ''}{metrics.monthlyGrowth}%
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Churn Rate:</span>
                  <span className="font-medium text-red-600">{metrics.churnRate}%</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Revenue Progress:</span>
                  <span className="font-medium">{revenueProgress.toFixed(1)}%</span>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-medium text-gray-900">Optimization Tips</h4>
              <div className="space-y-2 text-sm">
                {metrics.churnRate > 3 && (
                  <p className="text-red-600">⚠️ High churn rate - focus on retention</p>
                )}
                {metrics.trialConversionRate < 70 && (
                  <p className="text-orange-600">📈 Improve trial conversion with better onboarding</p>
                )}
                {!isOnTrack && (
                  <p className="text-blue-600">🎯 Need ${(metrics.targetRevenue - metrics.mrr).toLocaleString()} more MRR</p>
                )}
                {metrics.abTestResults[1].conversionRate > metrics.abTestResults[0].conversionRate && (
                  <p className="text-green-600">✅ Variant B is winning - consider implementing</p>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}




