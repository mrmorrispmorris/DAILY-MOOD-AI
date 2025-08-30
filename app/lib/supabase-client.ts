import { createClient } from '@supabase/supabase-js'

// Hydration-safe environment variable access
function getSupabaseUrl() {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_SUPABASE_URL!
  }
  // Client-side  
  return process.env.NEXT_PUBLIC_SUPABASE_URL!
}

function getSupabaseAnonKey() {
  if (typeof window === 'undefined') {
    // Server-side
    return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  }
  // Client-side
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
}

// Validate environment variables
const supabaseUrl = getSupabaseUrl()
const supabaseAnonKey = getSupabaseAnonKey()

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing required Supabase environment variables')
  throw new Error('Supabase configuration is incomplete')
}

console.log('✅ Supabase client initializing with:', {
  url: supabaseUrl,
  hasKey: !!supabaseAnonKey,
  keyLength: supabaseAnonKey?.length
})

// Create Supabase client with proper configuration
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
