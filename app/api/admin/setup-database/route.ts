import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client'

export async function POST() {
  try {
    const supabase = createRouteHandlerClient({ 
      cookies,
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY
    })

    console.log('🔧 Database Setup Starting...')

    // SQL to create the users table with proper structure
    const createUsersTableSQL = `
      -- Create users table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT,
        subscription_level TEXT DEFAULT 'free' NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Enable RLS
      ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own data" ON public.users;
      DROP POLICY IF EXISTS "Users can insert own data" ON public.users;
      DROP POLICY IF EXISTS "Users can update own data" ON public.users;

      -- Create RLS policies
      CREATE POLICY "Users can view own data" ON public.users 
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can insert own data" ON public.users 
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      CREATE POLICY "Users can update own data" ON public.users 
        FOR UPDATE USING (auth.uid() = id);
    `

    // SQL to create/fix the mood_entries table with actual schema
    const createMoodEntriesTableSQL = `
      -- Create mood_entries table if it doesn't exist
      CREATE TABLE IF NOT EXISTS public.mood_entries (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
        mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
        mood_notes TEXT DEFAULT '',
        activities TEXT[] DEFAULT '{}',
        weather TEXT DEFAULT 'unknown',
        sleep_hours NUMERIC,
        stress_level INTEGER DEFAULT 5 CHECK (stress_level >= 1 AND stress_level <= 10),
        energy_level INTEGER DEFAULT 5 CHECK (energy_level >= 1 AND energy_level <= 10),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
      );

      -- Enable RLS
      ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

      -- Drop existing policies if they exist
      DROP POLICY IF EXISTS "Users can view own mood entries" ON public.mood_entries;
      DROP POLICY IF EXISTS "Users can insert own mood entries" ON public.mood_entries;
      DROP POLICY IF EXISTS "Users can update own mood entries" ON public.mood_entries;
      DROP POLICY IF EXISTS "Users can delete own mood entries" ON public.mood_entries;

      -- Create RLS policies
      CREATE POLICY "Users can view own mood entries" ON public.mood_entries 
        FOR SELECT USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can insert own mood entries" ON public.mood_entries 
        FOR INSERT WITH CHECK (auth.uid() = user_id);
      
      CREATE POLICY "Users can update own mood entries" ON public.mood_entries 
        FOR UPDATE USING (auth.uid() = user_id);
      
      CREATE POLICY "Users can delete own mood entries" ON public.mood_entries 
        FOR DELETE USING (auth.uid() = user_id);
    `

    // Execute the SQL commands
    console.log('📝 Creating users table...')
    const { error: usersError } = await supabase.rpc('exec', { sql: createUsersTableSQL })
    
    if (usersError) {
      console.error('❌ Error creating users table:', usersError)
      // Try alternative approach using direct SQL execution
      console.log('🔄 Trying alternative approach for users table...')
      
      const { error: altUsersError } = await supabase
        .from('users')
        .select('id')
        .limit(1)
      
      if (altUsersError && altUsersError.code === '42P01') {
        // Table doesn't exist, we need to create it manually
        console.log('⚠️ Users table does not exist, needs manual creation in Supabase dashboard')
      }
    }

    console.log('📝 Creating mood_entries table...')
    const { error: moodError } = await supabase.rpc('exec', { sql: createMoodEntriesTableSQL })
    
    if (moodError) {
      console.error('❌ Error creating mood_entries table:', moodError)
    }

    // Test the setup by trying to query both tables
    console.log('🧪 Testing users table...')
    const { data: usersTest, error: usersTestError } = await supabase
      .from('users')
      .select('id, subscription_level')
      .limit(1)

    console.log('🧪 Testing mood_entries table...')
    const { data: moodTest, error: moodTestError } = await supabase
      .from('mood_entries')
      .select('id, mood_score')
      .limit(1)

    const result = {
      success: true,
      operations: {
        users_table: {
          created: !usersError,
          error: usersError?.message || null,
          test_query: {
            success: !usersTestError,
            error: usersTestError?.message || null,
            data: usersTest
          }
        },
        mood_entries_table: {
          created: !moodError,
          error: moodError?.message || null,
          test_query: {
            success: !moodTestError,
            error: moodTestError?.message || null,
            data: moodTest
          }
        }
      },
      timestamp: new Date().toISOString()
    }

    console.log('✅ Database setup complete:', result)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('💥 Database setup failed:', error)
    return NextResponse.json({ 
      error: 'Database setup failed', 
      details: error.message 
    }, { status: 500 })
  }
}
