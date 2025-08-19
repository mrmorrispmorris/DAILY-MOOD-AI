'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import MoodEntry from '@/app/components/MoodEntry'
import MoodChart from '@/app/components/MoodChart'
import AIInsights from '@/app/components/AIInsights'

export default function Dashboard() {
  const [moods, setMoods] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkUser()
    fetchMoods()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setUser(user)
  }

  const fetchMoods = async () => {
    const { data } = await supabase
      .from('moods')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(30)
    
    if (data) setMoods(data)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Beautiful Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-3">
            Your Mood Dashboard
          </h1>
          <p className="text-xl text-gray-600">Track your emotional journey with AI insights</p>
        </div>
        
        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <MoodEntry onSuccess={fetchMoods} />
          <MoodChart moods={moods} />
        </div>

        {/* AI Insights */}
        <div className="mb-12">
          <AIInsights moods={moods} />
        </div>
        
        {/* Recent Moods */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="mr-3">📊</span>
            Recent Mood Entries
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {moods.slice(0, 6).map((mood) => (
              <div key={mood.id} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-white/20">
                <div className="flex items-center justify-between mb-3">
                  <div className="text-3xl">{mood.mood_label}</div>
                  <div className="text-sm font-medium text-purple-600 bg-purple-100 px-3 py-1 rounded-full">
                    {mood.mood_score}/10
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(mood.created_at).toLocaleDateString('en-US', {
                    weekday: 'short',
                    month: 'short', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </div>
                {mood.notes && (
                  <p className="text-sm text-gray-700 italic border-l-3 border-purple-200 pl-3 mt-3">
                    "{mood.notes}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
