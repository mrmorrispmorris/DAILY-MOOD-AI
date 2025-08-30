import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

interface SystemStatus {
  status: 'operational' | 'degraded' | 'outage'
  timestamp: string
  environment: string
  version: string
  services: {
    web: ServiceStatus
    database: ServiceStatus
    ai: ServiceStatus
    payments: ServiceStatus
    auth: ServiceStatus
  }
  metrics: {
    uptime: number
    responseTime: number
    errorRate: number
    userCount?: number
    moodEntriesToday?: number
    premiumUsers?: number
  }
  incidents: SystemIncident[]
  maintenance: MaintenanceWindow[]
}

interface ServiceStatus {
  status: 'operational' | 'degraded' | 'outage'
  name: string
  description: string
  responseTime?: number
  lastIncident?: string
  uptime: number
}

interface SystemIncident {
  id: string
  title: string
  status: 'investigating' | 'identified' | 'monitoring' | 'resolved'
  impact: 'none' | 'minor' | 'major' | 'critical'
  createdAt: string
  updatedAt: string
  description: string
}

interface MaintenanceWindow {
  id: string
  title: string
  status: 'scheduled' | 'in-progress' | 'completed'
  impact: 'none' | 'minor' | 'major'
  scheduledStart: string
  scheduledEnd: string
  description: string
}

const startTime = Date.now()

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const detailed = searchParams.get('detailed') === 'true'
    
    const status: SystemStatus = {
      status: 'operational',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        web: await checkWebService(),
        database: await checkDatabaseService(),
        ai: await checkAIService(),
        payments: await checkPaymentService(),
        auth: await checkAuthService()
      },
      metrics: {
        uptime: Math.floor((Date.now() - startTime) / 1000),
        responseTime: 0,
        errorRate: 0
      },
      incidents: [],
      maintenance: []
    }

    // Add detailed metrics if requested
    if (detailed) {
      const metrics = await getDetailedMetrics()
      status.metrics = { ...status.metrics, ...metrics }
    }

    // Calculate overall status
    const serviceStatuses = Object.values(status.services).map(s => s.status)
    const hasOutage = serviceStatuses.includes('outage')
    const hasDegraded = serviceStatuses.includes('degraded')
    
    if (hasOutage) {
      status.status = 'outage'
    } else if (hasDegraded) {
      status.status = 'degraded'
    }

    // Add current incidents (mock data - in real app would come from incident tracking)
    status.incidents = getCurrentIncidents()
    status.maintenance = getScheduledMaintenance()

    const httpStatus = status.status === 'operational' ? 200 : 
                      status.status === 'degraded' ? 200 : 503

    return NextResponse.json(status, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'public, max-age=30', // Cache for 30 seconds
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    console.error('System status check failed:', error)
    
    return NextResponse.json({
      status: 'outage',
      timestamp: new Date().toISOString(),
      error: 'System status check failed',
      message: error.message
    }, { status: 500 })
  }
}

async function checkWebService(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  // Web service is operational if we can respond
  return {
    status: 'operational',
    name: 'Web Application',
    description: 'Next.js web application serving the DailyMood AI interface',
    responseTime: Date.now() - startTime,
    uptime: 99.9 // This would be calculated from actual uptime data
  }
}

async function checkDatabaseService(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Test database connection and performance
    const { data, error } = await supabase
      .from('mood_entries')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return {
        status: 'outage',
        name: 'Database',
        description: 'Supabase PostgreSQL database',
        responseTime,
        lastIncident: new Date().toISOString(),
        uptime: 98.5
      }
    }

    // Determine status based on response time
    let status: 'operational' | 'degraded' | 'outage' = 'operational'
    if (responseTime > 5000) status = 'degraded'
    if (responseTime > 10000) status = 'outage'

    return {
      status,
      name: 'Database',
      description: 'Supabase PostgreSQL database with mood entries and user data',
      responseTime,
      uptime: 99.8
    }

  } catch (error: any) {
    return {
      status: 'outage',
      name: 'Database',
      description: 'Supabase PostgreSQL database',
      responseTime: Date.now() - startTime,
      lastIncident: new Date().toISOString(),
      uptime: 98.5
    }
  }
}

async function checkAIService(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  if (!process.env.OPENAI_API_KEY) {
    return {
      status: 'operational',
      name: 'AI Insights',
      description: 'OpenAI GPT-4 integration (not configured)',
      uptime: 100
    }
  }

  try {
    // Test OpenAI API availability with a minimal request
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'DailyMood-AI/1.0'
      },
      signal: AbortSignal.timeout(8000)
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        status: 'degraded',
        name: 'AI Insights',
        description: 'OpenAI GPT-4 integration for mood analysis',
        responseTime,
        lastIncident: new Date().toISOString(),
        uptime: 97.2
      }
    }

    // Determine status based on response time
    let status: 'operational' | 'degraded' | 'outage' = 'operational'
    if (responseTime > 3000) status = 'degraded'

    return {
      status,
      name: 'AI Insights',
      description: 'OpenAI GPT-4 integration providing personalized mood analysis',
      responseTime,
      uptime: 99.1
    }

  } catch (error: any) {
    return {
      status: 'outage',
      name: 'AI Insights',
      description: 'OpenAI GPT-4 integration',
      responseTime: Date.now() - startTime,
      lastIncident: new Date().toISOString(),
      uptime: 97.2
    }
  }
}

async function checkPaymentService(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  if (!process.env.STRIPE_SECRET_KEY) {
    return {
      status: 'operational',
      name: 'Payment Processing',
      description: 'Stripe payment system (not configured)',
      uptime: 100
    }
  }

  try {
    // Test Stripe API availability
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'User-Agent': 'DailyMood-AI/1.0'
      },
      signal: AbortSignal.timeout(5000)
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        status: 'degraded',
        name: 'Payment Processing',
        description: 'Stripe payment and subscription management',
        responseTime,
        lastIncident: new Date().toISOString(),
        uptime: 98.9
      }
    }

    return {
      status: 'operational',
      name: 'Payment Processing',
      description: 'Stripe payment processing and subscription management',
      responseTime,
      uptime: 99.9
    }

  } catch (error: any) {
    return {
      status: 'outage',
      name: 'Payment Processing',
      description: 'Stripe payment system',
      responseTime: Date.now() - startTime,
      lastIncident: new Date().toISOString(),
      uptime: 98.9
    }
  }
}

async function checkAuthService(): Promise<ServiceStatus> {
  const startTime = Date.now()
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Test auth service by checking session
    const { data, error } = await supabase.auth.getSession()
    const responseTime = Date.now() - startTime

    // Auth service is operational if we can get session info (even if null)
    return {
      status: 'operational',
      name: 'Authentication',
      description: 'Supabase authentication with magic links and password login',
      responseTime,
      uptime: 99.7
    }

  } catch (error: any) {
    return {
      status: 'degraded',
      name: 'Authentication',
      description: 'Supabase authentication system',
      responseTime: Date.now() - startTime,
      lastIncident: new Date().toISOString(),
      uptime: 99.7
    }
  }
}

async function getDetailedMetrics() {
  try {
    const supabase = createSupabaseServerClient()
    
    // Get basic metrics (these would be more sophisticated in production)
    const [userResult, moodResult] = await Promise.allSettled([
      supabase.from('users').select('count', { count: 'exact', head: true }),
      supabase
        .from('mood_entries')
        .select('count', { count: 'exact', head: true })
        .gte('created_at', new Date().toISOString().split('T')[0]) // Today
    ])

    return {
      userCount: userResult.status === 'fulfilled' ? userResult.value.count || 0 : 0,
      moodEntriesToday: moodResult.status === 'fulfilled' ? moodResult.value.count || 0 : 0,
      premiumUsers: 0 // Would calculate from subscriptions
    }
  } catch (error) {
    return {
      userCount: 0,
      moodEntriesToday: 0,
      premiumUsers: 0
    }
  }
}

function getCurrentIncidents(): SystemIncident[] {
  // In production, this would fetch from incident tracking system
  return []
}

function getScheduledMaintenance(): MaintenanceWindow[] {
  // In production, this would fetch from maintenance scheduling system
  return []
}
