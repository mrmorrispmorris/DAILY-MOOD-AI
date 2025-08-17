'use client'

import { toast } from 'sonner'

export interface ErrorDetails {
  code: string
  message: string
  userMessage: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  category: 'auth' | 'network' | 'validation' | 'server' | 'unknown'
  timestamp: Date
  userId?: string
  context?: Record<string, any>
}

export class EnhancedErrorService {
  private static instance: EnhancedErrorService
  private errorLog: ErrorDetails[] = []
  private isOnline: boolean = typeof navigator !== 'undefined' ? navigator.onLine : true

  private constructor() {
    if (typeof window !== 'undefined') {
      this.setupNetworkListener()
    }
  }

  static getInstance(): EnhancedErrorService {
    if (!EnhancedErrorService.instance) {
      EnhancedErrorService.instance = new EnhancedErrorService()
    }
    return EnhancedErrorService.instance
  }

  private setupNetworkListener() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true
        this.handleNetworkRecovery()
      })

      window.addEventListener('offline', () => {
        this.isOnline = false
        this.handleNetworkLoss()
      })
    }
  }

  // Handle different types of errors with appropriate user messages
  handleError(error: Error | string, context?: Record<string, any>): void {
    const errorDetails = this.parseError(error, context)
    this.logError(errorDetails)
    this.showUserMessage(errorDetails)
    this.trackError(errorDetails)
  }

  private parseError(error: Error | string, context?: Record<string, any>): ErrorDetails {
    if (typeof error === 'string') {
      return this.createErrorDetails('UNKNOWN_ERROR', error, context)
    }

    // Parse common error patterns
    if (error.message.includes('network') || error.message.includes('fetch')) {
      return this.createErrorDetails('NETWORK_ERROR', error.message, context, 'network', 'high')
    }

    if (error.message.includes('auth') || error.message.includes('unauthorized')) {
      return this.createErrorDetails('AUTH_ERROR', error.message, context, 'auth', 'high')
    }

    if (error.message.includes('validation') || error.message.includes('invalid')) {
      return this.createErrorDetails('VALIDATION_ERROR', error.message, context, 'validation', 'medium')
    }

    if (error.message.includes('server') || error.message.includes('500')) {
      return this.createErrorDetails('SERVER_ERROR', error.message, context, 'server', 'critical')
    }

    return this.createErrorDetails('UNKNOWN_ERROR', error.message, context)
  }

  private createErrorDetails(
    code: string,
    message: string,
    context?: Record<string, any>,
    category: ErrorDetails['category'] = 'unknown',
    severity: ErrorDetails['severity'] = 'medium'
  ): ErrorDetails {
    return {
      code,
      message,
      userMessage: this.generateUserMessage(code, message, severity),
      severity,
      category,
      timestamp: new Date(),
      context
    }
  }

  private generateUserMessage(code: string, message: string, severity: ErrorDetails['severity']): string {
    const messages: Record<string, string> = {
      'NETWORK_ERROR': 'Connection issue detected. Please check your internet connection and try again.',
      'AUTH_ERROR': 'Authentication required. Please log in again to continue.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
      'SERVER_ERROR': 'We\'re experiencing technical difficulties. Please try again in a few minutes.',
      'OFFLINE_ERROR': 'You\'re currently offline. Your data will sync when you reconnect.',
      'RATE_LIMIT_ERROR': 'Too many requests. Please wait a moment before trying again.',
      'QUOTA_EXCEEDED': 'You\'ve reached your limit. Please upgrade your plan for more features.',
      'FEATURE_UNAVAILABLE': 'This feature is not available in your current plan.',
      'DATA_SYNC_ERROR': 'Unable to sync your data. Please check your connection.',
      'AI_SERVICE_ERROR': 'AI insights are temporarily unavailable. Please try again later.',
      'PAYMENT_ERROR': 'Payment processing failed. Please check your payment details.',
      'SUBSCRIPTION_ERROR': 'Subscription update failed. Please contact support if the issue persists.',
      'UNKNOWN_ERROR': 'Something went wrong. Please try again or contact support if the problem continues.'
    }

    return messages[code] || messages['UNKNOWN_ERROR']
  }

  private showUserMessage(errorDetails: ErrorDetails): void {
    const { severity, userMessage } = errorDetails

    switch (severity) {
      case 'low':
        toast.info(userMessage, {
          duration: 3000,
          description: 'This is just a heads up'
        })
        break
      case 'medium':
        toast.warning(userMessage, {
          duration: 5000,
          description: 'Please review and try again'
        })
        break
      case 'high':
        toast.error(userMessage, {
          duration: 8000,
          description: 'This needs your attention'
        })
        break
      case 'critical':
        toast.error(userMessage, {
          duration: 10000,
          description: 'Critical error - please contact support',
          action: {
            label: 'Contact Support',
            onClick: () => this.contactSupport(errorDetails)
          }
        })
        break
    }
  }

  // Handle network-specific errors
  handleNetworkError(error: Error): void {
    if (!this.isOnline) {
      this.handleError('OFFLINE_ERROR', { 
        originalError: error.message,
        timestamp: new Date().toISOString()
      })
    } else {
      this.handleError(error, { 
        errorType: 'network',
        retryCount: 0
      })
    }
  }

  // Handle authentication errors
  handleAuthError(error: Error): void {
    this.handleError(error, { 
      errorType: 'authentication',
      requiresRedirect: true
    })
    
    // Redirect to login if needed
    setTimeout(() => {
      window.location.href = '/login'
    }, 2000)
  }

  // Handle validation errors
  handleValidationError(field: string, message: string): void {
    this.handleError(`VALIDATION_ERROR: ${field}`, {
      field,
      validationMessage: message,
      errorType: 'validation'
    })
  }

  // Handle quota and rate limit errors
  handleQuotaError(error: Error): void {
    this.handleError(error, {
      errorType: 'quota',
      requiresUpgrade: true
    })
  }

  // Handle feature availability errors
  handleFeatureError(feature: string): void {
    this.handleError(`FEATURE_UNAVAILABLE: ${feature}`, {
      feature,
      errorType: 'feature_unavailable',
      requiresUpgrade: true
    })
  }

  // Handle AI service errors
  handleAIServiceError(error: Error): void {
    this.handleError(error, {
      errorType: 'ai_service',
      service: 'openai',
      fallbackAvailable: true
    })
  }

  // Handle payment errors
  handlePaymentError(error: Error): void {
    this.handleError(error, {
      errorType: 'payment',
      requiresRetry: true,
      supportRequired: true
    })
  }

  // Handle subscription errors
  handleSubscriptionError(error: Error): void {
    this.handleError(error, {
      errorType: 'subscription',
      requiresSupport: true
    })
  }

  // Handle data sync errors
  handleDataSyncError(error: Error): void {
    this.handleError(error, {
      errorType: 'data_sync',
      retryCount: 0,
      maxRetries: 3
    })
  }

  // Retry mechanism for recoverable errors
  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation()
      } catch (error) {
        lastError = error as Error
        
        if (attempt === maxRetries) {
          throw lastError
        }

        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, delay * attempt))
        
        // Log retry attempt
        this.logError({
          code: 'RETRY_ATTEMPT',
          message: `Retry attempt ${attempt}/${maxRetries} failed`,
          userMessage: `Retrying... (${attempt}/${maxRetries})`,
          severity: 'low',
          category: 'unknown',
          timestamp: new Date(),
          context: { attempt, maxRetries, error: lastError.message }
        })
      }
    }

    throw lastError!
  }

  // Network recovery handling
  private handleNetworkRecovery(): void {
    toast.success('Connection restored! Syncing your data...', {
      duration: 4000,
      description: 'Your offline changes will be uploaded'
    })

    // Trigger data sync
    this.triggerDataSync()
  }

  private handleNetworkLoss(): void {
    toast.warning('You\'re offline. Your data will be saved locally and synced when you reconnect.', {
      duration: 6000,
      description: 'Working offline mode enabled'
    })
  }

  private triggerDataSync(): void {
    // This would trigger the offline sync service
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: 'TRIGGER_SYNC',
        data: { timestamp: Date.now() }
      })
    }
  }

  // Error logging
  private logError(errorDetails: ErrorDetails): void {
    this.errorLog.push(errorDetails)
    
    // Keep only last 100 errors
    if (this.errorLog.length > 100) {
      this.errorLog = this.errorLog.slice(-100)
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Error logged:', errorDetails)
    }
  }

  // Error tracking for analytics
  private trackError(errorDetails: ErrorDetails): void {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'error', {
        event_category: 'error',
        event_label: errorDetails.code,
        error_message: errorDetails.message,
        error_category: errorDetails.category,
        error_severity: errorDetails.severity,
        value: 1
      })
    }
  }

  // Contact support
  private contactSupport(errorDetails: ErrorDetails): void {
    const supportUrl = `/support?error=${encodeURIComponent(errorDetails.code)}&context=${encodeURIComponent(JSON.stringify(errorDetails.context))}`
    window.open(supportUrl, '_blank')
  }

  // Get error statistics
  getErrorStats(): {
    total: number
    byCategory: Record<string, number>
    bySeverity: Record<string, number>
    recentErrors: ErrorDetails[]
  } {
    const byCategory: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const recentErrors = this.errorLog.slice(-10)

    this.errorLog.forEach(error => {
      byCategory[error.category] = (byCategory[error.category] || 0) + 1
      bySeverity[error.severity] = (bySeverity[error.severity] || 0) + 1
    })

    return {
      total: this.errorLog.length,
      byCategory,
      bySeverity,
      recentErrors
    }
  }

  // Clear error log
  clearErrorLog(): void {
    this.errorLog = []
  }

  // Export error log for debugging
  exportErrorLog(): string {
    return JSON.stringify(this.errorLog, null, 2)
  }
}

// Export singleton instance
export const errorService = EnhancedErrorService.getInstance()

// Convenience functions for common error types
export const handleNetworkError = (error: Error) => errorService.handleNetworkError(error)
export const handleAuthError = (error: Error) => errorService.handleAuthError(error)
export const handleValidationError = (field: string, message: string) => errorService.handleValidationError(field, message)
export const handleQuotaError = (error: Error) => errorService.handleQuotaError(error)
export const handleFeatureError = (feature: string) => errorService.handleFeatureError(feature)
export const handleAIServiceError = (error: Error) => errorService.handleAIServiceError(error)
export const handlePaymentError = (error: Error) => errorService.handlePaymentError(error)
export const handleSubscriptionError = (error: Error) => errorService.handleSubscriptionError(error)
export const handleDataSyncError = (error: Error) => errorService.handleDataSyncError(error)
export const retryOperation = <T>(operation: () => Promise<T>, maxRetries?: number, delay?: number) => 
  errorService.retryOperation(operation, maxRetries, delay)
