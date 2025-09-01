import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, type CookieOptions } from '@supabase/ssr'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in param, use it as the redirect URL
  const next = searchParams.get('next') ?? '/dashboard'

  console.log('🔐 Auth callback started:', { code: code ? 'present' : 'missing', next })

  if (code) {
    let response = NextResponse.redirect(`${origin}${next}`)
    
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
            response = NextResponse.redirect(`${origin}${next}`)
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
            response = NextResponse.redirect(`${origin}${next}`)
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      }
    )

    try {
      console.log('🔐 Exchanging code for session...')
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('❌ Auth exchange error:', error.message)
        return NextResponse.redirect(`${origin}/login?error=auth_failed`)
      }

      if (data.session && data.user) {
        console.log('✅ Auth success for user:', data.user.email)
        console.log('🍪 Session established, redirecting to:', next)
        return response
      } else {
        console.error('❌ No session data returned')
        return NextResponse.redirect(`${origin}/login?error=no_session`)
      }
      
    } catch (error) {
      console.error('❌ Auth callback exception:', error)
      return NextResponse.redirect(`${origin}/login?error=callback_exception`)
    }
  }

  console.log('⚠️ No auth code provided')
  return NextResponse.redirect(`${origin}/login?error=no_code`)
}