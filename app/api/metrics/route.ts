import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

interface ApplicationMetrics {
  timestamp: string
  period: string
  application: {
    version: string
    environment: string
    uptime: number
    nodeVersion: string
    memoryUsage: NodeJS.MemoryUsage
  }
  performance: {
    responseTime: number
    throughput: number
    errorRate: number
    successRate: number
  }
  business: {
    totalUsers: number
    activeUsers: {
      daily: number
      weekly: number
      monthly: number
    }
    moodEntries: {
      today: number
      thisWeek: number
      total: number
    }
    premium: {
      subscribers: number
      conversionRate: number
      monthlyRecurringRevenue: number
      churnRate: number
    }
  }
  technical: {
    database: {
      connections: number
      queryTime: number
      slowQueries: number
    }
    api: {
      requestsPerMinute: number
      topEndpoints: EndpointMetric[]
      errors: ErrorMetric[]
    }
    features: {
      aiInsights: FeatureMetric
      moodLogging: FeatureMetric
      blog: FeatureMetric
      authentication: FeatureMetric
    }
  }
}

interface EndpointMetric {
  endpoint: string
  requests: number
  avgResponseTime: number
  errorRate: number
}

interface ErrorMetric {
  type: string
  count: number
  lastOccurred: string
  message: string
}

interface FeatureMetric {
  usage: number
  successRate: number
  avgResponseTime: number
  errors: number
}

const startTime = Date.now()

export async function GET(request: Request) {
  const metricsStartTime = Date.now()
  
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '24h'
    const includeBusinessMetrics = searchParams.get('business') === 'true'
    
    // Check authorization for sensitive metrics
    const isAuthorized = await checkAuthorization(request)
    
    const metrics: ApplicationMetrics = {
      timestamp: new Date().toISOString(),
      period,
      application: {
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        nodeVersion: process.version,
        memoryUsage: process.memoryUsage()
      },
      performance: await getPerformanceMetrics(period),
      business: isAuthorized ? await getBusinessMetrics(period) : getPublicBusinessMetrics(),
      technical: await getTechnicalMetrics(period)
    }

    // Calculate metrics collection time
    const collectionTime = Date.now() - metricsStartTime
    metrics.performance.responseTime = collectionTime

    return NextResponse.json(metrics, {
      headers: {
        'Cache-Control': 'private, max-age=60', // Cache for 1 minute
        'Content-Type': 'application/json',
        'X-Collection-Time': collectionTime.toString()
      }
    })

  } catch (error: any) {
    console.error('Metrics collection failed:', error)
    
    return NextResponse.json({
      error: 'Failed to collect metrics',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

async function checkAuthorization(request: Request): Promise<boolean> {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Check if user is admin (in production, this would be more sophisticated)
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    return profile?.is_admin || false
  } catch {
    return false
  }
}

async function getPerformanceMetrics(period: string) {
  // In production, these would come from actual monitoring systems
  return {
    responseTime: Math.random() * 200 + 50, // Mock: 50-250ms
    throughput: Math.random() * 1000 + 500,  // Mock: 500-1500 req/min
    errorRate: Math.random() * 2,            // Mock: 0-2% error rate
    successRate: 100 - (Math.random() * 2)   // Mock: 98-100% success rate
  }
}

async function getBusinessMetrics(period: string) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get various date ranges
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
    const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)

    // Parallel queries for better performance
    const [
      totalUsersResult,
      dailyActiveResult,
      weeklyActiveResult,
      monthlyActiveResult,
      moodTodayResult,
      moodWeekResult,
      moodTotalResult,
      subscriptionsResult
    ] = await Promise.allSettled([
      supabase.from('users').select('count', { count: 'exact', head: true }),
      supabase.from('users').select('count', { count: 'exact', head: true }).gte('last_sign_in_at', today.toISOString()),
      supabase.from('users').select('count', { count: 'exact', head: true }).gte('last_sign_in_at', weekAgo.toISOString()),
      supabase.from('users').select('count', { count: 'exact', head: true }).gte('last_sign_in_at', monthAgo.toISOString()),
      supabase.from('mood_entries').select('count', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
      supabase.from('mood_entries').select('count', { count: 'exact', head: true }).gte('created_at', weekAgo.toISOString()),
      supabase.from('mood_entries').select('count', { count: 'exact', head: true }),
      supabase.from('subscriptions').select('count', { count: 'exact', head: true }).eq('status', 'active')
    ])

    // Extract results safely
    const totalUsers = totalUsersResult.status === 'fulfilled' ? totalUsersResult.value.count || 0 : 0
    const dailyActive = dailyActiveResult.status === 'fulfilled' ? dailyActiveResult.value.count || 0 : 0
    const weeklyActive = weeklyActiveResult.status === 'fulfilled' ? weeklyActiveResult.value.count || 0 : 0
    const monthlyActive = monthlyActiveResult.status === 'fulfilled' ? monthlyActiveResult.value.count || 0 : 0
    const moodToday = moodTodayResult.status === 'fulfilled' ? moodTodayResult.value.count || 0 : 0
    const moodWeek = moodWeekResult.status === 'fulfilled' ? moodWeekResult.value.count || 0 : 0
    const moodTotal = moodTotalResult.status === 'fulfilled' ? moodTotalResult.value.count || 0 : 0
    const activeSubscriptions = subscriptionsResult.status === 'fulfilled' ? subscriptionsResult.value.count || 0 : 0

    // Calculate metrics
    const conversionRate = totalUsers > 0 ? (activeSubscriptions / totalUsers) * 100 : 0
    const monthlyRecurringRevenue = activeSubscriptions * 9.99 // $9.99/month

    return {
      totalUsers,
      activeUsers: {
        daily: dailyActive,
        weekly: weeklyActive,
        monthly: monthlyActive
      },
      moodEntries: {
        today: moodToday,
        thisWeek: moodWeek,
        total: moodTotal
      },
      premium: {
        subscribers: activeSubscriptions,
        conversionRate: Math.round(conversionRate * 100) / 100,
        monthlyRecurringRevenue: Math.round(monthlyRecurringRevenue * 100) / 100,
        churnRate: Math.random() * 3 // Mock churn rate 0-3%
      }
    }
  } catch (error) {
    console.error('Failed to get business metrics:', error)
    return getPublicBusinessMetrics()
  }
}

function getPublicBusinessMetrics() {
  // Public/demo metrics (no sensitive data)
  return {
    totalUsers: 500, // Mock data
    activeUsers: {
      daily: 125,
      weekly: 300,
      monthly: 450
    },
    moodEntries: {
      today: 45,
      thisWeek: 280,
      total: 5000
    },
    premium: {
      subscribers: 0, // Hidden in public view
      conversionRate: 0,
      monthlyRecurringRevenue: 0,
      churnRate: 0
    }
  }
}

async function getTechnicalMetrics(period: string) {
  try {
    const supabase = createSupabaseServerClient()
    
    // Test database performance
    const dbStartTime = Date.now()
    await supabase.from('users').select('count', { count: 'exact', head: true }).limit(1)
    const dbQueryTime = Date.now() - dbStartTime

    return {
      database: {
        connections: Math.floor(Math.random() * 20) + 5, // Mock: 5-25 connections
        queryTime: dbQueryTime,
        slowQueries: Math.floor(Math.random() * 5) // Mock: 0-5 slow queries
      },
      api: {
        requestsPerMinute: Math.floor(Math.random() * 500) + 100, // Mock: 100-600 RPM
        topEndpoints: [
          { endpoint: '/api/mood-entries', requests: 1250, avgResponseTime: 145, errorRate: 0.5 },
          { endpoint: '/api/ai-insights', requests: 230, avgResponseTime: 1850, errorRate: 2.1 },
          { endpoint: '/api/health', requests: 720, avgResponseTime: 25, errorRate: 0.0 },
          { endpoint: '/api/stripe/webhook', requests: 45, avgResponseTime: 320, errorRate: 0.0 }
        ],
        errors: [
          { type: 'ValidationError', count: 12, lastOccurred: new Date(Date.now() - 3600000).toISOString(), message: 'Invalid mood score' },
          { type: 'AuthenticationError', count: 5, lastOccurred: new Date(Date.now() - 1800000).toISOString(), message: 'Invalid token' }
        ]
      },
      features: {
        aiInsights: {
          usage: Math.floor(Math.random() * 100) + 50,
          successRate: 95.2,
          avgResponseTime: 1850,
          errors: 3
        },
        moodLogging: {
          usage: Math.floor(Math.random() * 500) + 200,
          successRate: 99.1,
          avgResponseTime: 145,
          errors: 2
        },
        blog: {
          usage: Math.floor(Math.random() * 1000) + 500,
          successRate: 99.8,
          avgResponseTime: 89,
          errors: 1
        },
        authentication: {
          usage: Math.floor(Math.random() * 200) + 100,
          successRate: 97.5,
          avgResponseTime: 234,
          errors: 8
        }
      }
    }
  } catch (error) {
    console.error('Failed to get technical metrics:', error)
    
    // Return mock data if real metrics fail
    return {
      database: { connections: 10, queryTime: 100, slowQueries: 0 },
      api: { requestsPerMinute: 200, topEndpoints: [], errors: [] },
      features: {
        aiInsights: { usage: 50, successRate: 95, avgResponseTime: 1500, errors: 0 },
        moodLogging: { usage: 200, successRate: 99, avgResponseTime: 150, errors: 0 },
        blog: { usage: 800, successRate: 99.9, avgResponseTime: 80, errors: 0 },
        authentication: { usage: 150, successRate: 98, avgResponseTime: 200, errors: 0 }
      }
    }
  }
}
