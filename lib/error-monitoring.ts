export function logError(error: Error, context?: any) {
  console.error('Error occurred:', {
    message: error.message,
    stack: error.stack,
    context,
    timestamp: new Date().toISOString(),
    url: typeof window !== 'undefined' ? window.location.href : 'server'
  })
  
  // In production, send to error tracking service
  if (process.env.NODE_ENV === 'production') {
    // Send to Sentry, LogRocket, etc.
    // Example: Sentry.captureException(error, { extra: context })
  }
}

export function trackEvent(eventName: string, properties?: any) {
  console.log('Event tracked:', {
    event: eventName,
    properties,
    timestamp: new Date().toISOString()
  })
  
  // Send to analytics
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', eventName, properties)
  }
  
  // Send to Mixpanel or similar
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track(eventName, properties)
  }
}

export function trackPageView(page: string) {
  trackEvent('page_view', { page })
}

export function trackUserAction(action: string, details?: any) {
  trackEvent('user_action', { action, ...details })
}

export function trackConversion(type: 'signup' | 'premium_upgrade' | 'mood_logged', details?: any) {
  trackEvent('conversion', { type, ...details })
}

export function trackError(error: Error, context?: any) {
  logError(error, context)
  trackEvent('error_occurred', { 
    message: error.message,
    context
  })
}

// Performance monitoring
export function trackPerformance(metricName: string, value: number, unit: string = 'ms') {
  console.log(`Performance: ${metricName} = ${value}${unit}`)
  
  trackEvent('performance_metric', {
    metric: metricName,
    value,
    unit
  })
}

// Health check logging
export function logHealthCheck(service: string, status: 'healthy' | 'unhealthy', details?: any) {
  console.log(`Health Check: ${service} = ${status}`, details)
  
  trackEvent('health_check', {
    service,
    status,
    details
  })
}

