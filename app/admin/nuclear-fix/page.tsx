'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'

export default function NuclearFixPage() {
  const [isFixing, setIsFixing] = useState(false)
  const [result, setResult] = useState<string | null>(null)

  const handleNuclearFix = async () => {
    setIsFixing(true)
    setResult(null)

    try {
      console.log('💥 Admin: Starting nuclear database fix...')
      
      const response = await fetch('/api/admin/nuclear-fix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok) {
        console.log('✅ Admin: Nuclear fix successful:', data)
        setResult(`✅ SUCCESS: ${data.message}\n\nDetails: ${data.details}`)
        toast.success('Nuclear fix completed successfully!')
      } else {
        console.error('❌ Admin: Nuclear fix failed:', data)
        setResult(`❌ ERROR: ${data.error}\n\nDetails: ${data.details}`)
        toast.error(`Nuclear fix failed: ${data.error}`)
      }
    } catch (error) {
      console.error('💥 Admin: Exception during nuclear fix:', error)
      setResult(`💥 EXCEPTION: ${(error as Error).message}`)
      toast.error('Exception during nuclear fix')
    } finally {
      setIsFixing(false)
    }
  }

  return (
    <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-lg border-red-200">
        <CardHeader className="bg-red-100">
          <CardTitle className="text-center text-red-700">💥 NUCLEAR DATABASE FIX</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 mt-4">
          <div className="bg-red-100 border border-red-300 rounded-lg p-4">
            <p className="text-sm text-red-800 font-semibold mb-2">⚠️ WARNING: NUCLEAR OPTION</p>
            <p className="text-sm text-red-700">
              This will completely remove the foreign key constraint that&apos;s preventing mood logging. 
              This is a last resort fix that makes the mood_entries table independent.
            </p>
          </div>
          
          <Button 
            onClick={handleNuclearFix} 
            disabled={isFixing}
            className="w-full bg-red-600 hover:bg-red-700"
            size="lg"
          >
            {isFixing ? '💥 Executing Nuclear Fix...' : '💥 EXECUTE NUCLEAR FIX'}
          </Button>

          {result && (
            <div className="mt-4 p-4 bg-gray-100 rounded-lg border">
              <pre className="text-sm whitespace-pre-wrap">{result}</pre>
            </div>
          )}

          <div className="text-xs text-gray-600 space-y-2 border-t pt-4">
            <p><strong>What this nuclear fix does:</strong></p>
            <ul className="list-disc list-inside space-y-1">
              <li>🔥 Drops the problematic foreign key constraint</li>
              <li>🛠️ Adds missing columns to mood_entries table</li>
              <li>🔒 Creates RLS policies based on user_id only</li>
              <li>🧪 Tests mood entry creation</li>
              <li>✅ Makes mood logging work independently</li>
            </ul>
            <p className="text-red-600 font-semibold">
              After this fix, mood logging should work without any foreign key issues!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
