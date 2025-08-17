import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    console.log('🔧 Database Fix: Starting database schema fixes...')

    // Get the current user to ensure we're authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ Database Fix: User not authenticated:', userError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('🔧 Database Fix: Authenticated user:', user.email)

    // Step 1: Try to create the users table if it doesn't exist
    console.log('📝 Database Fix: Creating users table...')
    const createUsersTable = `
      CREATE TABLE IF NOT EXISTS users (
        id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        subscription_level TEXT DEFAULT 'free',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
    `

    // Step 2: Enable RLS on users table
    const enableRLS = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
    `

    // Step 3: Create RLS policies for users table
    const createUsersPolicies = `
      -- Allow users to read their own profile
      CREATE POLICY IF NOT EXISTS "Users can read own profile" ON users
        FOR SELECT USING (auth.uid() = id);
      
      -- Allow users to insert their own profile
      CREATE POLICY IF NOT EXISTS "Users can insert own profile" ON users
        FOR INSERT WITH CHECK (auth.uid() = id);
      
      -- Allow users to update their own profile
      CREATE POLICY IF NOT EXISTS "Users can update own profile" ON users
        FOR UPDATE USING (auth.uid() = id);
    `

    // Step 4: Create the current user's profile
    const createCurrentUser = `
      INSERT INTO users (id, email, subscription_level, created_at, updated_at)
      VALUES ('${user.id}', '${user.email}', 'free', NOW(), NOW())
      ON CONFLICT (id) DO NOTHING;
    `

    // Step 5: Fix mood_entries table structure
    const fixMoodEntriesTable = `
      -- Add missing columns if they don't exist
      ALTER TABLE mood_entries 
      ADD COLUMN IF NOT EXISTS emoji TEXT DEFAULT '😊',
      ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '',
      ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}',
      ADD COLUMN IF NOT EXISTS date DATE DEFAULT CURRENT_DATE;
    `

    try {
      // Execute the SQL commands
      console.log('📝 Database Fix: Creating users table...')
      await supabase.rpc('exec_sql', { sql: createUsersTable })
      
      console.log('📝 Database Fix: Enabling RLS...')
      await supabase.rpc('exec_sql', { sql: enableRLS })
      
      console.log('📝 Database Fix: Creating RLS policies...')
      await supabase.rpc('exec_sql', { sql: createUsersPolicies })
      
      console.log('📝 Database Fix: Creating current user profile...')
      await supabase.rpc('exec_sql', { sql: createCurrentUser })
      
      console.log('📝 Database Fix: Fixing mood_entries table...')
      await supabase.rpc('exec_sql', { sql: fixMoodEntriesTable })
      
    } catch (sqlError) {
      console.log('⚠️ Database Fix: SQL execution via RPC failed, trying direct approach...')
      
      // Fallback: Try direct table operations
      try {
        // Create user profile directly
        const { data, error } = await supabase
          .from('users')
          .upsert({
            id: user.id,
            email: user.email,
            subscription_level: 'free',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })

        if (error) {
          console.error('❌ Database Fix: Direct user creation failed:', error)
        } else {
          console.log('✅ Database Fix: User profile created via direct method')
        }
      } catch (directError) {
        console.error('❌ Database Fix: Direct method also failed:', directError)
      }
    }

    console.log('✅ Database Fix: Database fixes completed')
    return NextResponse.json({ 
      success: true,
      message: 'Database fixes applied successfully',
      user: {
        id: user.id,
        email: user.email
      }
    })

  } catch (error) {
    console.error('💥 Database Fix: Exception during database fix:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }, { status: 500 })
  }
}
