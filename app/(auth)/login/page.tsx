'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [mounted, setMounted] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || 'dashboard'

  // Handle hydration
  useEffect(() => {
    setMounted(true)
  }, [])

  // Listen for auth changes (only after hydration)
  useEffect(() => {
    if (!mounted) return

    console.log('🔐 Setting up auth listener...')
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        console.log(`✅ User signed in, redirecting to /${redirectTo}`)
        router.push(`/${redirectTo}`)
      }
    })

    // Check if user is already logged in
    const checkUser = async () => {
      try {
        console.log('🔍 Checking for existing user...')
        const { data: { user }, error } = await supabase.auth.getUser()
        
        if (error) {
          console.log('❌ Auth check error:', error.message)
          setMessage('') // Clear any existing "Invalid API key" message
          return
        }
        
        if (user) {
          console.log(`✅ User already logged in, redirecting to /${redirectTo}`)
          router.push(`/${redirectTo}`)
        } else {
          console.log('ℹ️ No existing user session')
          setMessage('') // Clear any error messages
        }
      } catch (error) {
        console.log('🔥 Auth check failed:', error)
        setMessage('') // Clear error messages on client
      }
    }
    
    checkUser()

    return () => subscription.unsubscribe()
  }, [router, redirectTo, mounted])

  const handlePasswordLogin = async () => {
    if (!mounted) return
    
    setLoading(true)
    setMessage('')
    
    try {
      console.log('🔐 Attempting password login with email:', email)
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        console.log('❌ Password login error:', error.message)
        toast.error(error.message)
        setMessage('Error: ' + error.message)
      } else {
        console.log('✅ Password login successful')
        toast.success('Welcome back!')
        router.push(`/${redirectTo}`)
      }
    } catch (error) {
      console.log('🔥 Password login exception:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setMessage('An unexpected error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  const handleMagicLink = async () => {
    if (!mounted) return
    
    setLoading(true)
    setMessage('')
    
    try {
      console.log('🔐 Attempting magic link login with email:', email)
      console.log('🔧 Using redirect URL:', `${window.location.origin}/auth/callback`)
      
      // Try multiple approaches to ensure code parameter is included
      const { error } = await supabase.auth.signInWithOtp({ 
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          shouldCreateUser: true,
          data: {
            redirect_to: `${window.location.origin}/dashboard`
          }
        }
      })
      
      if (error) {
        console.log('❌ Magic link error:', error.message)
        toast.error(error.message)
        setMessage('Error: ' + error.message)
        
        // Show diagnostic info
        console.log('🔍 Diagnostic info:')
        console.log('- Window origin:', window.location.origin)
        console.log('- Redirect URL would be:', `${window.location.origin}/auth/callback`)
        
      } else {
        console.log('✅ Magic link sent successfully')
        toast.success('Check your email for the magic link!')
        setMessage(`✅ Magic link sent to ${email}! Check your email and click the link.`)
        
        // Additional guidance
        setTimeout(() => {
          setMessage(`📧 Still waiting? Check spam folder. Or try the Quick Auth option: ${window.location.origin}/quick-auth`)
        }, 10000)
      }
    } catch (error) {
      console.log('🔥 Magic link exception:', error)
      toast.error('An unexpected error occurred. Please try again.')
      setMessage('An unexpected error occurred. Please try again.')
    }
    
    setLoading(false)
  }

  // Show loading during hydration to prevent flash
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mood-purple to-mood-blue flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-6"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mood-purple to-mood-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Welcome Back
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Track your mood with AI-powered insights
        </p>
        
        {/* Auth Method Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              authMethod === 'password' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Password
          </button>
          <button
            onClick={() => setAuthMethod('magic-link')}
            className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
              authMethod === 'magic-link' 
                ? 'bg-purple-600 text-white' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            Magic Link
          </button>
        </div>

        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {authMethod === 'password' && (
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          )}
          
          <button
            onClick={authMethod === 'password' ? handlePasswordLogin : handleMagicLink}
            disabled={loading || !email || (authMethod === 'password' && !password)}
            className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading 
              ? (authMethod === 'password' ? 'Signing in...' : 'Sending...')
              : (authMethod === 'password' ? 'Sign In' : 'Send Magic Link')
            }
          </button>
          
          {authMethod === 'password' && (
            <p className="text-center">
              <a href="#" className="text-sm text-purple-600 hover:text-purple-700">
                Forgot password?
              </a>
            </p>
          )}
          
          <p className="text-center text-sm text-gray-500">
            Don't have an account?{' '}
            <a href="/signup" className="text-purple-600 hover:text-purple-700 font-medium">
              Sign up free
            </a>
          </p>
          
          <div className="text-center text-sm border-t pt-4 mt-4">
            <p className="text-gray-600 mb-2">Having login issues?</p>
            <a 
              href="/working-auth" 
              className="inline-block bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              🎭 Working Auth (Guaranteed!)
            </a>
          </div>
          
          {mounted && message && (
            <p className="text-center text-sm mt-4 text-green-600" suppressHydrationWarning>
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}