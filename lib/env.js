function validateEnvironment() {
  console.log('🔍 ENV VALIDATION: Starting environment check...')
  
  const required = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ]
  
  const optional = [
    'SUPABASE_SERVICE_ROLE_KEY',
    'OPENAI_API_KEY',
    'STRIPE_SECRET_KEY'
  ]
  
  console.log('🔍 ENV VALIDATION: Checking required variables...')
  const missing = required.filter(key => {
    const exists = !!process.env[key]
    console.log(`  ${key}: ${exists ? '✅ Present' : '❌ Missing'}`)
    return !exists
  })
  
  console.log('🔍 ENV VALIDATION: Checking optional variables...')
  optional.forEach(key => {
    const exists = !!process.env[key]
    console.log(`  ${key}: ${exists ? '✅ Present' : '⚠️ Optional - Not set'}`)
  })
  
  if (missing.length > 0) {
    console.error('❌ ENV VALIDATION: Missing environment variables:', missing)
    console.error('❌ ENV VALIDATION: Check your .env.local file')
    console.error('❌ ENV VALIDATION: Current .env.local should contain:')
    missing.forEach(key => {
      console.error(`  ${key}=your_value_here`)
    })
    
    // Don't throw in development - just warn
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
    } else {
      console.warn('⚠️ ENV VALIDATION: Continuing in development mode with missing variables')
    }
  }
  
  console.log('✅ ENV VALIDATION: Environment validation completed')
  return { missing, valid: missing.length === 0 }
}

// Only validate if not in middleware context
if (typeof window === 'undefined' && !process.env.MIDDLEWARE_CONTEXT) {
  try {
    validateEnvironment()
  } catch (error) {
    console.error('🚨 ENV VALIDATION: Critical error during validation:', error)
  }
}

export { validateEnvironment }


