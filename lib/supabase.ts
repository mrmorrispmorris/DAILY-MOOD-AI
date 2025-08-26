import { createClient } from '@supabase/supabase-js'

// Validate environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables')
  // Provide fallback for build time
  const fallbackUrl = 'https://bpbzxmaqcllvpvykwmup.supabase.co'
  const fallbackKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJwYnp4bWFxY2xsdnB2eWt3bXVwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwODA2NTcsImV4cCI6MjA3MVE1NjY1N30.BefxUfed_CIMEcQ0ZDoaiXKSta-dK9eGiCoRWjcAYBU'
  
  // Use fallback during build only
  const url = supabaseUrl || fallbackUrl
  const key = supabaseAnonKey || fallbackKey
  
  export const supabase = createClient(url, key)
} else {
  export const supabase = createClient(supabaseUrl, supabaseAnonKey)
}
