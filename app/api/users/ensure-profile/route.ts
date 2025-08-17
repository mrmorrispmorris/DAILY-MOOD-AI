import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      console.error('❌ API: User not authenticated:', userError)
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    console.log('🔧 API: Ensuring user profile for:', user.email)

    // Try to create or update user profile
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
      .select()
      .single()

    if (error) {
      console.error('❌ API: Failed to create user profile:', error)
      return NextResponse.json({ 
        error: 'Failed to create user profile',
        details: error.message 
      }, { status: 500 })
    }

    console.log('✅ API: User profile ensured successfully')
    return NextResponse.json({ 
      success: true, 
      user: data 
    })

  } catch (error) {
    console.error('💥 API: Exception ensuring user profile:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: (error as Error).message 
    }, { status: 500 })
  }
}
