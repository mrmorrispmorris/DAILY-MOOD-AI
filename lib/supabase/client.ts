import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => {
  // Get environment variables
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // Check if environment variables are properly set
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('⚠️ Supabase not configured - using demo mode')
    throw new Error('SUPABASE_NOT_CONFIGURED')
  }
  
  // Check if they're still placeholder values
  if (supabaseUrl.includes('your-project') || 
      supabaseAnonKey.includes('your-anon-key') || 
      supabaseUrl === 'https://your-project.supabase.co' ||
      supabaseUrl === 'your_supabase_project_url' ||
      supabaseAnonKey === 'your_supabase_anon_key') {
    console.warn('⚠️ Placeholder values detected - using demo mode')
    throw new Error('SUPABASE_PLACEHOLDER_VALUES')
  }
  
  // Validate URL format
  if (!supabaseUrl.startsWith('https://') || !supabaseUrl.includes('.supabase.co')) {
    console.warn('⚠️ Invalid Supabase URL format')
    throw new Error('SUPABASE_INVALID_URL')
  }
  
  try {
    console.log('✅ Creating Supabase client with valid configuration')
    return createClientComponentClient({
      supabaseUrl,
      supabaseKey: supabaseAnonKey
    })
  } catch (error) {
    console.error('❌ Failed to create Supabase client:', error)
    throw error
  }
}