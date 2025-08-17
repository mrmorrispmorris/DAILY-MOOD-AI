'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { Copy, Eye, EyeOff, CheckCircle, XCircle, AlertTriangle } from 'lucide-react'

export default function EnvironmentSetupPage() {
  const [showKeys, setShowKeys] = useState(false)
  const [testResults, setTestResults] = useState<any>(null)
  const [isTesting, setIsTesting] = useState(false)

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Copied to clipboard!')
  }

  const testConnection = async () => {
    setIsTesting(true)
    setTestResults(null)
    
    try {
      const response = await fetch('/api/debug/database-schema')
      const result = await response.json()
      setTestResults(result)
      
      if (result.success && result.connectionTests?.some((test: any) => test.success)) {
        toast.success('Connection test completed - check results below')
      } else {
        toast.error('Connection test failed - check environment variables')
      }
    } catch (error: any) {
      toast.error(`Test failed: ${error.message}`)
    } finally {
      setIsTesting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Environment Variables Setup</h1>
          <p className="text-gray-600">
            Fix database connection issues by configuring Supabase environment variables
          </p>
        </div>

        {/* Current Status */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              Current Configuration Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm">
              <p><strong>⚠️ Issue:</strong> Database connection failing with 406 errors</p>
              <p><strong>🎯 Root Cause:</strong> Missing or incorrect Supabase environment variables</p>
              <p><strong>🔧 Solution:</strong> Configure proper environment variables in Vercel</p>
            </div>
          </CardContent>
        </Card>

        {/* Environment Variables Guide */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>📋 Required Environment Variables</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">1. NEXT_PUBLIC_SUPABASE_URL</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Input 
                    value="https://zbvazupqnxmkowqllwel.supabase.co" 
                    readOnly 
                    className="font-mono text-sm"
                  />
                  <Button 
                    size="sm" 
                    onClick={() => copyToClipboard('https://zbvazupqnxmkowqllwel.supabase.co')}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Your Supabase project URL (found in Settings → API)</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">2. NEXT_PUBLIC_SUPABASE_ANON_KEY</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Input 
                    value={showKeys ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." : "••••••••••••••••••••••••••••••••••••••••"}
                    readOnly 
                    className="font-mono text-sm"
                    type={showKeys ? "text" : "password"}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => setShowKeys(!showKeys)}
                  >
                    {showKeys ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-gray-600">Your Supabase anon/public key (found in Settings → API)</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">3. SUPABASE_SERVICE_ROLE_KEY (Optional)</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Input 
                    value={showKeys ? "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." : "••••••••••••••••••••••••••••••••••••••••"}
                    readOnly 
                    className="font-mono text-sm"
                    type={showKeys ? "text" : "password"}
                  />
                </div>
                <p className="text-xs text-gray-600">Service role key for admin operations (found in Settings → API)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vercel Setup Instructions */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🚀 How to Set Up in Vercel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">1</div>
                <div>
                  <p className="font-semibold">Go to Vercel Dashboard</p>
                  <p className="text-gray-600">Visit vercel.com/dashboard and select your project</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">2</div>
                <div>
                  <p className="font-semibold">Navigate to Settings → Environment Variables</p>
                  <p className="text-gray-600">Click on the Settings tab, then Environment Variables</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">3</div>
                <div>
                  <p className="font-semibold">Add Each Environment Variable</p>
                  <p className="text-gray-600">Click &quot;Add New&quot; and enter the name and value for each variable above</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-bold text-blue-600">4</div>
                <div>
                  <p className="font-semibold">Redeploy Your App</p>
                  <p className="text-gray-600">Go to Deployments tab and click &quot;Redeploy&quot; on the latest deployment</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Get Your Supabase Keys */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🔑 How to Get Your Supabase Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">1</div>
                <div>
                  <p className="font-semibold">Go to Supabase Dashboard</p>
                  <p className="text-gray-600">Visit supabase.com/dashboard and select your project</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">2</div>
                <div>
                  <p className="font-semibold">Navigate to Settings → API</p>
                  <p className="text-gray-600">Click on the Settings gear icon, then API section</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">3</div>
                <div>
                  <p className="font-semibold">Copy Your Keys</p>
                  <p className="text-gray-600">Copy the Project URL and anon public key from the API settings</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test Connection */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>🧪 Test Database Connection</CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={testConnection} 
              disabled={isTesting}
              className="w-full mb-4"
            >
              {isTesting ? 'Testing Connection...' : 'Test Connection Now'}
            </Button>

            {testResults && (
              <div className="space-y-4">
                {/* Environment Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    Environment Variables
                    {testResults.environment?.hasUrl && testResults.environment?.hasAnonKey ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p>URL: {testResults.environment?.hasUrl ? '✅ Found' : '❌ Missing'}</p>
                    <p>Anon Key: {testResults.environment?.hasAnonKey ? '✅ Found' : '❌ Missing'}</p>
                    <p>Service Key: {testResults.environment?.hasServiceKey ? '✅ Found' : '⚠️ Missing (optional)'}</p>
                  </div>
                </div>

                {/* Connection Tests */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Connection Test Results</h3>
                  <div className="space-y-2">
                    {testResults.connectionTests?.map((test: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        {test.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className={test.success ? 'text-green-600' : 'text-red-600'}>
                          {test.name}: {test.success ? 'Success' : test.error}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                {testResults.recommendations?.length > 0 && (
                  <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="font-semibold mb-2 text-yellow-800">Recommendations</h3>
                    <div className="space-y-1 text-sm text-yellow-700">
                      {testResults.recommendations.map((rec: string, index: number) => (
                        <p key={index}>{rec}</p>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Manual SQL Commands */}
        <Card>
          <CardHeader>
            <CardTitle>🔧 Manual Database Setup (If Needed)</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              If environment variables are correct but tables are missing, run these commands in your Supabase SQL Editor:
            </p>
            <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`-- Check what tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_level TEXT DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create mood_entries table  
CREATE TABLE IF NOT EXISTS public.mood_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_notes TEXT DEFAULT '',
  activities TEXT[] DEFAULT '{}',
  weather TEXT DEFAULT 'unknown',
  sleep_hours NUMERIC,
  stress_level INTEGER DEFAULT 5,
  energy_level INTEGER DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can manage own data" ON public.users USING (auth.uid() = id);
CREATE POLICY "Users can manage own mood entries" ON public.mood_entries USING (auth.uid() = user_id);`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
