import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

const protectedPaths = ['/dashboard', '/api/ai-insights', '/api/analytics']
// Note: /working-dashboard handles its own auth verification

export async function middleware(request: NextRequest) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`🛡️ MIDDLEWARE START: ${request.method} ${request.nextUrl.pathname}`)
  }
  
  try {
    const path = request.nextUrl.pathname
    
    // Check if path needs protection
    if (protectedPaths.some(p => path.startsWith(p))) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔐 Protected path detected: ${path}`)
      }
      
      let response = NextResponse.next({
        request: {
          headers: request.headers,
        },
      })

      const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          cookies: {
            get(name: string) {
              return request.cookies.get(name)?.value
            },
            set(name: string, value: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value,
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value,
                ...options,
              })
            },
            remove(name: string, options: CookieOptions) {
              request.cookies.set({
                name,
                value: '',
                ...options,
              })
              response = NextResponse.next({
                request: {
                  headers: request.headers,
                },
              })
              response.cookies.set({
                name,
                value: '',
                ...options,
              })
            },
          },
        }
      )

      const { data: { user }, error } = await supabase.auth.getUser()

      if (error || !user) {
        if (process.env.NODE_ENV === 'development') {
          console.log(`🚫 Unauthenticated access to ${path}, redirecting to login`)
        }
        if (!path.includes('/login') && !path.startsWith('/api/')) {
          return NextResponse.redirect(new URL('/login', request.url))
        } else if (path.startsWith('/api/')) {
          return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
      } else {
        if (process.env.NODE_ENV === 'development') {
          console.log(`✅ Authenticated user ${user.email} accessing ${path}`)
        }
      }

      return response
    }
    
    // For non-protected paths, proceed normally
    if (process.env.NODE_ENV === 'development') {
      console.log(`⏭️ Non-protected path: ${path}`)
    }
    const response = NextResponse.next()
    
    // Add security headers
    response.headers.set('x-middleware-processed', 'true')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Middleware completed: ${request.nextUrl.pathname}`)
    }
    return response
    
  } catch (error: any) {
    console.error('🚨 Middleware error:', {
      message: error.message,
      stack: error.stack,
      pathname: request.nextUrl.pathname
    })
    
    return NextResponse.json(
      { error: 'Middleware processing failed', details: error.message },
      { status: 500 }
    )
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/minimal).*)'],
}