interface Alert {
  type: 'error' | 'warning' | 'info'
  metric: string
  threshold: number
  currentValue: number
  message: string
}

export class MonitoringService {
  private alerts: Alert[] = []
  private isProduction = process.env.NODE_ENV === 'production'
  
  async checkSystemHealth() {
    const checks = [
      this.checkErrorRate(),
      this.checkResponseTime(),
      this.checkPaymentSuccess(),
      this.checkDatabaseConnections(),
      this.checkSignupRate(),
      this.checkMemoryUsage(),
      this.checkApiEndpoints()
    ]
    
    const results = await Promise.all(checks)
    return results.filter(Boolean)
  }
  
  private async checkErrorRate() {
    try {
      // In production, this would check actual error logs
      const mockErrorRate = Math.random() * 20 // 0-20 errors per hour
      
      if (mockErrorRate > 10) {
        return {
          type: 'error' as const,
          metric: 'error_rate',
          threshold: 10,
          currentValue: mockErrorRate,
          message: `High error rate: ${Math.round(mockErrorRate)} errors in last hour`
        }
      }
      
      if (mockErrorRate > 5) {
        return {
          type: 'warning' as const,
          metric: 'error_rate',
          threshold: 5,
          currentValue: mockErrorRate,
          message: `Elevated error rate: ${Math.round(mockErrorRate)} errors in last hour`
        }
      }
      
      return null
    } catch (error) {
      return {
        type: 'error' as const,
        metric: 'error_rate',
        threshold: 0,
        currentValue: -1,
        message: `Error rate check failed: ${error.message}`
      }
    }
  }
  
  private async checkResponseTime() {
    try {
      const start = Date.now()
      
      // Test critical API endpoints
      const endpoints = ['/api/health', '/api/user-profile', '/api/mood-entries']
      const promises = endpoints.map(async (endpoint) => {
        try {
          if (typeof window !== 'undefined') {
            const response = await fetch(endpoint)
            return { endpoint, time: Date.now() - start, status: response.status }
          }
          return { endpoint, time: 50, status: 200 } // Mock for server-side
        } catch {
          return { endpoint, time: 5000, status: 500 }
        }
      })
      
      const results = await Promise.all(promises)
      const avgResponseTime = results.reduce((sum, r) => sum + r.time, 0) / results.length
      
      if (avgResponseTime > 2000) {
        return {
          type: 'error' as const,
          metric: 'response_time',
          threshold: 2000,
          currentValue: avgResponseTime,
          message: `Slow API response: ${Math.round(avgResponseTime)}ms average`
        }
      }
      
      if (avgResponseTime > 1000) {
        return {
          type: 'warning' as const,
          metric: 'response_time',
          threshold: 1000,
          currentValue: avgResponseTime,
          message: `Elevated response time: ${Math.round(avgResponseTime)}ms average`
        }
      }
      
      return null
    } catch (error) {
      return {
        type: 'error' as const,
        metric: 'response_time',
        threshold: 0,
        currentValue: -1,
        message: `Response time check failed: ${error.message}`
      }
    }
  }
  
  private async checkPaymentSuccess() {
    // Mock payment success rate check
    const mockSuccessRate = 0.95 + Math.random() * 0.05 // 95-100%
    
    if (mockSuccessRate < 0.95) {
      return {
        type: 'error' as const,
        metric: 'payment_success_rate',
        threshold: 0.95,
        currentValue: mockSuccessRate,
        message: `Payment success rate below 95%: ${(mockSuccessRate * 100).toFixed(1)}%`
      }
    }
    
    if (mockSuccessRate < 0.98) {
      return {
        type: 'warning' as const,
        metric: 'payment_success_rate',
        threshold: 0.98,
        currentValue: mockSuccessRate,
        message: `Payment success rate below optimal: ${(mockSuccessRate * 100).toFixed(1)}%`
      }
    }
    
    return null
  }
  
  private async checkDatabaseConnections() {
    try {
      // Mock database connection check
      if (typeof window !== 'undefined' && (window as any).supabase) {
        const { data, error } = await (window as any).supabase
          .from('users')
          .select('id')
          .limit(1)
        
        if (error) {
          return {
            type: 'error' as const,
            metric: 'database_connection',
            threshold: 1,
            currentValue: 0,
            message: `Database connection failed: ${error.message}`
          }
        }
      }
      
      return null
    } catch (error) {
      return {
        type: 'error' as const,
        metric: 'database_connection',
        threshold: 1,
        currentValue: 0,
        message: `Database health check failed: ${error.message}`
      }
    }
  }
  
  private async checkSignupRate() {
    // Mock signup rate monitoring
    const mockTodaySignups = Math.floor(Math.random() * 50) // 0-50 signups today
    const mockYesterdaySignups = 30 // baseline
    
    if (mockTodaySignups < mockYesterdaySignups * 0.5) {
      return {
        type: 'warning' as const,
        metric: 'signup_rate',
        threshold: mockYesterdaySignups * 0.5,
        currentValue: mockTodaySignups,
        message: `Signup rate 50% below yesterday: ${mockTodaySignups} vs ${mockYesterdaySignups}`
      }
    }
    
    return null
  }
  
  private async checkMemoryUsage() {
    if (typeof process !== 'undefined' && process.memoryUsage) {
      const usage = process.memoryUsage()
      const usedMB = usage.heapUsed / 1024 / 1024
      
      if (usedMB > 500) {
        return {
          type: 'warning' as const,
          metric: 'memory_usage',
          threshold: 500,
          currentValue: usedMB,
          message: `High memory usage: ${Math.round(usedMB)}MB`
        }
      }
    }
    
    return null
  }
  
  private async checkApiEndpoints() {
    // Mock API endpoint health checks
    const criticalEndpoints = [
      { path: '/api/auth', name: 'Authentication' },
      { path: '/api/mood-entries', name: 'Mood Entries' },
      { path: '/api/stripe/checkout', name: 'Payments' },
      { path: '/api/analytics', name: 'Analytics' }
    ]
    
    const failedEndpoints = criticalEndpoints.filter(() => Math.random() < 0.05) // 5% chance of failure
    
    if (failedEndpoints.length > 0) {
      return {
        type: 'error' as const,
        metric: 'api_endpoints',
        threshold: 0,
        currentValue: failedEndpoints.length,
        message: `Critical API endpoints down: ${failedEndpoints.map(e => e.name).join(', ')}`
      }
    }
    
    return null
  }
  
  async sendAlert(alert: Alert) {
    const timestamp = new Date().toISOString()
    
    // Console logging for development
    console.error(`[ALERT] ${alert.type.toUpperCase()}: ${alert.message}`)
    
    // In production, integrate with alerting services
    if (this.isProduction) {
      // Send to Slack, PagerDuty, email, etc.
      await this.sendToSlack(alert)
      await this.sendEmail(alert)
      
      // Store in database for historical tracking
      if (typeof window !== 'undefined' && (window as any).supabase) {
        await (window as any).supabase.from('system_alerts').insert({
          type: alert.type,
          metric: alert.metric,
          message: alert.message,
          threshold: alert.threshold,
          current_value: alert.currentValue,
          created_at: timestamp
        })
      }
    }
    
    // Store locally for development
    const alerts = JSON.parse(localStorage.getItem('system_alerts') || '[]')
    alerts.push({ ...alert, timestamp })
    
    // Keep only last 100 alerts
    if (alerts.length > 100) alerts.splice(0, alerts.length - 100)
    
    localStorage.setItem('system_alerts', JSON.stringify(alerts))
  }
  
  private async sendToSlack(alert: Alert) {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL
    if (!webhookUrl) return
    
    const color = alert.type === 'error' ? 'danger' : 
                 alert.type === 'warning' ? 'warning' : 'good'
    
    const payload = {
      attachments: [{
        color,
        title: `🚨 ${alert.type.toUpperCase()}: ${alert.metric}`,
        text: alert.message,
        fields: [
          { title: 'Threshold', value: alert.threshold, short: true },
          { title: 'Current Value', value: alert.currentValue, short: true },
          { title: 'Time', value: new Date().toISOString(), short: true },
          { title: 'Environment', value: process.env.NODE_ENV, short: true }
        ]
      }]
    }
    
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
    } catch (error) {
      console.error('Failed to send Slack alert:', error)
    }
  }
  
  private async sendEmail(alert: Alert) {
    // In production, integrate with email service (SendGrid, SES, etc.)
    const emailData = {
      to: process.env.ALERT_EMAIL || 'admin@dailymoodai.com',
      subject: `🚨 ${alert.type.toUpperCase()}: ${alert.metric}`,
      body: `
        Alert Details:
        - Metric: ${alert.metric}
        - Message: ${alert.message}
        - Threshold: ${alert.threshold}
        - Current Value: ${alert.currentValue}
        - Time: ${new Date().toISOString()}
        - Environment: ${process.env.NODE_ENV}
        
        Please investigate immediately if this is a production alert.
      `
    }
    
    console.log('📧 Would send email alert:', emailData)
  }
  
  // Get system health summary
  async getHealthSummary() {
    const alerts = await this.checkSystemHealth()
    const errorCount = alerts.filter(a => a.type === 'error').length
    const warningCount = alerts.filter(a => a.type === 'warning').length
    
    return {
      status: errorCount > 0 ? 'error' : warningCount > 0 ? 'warning' : 'healthy',
      totalAlerts: alerts.length,
      errors: errorCount,
      warnings: warningCount,
      lastCheck: new Date().toISOString(),
      alerts
    }
  }
  
  // Start automated monitoring
  startMonitoring() {
    // Check every 5 minutes in production, 30 seconds in development
    const interval = this.isProduction ? 5 * 60 * 1000 : 30 * 1000
    
    setInterval(async () => {
      try {
        const alerts = await this.checkSystemHealth()
        for (const alert of alerts) {
          await this.sendAlert(alert)
        }
      } catch (error) {
        console.error('Monitoring check failed:', error)
      }
    }, interval)
    
    console.log(`🔍 Monitoring started (checking every ${interval/1000}s)`)
  }
}

// Singleton instance
export const monitoringService = new MonitoringService()

// Auto-start monitoring in browser
if (typeof window !== 'undefined') {
  monitoringService.startMonitoring()
}


