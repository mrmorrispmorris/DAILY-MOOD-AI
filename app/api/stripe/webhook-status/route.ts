import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

/**
 * Webhook Health Check Endpoint
 * Verifies webhook configuration and functionality
 */
export async function GET(req: NextRequest) {
  try {
    // Admin check
    const { searchParams } = new URL(req.url)
    const adminKey = searchParams.get('key')
    
    if (adminKey !== 'webhook-status-check') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const status = {
      timestamp: new Date().toISOString(),
      webhook_endpoint: '/api/stripe/webhook',
      environment: process.env.NODE_ENV || 'development',
      checks: {
        stripe_connection: false,
        database_connection: false,
        webhook_secret_configured: false,
        subscriptions_table_exists: false,
        recent_webhook_activity: false
      },
      recent_events: [],
      subscription_stats: {
        total_subscriptions: 0,
        active_subscriptions: 0,
        canceled_subscriptions: 0
      },
      errors: [] as string[]
    }
    
    // Check Stripe connection
    try {
      await stripe.accounts.retrieve()
      status.checks.stripe_connection = true
    } catch (error: any) {
      status.errors.push(`Stripe connection failed: ${error.message}`)
    }
    
    // Check webhook secret configuration
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      status.checks.webhook_secret_configured = true
    } else {
      status.errors.push('STRIPE_WEBHOOK_SECRET environment variable not set')
    }
    
    // Check database connection and subscriptions table
    try {
      const { data, error } = await supabase
        .from('subscriptions')
        .select('id, status, created_at')
        .limit(1)
      
      if (!error) {
        status.checks.database_connection = true
        status.checks.subscriptions_table_exists = true
        
        // Get subscription statistics
        const { count: totalCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
        
        const { count: activeCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active')
        
        const { count: canceledCount } = await supabase
          .from('subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'canceled')
        
        status.subscription_stats = {
          total_subscriptions: totalCount || 0,
          active_subscriptions: activeCount || 0,
          canceled_subscriptions: canceledCount || 0
        }
      } else {
        status.errors.push(`Database error: ${error.message}`)
      }
    } catch (error: any) {
      status.errors.push(`Database connection failed: ${error.message}`)
    }
    
    // Check for recent webhook activity (last 24 hours)
    try {
      const { data: recentEvents, error } = await supabase
        .from('analytics_events')
        .select('event_name, timestamp, user_id')
        .in('event_name', ['subscription_completed', 'payment_succeeded', 'payment_failed'])
        .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
        .order('timestamp', { ascending: false })
        .limit(10)
      
      if (!error && recentEvents?.length) {
        status.checks.recent_webhook_activity = true
        status.recent_events = recentEvents.map(event => ({
          event: event.event_name,
          timestamp: event.timestamp,
          userId: event.user_id
        }))
      }
    } catch (error: any) {
      status.errors.push(`Analytics check failed: ${error.message}`)
    }
    
    // Overall health score
    const totalChecks = Object.keys(status.checks).length
    const passedChecks = Object.values(status.checks).filter(Boolean).length
    const healthScore = Math.round((passedChecks / totalChecks) * 100)
    
    return NextResponse.json({
      ...status,
      health_score: healthScore,
      status: healthScore >= 80 ? 'healthy' : healthScore >= 60 ? 'warning' : 'unhealthy',
      recommendations: generateRecommendations(status)
    })
    
  } catch (error: any) {
    console.error('❌ Webhook status check failed:', error)
    return NextResponse.json(
      { 
        error: 'Status check failed', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}

function generateRecommendations(status: any): string[] {
  const recommendations = []
  
  if (!status.checks.stripe_connection) {
    recommendations.push('Configure valid Stripe API keys')
  }
  
  if (!status.checks.webhook_secret_configured) {
    recommendations.push('Set up STRIPE_WEBHOOK_SECRET environment variable')
  }
  
  if (!status.checks.database_connection) {
    recommendations.push('Fix database connection issues')
  }
  
  if (!status.checks.subscriptions_table_exists) {
    recommendations.push('Run database migrations to create subscriptions table')
  }
  
  if (!status.checks.recent_webhook_activity && process.env.NODE_ENV === 'production') {
    recommendations.push('Configure Stripe webhooks to point to your production endpoint')
  }
  
  if (status.subscription_stats.total_subscriptions === 0) {
    recommendations.push('Test subscription flow to ensure webhooks are working')
  }
  
  return recommendations
}


