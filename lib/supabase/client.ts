import { createClient } from '@supabase/supabase-js'

// Hardcoded Supabase configuration
const supabaseUrl = 'https://ctmgjkwctnndlpkpxvqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bWdqa3djdG5uZGxwa3B4dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjE1ODUsImV4cCI6MjA3MDk5NzU4NX0.9Vs7JiuNx45Nfo2vSV4LHkmpFC8Wriq4uHqK3BXrdpE'

// Create and export the Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Helper function to check if client is ready
export const isSupabaseReady = () => {
  return !!supabase
}

// Export URL and key for server-side usage
export const SUPABASE_URL = supabaseUrl
export const SUPABASE_ANON_KEY = supabaseAnonKey