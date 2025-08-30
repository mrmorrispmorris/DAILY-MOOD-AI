/**
 * Error Tracking System for DailyMood AI
 * 
 * This module provides comprehensive error tracking and monitoring
 * without external dependencies. In production, this could integrate
 * with services like Sentry, Bugsnag, or custom error tracking.
 */

export interface ErrorReport {
  id: string
  timestamp: string
  level: 'info' | 'warn' | 'error' | 'fatal'
  message: string
  error?: Error
  context: {
    userId?: string
    sessionId?: string
    userAgent?: string
    url?: string
    method?: string
    statusCode?: number
    component?: string
    feature?: string
  }
  metadata?: Record<string, any>
  stackTrace?: string
  environment: string
  version: string
}

export interface ErrorStats {
  totalErrors: number
  errorRate: number
  topErrors: ErrorSummary[]
  recentErrors: ErrorReport[]
  errorsByLevel: Record<string, number>
  errorsByComponent: Record<string, number>
}

export interface ErrorSummary {
  message: string
  count: number
  lastOccurred: string
  level: string
  affectedUsers: number
}

class ErrorTracker {
  private errors: ErrorReport[] = []
  private maxStoredErrors = 1000 // Keep last 1000 errors in memory
  private errorCallbacks: Array<(error: ErrorReport) => void> = []

  /**
   * Track an error with context
   */
  trackError(
    error: Error | string,
    level: ErrorReport['level'] = 'error',
    context: Partial<ErrorReport['context']> = {},
    metadata: Record<string, any> = {}
  ): string {
    const errorId = this.generateErrorId()
    const timestamp = new Date().toISOString()
    
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp,
      level,
      message: typeof error === 'string' ? error : error.message,
      error: typeof error === 'object' ? error : undefined,
      context: {
        ...context,
        userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'Server',
        url: typeof window !== 'undefined' ? window.location.href : context.url
      },
      metadata,
      stackTrace: typeof error === 'object' ? error.stack : new Error().stack,
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0'
    }

    // Store error (with rotation)
    this.addError(errorReport)

    // Notify callbacks
    this.errorCallbacks.forEach(callback => {
      try {
        callback(errorReport)
      } catch (callbackError) {
        console.error('Error in error tracking callback:', callbackError)
      }
    })

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      this.logToConsole(errorReport)
    }

    // Send to external service if configured
    this.sendToExternalService(errorReport)

    return errorId
  }

  /**
   * Track API errors with request context
   */
  trackAPIError(
    error: Error | string,
    request: {
      method?: string
      url?: string
      statusCode?: number
      userId?: string
    },
    metadata: Record<string, any> = {}
  ): string {
    return this.trackError(error, 'error', {
      ...request,
      feature: 'API'
    }, {
      ...metadata,
      requestDetails: request
    })
  }

  /**
   * Track authentication errors
   */
  trackAuthError(
    error: Error | string,
    userId?: string,
    metadata: Record<string, any> = {}
  ): string {
    return this.trackError(error, 'warn', {
      userId,
      feature: 'Authentication'
    }, {
      ...metadata,
      category: 'auth'
    })
  }

  /**
   * Track payment/Stripe errors
   */
  trackPaymentError(
    error: Error | string,
    userId?: string,
    stripeDetails: Record<string, any> = {}
  ): string {
    return this.trackError(error, 'error', {
      userId,
      feature: 'Payments'
    }, {
      stripe: stripeDetails,
      category: 'payment'
    })
  }

  /**
   * Track AI service errors
   */
  trackAIError(
    error: Error | string,
    userId?: string,
    aiMetadata: Record<string, any> = {}
  ): string {
    return this.trackError(error, 'error', {
      userId,
      feature: 'AI_Insights'
    }, {
      ai: aiMetadata,
      category: 'ai_service'
    })
  }

  /**
   * Track frontend component errors
   */
  trackComponentError(
    error: Error | string,
    componentName: string,
    userId?: string,
    props: Record<string, any> = {}
  ): string {
    return this.trackError(error, 'error', {
      userId,
      component: componentName,
      feature: 'Frontend'
    }, {
      componentProps: props,
      category: 'component'
    })
  }

  /**
   * Track performance issues
   */
  trackPerformanceIssue(
    message: string,
    timing: {
      operation: string
      duration: number
      threshold: number
    },
    context: Partial<ErrorReport['context']> = {}
  ): string {
    return this.trackError(
      `Performance issue: ${message} (${timing.duration}ms > ${timing.threshold}ms)`,
      'warn',
      {
        ...context,
        feature: 'Performance'
      },
      {
        performance: timing,
        category: 'performance'
      }
    )
  }

  /**
   * Get error statistics
   */
  getErrorStats(timeRange: '1h' | '24h' | '7d' | 'all' = '24h'): ErrorStats {
    const filteredErrors = this.getErrorsInTimeRange(timeRange)
    
    // Group errors by message for top errors
    const errorGroups = new Map<string, ErrorSummary>()
    const userSet = new Set<string>()

    filteredErrors.forEach(error => {
      if (error.context.userId) {
        userSet.add(error.context.userId)
      }

      const key = error.message
      if (!errorGroups.has(key)) {
        errorGroups.set(key, {
          message: key,
          count: 0,
          lastOccurred: error.timestamp,
          level: error.level,
          affectedUsers: 0
        })
      }

      const group = errorGroups.get(key)!
      group.count++
      group.lastOccurred = error.timestamp
      
      // Count unique users for this error
      const errorUsers = new Set<string>()
      filteredErrors
        .filter(e => e.message === key && e.context.userId)
        .forEach(e => errorUsers.add(e.context.userId!))
      group.affectedUsers = errorUsers.size
    })

    // Sort by count and take top 10
    const topErrors = Array.from(errorGroups.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)

    // Count by level
    const errorsByLevel = filteredErrors.reduce((acc, error) => {
      acc[error.level] = (acc[error.level] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Count by component
    const errorsByComponent = filteredErrors.reduce((acc, error) => {
      const component = error.context.component || error.context.feature || 'Unknown'
      acc[component] = (acc[component] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Calculate error rate (errors per minute)
    const timeRangeMs = this.getTimeRangeMs(timeRange)
    const minutes = timeRangeMs / (60 * 1000)
    const errorRate = filteredErrors.length / minutes

    return {
      totalErrors: filteredErrors.length,
      errorRate: Math.round(errorRate * 100) / 100,
      topErrors,
      recentErrors: filteredErrors.slice(0, 20), // Last 20 errors
      errorsByLevel,
      errorsByComponent
    }
  }

  /**
   * Get errors by user ID
   */
  getUserErrors(userId: string, limit = 50): ErrorReport[] {
    return this.errors
      .filter(error => error.context.userId === userId)
      .slice(0, limit)
  }

  /**
   * Register callback for error notifications
   */
  onError(callback: (error: ErrorReport) => void): () => void {
    this.errorCallbacks.push(callback)
    
    // Return unsubscribe function
    return () => {
      const index = this.errorCallbacks.indexOf(callback)
      if (index > -1) {
        this.errorCallbacks.splice(index, 1)
      }
    }
  }

  /**
   * Clear stored errors
   */
  clearErrors(): void {
    this.errors = []
  }

  /**
   * Export errors (for debugging or external analysis)
   */
  exportErrors(format: 'json' | 'csv' = 'json'): string {
    if (format === 'csv') {
      return this.exportToCSV()
    }
    return JSON.stringify(this.errors, null, 2)
  }

  // Private methods
  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private addError(error: ErrorReport): void {
    this.errors.unshift(error) // Add to beginning
    
    // Rotate if too many errors
    if (this.errors.length > this.maxStoredErrors) {
      this.errors = this.errors.slice(0, this.maxStoredErrors)
    }
  }

  private logToConsole(error: ErrorReport): void {
    const logMethod = error.level === 'fatal' || error.level === 'error' ? 'error' :
                     error.level === 'warn' ? 'warn' : 'info'
    
    console[logMethod](`[${error.level.toUpperCase()}] ${error.message}`, {
      id: error.id,
      timestamp: error.timestamp,
      context: error.context,
      metadata: error.metadata
    })
    
    if (error.stackTrace) {
      console[logMethod](error.stackTrace)
    }
  }

  private async sendToExternalService(error: ErrorReport): Promise<void> {
    // In production, integrate with external error tracking service
    // Examples: Sentry, Bugsnag, LogRocket, etc.
    
    if (process.env.ERROR_TRACKING_URL) {
      try {
        await fetch(process.env.ERROR_TRACKING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.ERROR_TRACKING_TOKEN}`
          },
          body: JSON.stringify(error)
        })
      } catch (serviceError) {
        console.error('Failed to send error to external service:', serviceError)
      }
    }
  }

  private getErrorsInTimeRange(timeRange: '1h' | '24h' | '7d' | 'all'): ErrorReport[] {
    if (timeRange === 'all') return this.errors

    const now = Date.now()
    const rangeMs = this.getTimeRangeMs(timeRange)
    const cutoff = new Date(now - rangeMs)

    return this.errors.filter(error => new Date(error.timestamp) > cutoff)
  }

  private getTimeRangeMs(timeRange: '1h' | '24h' | '7d' | 'all'): number {
    switch (timeRange) {
      case '1h': return 60 * 60 * 1000
      case '24h': return 24 * 60 * 60 * 1000
      case '7d': return 7 * 24 * 60 * 60 * 1000
      case 'all': return Infinity
    }
  }

  private exportToCSV(): string {
    const headers = ['ID', 'Timestamp', 'Level', 'Message', 'Component', 'Feature', 'UserID', 'URL']
    const rows = this.errors.map(error => [
      error.id,
      error.timestamp,
      error.level,
      error.message,
      error.context.component || '',
      error.context.feature || '',
      error.context.userId || '',
      error.context.url || ''
    ])

    return [headers, ...rows].map(row => row.join(',')).join('\n')
  }
}

// Global error tracker instance
export const errorTracker = new ErrorTracker()

// React Error Boundary helper
export function withErrorTracking<T extends object>(
  Component: React.ComponentType<T>,
  componentName: string
) {
  return class ErrorTrackedComponent extends React.Component<T> {
    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
      errorTracker.trackComponentError(
        error,
        componentName,
        undefined, // UserId would need to come from props or context
        { errorInfo }
      )
    }

    render() {
      return React.createElement(Component, this.props)
    }
  } as React.ComponentType<T>
}

// API route error handler
export function handleAPIError(
  error: Error | string,
  request: {
    method?: string
    url?: string
    statusCode?: number
    userId?: string
  }
): string {
  return errorTracker.trackAPIError(error, request)
}

// Global error handlers (browser)
if (typeof window !== 'undefined') {
  // Unhandled errors
  window.addEventListener('error', (event) => {
    errorTracker.trackError(
      event.error || event.message,
      'error',
      {
        url: window.location.href,
        feature: 'Global'
      },
      {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      }
    )
  })

  // Unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorTracker.trackError(
      event.reason,
      'error',
      {
        url: window.location.href,
        feature: 'Promise'
      },
      {
        type: 'unhandled_rejection'
      }
    )
  })
}