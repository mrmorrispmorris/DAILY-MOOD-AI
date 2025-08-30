'use client'

import { useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import Link from 'next/link'
import { ArrowLeft, Mail, Sparkles, Brain, TrendingUp, Shield } from 'lucide-react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [authMethod, setAuthMethod] = useState<'password' | 'magic-link'>('password')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handlePasswordSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate password match
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    // Validate password strength
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
          data: {
            first_login: true
          }
        }
      })

      if (error) throw error
      
      toast.success('Account created! Check your email to verify.')
      setSubmitted(true)
    } catch (error: any) {
      console.error('Password signup error:', error)
      toast.error(error.message || 'Something went wrong')
      setError(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleMagicLinkSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            first_login: true
          }
        }
      })

      if (error) throw error
      
      toast.success('Magic link sent! Check your email.')
      setSubmitted(true)
    } catch (error: any) {
      console.error('Magic link signup error:', error)
      toast.error(error.message || 'Something went wrong')
      setError(error.message || 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Check Your Email!</h2>
          <p className="text-gray-600 mb-6">
            We sent a magic link to <span className="font-semibold">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Click the link in your email to start tracking your mood and unlock AI insights.
          </p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to home
        </Link>
        
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h1 className="text-3xl font-bold mb-2">Start Your Mental Wellness Journey</h1>
            <p className="text-gray-600 mb-6">Join thousands improving their mental health with AI insights</p>
            
            {/* Auth Method Toggle */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
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
                type="button"
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
            
            <form onSubmit={authMethod === 'password' ? handlePasswordSignup : handleMagicLinkSignup} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
                  required
                  disabled={loading}
                />
              </div>

              {authMethod === 'password' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Create a secure password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
                      required
                      disabled={loading}
                      minLength={8}
                    />
                    <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your password"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-400 focus:outline-none transition-colors"
                      required
                      disabled={loading}
                    />
                  </div>
                </>
              )}
              
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              
              <button
                type="submit"
                disabled={loading || !email || (authMethod === 'password' && (!password || !confirmPassword))}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading 
                  ? (authMethod === 'password' ? 'Creating Account...' : 'Sending Magic Link...')
                  : (authMethod === 'password' ? 'Create Account →' : 'Send Magic Link →')
                }
              </button>
            </form>
            
            <p className="text-center text-sm text-gray-500 mt-6">
              Already have an account?{' '}
              <Link href="/login" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign in
              </Link>
            </p>
          </motion.div>
          
          {/* Right: Benefits */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-bold">Why DailyMood AI?</h2>
            
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Brain className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">AI-Powered Insights</h3>
                  <p className="text-gray-600 text-sm">GPT-4 analyzes your mood patterns and provides personalized recommendations</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Track Progress</h3>
                  <p className="text-gray-600 text-sm">Beautiful charts and analytics show your mental health journey over time</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">10x Better Than Daylio</h3>
                  <p className="text-gray-600 text-sm">Advanced AI features, better analytics, and premium insights included</p>
                </div>
              </div>
              
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">Your Data, Protected</h3>
                  <p className="text-gray-600 text-sm">End-to-end encryption and GDPR compliant. Export anytime.</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
              <p className="text-sm font-semibold text-purple-900 mb-2">🎁 Limited Time Offer</p>
              <p className="text-sm text-purple-700">Start with 14 days of Premium features FREE. No credit card required.</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
