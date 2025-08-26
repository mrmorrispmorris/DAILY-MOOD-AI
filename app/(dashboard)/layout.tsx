'use client'

import { useAuth } from '@/hooks/use-auth'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import ErrorBoundary from '@/app/components/ErrorBoundary'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading, error, signOut } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Only redirect if not loading and no user found
    if (!loading && !user && !error) {
      console.log('🔄 Dashboard: No user found, redirecting to login')
      router.push('/login')
    }
  }, [user, loading, error, router])

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Loading Dashboard</h2>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Authentication Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/login')}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition"
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  // Show dashboard for authenticated users
  if (user) {
    return (
      <ErrorBoundary fallback={
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Dashboard Error</h1>
            <p className="text-gray-600">An error occurred in the dashboard</p>
          </div>
        </div>
      }>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
          {/* Authenticated Header */}
          <header className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 sticky top-0 z-40">
            <div className="container mx-auto px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">🧠</span>
                  </div>
                  <h1 className="text-2xl font-bold text-purple-600">DailyMood AI</h1>
                </div>
                
                {/* Navigation */}
                <nav className="hidden md:flex items-center space-x-6">
                  <Link 
                    href="/dashboard" 
                    className={`text-sm font-medium transition ${
                      pathname === '/dashboard' 
                        ? 'text-purple-600 border-b-2 border-purple-600 pb-1' 
                        : 'text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/subscription" 
                    className={`text-sm font-medium transition ${
                      pathname === '/subscription' 
                        ? 'text-purple-600 border-b-2 border-purple-600 pb-1' 
                        : 'text-gray-600 hover:text-purple-600'
                    }`}
                  >
                    Subscription
                  </Link>
                  <Link 
                    href="/pricing" 
                    className="text-sm font-medium text-gray-600 hover:text-purple-600 transition"
                  >
                    Pricing
                  </Link>
                </nav>
                
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-600 hidden sm:block">Welcome, {user.email}</span>
                  <button
                    onClick={async () => {
                      console.log('🚪 Logout clicked')
                      const { success, error } = await signOut()
                      if (success) {
                        console.log('✅ Logout successful, redirecting to login')
                        router.push('/login')
                      } else {
                        console.error('❌ Logout failed:', error)
                      }
                    }}
                    className="text-sm text-gray-500 hover:text-gray-700 transition bg-gray-100 px-3 py-1 rounded-lg"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="container mx-auto px-6 py-8">
            {children}
          </main>
        </div>
      </ErrorBoundary>
    )
  }

  // Fallback - should not reach here
  return null
}