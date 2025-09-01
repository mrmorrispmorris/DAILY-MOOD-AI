'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase-client'
import toast from 'react-hot-toast'

export default function QuickAuth() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignup, setIsSignup] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleAuth = async () => {
    if (!email || !password) {
      toast.error('Please fill in all fields')
      return
    }

    setLoading(true)
    
    try {
      if (isSignup) {
        console.log('🔐 Creating new account for:', email)
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`
          }
        })

        if (error) {
          console.error('❌ Signup error:', error.message)
          toast.error(error.message)
        } else if (data.user) {
          console.log('✅ Account created for:', data.user.email)
          toast.success('Account created! You can now sign in.')
          setIsSignup(false)
        }
      } else {
        console.log('🔐 Signing in:', email)
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        })

        if (error) {
          console.error('❌ Login error:', error.message)
          toast.error(error.message)
        } else if (data.user) {
          console.log('✅ Login successful for:', data.user.email)
          toast.success('Welcome back!')
          router.push('/dashboard')
        }
      }
    } catch (error) {
      console.error('❌ Auth exception:', error)
      toast.error('An unexpected error occurred')
    }
    
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
          🚀 Quick Auth
        </h1>
        <p className="text-center text-gray-600 mb-6">
          {isSignup ? 'Create your account' : 'Sign in to see your avatar system!'}
        </p>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Email address"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <input
            type="password"
            placeholder="Password (min 6 characters)"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          
          <button
            onClick={handleAuth}
            disabled={loading || !email || !password}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors disabled:opacity-50 font-medium"
          >
            {loading 
              ? (isSignup ? 'Creating Account...' : 'Signing In...') 
              : (isSignup ? '🎯 Create Account' : '🎭 Sign In & See Avatars!')
            }
          </button>
          
          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignup(!isSignup)}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              {isSignup 
                ? 'Already have an account? Sign in' 
                : "Don't have an account? Create one"
              }
            </button>
          </div>
          
          <div className="text-center text-sm text-gray-500 border-t pt-4">
            <p className="font-medium text-green-600">✅ This bypasses magic link issues</p>
            <p>Works with your existing Supabase setup</p>
            <p>Same database, same avatar system!</p>
          </div>
        </div>
      </div>
    </div>
  )
}

