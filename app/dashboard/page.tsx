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
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Your Mood Dashboard</h1>
        
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <MoodEntry onSuccess={fetchMoods} />
          <MoodChart moods={moods} />
        </div>

        <div className="mb-8">
          <AIInsights moods={moods} />
        </div>
        
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          {moods.slice(0, 6).map((mood) => (
            <div key={mood.id} className="bg-white p-4 rounded-lg shadow">
              <div className="text-2xl">{mood.mood_label}</div>
              <div className="text-sm text-gray-500">
                {new Date(mood.created_at).toLocaleDateString()}
              </div>
              {mood.notes && <p className="text-sm mt-2">{mood.notes}</p>}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
