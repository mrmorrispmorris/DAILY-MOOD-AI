'use client'

export interface ErrorReport {
  id: string
  timestamp: string
  level: 'error' | 'warning' | 'info'
  message: string
  stack?: string
  context?: Record<string, any>
  user_id?: string
  session_id?: string
  url?: string
  user_agent?: string
}

export interface ErrorMetrics {
  total_errors: number
  error_rate: number
  top_errors: Array<{ message: string; count: number }>
  error_trends: Array<{ date: string; count: number }>
}

class ErrorTrackingService {
  private errors: ErrorReport[] = []
  private maxErrors = 1000
  private sessionId: string

  constructor() {
    this.sessionId = typeof window !== 'undefined' 
      ? this.generateSessionId() 
      : 'server-' + Date.now()
    
    if (typeof window !== 'undefined') {
      this.setupGlobalErrorHandlers()
    }
  }

  private generateSessionId(): string {
    return 'session_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private setupGlobalErrorHandlers() {
    // Handle unhandled JavaScript errors
    window.addEventListener('error', (event) => {
      this.captureError({
        message: event.message,
        stack: event.error?.stack,
        url: event.filename,
        context: {
          line: event.lineno,
          column: event.colno,
          type: 'javascript_error'
        }
      })
    })

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        stack: event.reason?.stack,
        context: {
          type: 'promise_rejection',
          reason: event.reason
        }
      })
    })

    // Handle React errors (if using React error boundary)
    const originalConsoleError = console.error
    console.error = (...args) => {
      const message = args.join(' ')
      
      // Capture React errors
      if (message.includes('React') || message.includes('Component')) {
        this.captureError({
          message,
          context: {
            type: 'react_error',
            args: args
          }
        })
      }
      
      originalConsoleError.apply(console, args)
    }
  }

  public captureError(error: Partial<ErrorReport>) {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      timestamp: new Date().toISOString(),
      level: error.level || 'error',
      message: error.message || 'Unknown error',
      stack: error.stack,
      context: error.context || {},
      session_id: this.sessionId,
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      user_agent: typeof window !== 'undefined' ? navigator.userAgent : undefined,
      user_id: error.user_id,
      ...error
    }

    // Store locally
    this.errors.push(errorReport)
    
    // Maintain buffer size
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors)
    }

    // Send to server for production tracking
    if (process.env.NODE_ENV === 'production') {
      this.sendToServer(errorReport)
    } else {
      console.warn('🐛 Error captured:', errorReport)
    }
  }

  private generateErrorId(): string {
    return 'err_' + Math.random().toString(36).substring(2) + Date.now().toString(36)
  }

  private async sendToServer(error: ErrorReport) {
    try {
      await fetch('/api/errors', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          error,
          service: 'dailymood-ai-frontend',
          environment: process.env.NODE_ENV
        })
      })
    } catch (sendError) {
      console.warn('Failed to send error to server:', sendError)
    }
  }

  public getErrors(): ErrorReport[] {
    return [...this.errors]
  }

  public getMetrics(): ErrorMetrics {
    const now = Date.now()
    const last24h = now - 24 * 60 * 60 * 1000
    const recent = this.errors.filter(e => new Date(e.timestamp).getTime() > last24h)

    // Count error types
    const errorCounts = recent.reduce((acc, error) => {
      const key = error.message.substring(0, 100) // Truncate for grouping
      acc[key] = (acc[key] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    // Top errors
    const topErrors = Object.entries(errorCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([message, count]) => ({ message, count }))

    // Error trends (last 7 days)
    const trends = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date(now - i * 24 * 60 * 60 * 1000)
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()
      const dayEnd = dayStart + 24 * 60 * 60 * 1000

      const dayErrors = this.errors.filter(e => {
        const errorTime = new Date(e.timestamp).getTime()
        return errorTime >= dayStart && errorTime < dayEnd
      })

      trends.push({
        date: date.toISOString().split('T')[0],
        count: dayErrors.length
      })
    }

    return {
      total_errors: this.errors.length,
      error_rate: recent.length / 24, // errors per hour
      top_errors: topErrors,
      error_trends: trends
    }
  }

  public clearErrors() {
    this.errors = []
  }

  // Specific error capture methods
  public captureAPIError(url: string, status: number, response?: any, context?: any) {
    this.captureError({
      level: 'error',
      message: `API Error: ${status} ${url}`,
      context: {
        type: 'api_error',
        url,
        status,
        response,
        ...context
      }
    })
  }

  public captureUserAction(action: string, success: boolean, context?: any) {
    this.captureError({
      level: success ? 'info' : 'warning',
      message: `User Action: ${action} ${success ? 'succeeded' : 'failed'}`,
      context: {
        type: 'user_action',
        action,
        success,
        ...context
      }
    })
  }

  public capturePerformanceIssue(metric: string, value: number, threshold: number) {
    if (value > threshold) {
      this.captureError({
        level: 'warning',
        message: `Performance Issue: ${metric} = ${value}ms (threshold: ${threshold}ms)`,
        context: {
          type: 'performance_issue',
          metric,
          value,
          threshold
        }
      })
    }
  }
}

// Export singleton instance
export const errorTracker = new ErrorTrackingService()

// React hook for error tracking
export function useErrorTracking() {
  return {
    captureError: (error: Partial<ErrorReport>) => errorTracker.captureError(error),
    captureAPIError: (url: string, status: number, response?: any, context?: any) =>
      errorTracker.captureAPIError(url, status, response, context),
    captureUserAction: (action: string, success: boolean, context?: any) =>
      errorTracker.captureUserAction(action, success, context),
    getErrors: () => errorTracker.getErrors(),
    getMetrics: () => errorTracker.getMetrics(),
  }
}

export default ErrorTrackingService


