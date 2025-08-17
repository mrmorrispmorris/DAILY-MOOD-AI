import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies })

  try {
    console.log('🔧 RLS Fix: Starting RLS policy fixes...')

    // Test authentication first
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        details: authError
      }, { status: 401 })
    }

    console.log('✅ RLS Fix: User authenticated:', user.email)

    // Fix 1: Enable INSERT policy for mood_entries table
    console.log('🔧 RLS Fix: Creating INSERT policy for mood_entries...')
    
    // First, try to drop existing policies to avoid conflicts
    try {
      await supabase.rpc('sql', {
        query: `
          DROP POLICY IF EXISTS "Users can create own mood entries" ON mood_entries;
          DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON mood_entries;
        `
      })
      console.log('🧹 RLS Fix: Dropped existing mood_entries policies')
    } catch (dropError) {
      console.log('ℹ️ RLS Fix: No existing policies to drop for mood_entries')
    }

    // Create new INSERT policy for mood_entries
    const { error: moodEntriesPolicyError } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Enable insert for authenticated users only" 
        ON mood_entries 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = user_id);
      `
    })

    if (moodEntriesPolicyError) {
      console.error('❌ RLS Fix: Failed to create mood_entries INSERT policy:', moodEntriesPolicyError)
      throw new Error(`mood_entries policy creation failed: ${moodEntriesPolicyError.message}`)
    }

    console.log('✅ RLS Fix: mood_entries INSERT policy created successfully')

    // Fix 2: Enable INSERT policy for mood_logs table (if it exists)
    console.log('🔧 RLS Fix: Creating INSERT policy for mood_logs...')
    
    // First, try to drop existing policies
    try {
      await supabase.rpc('sql', {
        query: `
          DROP POLICY IF EXISTS "Users can create own mood logs" ON mood_logs;
          DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON mood_logs;
        `
      })
      console.log('🧹 RLS Fix: Dropped existing mood_logs policies')
    } catch (dropError) {
      console.log('ℹ️ RLS Fix: No existing policies to drop for mood_logs')
    }

    // Create new INSERT policy for mood_logs
    const { error: moodLogsPolicyError } = await supabase.rpc('sql', {
      query: `
        CREATE POLICY "Enable insert for authenticated users only" 
        ON mood_logs 
        FOR INSERT 
        TO authenticated 
        WITH CHECK (auth.uid() = auth_user_id);
      `
    })

    if (moodLogsPolicyError) {
      console.warn('⚠️ RLS Fix: Failed to create mood_logs INSERT policy (table might not exist):', moodLogsPolicyError)
    } else {
      console.log('✅ RLS Fix: mood_logs INSERT policy created successfully')
    }

    // Test the fixes by attempting actual insertions
    console.log('🔍 RLS Fix: Testing INSERT operations after policy fix...')

    // Test mood_entries insertion
    const testEntry = {
      user_id: user.id,
      mood_score: 7,
      emoji: '😊',
      notes: 'RLS policy test entry',
      tags: ['test', 'rls-fix'],
      date: new Date().toISOString().split('T')[0]
    }

    const { data: insertTest, error: insertError } = await supabase
      .from('mood_entries')
      .insert(testEntry)
      .select()
      .single()

    let moodEntriesWorking = false
    if (!insertError && insertTest) {
      moodEntriesWorking = true
      console.log('✅ RLS Fix: mood_entries INSERT test successful!')
      
      // Clean up test entry
      await supabase.from('mood_entries').delete().eq('id', insertTest.id)
      console.log('🧹 RLS Fix: Cleaned up test mood_entries entry')
    } else {
      console.error('❌ RLS Fix: mood_entries INSERT test failed:', insertError)
    }

    // Test mood_logs insertion (if table exists)
    let moodLogsWorking = false
    if (!moodLogsPolicyError) {
      const testLogsEntry = {
        auth_user_id: user.id,
        user_email: user.email,
        mood_score: 7,
        emoji: '😊',
        notes: 'RLS policy test logs entry',
        tags: ['test', 'rls-fix'],
        log_date: new Date().toISOString().split('T')[0]
      }

      const { data: logsInsertTest, error: logsInsertError } = await supabase
        .from('mood_logs')
        .insert(testLogsEntry)
        .select()
        .single()

      if (!logsInsertError && logsInsertTest) {
        moodLogsWorking = true
        console.log('✅ RLS Fix: mood_logs INSERT test successful!')
        
        // Clean up test entry
        await supabase.from('mood_logs').delete().eq('id', logsInsertTest.id)
        console.log('🧹 RLS Fix: Cleaned up test mood_logs entry')
      } else {
        console.error('❌ RLS Fix: mood_logs INSERT test failed:', logsInsertError)
      }
    }

    const success = moodEntriesWorking || moodLogsWorking

    console.log('✅ RLS Fix: RLS policy fixes completed!')
    return NextResponse.json({ 
      message: 'RLS policy fixes completed successfully!',
      results: {
        mood_entries: {
          policyCreated: !moodEntriesPolicyError,
          insertWorking: moodEntriesWorking,
          error: insertError
        },
        mood_logs: {
          policyCreated: !moodLogsPolicyError,
          insertWorking: moodLogsWorking,
          tableExists: !moodLogsPolicyError
        }
      },
      recommendation: success 
        ? `✅ Database is now working! Use ${moodEntriesWorking ? 'mood_entries' : 'mood_logs'} table for mood logging.`
        : '❌ RLS policies created but INSERT operations still failing. Check Supabase dashboard for additional issues.',
      status: success ? 'success' : 'partial_success'
    }, { status: 200 })

  } catch (error: any) {
    console.error('❌ RLS Fix: Error during RLS policy fix:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to fix RLS policies',
      details: error,
      step: 'rls_policy_fix'
    }, { status: 500 })
  }
}
