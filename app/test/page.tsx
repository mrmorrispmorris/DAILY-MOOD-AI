export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-green-600 mb-4">
          ✅ DailyMood AI is Working!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Deployment successful - app is accessible
        </p>
        <div className="space-y-4">
          <a 
            href="/login" 
            className="block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
          <a 
            href="/dashboard" 
            className="block bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go to Dashboard
          </a>
          <a 
            href="/log-mood" 
            className="block bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Go to Mood Logging
          </a>
        </div>
      </div>
    </div>
  )
}
