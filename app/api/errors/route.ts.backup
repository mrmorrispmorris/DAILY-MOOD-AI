import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * Error Reporting API
 * Collects and stores errors from frontend and backend
 */
export async function POST(req: NextRequest) {
  try {
    const { error, service, environment } = await req.json()
    
    // Basic validation
    if (!error || !error.message) {
      return NextResponse.json(
        { error: 'Invalid error report - message required' },
        { status: 400 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Store error in analytics_events table
    const errorRecord = {
      event_name: 'application_error',
      user_id: error.user_id || null,
      event_data: {
        level: error.level || 'error',
        message: error.message,
        stack: error.stack,
        context: error.context || {},
        session_id: error.session_id,
        url: error.url,
        user_agent: error.user_agent,
        service: service || 'unknown',
        environment: environment || 'unknown',
        error_id: error.id
      },
      timestamp: error.timestamp || new Date().toISOString(),
      page_url: error.url
    }

    const { data, error: dbError } = await supabase
      .from('analytics_events')
      .insert([errorRecord])
      .select()

    if (dbError) {
      console.error('Failed to store error:', dbError)
      return NextResponse.json(
        { error: 'Failed to store error report' },
        { status: 500 }
      )
    }

    // Log critical errors immediately
    if (error.level === 'error') {
      console.error('🚨 Critical Error Reported:', {
        id: error.id,
        message: error.message,
        url: error.url,
        user_id: error.user_id,
        service,
        environment
      })
    }

    return NextResponse.json({
      success: true,
      error_id: error.id,
      stored_at: new Date().toISOString()
    })

  } catch (apiError: any) {
    console.error('Error reporting API failed:', apiError)
    
    return NextResponse.json(
      { error: 'Error reporting failed', details: apiError.message },
      { status: 500 }
    )
  }
}

/**
 * Get error analytics and metrics
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const token = searchParams.get('token')
    const timeframe = searchParams.get('timeframe') || '24h'
    
    // Basic auth check
    if (!token || token !== process.env.MONITOR_SECRET_TOKEN) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Calculate time range
    const hours = timeframe === '7d' ? 168 : timeframe === '24h' ? 24 : 1
    const since = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    // Fetch error events
    const { data: errorEvents, error } = await supabase
      .from('analytics_events')
      .select('*')
      .eq('event_name', 'application_error')
      .gte('timestamp', since)
      .order('timestamp', { ascending: false })

    if (error) {
      console.error('Failed to fetch error analytics:', error)
      return NextResponse.json(
        { error: 'Failed to fetch error data' },
        { status: 500 }
      )
    }

    // Process error analytics
    const errors = errorEvents || []
    
    // Group by error type/message
    const errorGroups = errors.reduce((acc, event) => {
      const errorData = event.event_data
      const key = errorData.message?.substring(0, 100) || 'Unknown error'
      
      if (!acc[key]) {
        acc[key] = {
          message: key,
          count: 0,
          level: errorData.level || 'error',
          first_seen: event.timestamp,
          last_seen: event.timestamp,
          examples: []
        }
      }
      
      acc[key].count++
      if (new Date(event.timestamp) > new Date(acc[key].last_seen)) {
        acc[key].last_seen = event.timestamp
      }
      if (new Date(event.timestamp) < new Date(acc[key].first_seen)) {
        acc[key].first_seen = event.timestamp
      }
      
      // Store examples
      if (acc[key].examples.length < 3) {
        acc[key].examples.push({
          id: errorData.error_id,
          timestamp: event.timestamp,
          url: errorData.url,
          user_id: event.user_id,
          stack: errorData.stack?.substring(0, 200) // Truncate stack traces
        })
      }
      
      return acc
    }, {} as Record<string, any>)

    // Sort by frequency
    const topErrors = Object.values(errorGroups)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 20)

    // Error trends by day
    const trends = []
    const now = new Date()
    const days = timeframe === '7d' ? 7 : 1
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate())
      const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000)
      
      const dayErrors = errors.filter(e => {
        const errorTime = new Date(e.timestamp)
        return errorTime >= dayStart && errorTime < dayEnd
      })
      
      trends.push({
        date: dayStart.toISOString().split('T')[0],
        total_errors: dayErrors.length,
        critical_errors: dayErrors.filter(e => e.event_data?.level === 'error').length,
        warnings: dayErrors.filter(e => e.event_data?.level === 'warning').length
      })
    }

    // Error distribution by level
    const errorLevels = errors.reduce((acc, event) => {
      const level = event.event_data?.level || 'unknown'
      acc[level] = (acc[level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      timeframe,
      summary: {
        total_errors: errors.length,
        error_rate: errors.length / hours, // per hour
        unique_errors: Object.keys(errorGroups).length,
        most_frequent: (topErrors[0] as any)?.message || 'None'
      },
      top_errors: topErrors,
      error_trends: trends,
      error_levels: errorLevels,
      recent_errors: errors.slice(0, 10).map(e => ({
        id: e.event_data?.error_id,
        timestamp: e.timestamp,
        level: e.event_data?.level,
        message: e.event_data?.message,
        url: e.event_data?.url,
        user_id: e.user_id,
        service: e.event_data?.service
      }))
    })

  } catch (error: any) {
    console.error('Error analytics API failed:', error)
    
    return NextResponse.json(
      { error: 'Failed to fetch error analytics' },
      { status: 500 }
    )
  }
}


