'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/app/lib/supabase-client'
import MoodEntry from '@/app/components/MoodEntry'
import MoodChart from '@/app/components/MoodChart'
import AIInsights from '@/app/components/AIInsights'
import AvatarCompanion from '@/app/components/avatar/AvatarCompanion'

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [moods, setMoods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkUser()
    fetchMoods()
  }, [])

  const checkUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/login')
      return
    }
    setUser(user)
    setLoading(false)
  }

  const fetchMoods = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase
      .from('mood_entries')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false })
      .limit(30)

    if (!error && data) {
      setMoods(data)
    }
  }

  if (loading) {
    return <div className="loading">Loading your dashboard...</div>
  }

  const stats = moods.length > 0 ? {
    average: Math.round(moods.reduce((sum, mood) => sum + mood.mood_score, 0) / moods.length)
  } : null

  return (
    <div className="dashboard">
      <h1>Welcome back, {user?.email?.split('@')[0]}!</h1>
      
      {/* Avatar Companion - NEW SECTION */}
      <div className="flex justify-center mb-8">
        <AvatarCompanion 
          userMood={stats?.average || 5}
          userName={user?.email?.split('@')[0]}
          lastMoodEntry={moods[0]?.created_at ? new Date(moods[0].created_at) : undefined}
        />
      </div>
      
      <div className="dashboard-grid">
        <MoodEntry onSuccess={fetchMoods} />
        <MoodChart moods={moods} />
        <AIInsights moods={moods} />
      </div>
      
      <div className="recent-moods">
        {moods.map(mood => (
          <div key={mood.id} className="mood-card">
            <span>{mood.emoji}</span>
            <span>{mood.mood_score}/10</span>
            <span>{mood.date}</span>
          </div>
        ))}
      </div>
    </div>
  )
}