import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  console.log(`🛡️ Middleware: ${req.nextUrl.pathname}`)
  
  // TEMPORARILY DISABLE MIDDLEWARE - JUST PASS THROUGH ALL REQUESTS
  console.log(`⏭️ Middleware disabled - allowing all requests: ${req.nextUrl.pathname}`)
  return res
  
  // Skip middleware for static files, API routes, and auth pages
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api') ||
    req.nextUrl.pathname.includes('.') ||
    req.nextUrl.pathname === '/login' ||
    req.nextUrl.pathname === '/' ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    console.log(`⏭️ Skipping middleware for: ${req.nextUrl.pathname}`)
    return res
  }

  // Allow demo mode for all dashboard routes
  if (req.nextUrl.searchParams.get('demo') === 'true') {
    console.log('🎭 Demo mode - allowing access')
    return res
  }

  // Only check auth for dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      console.log('🔐 Checking auth for dashboard route')
      
      // Check if Supabase is configured
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || 
          supabaseUrl.includes('your-project') || 
          supabaseKey.includes('your-anon-key') ||
          supabaseUrl === 'your_supabase_project_url' ||
          supabaseKey === 'your_supabase_anon_key') {
        console.log('⚠️ Supabase not configured - redirecting to demo')
        return NextResponse.redirect(new URL('/dashboard?demo=true', req.url))
      }
      
      const supabase = createMiddlewareClient({ req, res })
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('❌ Auth error in middleware:', error.message)
        // Don't redirect on auth errors, let the page handle it
        console.log('⚠️ Auth error in middleware, allowing page to handle')
        return res
      }
      
      // If no session, redirect to login
      if (!session) {
        console.log('🚫 No session - redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      console.log('✅ Valid session found')
      
    } catch (error) {
      console.error('💥 Middleware error:', error)
      // Don't redirect on exceptions, let the page handle it
      console.log('⚠️ Middleware exception, allowing page to handle')
      return res
    }
  }

  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}