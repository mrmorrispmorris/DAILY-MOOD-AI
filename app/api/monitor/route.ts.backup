import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(request: NextRequest) {
  try {
    // Only allow monitoring from authorized sources
    const authHeader = request.headers.get('authorization')
    const monitoringSecret = process.env.MONITORING_SECRET || 'dev-secret'
    
    if (authHeader !== `Bearer ${monitoringSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const diagnostics: any = {
      timestamp: new Date().toISOString(),
      status: 'healthy',
      version: '1.0.0',
      environment: process.env.NODE_ENV,
      checks: {}
    };

    // System health checks
    diagnostics.checks.uptime = {
      value: process.uptime ? Math.floor(process.uptime()) : 0,
      unit: 'seconds',
      status: 'ok'
    }

    // Memory usage
    if (process.memoryUsage) {
      const usage = process.memoryUsage()
      const usedBytes = usage.heapUsed || 0
      const totalBytes = usage.heapTotal || 0
      const usedMB = Number((usedBytes / 1024 / 1024).toFixed(0))
      const totalMB = Number((totalBytes / 1024 / 1024).toFixed(0))
      
      diagnostics.checks.memory = {
        used: usedMB,
        total: totalMB,
        unit: 'MB',
        status: usedMB > 500 ? 'warning' : usedMB > 1000 ? 'error' : 'ok'
      }
    }

    // CPU usage (Node.js process)
    if (process.cpuUsage) {
      const cpuUsage = process.cpuUsage()
      diagnostics.checks.cpu = {
        user: cpuUsage.user,
        system: cpuUsage.system,
        unit: 'microseconds',
        status: 'ok'
      }
    }

    // Database connectivity
    try {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      )

      const start = Date.now()
      const { data, error } = await supabase
        .from('users')
        .select('id')
        .limit(1)

      const responseTime = Date.now() - start;

      diagnostics.checks.database = {
        connected: !error,
        responseTime,
        unit: 'ms',
        status: error ? 'error' : responseTime > 1000 ? 'warning' : 'ok',
        error: error?.message
      }
    } catch (dbError: any) {
      diagnostics.checks.database = {
        connected: false,
        status: 'error',
        error: dbError.message
      }
      diagnostics.status = 'unhealthy'
    }

    // API endpoint checks
    const endpoints = [
      { path: '/api/health', name: 'health' },
    ]

    for (const endpoint of endpoints) {
      try {
        const start = Date.now()
        const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3003'
        const response = await fetch(`${baseUrl}${endpoint.path}`)
        const responseTime = Date.now() - start

        diagnostics.checks[`api_${endpoint.name}`] = {
          status: response.ok ? 'ok' : 'error',
          httpStatus: response.status,
          responseTime,
          unit: 'ms'
        }
      } catch (apiError: any) {
        diagnostics.checks[`api_${endpoint.name}`] = {
          status: 'error',
          error: apiError.message
        }
        diagnostics.status = 'unhealthy'
      }
    }

    // Environment variables check
    const requiredEnvVars = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY',
      'SUPABASE_SERVICE_ROLE_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'STRIPE_SECRET_KEY'
    ]

    const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName])
    
    diagnostics.checks.environment = {
      status: missingEnvVars.length === 0 ? 'ok' : 'error',
      required: requiredEnvVars.length,
      missing: missingEnvVars.length,
      missingVars: missingEnvVars
    }

    if (missingEnvVars.length > 0) {
      diagnostics.status = 'unhealthy'
    }

    // Overall status determination
    const checkStatuses = Object.values(diagnostics.checks).map((check: any) => check.status)
    if (checkStatuses.includes('error')) {
      diagnostics.status = 'unhealthy'
    } else if (checkStatuses.includes('warning')) {
      diagnostics.status = 'warning'
    }

    const statusCode = diagnostics.status === 'unhealthy' ? 503 : 
                     diagnostics.status === 'warning' ? 200 : 200

    return NextResponse.json(diagnostics, { 
      status: statusCode,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error: any) {
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    }, { 
      status: 503
    })
  }
}