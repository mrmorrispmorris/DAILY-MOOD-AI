'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface User {
  id: string
  email: string
  created_at: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check authentication from localStorage
    const session = localStorage.getItem('dailymood_session')
    
    if (!session) {
      setLoading(false)
      return
    }

    try {
      const userData = JSON.parse(session)
      setUser(userData)
      console.log('✅ User authenticated:', userData.email)
    } catch (error) {
      console.error('❌ Invalid session data:', error)
      localStorage.removeItem('dailymood_session')
    }

    setLoading(false)
  }, [])

  const signOut = () => {
    localStorage.removeItem('dailymood_session')
    setUser(null)
    console.log('✅ User logged out')
    router.push('/working-auth')
  }

  return {
    user,
    loading,
    signOut,
    isAuthenticated: !!user
  }
}

