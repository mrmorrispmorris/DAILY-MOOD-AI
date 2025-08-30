import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Offline - DailyMood AI',
  description: 'You are currently offline. Your mood data will sync when you reconnect.',
}

export default function OfflinePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-500 via-blue-500 to-indigo-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 text-center text-white shadow-2xl">
        <div className="text-8xl mb-6 animate-pulse">🌙</div>
        
        <h1 className="text-3xl font-bold mb-4">You're Offline</h1>
        
        <p className="text-lg opacity-90 mb-6 leading-relaxed">
          Don't worry! You can still track your mood. Your data will automatically sync when you're back online.
        </p>
        
        <div className="space-y-4">
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-white text-purple-600 py-3 px-6 rounded-2xl font-semibold hover:bg-gray-100 transition-colors"
          >
            Try Reconnecting
          </button>
          
          <button
            onClick={() => window.history.back()}
            className="w-full bg-white/20 backdrop-blur text-white py-3 px-6 rounded-2xl font-semibold hover:bg-white/30 transition-colors border border-white/30"
          >
            Go Back
          </button>
        </div>
        
        <div className="mt-8 text-center">
          <div className="inline-flex items-center bg-white/10 px-4 py-2 rounded-full text-sm">
            <div className="w-2 h-2 bg-red-400 rounded-full mr-2 animate-ping"></div>
            <span>Offline Mode</span>
          </div>
        </div>
        
        <div className="mt-6 text-sm opacity-75">
          <p>💡 Tip: Install DailyMood AI as an app for the best offline experience!</p>
        </div>
      </div>
    </div>
  )
}


