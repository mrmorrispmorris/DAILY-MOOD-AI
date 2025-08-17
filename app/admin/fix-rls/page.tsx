'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, Shield, Database } from 'lucide-react'

export default function FixRLSPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [fixStatus, setFixStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successDetails, setSuccessDetails] = useState<any>(null)

  const handleFixRLS = async () => {
    setIsFixing(true)
    setFixStatus('idle')
    setErrorMessage(null)
    setSuccessDetails(null)
    toast.info('Fixing RLS policies for INSERT operations...')

    try {
      const response = await fetch('/api/admin/fix-rls-policies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const result = await response.json()

      if (response.ok) {
        setFixStatus('success')
        setSuccessDetails(result)
        toast.success(result.message || 'RLS policies fixed successfully!')
      } else {
        setFixStatus('error')
        setErrorMessage(result.error || 'Failed to fix RLS policies.')
        toast.error(result.error || 'Failed to fix RLS policies.')
      }
    } catch (error: any) {
      setFixStatus('error')
      setErrorMessage(error.message || 'An unexpected error occurred during RLS policy fix.')
      toast.error(error.message || 'An unexpected error occurred during RLS policy fix.')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl border-green-500 shadow-lg">
        <CardHeader>
          <CardTitle className="text-center text-green-700 flex items-center justify-center gap-2">
            <Shield className="h-6 w-6" />
            🔧 RLS POLICY FIX - ENABLE INSERT OPERATIONS
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-sm text-red-800 font-semibold mb-2">🚨 IDENTIFIED PROBLEM:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Authentication works ✅</li>
              <li>• Tables exist and can be read ✅</li>
              <li>• INSERT operations blocked by RLS policies ❌</li>
            </ul>
          </div>

          <div className="bg-green-100 border border-green-300 rounded-lg p-4">
            <p className="text-sm text-green-800 font-semibold mb-2">✅ RLS POLICY FIXES:</p>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Create INSERT policy for mood_entries table</li>
              <li>• Create INSERT policy for mood_logs table</li>
              <li>• Use auth.uid() to allow users to insert their own data</li>
              <li>• Test INSERT operations after policy creation</li>
              <li>• Provide working table recommendation</li>
            </ul>
          </div>

          <div className="bg-blue-100 border border-blue-300 rounded-lg p-4">
            <p className="text-sm text-blue-800 font-semibold mb-2">🎯 EXPECTED RESULT:</p>
            <p className="text-sm text-blue-700">
              After running this fix, mood logging should work directly with the database 
              instead of falling back to localStorage. The app will be able to save mood 
              entries properly to Supabase.
            </p>
          </div>
          
          <Button 
            onClick={handleFixRLS} 
            disabled={isFixing}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-lg text-lg font-semibold transition-colors duration-200"
          >
            {isFixing ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Fixing RLS Policies...
              </>
            ) : (
              <>
                <Shield className="mr-2 h-5 w-5" />
                🔧 FIX RLS POLICIES NOW
              </>
            )}
          </Button>

          {fixStatus === 'success' && successDetails && (
            <div className="bg-green-50 border border-green-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-800 mb-4">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">RLS Policies Fixed!</span>
              </div>
              <div className="text-sm text-green-700 space-y-2">
                <div>
                  <strong>mood_entries Table:</strong> 
                  {successDetails.results?.mood_entries?.insertWorking ? ' ✅ INSERT Working' : ' ❌ INSERT Failed'}
                </div>
                <div>
                  <strong>mood_logs Table:</strong> 
                  {successDetails.results?.mood_logs?.insertWorking ? ' ✅ INSERT Working' : ' ❌ INSERT Failed'}
                </div>
                <div className="mt-3 p-3 bg-blue-50 rounded">
                  <strong>Recommendation:</strong> {successDetails.recommendation}
                </div>
                {successDetails.status === 'success' && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded border border-yellow-300">
                    <strong>🎉 SUCCESS!</strong> Go test mood logging at: 
                    <a href="/log-mood" className="text-blue-600 hover:text-blue-800 font-medium ml-1">
                      /log-mood
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {fixStatus === 'error' && errorMessage && (
            <div className="bg-red-50 border border-red-300 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-800 mb-2">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">RLS Policy Fix Failed</span>
              </div>
              <div className="text-sm text-red-700">
                <p><strong>Error:</strong> {errorMessage}</p>
                <p className="mt-2">This might require manual Supabase dashboard access.</p>
              </div>
            </div>
          )}

          <div className="text-center text-sm text-gray-600">
            <p>After fixing RLS policies, test mood logging at:</p>
            <a 
              href="/log-mood" 
              className="text-green-600 hover:text-green-800 font-medium"
            >
              /log-mood
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
