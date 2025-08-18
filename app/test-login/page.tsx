'use client'

import { useState } from 'react'

export default function TestLoginPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testSupabase = async () => {
    setLoading(true)
    setResult('Testing...')
    
    try {
      // Import Supabase directly
      const clientModule = await import('@/lib/supabase/client')
      console.log('🔍 Client module:', clientModule)
      
      const { supabase } = clientModule
      console.log('🔍 Supabase object:', supabase)
      
      if (!supabase) {
        setResult(`❌ SUPABASE CLIENT IS UNDEFINED! Module keys: ${Object.keys(clientModule).join(', ')}`)
        return
      }
      
      setResult(`✅ SUPABASE CLIENT LOADED: SUCCESS`)
      
      setResult(`✅ SUPABASE CLIENT LOADED: SUCCESS\n\nTesting authentication...`)
      
      // First try to get current session (should be null for new user)
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        setResult(`❌ SESSION ERROR: ${sessionError.message}`)
        return
      }
      
      setResult(`✅ SUPABASE CLIENT LOADED: SUCCESS\n✅ SESSION CHECK: OK\n\nTesting sign up...`)
      
      // Test sign up with accepted email domain
      const testEmail = `testuser${Date.now()}@gmail.com`  // Use gmail.com instead of example.com
      const testPassword = 'TestPassword123!'  // Strong password
      
      console.log('🔍 Attempting signup with:', testEmail)
      
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
      })
      
      if (error) {
        setResult(`❌ SIGN UP ERROR: ${error.message}\n\nError Details:\n- Status: ${error.status || 'Unknown'}\n- Code: ${error.name || 'Unknown'}`)
        console.error('Full error object:', error)
      } else if (data.user) {
        if (data.user.email_confirmed_at) {
          setResult(`🎉 SIGN UP SUCCESS! User confirmed: ${data.user.email}`)
        } else {
          setResult(`📧 SIGN UP SUCCESS! User created: ${data.user.email}\n\n⚠️ Email confirmation required. Check your email or configure Supabase to skip confirmation.`)
        }
      } else {
        setResult(`❓ UNEXPECTED: No error but no user returned`)
      }
      
    } catch (err: any) {
      setResult(`💥 ERROR: ${err.message}`)
    }
    
    setLoading(false)
  }

  return (
    <div style={{ 
      padding: '50px', 
      fontFamily: 'monospace', 
      backgroundColor: '#000', 
      color: '#0f0', 
      minHeight: '100vh' 
    }}>
      <h1 style={{ color: '#fff', fontSize: '24px' }}>🧪 SUPABASE TEST PAGE</h1>
      
      <button 
        onClick={testSupabase}
        disabled={loading}
        style={{
          padding: '20px 40px',
          fontSize: '18px',
          backgroundColor: loading ? '#666' : '#0080ff',
          color: '#fff',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          margin: '20px 0'
        }}
      >
        {loading ? '🔄 TESTING...' : '🚀 TEST SUPABASE NOW'}
      </button>
      
      <div style={{
        backgroundColor: '#111',
        padding: '20px',
        borderRadius: '8px',
        fontSize: '16px',
        whiteSpace: 'pre-wrap',
        border: '2px solid #333'
      }}>
        {result || 'Click the button to test Supabase authentication...'}
      </div>
      
      <div style={{ marginTop: '20px', color: '#888' }}>
        <p>🎯 This page bypasses ALL service workers and complex components!</p>
        <p>🔥 Direct Supabase test with hardcoded credentials</p>
      </div>
    </div>
  )
}
