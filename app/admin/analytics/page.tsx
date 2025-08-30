'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useRouter } from 'next/navigation'
import { AnalyticsDashboard } from '@/app/components/AnalyticsDashboard'

export default function AdminAnalyticsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login?redirect=/admin/analytics')
        return
      }

      // Check if user is admin (in production, this would check a proper admin role)
      const adminEmails = [
        'benm@cecontractors.com.au', // User's email from authentication
        'admin@dailymood.ai',
        'analytics@dailymood.ai'
      ]

      const userIsAdmin = adminEmails.includes(user.email || '')
      setIsAdmin(userIsAdmin)
      
      if (!userIsAdmin) {
        // Redirect non-admin users
        router.push('/dashboard')
        return
      }

      setChecking(false)
    }
  }, [user, loading, router])

  if (loading || checking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Checking admin access...</div>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don't have permission to view this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Navigation Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="text-purple-600 hover:text-purple-700 font-medium"
            >
              ← Back to Dashboard
            </button>
            <div className="h-6 w-px bg-gray-300" />
            <h1 className="text-xl font-bold text-gray-900">🔧 Admin Panel</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-600">
              Logged in as: <span className="font-medium">{user?.email}</span>
            </div>
            <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
              Admin Access
            </div>
          </div>
        </div>
      </header>

      {/* Admin Analytics Dashboard */}
      <AnalyticsDashboard isAdmin={true} userId={user?.id} />
      
      {/* Quick Admin Actions */}
      <div className="max-w-7xl mx-auto px-8 pb-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🛠️ Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button 
              onClick={() => alert('Analytics export feature coming soon!')}
              className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition"
            >
              <div className="text-2xl mb-2">📊</div>
              <div className="font-semibold text-blue-900">Export Analytics</div>
              <div className="text-sm text-blue-600">Download CSV reports</div>
            </button>
            
            <button 
              onClick={() => alert('User management feature coming soon!')}
              className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition"
            >
              <div className="text-2xl mb-2">👥</div>
              <div className="font-semibold text-green-900">User Management</div>
              <div className="text-sm text-green-600">Manage user accounts</div>
            </button>
            
            <button 
              onClick={() => alert('Revenue reports feature coming soon!')}
              className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition"
            >
              <div className="text-2xl mb-2">💰</div>
              <div className="font-semibold text-purple-900">Revenue Reports</div>
              <div className="text-sm text-purple-600">Detailed financial metrics</div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


