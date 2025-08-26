/**
 * Global error handlers to prevent ECONNRESET crashes and uncaught exceptions
 * Added to resolve critical system stability issues
 */

export function setupGlobalErrorHandlers() {
  // Handle uncaught exceptions
  process.on('uncaughtException', (error) => {
    console.error('🚨 Uncaught Exception:', error.message)
    console.error('Stack:', error.stack)
    
    // Don't crash the process for network errors
    if (error.message.includes('aborted') || 
        error.message.includes('ECONNRESET') ||
        error.message.includes('ENOTFOUND') ||
        error.message.includes('ETIMEDOUT')) {
      console.log('📡 Network error handled gracefully - continuing server operation')
      return
    }
    
    // For other critical errors, log and continue (don't exit in development)
    if (process.env.NODE_ENV === 'development') {
      console.error('🔧 Development mode: Continuing despite uncaught exception')
    } else {
      // In production, exit gracefully
      console.error('💥 Critical error in production - shutting down gracefully')
      process.exit(1)
    }
  })

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason, promise) => {
    console.error('🚨 Unhandled Rejection at:', promise, 'reason:', reason)
    
    // Don't crash for network-related promise rejections
    if (reason && typeof reason === 'object' && 'code' in reason) {
      const errorCode = (reason as any).code
      if (errorCode === 'ECONNRESET' || 
          errorCode === 'ENOTFOUND' || 
          errorCode === 'ETIMEDOUT' ||
          errorCode === 'ECONNREFUSED') {
        console.log('📡 Network-related promise rejection handled gracefully')
        return
      }
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.error('🔧 Development mode: Continuing despite unhandled rejection')
    }
  })

  // Handle warning events
  process.on('warning', (warning) => {
    // Only log non-monitoring warnings in development
    if (process.env.NODE_ENV === 'development' && 
        !warning.message.includes('prisma') &&
        !warning.message.includes('opentelemetry')) {
      console.warn('⚠️ Process warning:', warning.message)
    }
  })

  console.log('✅ Global error handlers initialized')
}

/**
 * Wrapper for HTTP requests to handle common network errors
 */
export function safeHttpRequest(requestFn: () => Promise<any>) {
  return requestFn().catch((error) => {
    if (error.code === 'ECONNRESET' || 
        error.code === 'ENOTFOUND' || 
        error.code === 'ETIMEDOUT') {
      console.log(`📡 Network error handled: ${error.code}`)
      throw new Error(`Network temporarily unavailable: ${error.code}`)
    }
    throw error
  })
}
