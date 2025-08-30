'use client';

import { useState } from 'react';

export default function TestApiPage() {
  const [results, setResults] = useState<any>({});
  const [testing, setTesting] = useState(false);

  const testSupabaseAPI = async () => {
    setTesting(true);
    const testResults: any = {};

    // Test 1: Direct REST API call
    try {
      console.log('🧪 Testing direct Supabase REST API...');
      const response = await fetch(
        'https://bpbzxmaqcllvpvykwmup.supabase.co/rest/v1/',
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      testResults.restAPI = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok
      };
      
      console.log('REST API result:', testResults.restAPI);
    } catch (error: any) {
      testResults.restAPI = {
        error: error.message,
        success: false
      };
      console.error('REST API error:', error);
    }

    // Test 2: Auth API call
    try {
      console.log('🧪 Testing Supabase Auth API...');
      const response = await fetch(
        'https://bpbzxmaqcllvpvykwmup.supabase.co/auth/v1/settings',
        {
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      const data = await response.text();
      testResults.authAPI = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: data.substring(0, 200) + '...'
      };
      
      console.log('Auth API result:', testResults.authAPI);
    } catch (error: any) {
      testResults.authAPI = {
        error: error.message,
        success: false
      };
      console.error('Auth API error:', error);
    }

    // Test 3: OTP signup test
    try {
      console.log('🧪 Testing OTP signup...');
      const response = await fetch(
        'https://bpbzxmaqcllvpvykwmup.supabase.co/auth/v1/otp',
        {
          method: 'POST',
          headers: {
            'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: 'test@example.com',
            create_user: false
          })
        }
      );
      
      const data = await response.text();
      testResults.otpAPI = {
        status: response.status,
        statusText: response.statusText,
        success: response.ok,
        response: data.substring(0, 200) + '...'
      };
      
      console.log('OTP API result:', testResults.otpAPI);
    } catch (error: any) {
      testResults.otpAPI = {
        error: error.message,
        success: false
      };
      console.error('OTP API error:', error);
    }

    // Add environment info
    testResults.environment = {
      supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
      hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      anonKeyLength: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length,
      anonKeyStart: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)
    };

    setResults(testResults);
    setTesting(false);
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Direct Supabase API Test</h1>
      
      <button
        onClick={testSupabaseAPI}
        disabled={testing}
        className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
      >
        {testing ? 'Testing APIs...' : 'Test Supabase APIs'}
      </button>

      {Object.keys(results).length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Test Results:</h2>
          
          {/* Environment Info */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">Environment:</h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(results.environment, null, 2)}
            </pre>
          </div>

          {/* REST API Test */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">
              REST API Test: 
              <span className={results.restAPI?.success ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {results.restAPI?.success ? '✅ SUCCESS' : '❌ FAILED'}
              </span>
            </h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(results.restAPI, null, 2)}
            </pre>
          </div>

          {/* Auth API Test */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">
              Auth API Test: 
              <span className={results.authAPI?.success ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {results.authAPI?.success ? '✅ SUCCESS' : '❌ FAILED'}
              </span>
            </h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(results.authAPI, null, 2)}
            </pre>
          </div>

          {/* OTP API Test */}
          <div className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-semibold mb-2">
              OTP API Test: 
              <span className={results.otpAPI?.success ? 'text-green-600 ml-2' : 'text-red-600 ml-2'}>
                {results.otpAPI?.success ? '✅ SUCCESS' : '❌ FAILED'}
              </span>
            </h3>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-x-auto">
              {JSON.stringify(results.otpAPI, null, 2)}
            </pre>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>This test bypasses our application code entirely and tests the Supabase API directly.</strong>
          <br /><br />
          - If REST API fails → Invalid anon key or project doesn't exist<br />
          - If Auth API fails → Authentication not configured properly<br />
          - If OTP API fails → Email auth not enabled or rate limited
        </p>
      </div>
    </div>
  );
}


