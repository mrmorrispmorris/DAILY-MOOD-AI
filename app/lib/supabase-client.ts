import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ctmgjkwctnndlpkpxvqv.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0bWdqa3djdG5uZGxwa3B4dnF2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU0MjE1ODUsImV4cCI6MjA3MDk5NzU4NX0.9Vs7JiuNx45Nfo2vSV4LHkmpFC8Wriq4uHqK3BXrdpE'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
