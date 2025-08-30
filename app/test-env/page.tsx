'use client';

export default function TestEnvPage() {
  // This will help diagnose if environment variables are reaching the client
  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 text-gray-900">Environment Variable Test</h1>
      
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-2">Supabase URL:</h2>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_SUPABASE_URL || 'NOT FOUND'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-2">Supabase Anon Key:</h2>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 
              `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.substring(0, 20)}...` : 
              'NOT FOUND'
            }
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-2">App URL:</h2>
          <p className="font-mono text-sm bg-gray-100 p-2 rounded">
            {process.env.NEXT_PUBLIC_URL || 'NOT FOUND'}
          </p>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg mb-2">All NEXT_PUBLIC_ Variables:</h2>
          <pre className="font-mono text-xs bg-gray-100 p-2 rounded overflow-x-auto">
            {JSON.stringify(
              Object.keys(process.env).filter(key => key.startsWith('NEXT_PUBLIC_'))
                .reduce((obj, key) => {
                  obj[key] = key.includes('KEY') ? 'REDACTED' : process.env[key];
                  return obj;
                }, {} as Record<string, any>), 
              null, 2
            )}
          </pre>
        </div>
        
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Diagnosis:</strong> If any values show "NOT FOUND", then environment variables 
            are not reaching the client-side React components. This confirms the root cause of 
            the authentication issue.
          </p>
        </div>
      </div>
    </div>
  );
}


