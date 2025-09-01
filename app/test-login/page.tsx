'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TestLogin() {
  const [email, setEmail] = useState('test@dailymood.ai')
  const router = useRouter()

  const handleTestLogin = async () => {
    // Create a fake session for testing
    localStorage.setItem('test_auth', JSON.stringify({
      user: {
        id: 'test-user-123',
        email: email,
        created_at: new Date().toISOString()
      },
      session: {
        access_token: 'test-token-123',
        refresh_token: 'test-refresh-123'
      }
    }))
    
    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-3xl font-bold text-center mb-6 text-gray-800">
          🚀 Test Login
        </h1>
        <p className="text-center text-gray-600 mb-8">
          Quick access to see your avatar system while we debug auth!
        </p>
        
        <div className="space-y-4">
          <input
            type="email"
            placeholder="Test email"
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-400 focus:outline-none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          
          <button
            onClick={handleTestLogin}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors font-medium"
          >
            🎭 Enter App & See Avatar System!
          </button>
          
          <div className="text-center text-sm text-gray-500">
            <p>This bypasses authentication for testing</p>
            <p>Your avatar system is waiting! 🎉</p>
          </div>
        </div>
      </div>
    </div>
  )
}

