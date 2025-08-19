import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  console.log(`🛡️ Middleware: ${request.nextUrl.pathname}`)
  
  // SIMPLIFIED - Just let everything through for now
  console.log(`⏭️ Skipping middleware for: ${request.nextUrl.pathname}`)
  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}