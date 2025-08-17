'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function FixDatabasePage() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleFixDatabase = async () => {
    setIsFixing(true)
    setResult(null)

    try {
      console.log('🔧 Admin: Starting database fix...')
      
      const response = await fetch('/api/admin/fix-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Admin: Database fix successful:', data)
        setResult(`✅ Success: ${data.message}`)
        toast.success('Database fixed successfully!')
      } else {
        console.error('❌ Admin: Database fix failed:', data)
        setResult(`❌ Error: ${data.error}`)
        toast.error(`Database fix failed: ${data.error}`)
      }
    } catch (error) {
      console.error('💥 Admin: Exception during database fix:', error)
      setResult(`💥 Exception: ${(error as Error).message}`)
      toast.error('Exception during database fix')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-red-600">🚨 Database Fix</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 text-center">
            This will attempt to fix the database schema and RLS policies that are preventing mood logging.
          </p>
          
          <Button 
            onClick={handleFixDatabase} 
            disabled={isFixing}
            className="w-full"
            variant="destructive"
          >
            {isFixing ? 'Fixing Database...' : '🔧 Fix Database Schema'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>What this does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>Creates users table with proper RLS policies</li>
              <li>Creates your user profile</li>
              <li>Fixes mood_entries table structure</li>
              <li>Resolves foreign key constraint issues</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
