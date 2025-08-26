// DEVELOPMENT-ONLY: Completely avoid Sentry dependencies
// This file is used in development to prevent bundling Sentry modules

export class ErrorService {
  /**
   * Log an error to console only (development)
   */
  static logError(error: Error, context?: any) {
    console.error('🚨 Development Error:', error.message, context)
    if (context) {
      console.error('Context:', JSON.stringify(context, null, 2))
    }
    console.error('Stack:', error.stack)
  }

  /**
   * Log a warning message (development)
   */
  static logWarning(message: string, context?: any) {
    console.warn('⚠️ Development Warning:', message, context)
  }

  /**
   * Log an info message (development)
   */
  static logInfo(message: string, context?: any) {
    console.log('ℹ️ Development Info:', message, context)
  }

  /**
   * Set user context (no-op in development)
   */
  static setUserContext(user: { id: string; email: string }) {
    console.log('👤 Development: User context set:', user.email)
  }

  /**
   * Add custom context (no-op in development)
   */
  static addContext(key: string, value: any) {
    console.log(`🏷️ Development: Context added - ${key}:`, value)
  }

  /**
   * Capture a message (development)
   */
  static captureMessage(message: string, level: 'error' | 'warning' | 'info' = 'info') {
    console.log(`📝 Development ${level.toUpperCase()}: ${message}`)
  }
}

