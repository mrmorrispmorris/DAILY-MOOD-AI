import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './lib/supabase/client'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  console.log(`🛡️ Middleware: ${req.nextUrl.pathname}`)
  
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

  // Only check auth for dashboard routes
  if (req.nextUrl.pathname.startsWith('/dashboard')) {
    try {
      console.log('🔐 Checking auth for dashboard route')
      
      const supabase = createMiddlewareClient({ 
        req, 
        res,
        supabaseUrl: SUPABASE_URL,
        supabaseKey: SUPABASE_ANON_KEY
      })
      
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error) {
        console.log('❌ Auth error in middleware:', error.message)
        // Don't redirect on auth errors, let the page handle it
        return res
      }
      
      // If no session, redirect to login
      if (!session) {
        console.log('🚫 No session - redirecting to login')
        return NextResponse.redirect(new URL('/login', req.url))
      }
      
      console.log('✅ Valid session found for:', session.user.email)
      
    } catch (error) {
      console.error('💥 Middleware error:', error)
      // Don't redirect on exceptions, let the page handle it
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