'use client'

import { useAuth } from '@/hooks/use-auth'
import { useEffect, useState } from 'react'

export function SessionDebug() {
  const { user, loading, error } = useAuth()
  const [storageInfo, setStorageInfo] = useState<any>(null)

  useEffect(() => {
    const checkStorage = () => {
      if (typeof window === 'undefined') return

      const authToken = localStorage.getItem('dailymood-supabase-auth-token')
      const allKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || key.includes('auth') || key.includes('dailymood')
      )

      setStorageInfo({
        authToken: authToken ? 'EXISTS' : 'MISSING',
        keys: allKeys,
        timestamp: new Date().toLocaleTimeString()
      })
    }

    checkStorage()
    const interval = setInterval(checkStorage, 2000) // Check every 2 seconds

    return () => clearInterval(interval)
  }, [])

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs font-mono max-w-sm z-50">
      <h3 className="font-bold text-green-400 mb-2">🔍 Session Debug</h3>
      
      <div className="space-y-1">
        <div>
          <span className="text-yellow-400">User:</span> {user?.email || 'None'}
        </div>
        <div>
          <span className="text-yellow-400">Loading:</span> {loading ? 'Yes' : 'No'}
        </div>
        <div>
          <span className="text-yellow-400">Error:</span> {error || 'None'}
        </div>
        <div>
          <span className="text-yellow-400">Auth Token:</span> {storageInfo?.authToken || 'Checking...'}
        </div>
        <div>
          <span className="text-yellow-400">Keys:</span> {storageInfo?.keys?.length || 0}
        </div>
        <div className="text-gray-400 text-xs">
          Updated: {storageInfo?.timestamp}
        </div>
      </div>
      
      {storageInfo?.keys && storageInfo.keys.length > 0 && (
        <details className="mt-2">
          <summary className="cursor-pointer text-blue-400">Storage Keys</summary>
          <div className="text-xs mt-1 text-gray-300">
            {storageInfo.keys.map((key: string) => (
              <div key={key}>• {key}</div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

