import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/lib/supabase/client'

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ 
    cookies,
    supabaseUrl: SUPABASE_URL,
    supabaseKey: SUPABASE_ANON_KEY
  })

  try {
    console.log('🔧 Simple Fix: Starting database diagnostics...')

    // Test 1: Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('🔍 Auth Test:', { user: user?.email, error: authError })

    if (authError || !user) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        details: authError,
        step: 'authentication'
      }, { status: 401 })
    }

    // Test 2: Check if mood_entries table exists and what columns it has
    console.log('🔍 Testing mood_entries table access...')
    const { data: entriesTest, error: entriesError } = await supabase
      .from('mood_entries')
      .select('*')
      .limit(1)

    console.log('🔍 mood_entries Test Result:', { 
      data: entriesTest, 
      error: entriesError,
      errorCode: entriesError?.code,
      errorMessage: entriesError?.message
    })

    // Test 3: Check if mood_logs table exists
    console.log('🔍 Testing mood_logs table access...')
    const { data: logsTest, error: logsError } = await supabase
      .from('mood_logs')
      .select('*')
      .limit(1)

    console.log('🔍 mood_logs Test Result:', { 
      data: logsTest, 
      error: logsError,
      errorCode: logsError?.code,
      errorMessage: logsError?.message
    })

    // Test 4: Try to insert a test mood entry directly
    console.log('🔍 Testing direct mood_entries insertion...')
    const testEntry = {
      user_id: user.id,
      mood_score: 5,
      emoji: '😐',
      notes: 'Test entry',
      tags: ['test'],
      date: new Date().toISOString().split('T')[0]
    }

    const { data: insertTest, error: insertError } = await supabase
      .from('mood_entries')
      .insert(testEntry)
      .select()
      .single()

    console.log('🔍 Insert Test Result:', { 
      data: insertTest, 
      error: insertError,
      errorCode: insertError?.code,
      errorMessage: insertError?.message,
      errorDetails: insertError?.details,
      errorHint: insertError?.hint
    })

    // Test 5: If mood_entries failed, try mood_logs
    let logsInsertResult = null
    if (insertError) {
      console.log('🔍 Testing mood_logs insertion as fallback...')
      const testLogsEntry = {
        auth_user_id: user.id,
        user_email: user.email,
        mood_score: 5,
        emoji: '😐',
        notes: 'Test logs entry',
        tags: ['test'],
        log_date: new Date().toISOString().split('T')[0]
      }

      const { data: logsInsertData, error: logsInsertError } = await supabase
        .from('mood_logs')
        .insert(testLogsEntry)
        .select()
        .single()

      logsInsertResult = { 
        data: logsInsertData, 
        error: logsInsertError,
        errorCode: logsInsertError?.code,
        errorMessage: logsInsertError?.message
      }
      console.log('🔍 mood_logs Insert Test Result:', logsInsertResult)
    }

    // Clean up test entries
    if (insertTest?.id) {
      await supabase.from('mood_entries').delete().eq('id', insertTest.id)
      console.log('🧹 Cleaned up test mood_entries entry')
    }
    if (logsInsertResult?.data?.id) {
      await supabase.from('mood_logs').delete().eq('id', logsInsertResult.data.id)
      console.log('🧹 Cleaned up test mood_logs entry')
    }

    // Determine what's working
    const moodEntriesWorks = !insertError
    const moodLogsWorks = logsInsertResult && !logsInsertResult.error

    console.log('✅ Database Diagnostics Complete!')
    return NextResponse.json({ 
      message: 'Database diagnostics completed successfully!',
      authentication: {
        working: !authError,
        user: user?.email,
        error: authError
      },
      mood_entries: {
        tableExists: entriesError?.code !== 'PGRST106', // Table not found
        canRead: !entriesError || entriesError.code !== 'PGRST106',
        canInsert: moodEntriesWorks,
        readError: entriesError,
        insertError: insertError
      },
      mood_logs: {
        tableExists: logsError?.code !== 'PGRST106',
        canRead: !logsError || logsError.code !== 'PGRST106', 
        canInsert: moodLogsWorks,
        readError: logsError,
        insertError: logsInsertResult?.error
      },
      recommendation: moodEntriesWorks 
        ? 'mood_entries table is working - use it!'
        : moodLogsWorks 
        ? 'Use mood_logs table as alternative'
        : 'Both tables have issues - need manual Supabase dashboard fix',
      status: 'diagnostic_complete'
    }, { status: 200 })

  } catch (error: any) {
    console.error('❌ Database diagnostics failed:', error)
    return NextResponse.json({ 
      error: error.message || 'Database diagnostics failed',
      details: error,
      step: 'diagnostics'
    }, { status: 500 })
  }
}
