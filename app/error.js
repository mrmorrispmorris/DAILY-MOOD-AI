'use client'

export default function Error({ error, reset }) {
  console.error('Page Error:', error);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50 flex items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Component Error Detected</h2>
        <p className="text-gray-600 mb-6">A component failed to load properly.</p>
        
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-gray-100 p-4 rounded mb-4 text-left">
            <p className="text-sm font-mono text-red-600">{error.message}</p>
          </div>
        )}
        
        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={() => window.location.href = '/'}
            className="w-full bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition"
          >
            Go Home
          </button>
        </div>
      </div>
    </div>
  );
}


