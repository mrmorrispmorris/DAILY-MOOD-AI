import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ 
      cookies,
      supabaseUrl: SUPABASE_URL,
      supabaseKey: SUPABASE_ANON_KEY
    })
    
    console.log('🔥 FINAL FIX: Creating completely new table structure...')

    // Get the current user to ensure we're authenticated
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ FINAL FIX: User not authenticated:', userError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('🔧 FINAL FIX: Authenticated user:', user.email)

    // FINAL APPROACH: Create a completely new table with no foreign keys
    const finalFix = `
      -- Step 1: Create a brand new mood logs table with no constraints
      CREATE TABLE IF NOT EXISTS mood_logs (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        auth_user_id UUID NOT NULL,
        user_email TEXT NOT NULL,
        mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
        emoji TEXT DEFAULT '😊',
        notes TEXT DEFAULT '',
        tags TEXT[] DEFAULT '{}',
        log_date DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Step 2: Enable RLS on the new table
      ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
      
      -- Step 3: Create simple RLS policy
      DROP POLICY IF EXISTS "Users can manage own mood logs" ON mood_logs;
      CREATE POLICY "Users can manage own mood logs" ON mood_logs
        FOR ALL USING (auth_user_id = auth.uid());
      
      -- Step 4: Create indexes for performance
      CREATE INDEX IF NOT EXISTS mood_logs_user_date_idx ON mood_logs (auth_user_id, log_date DESC);
      CREATE INDEX IF NOT EXISTS mood_logs_created_at_idx ON mood_logs (created_at DESC);
    `

    try {
      console.log('🔥 FINAL FIX: Creating new mood_logs table...')
      
      // Execute the SQL
      const { error: sqlError } = await supabase.rpc('exec_sql', { sql: finalFix })
      
      if (sqlError) {
        console.log('⚠️ FINAL FIX: RPC failed, trying direct table creation...')
        
        // Try direct table operations
        const { error: createError } = await supabase.rpc('exec_sql', { 
          sql: `CREATE TABLE IF NOT EXISTS mood_logs (
                  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
                  auth_user_id UUID NOT NULL,
                  user_email TEXT NOT NULL,
                  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
                  emoji TEXT DEFAULT '😊',
                  notes TEXT DEFAULT '',
                  tags TEXT[] DEFAULT '{}',
                  log_date DATE DEFAULT CURRENT_DATE,
                  created_at TIMESTAMPTZ DEFAULT NOW(),
                  updated_at TIMESTAMPTZ DEFAULT NOW()
                );` 
        })
        
        if (createError) {
          console.error('❌ FINAL FIX: Table creation failed:', createError)
        } else {
          console.log('✅ FINAL FIX: New table created successfully')
        }
      } else {
        console.log('✅ FINAL FIX: Full SQL execution completed')
      }
      
    } catch (sqlError) {
      console.log('⚠️ FINAL FIX: SQL execution had issues, but continuing...')
    }

    // Test if the new table works
    try {
      console.log('🧪 FINAL FIX: Testing new mood_logs table...')
      
      const testEntry = {
        auth_user_id: user.id,
        user_email: user.email,
        mood_score: 7,
        emoji: '🧪',
        notes: 'Final fix test entry',
        tags: ['test', 'final-fix'],
        log_date: new Date().toISOString().split('T')[0]
      }
      
      const { data: testData, error: testError } = await supabase
        .from('mood_logs')
        .insert(testEntry)
        .select()
        .single()

      if (testError) {
        console.error('❌ FINAL FIX: Test entry creation failed:', testError)
        return NextResponse.json({ 
          success: false,
          error: 'Test entry creation failed',
          details: testError.message 
        }, { status: 500 })
      } else {
        console.log('✅ FINAL FIX: Test entry created successfully!', testData)
        
        // Clean up test entry
        await supabase.from('mood_logs').delete().eq('id', testData.id)
        console.log('🧹 FINAL FIX: Test entry cleaned up')
        
        return NextResponse.json({ 
          success: true,
          message: 'Final fix completed - new mood_logs table is working!',
          user: {
            id: user.id,
            email: user.email
          },
          details: 'mood_logs table created with no foreign key constraints',
          testResult: testData
        })
      }
    } catch (testError) {
      console.error('💥 FINAL FIX: Test failed:', testError)
      return NextResponse.json({ 
        success: false,
        error: 'Final fix test failed',
        details: (testError as Error).message 
      }, { status: 500 })
    }

  } catch (error) {
    console.error('💥 FINAL FIX: Exception during final fix:', error)
    return NextResponse.json({ 
      error: 'Final fix failed',
      details: (error as Error).message 
    }, { status: 500 })
  }
}
