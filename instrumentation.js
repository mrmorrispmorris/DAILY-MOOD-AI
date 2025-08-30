export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🔍 INSTRUMENTATION: Registering error handlers...')
    
    // Capture ALL unhandled errors
    process.on('uncaughtException', (error) => {
      console.error('🚨 UNCAUGHT EXCEPTION:', error)
      console.error('Stack trace:', error.stack)
      console.error('Error name:', error.name)
      console.error('Error message:', error.message)
    })
    
    process.on('unhandledRejection', (reason, promise) => {
      console.error('🚨 UNHANDLED REJECTION:', reason)
      console.error('Promise:', promise)
      if (reason instanceof Error) {
        console.error('Rejection stack:', reason.stack)
      }
    })
    
    console.log('✅ INSTRUMENTATION: Error handlers registered successfully')
  }
}


