import { NextResponse, type NextRequest } from 'next/server'
import { updateSession } from './lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  console.log(`🛡️ Middleware: ${request.nextUrl.pathname}`)
  
  // Skip middleware for static files, API routes, and public pages
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api') ||
    request.nextUrl.pathname.includes('.') ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/favicon.ico'
  ) {
    console.log(`⏭️ Skipping middleware for: ${request.nextUrl.pathname}`)
    return NextResponse.next()
  }

  // Update session for all other requests
  const { supabaseResponse, user } = await updateSession(request)

  // Only check auth for dashboard routes
  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    console.log('🔐 Checking auth for dashboard route')
    
    if (!user) {
      console.log('🚫 No user - redirecting to login')
      return NextResponse.redirect(new URL('/login', request.url))
    }
    
    console.log('✅ Valid user found:', user.email)
  }
  
  return supabaseResponse
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}