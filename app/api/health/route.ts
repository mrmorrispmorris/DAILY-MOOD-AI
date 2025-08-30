import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

export const dynamic = 'force-dynamic'

interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'degraded'
  timestamp: string
  uptime: number
  version: string
  checks: {
    database: HealthStatus
    supabase: HealthStatus
    openai: HealthStatus
    stripe: HealthStatus
  }
  performance: {
    responseTime: number
    memoryUsage?: NodeJS.MemoryUsage
  }
}

interface HealthStatus {
  status: 'healthy' | 'unhealthy' | 'degraded'
  responseTime?: number
  lastChecked: string
  error?: string
}

const startTime = Date.now()

export async function GET() {
  const checkStartTime = Date.now()
  
  try {
    // Initialize health check response
    const healthCheck: HealthCheck = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: { status: 'healthy', lastChecked: new Date().toISOString() },
        supabase: { status: 'healthy', lastChecked: new Date().toISOString() },
        openai: { status: 'healthy', lastChecked: new Date().toISOString() },
        stripe: { status: 'healthy', lastChecked: new Date().toISOString() }
      },
      performance: {
        responseTime: 0,
        memoryUsage: process.memoryUsage()
      }
    }

    // Check Database/Supabase Connection
    const dbCheck = await checkDatabase()
    healthCheck.checks.database = dbCheck
    healthCheck.checks.supabase = dbCheck

    // Check OpenAI API (if configured)
    if (process.env.OPENAI_API_KEY) {
      healthCheck.checks.openai = await checkOpenAI()
    }

    // Check Stripe API (if configured)
    if (process.env.STRIPE_SECRET_KEY) {
      healthCheck.checks.stripe = await checkStripe()
    }

    // Calculate overall status
    const allChecks = Object.values(healthCheck.checks)
    const hasUnhealthy = allChecks.some(check => check.status === 'unhealthy')
    const hasDegraded = allChecks.some(check => check.status === 'degraded')
    
    if (hasUnhealthy) {
      healthCheck.status = 'unhealthy'
    } else if (hasDegraded) {
      healthCheck.status = 'degraded'
    }

    // Calculate total response time
    healthCheck.performance.responseTime = Date.now() - checkStartTime

    // Return appropriate HTTP status code
    const httpStatus = healthCheck.status === 'healthy' ? 200 : 
                      healthCheck.status === 'degraded' ? 200 : 503

    return NextResponse.json(healthCheck, { 
      status: httpStatus,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error: any) {
    // Return error response
    const errorResponse: HealthCheck = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - startTime) / 1000),
      version: process.env.npm_package_version || '1.0.0',
      checks: {
        database: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Check failed' },
        supabase: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Check failed' },
        openai: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Check failed' },
        stripe: { status: 'unhealthy', lastChecked: new Date().toISOString(), error: 'Check failed' }
      },
      performance: {
        responseTime: Date.now() - checkStartTime,
        memoryUsage: process.memoryUsage()
      }
    }

    console.error('Health check failed:', error)

    return NextResponse.json(errorResponse, { 
      status: 503,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache', 
        'Expires': '0'
      }
    })
  }
}

async function checkDatabase(): Promise<HealthStatus> {
  const startTime = Date.now()
  
  try {
    const supabase = createSupabaseServerClient()
    
    // Simple query to test connection
    const { data, error } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
      .limit(1)

    const responseTime = Date.now() - startTime

    if (error) {
      return {
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        error: error.message
      }
    }

    // Consider slow responses as degraded
    const status = responseTime > 5000 ? 'degraded' : 'healthy'

    return {
      status,
      responseTime,
      lastChecked: new Date().toISOString()
    }

  } catch (error: any) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message || 'Database connection failed'
    }
  }
}

async function checkOpenAI(): Promise<HealthStatus> {
  const startTime = Date.now()
  
  try {
    // Simple API call to check OpenAI availability
    const response = await fetch('https://api.openai.com/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'User-Agent': 'DailyMood-AI/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        status: 'unhealthy',
        responseTime,
        lastChecked: new Date().toISOString(),
        error: `OpenAI API returned ${response.status}`
      }
    }

    // Consider slow responses as degraded
    const status = responseTime > 5000 ? 'degraded' : 'healthy'

    return {
      status,
      responseTime,
      lastChecked: new Date().toISOString()
    }

  } catch (error: any) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message || 'OpenAI API unreachable'
    }
  }
}

async function checkStripe(): Promise<HealthStatus> {
  const startTime = Date.now()
  
  try {
    // Simple API call to check Stripe availability
    const response = await fetch('https://api.stripe.com/v1/account', {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'User-Agent': 'DailyMood-AI/1.0'
      },
      signal: AbortSignal.timeout(10000) // 10 second timeout
    })

    const responseTime = Date.now() - startTime

    if (!response.ok) {
      return {
        status: 'unhealthy', 
        responseTime,
        lastChecked: new Date().toISOString(),
        error: `Stripe API returned ${response.status}`
      }
    }

    // Consider slow responses as degraded
    const status = responseTime > 3000 ? 'degraded' : 'healthy'

    return {
      status,
      responseTime,
      lastChecked: new Date().toISOString()
    }

  } catch (error: any) {
    return {
      status: 'unhealthy',
      responseTime: Date.now() - startTime,
      lastChecked: new Date().toISOString(),
      error: error.message || 'Stripe API unreachable'
    }
  }
}