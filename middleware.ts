import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    console.log(`🛡️ Middleware: ${request.nextUrl.pathname}`)
    
    // SIMPLIFIED - Just let everything through for now
    console.log(`⏭️ Skipping middleware for: ${request.nextUrl.pathname}`)
    return NextResponse.next()
  } catch (error: any) {
    // Handle middleware errors gracefully to prevent crashes
    console.error('🚨 Middleware error:', error.message)
    
    // For network errors, continue processing
    if (error.code === 'ECONNRESET' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      console.log('📡 Network error in middleware - continuing')
      return NextResponse.next()
    }
    
    // For other errors, return a safe response
    return new NextResponse('Middleware error', { status: 500 })
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}