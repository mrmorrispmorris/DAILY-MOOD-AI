'use client'

export default function GlobalError({ error, reset }) {
  console.error('Global Error:', error);
  
  return (
    <html>
      <body>
        <div className="min-h-screen bg-gradient-to-br from-red-100 via-white to-pink-100 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
            <div className="text-8xl mb-6">🚨</div>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Application Error</h2>
            <p className="text-gray-600 mb-6">
              A critical error occurred while loading the application.
            </p>
            
            {process.env.NODE_ENV === 'development' && (
              <div className="bg-red-50 border border-red-200 p-4 rounded mb-6 text-left">
                <p className="text-sm font-mono text-red-700">
                  {error?.message || 'Unknown error'}
                </p>
                {error?.stack && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-xs text-red-600">Stack Trace</summary>
                    <pre className="text-xs mt-2 overflow-auto">{error.stack}</pre>
                  </details>
                )}
              </div>
            )}
            
            <div className="space-y-3">
              <button
                onClick={() => reset()}
                className="w-full bg-red-600 text-white py-3 px-6 rounded-lg hover:bg-red-700 transition font-semibold"
              >
                Reset Application
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition font-semibold"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}


