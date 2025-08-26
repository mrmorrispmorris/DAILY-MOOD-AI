'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { useRouter, useSearchParams } from 'next/navigation'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || 'dashboard'

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔐 Auth event:', event, session?.user?.email)
      
      if (event === 'SIGNED_IN' && session) {
        console.log(`✅ User signed in, redirecting to /${redirectTo}`)
        router.push(`/${redirectTo}`)
      }
    })

    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        console.log(`✅ User already logged in, redirecting to /${redirectTo}`)
        router.push(`/${redirectTo}`)
      }
    }
    
    checkUser()

    return () => subscription.unsubscribe()
  }, [router, redirectTo])

  const handleLogin = async () => {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({ 
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/${redirectTo}`
      }
    })
    
    if (error) {
      setMessage('Error: ' + error.message)
    } else {
      setMessage('Check your email for the login link!')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mood-purple to-mood-blue flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Welcome to DailyMood AI
        </h1>
        <p className="text-center text-gray-600 mb-6">
          Track your mood with AI-powered insights
        </p>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-mood-purple focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-mood-purple text-white py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50"
          >
            {loading ? 'Sending...' : 'Send Magic Link'}
          </button>
          
          {message && (
            <p className="text-center text-sm mt-4 text-mood-green">
              {message}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}