import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    console.log('🔍 Database Connection Investigation Starting...')

    // Step 1: Check environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

    console.log('🔧 Environment Check:', {
      hasUrl: !!supabaseUrl,
      hasAnonKey: !!supabaseAnonKey,
      hasServiceKey: !!serviceRoleKey,
      urlPreview: supabaseUrl ? supabaseUrl.substring(0, 30) + '...' : 'MISSING',
      keyPreview: supabaseAnonKey ? supabaseAnonKey.substring(0, 20) + '...' : 'MISSING'
    })

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        error: 'Missing environment variables',
        details: {
          hasUrl: !!supabaseUrl,
          hasAnonKey: !!supabaseAnonKey,
          hasServiceKey: !!serviceRoleKey
        }
      }, { status: 500 })
    }

    // Step 2: Test basic client creation
    let supabase
    try {
      supabase = createRouteHandlerClient({ cookies })
      console.log('✅ Supabase client created successfully')
    } catch (clientError) {
      console.error('❌ Failed to create Supabase client:', clientError)
      return NextResponse.json({
        error: 'Failed to create Supabase client',
        details: clientError
      }, { status: 500 })
    }

    // Step 3: Test authentication
    let authResult
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      authResult = {
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message || null
      }
      console.log('🔐 Auth test result:', authResult)
    } catch (authException) {
      console.error('💥 Auth test exception:', authException)
      authResult = { user: null, error: authException.message }
    }

    // Step 4: Test basic database connectivity with different approaches
    const connectionTests = []

    // Test 1: Try a simple query first
    try {
      console.log('🧪 Testing basic connectivity...')
      const { data: basicTest, error: basicError } = await supabase
        .rpc('version') // PostgreSQL version function

      connectionTests.push({
        name: 'Basic PostgreSQL Version Query',
        success: !basicError,
        data: basicTest,
        error: basicError?.message || null
      })
    } catch (basicException) {
      connectionTests.push({
        name: 'Basic PostgreSQL Version Query',
        success: false,
        data: null,
        error: basicException.message
      })
    }

    // Test 2: Try to list tables using information_schema
    try {
      console.log('🧪 Testing information_schema access...')
      const { data: tables, error: tablesError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public')
        .limit(5)

      connectionTests.push({
        name: 'Information Schema Tables Query',
        success: !tablesError,
        data: tables,
        error: tablesError?.message || null,
        errorCode: tablesError?.code || null,
        errorDetails: tablesError?.details || null
      })
    } catch (tablesException) {
      connectionTests.push({
        name: 'Information Schema Tables Query',
        success: false,
        data: null,
        error: tablesException.message
      })
    }

    // Test 3: Try direct table access
    const commonTables = ['users', 'mood_entries', 'profiles']
    for (const tableName of commonTables) {
      try {
        console.log(`🧪 Testing access to ${tableName} table...`)
        const { data: tableTest, error: tableError } = await supabase
          .from(tableName)
          .select('*')
          .limit(1)

        connectionTests.push({
          name: `Direct ${tableName} Table Access`,
          success: !tableError,
          data: tableTest,
          error: tableError?.message || null,
          errorCode: tableError?.code || null,
          errorDetails: tableError?.details || null
        })
      } catch (tableException) {
        connectionTests.push({
          name: `Direct ${tableName} Table Access`,
          success: false,
          data: null,
          error: tableException.message
        })
      }
    }

    // Compile final result
    const result = {
      success: true,
      environment: {
        hasUrl: !!supabaseUrl,
        hasAnonKey: !!supabaseAnonKey,
        hasServiceKey: !!serviceRoleKey,
        urlPreview: supabaseUrl ? supabaseUrl.substring(0, 50) + '...' : 'MISSING'
      },
      authentication: authResult,
      connectionTests,
      recommendations: [],
      timestamp: new Date().toISOString()
    }

    // Add recommendations based on test results
    if (!authResult.user) {
      result.recommendations.push('❌ No authenticated user - login required for database access')
    }

    const failedTests = connectionTests.filter(test => !test.success)
    if (failedTests.length > 0) {
      result.recommendations.push(`❌ ${failedTests.length} connection tests failed - check environment variables and Supabase project status`)
    }

    if (connectionTests.some(test => test.errorCode === '406')) {
      result.recommendations.push('🔧 406 errors detected - likely RLS policy or schema mismatch issues')
    }

    if (connectionTests.some(test => test.error?.includes('relation') && test.error?.includes('does not exist'))) {
      result.recommendations.push('📋 Missing tables detected - run database setup to create required tables')
    }

    console.log('✅ Enhanced database investigation complete:', result)

    return NextResponse.json(result)

  } catch (error: any) {
    console.error('💥 Database investigation failed:', error)
    return NextResponse.json({ 
      error: 'Database investigation failed', 
      details: error.message 
    }, { status: 500 })
  }
}
