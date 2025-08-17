'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react'

export default function FixSchemaPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [fixStatus, setFixStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successDetails, setSuccessDetails] = useState<any>(null)

  const handleFixSchema = async () => {
    setIsFixing(true)
    setFixStatus('idle')
    setErrorMessage(null)
    setSuccessDetails(null)
    toast.info('Fixing database schema...')

    try {
      const response = await fetch('/api/admin/fix-schema', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setFixStatus('success')
        setSuccessDetails(result)
        toast.success(result.message || 'Database schema fixed successfully!')
      } else {
        setFixStatus('error')
        setErrorMessage(result.error || 'Failed to fix database schema.')
        toast.error(result.error || 'Failed to fix database schema.')
      }
    } catch (error: any) {
      setFixStatus('error')
      setErrorMessage(error.message || 'An unexpected error occurred during schema fix.')
      toast.error(error.message || 'An unexpected error occurred during schema fix.')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-blue-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-blue-700 flex items-center justify-center gap-2">
            <Database className="h-6 w-6" />
            🔧 DATABASE SCHEMA FIX
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">🔍 DATABASE DIAGNOSTICS:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Test authentication status</li>
              <li>• Check mood_entries table access</li>
              <li>• Check mood_logs table access</li>
              <li>• Test direct database insertion</li>
              <li>• Identify which tables are working</li>
            </ul>
          </div>

          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-sm text-green-800 font-semibold mb-2">✅ WHAT THIS WILL DO:</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Run comprehensive database tests</li>
              <li>• Identify exact schema issues</li>
              <li>• Test actual insertion capabilities</li>
              <li>• Provide specific recommendations</li>
              <li>• No destructive operations</li>
            </ul>
          </div>
          
          <Button 
            onClick={handleFixSchema} 
            disabled={isFixing}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
          >
            {isFixing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Fixing Schema...
              </>
            ) : (
              <>
                <Database className="mr-2 h-5 w-5" />
                🔍 RUN DATABASE DIAGNOSTICS
              </>
            )}
          </Button>

          {fixStatus === 'success' && successDetails && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Database Diagnostics Complete!</span>
              </div>
              <div className="text-sm text-green-700 space-y-2">
                <div>
                  <strong>Authentication:</strong> {successDetails.authentication?.working ? '✅ Working' : '❌ Failed'}
                  {successDetails.authentication?.user && <span> ({successDetails.authentication.user})</span>}
                </div>
                <div>
                  <strong>mood_entries Table:</strong> 
                  {successDetails.mood_entries?.canInsert ? ' ✅ Can Insert' : ' ❌ Cannot Insert'}
                  {successDetails.mood_entries?.canRead ? ' ✅ Can Read' : ' ❌ Cannot Read'}
                </div>
                <div>
                  <strong>mood_logs Table:</strong> 
                  {successDetails.mood_logs?.canInsert ? ' ✅ Can Insert' : ' ❌ Cannot Insert'}
                  {successDetails.mood_logs?.canRead ? ' ✅ Can Read' : ' ❌ Cannot Read'}
                </div>
                <div className="mt-3 p-2 bg-blue-50 rounded">
                  <strong>Recommendation:</strong> {successDetails.recommendation}
                </div>
              </div>
            </div>
          )}

          {fixStatus === 'error' && errorMessage && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Schema Fix Failed</span>
              </div>
              <div className="text-sm text-red-700">
                <p><strong>Error:</strong> {errorMessage}</p>
                <p className="mt-2">Please check the console for more details.</p>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>After fixing the schema, test mood logging at:</p>
            <a 
              href="/log-mood" 
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              /log-mood
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
