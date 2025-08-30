// Run every 5 minutes in production
async function healthCheck() {
  const checks = [
    { name: 'Database', url: '/api/health/db' },
    { name: 'Auth', url: '/api/health/auth' },
    { name: 'Stripe', url: '/api/health/stripe' },
    { name: 'OpenAI', url: '/api/health/openai' }
  ]

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://project-iota-gray.vercel.app'
  const results = []

  for (const check of checks) {
    try {
      const startTime = Date.now()
      const res = await fetch(baseUrl + check.url, {
        method: 'GET',
        headers: {
          'User-Agent': 'DailyMood-HealthCheck/1.0'
        },
        timeout: 10000 // 10 second timeout
      })
      
      const responseTime = Date.now() - startTime
      
      if (!res.ok) {
        console.error(`❌ ${check.name} health check failed: ${res.status} ${res.statusText}`)
        results.push({
          service: check.name,
          status: 'failed',
          responseTime,
          error: `HTTP ${res.status}`,
          timestamp: new Date().toISOString()
        })
        
        // Send alert for critical services
        if (['Database', 'Auth'].includes(check.name)) {
          await sendCriticalAlert(check.name, `HTTP ${res.status}`)
        }
      } else {
        console.log(`✅ ${check.name} health check passed (${responseTime}ms)`)
        results.push({
          service: check.name,
          status: 'healthy',
          responseTime,
          timestamp: new Date().toISOString()
        })
      }
    } catch (error: any) {
      console.error(`❌ ${check.name} is down:`, error.message)
      results.push({
        service: check.name,
        status: 'down',
        error: error.message,
        timestamp: new Date().toISOString()
      })
      
      // Send critical alert
      await sendCriticalAlert(check.name, error.message)
    }
  }

  // Store results for monitoring dashboard
  await storeHealthResults(results)
  
  return results
}

async function sendCriticalAlert(serviceName: string, error: string) {
  try {
    // In production, this could send to Slack, Discord, or email
    const alertData = {
      service: serviceName,
      error,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }

    // Log to console for now
    console.error('🚨 CRITICAL ALERT:', JSON.stringify(alertData, null, 2))

    // TODO: Implement actual alerting (Slack webhook, email, etc.)
    /*
    await fetch(process.env.SLACK_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: `🚨 DailyMood AI Alert: ${serviceName} is down`,
        blocks: [
          {
            type: "section",
            text: {
              type: "mrkdwn",
              text: `*Service*: ${serviceName}\n*Error*: ${error}\n*Time*: ${new Date().toISOString()}`
            }
          }
        ]
      })
    })
    */
  } catch (alertError) {
    console.error('Failed to send alert:', alertError)
  }
}

async function storeHealthResults(results: any[]) {
  try {
    // Store in a simple JSON file or database for monitoring
    const timestamp = new Date().toISOString()
    const healthLog = {
      timestamp,
      results,
      summary: {
        total: results.length,
        healthy: results.filter(r => r.status === 'healthy').length,
        failed: results.filter(r => r.status === 'failed').length,
        down: results.filter(r => r.status === 'down').length
      }
    }

    // In production, store in database or monitoring service
    console.log('📊 Health Check Results:', JSON.stringify(healthLog, null, 2))
    
    // TODO: Store in actual monitoring system
    /*
    await supabase.from('health_logs').insert(healthLog)
    */
  } catch (error) {
    console.error('Failed to store health results:', error)
  }
}

// Performance monitoring
async function performanceCheck() {
  const pages = [
    '/',
    '/dashboard',
    '/pricing',
    '/blog'
  ]

  const baseUrl = process.env.NEXT_PUBLIC_URL || 'https://project-iota-gray.vercel.app'
  
  for (const page of pages) {
    try {
      const startTime = Date.now()
      const res = await fetch(baseUrl + page)
      const responseTime = Date.now() - startTime
      
      if (responseTime > 3000) {
        console.warn(`⚠️ Slow response for ${page}: ${responseTime}ms`)
      } else {
        console.log(`⚡ ${page} loaded in ${responseTime}ms`)
      }
    } catch (error) {
      console.error(`❌ Failed to load ${page}:`, error)
    }
  }
}

// Main monitoring function
export async function runMonitoring() {
  console.log('🔍 Starting DailyMood AI monitoring...')
  
  try {
    const healthResults = await healthCheck()
    await performanceCheck()
    
    const summary = {
      timestamp: new Date().toISOString(),
      healthStatus: healthResults.every(r => r.status === 'healthy') ? 'ALL_HEALTHY' : 'ISSUES_DETECTED',
      totalServices: healthResults.length,
      healthyServices: healthResults.filter(r => r.status === 'healthy').length
    }
    
    console.log('✅ Monitoring complete:', summary)
    return summary
  } catch (error) {
    console.error('❌ Monitoring failed:', error)
    return { error: error.message }
  }
}

// Export for use in production
export { healthCheck, performanceCheck, sendCriticalAlert }

// For local development/testing
if (require.main === module) {
  runMonitoring().then(result => {
    console.log('Final result:', result)
    process.exit(0)
  }).catch(error => {
    console.error('Monitoring error:', error)
    process.exit(1)
  })
}


