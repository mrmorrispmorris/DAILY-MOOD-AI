'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Loader2, CheckCircle, XCircle, Database, Search, Settings } from 'lucide-react'

interface DatabaseInfo {
  success: boolean
  tables: string[]
  tableDetails: Record<string, any[]>
  authentication: {
    user: { id: string; email: string } | null
    error: string | null
  }
  timestamp: string
}

interface SetupResult {
  success: boolean
  operations: {
    users_table: {
      created: boolean
      error: string | null
      test_query: {
        success: boolean
        error: string | null
        data: any
      }
    }
    mood_entries_table: {
      created: boolean
      error: string | null
      test_query: {
        success: boolean
        error: string | null
        data: any
      }
    }
  }
  timestamp: string
}

export default function DatabaseDebugPage() {
  const [isInvestigating, setIsInvestigating] = useState(false)
  const [isSettingUp, setIsSettingUp] = useState(false)
  const [databaseInfo, setDatabaseInfo] = useState<DatabaseInfo | null>(null)
  const [setupResult, setSetupResult] = useState<SetupResult | null>(null)

  const investigateDatabase = async () => {
    setIsInvestigating(true)
    setDatabaseInfo(null)
    toast.info('Investigating database schema...')

    try {
      const response = await fetch('/api/debug/database-schema')
      
      if (response.ok) {
        const result = await response.json()
        setDatabaseInfo(result)
        toast.success('Database investigation complete!')
      } else {
        const errorData = await response.json()
        toast.error(`Investigation failed: ${errorData.error}`)
      }
    } catch (error: any) {
      toast.error(`Investigation failed: ${error.message}`)
    } finally {
      setIsInvestigating(false)
    }
  }

  const setupDatabase = async () => {
    setIsSettingUp(true)
    setSetupResult(null)
    toast.info('Setting up database schema...')

    try {
      const response = await fetch('/api/admin/setup-database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const result = await response.json()
        setSetupResult(result)
        toast.success('Database setup complete!')
      } else {
        const errorData = await response.json()
        toast.error(`Setup failed: ${errorData.error}`)
      }
    } catch (error: any) {
      toast.error(`Setup failed: ${error.message}`)
    } finally {
      setIsSettingUp(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">🔧 Database Debug Center</h1>
          <p className="text-gray-600">
            Investigate and fix database schema issues causing 406 errors
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Investigation Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-blue-600" />
                Database Investigation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Check what tables and columns actually exist in the database
              </p>
              <Button 
                onClick={investigateDatabase} 
                disabled={isInvestigating}
                className="w-full"
              >
                {isInvestigating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Investigating...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Investigate Database
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Setup Panel */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Database Setup
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-600">
                Create missing tables and fix schema issues
              </p>
              <Button 
                onClick={setupDatabase} 
                disabled={isSettingUp}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                {isSettingUp ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting Up...
                  </>
                ) : (
                  <>
                    <Settings className="mr-2 h-4 w-4" />
                    Setup Database
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Investigation Results */}
        {databaseInfo && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-blue-600" />
                Investigation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Authentication Status */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Authentication Status</h3>
                  {databaseInfo.authentication.user ? (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Authenticated as {databaseInfo.authentication.user.email}</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-red-600">
                      <XCircle className="h-4 w-4" />
                      <span>Not authenticated: {databaseInfo.authentication.error}</span>
                    </div>
                  )}
                </div>

                {/* Tables Found */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Tables Found ({databaseInfo.tables.length})</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {databaseInfo.tables.map((table) => (
                      <div key={table} className="p-2 bg-white rounded border text-sm">
                        {table}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Table Details */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">Table Schemas</h3>
                  <div className="space-y-3">
                    {Object.entries(databaseInfo.tableDetails).map(([tableName, columns]) => (
                      <div key={tableName} className="p-3 bg-white rounded border">
                        <h4 className="font-medium text-sm text-blue-600 mb-2">{tableName}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-1 text-xs">
                          {columns.map((col: any, idx: number) => (
                            <div key={idx} className="flex justify-between">
                              <span className="font-mono">{col.column_name}</span>
                              <span className="text-gray-500">{col.data_type}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Setup Results */}
        {setupResult && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-green-600" />
                Setup Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Users Table */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    Users Table
                    {setupResult.operations.users_table.created ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Created:</strong> {setupResult.operations.users_table.created ? 'Yes' : 'No'}</p>
                    {setupResult.operations.users_table.error && (
                      <p className="text-red-600"><strong>Error:</strong> {setupResult.operations.users_table.error}</p>
                    )}
                    <p><strong>Query Test:</strong> {setupResult.operations.users_table.test_query.success ? 'Passed' : 'Failed'}</p>
                    {setupResult.operations.users_table.test_query.error && (
                      <p className="text-red-600"><strong>Query Error:</strong> {setupResult.operations.users_table.test_query.error}</p>
                    )}
                  </div>
                </div>

                {/* Mood Entries Table */}
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    Mood Entries Table
                    {setupResult.operations.mood_entries_table.created ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                  </h3>
                  <div className="text-sm space-y-1">
                    <p><strong>Created:</strong> {setupResult.operations.mood_entries_table.created ? 'Yes' : 'No'}</p>
                    {setupResult.operations.mood_entries_table.error && (
                      <p className="text-red-600"><strong>Error:</strong> {setupResult.operations.mood_entries_table.error}</p>
                    )}
                    <p><strong>Query Test:</strong> {setupResult.operations.mood_entries_table.test_query.success ? 'Passed' : 'Failed'}</p>
                    {setupResult.operations.mood_entries_table.test_query.error && (
                      <p className="text-red-600"><strong>Query Error:</strong> {setupResult.operations.mood_entries_table.test_query.error}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Instructions */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>📋 Manual Instructions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-2">
              <p><strong>If automatic setup fails, manually run this in Supabase SQL Editor:</strong></p>
              <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-xs">
{`-- Create users table
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  subscription_level TEXT DEFAULT 'free' NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Enable RLS and create policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own data" ON public.users USING (auth.uid() = id);
CREATE POLICY "Users can manage own mood entries" ON public.mood_entries USING (auth.uid() = user_id);`}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
