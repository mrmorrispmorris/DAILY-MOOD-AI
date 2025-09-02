'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import AvatarCompanion from '@/app/components/avatar/AvatarCompanion'
import AIInsights from '@/app/components/ai/AIInsights'
import EnhancedMoodEntry from '@/app/components/premium/EnhancedMoodEntry'
import Link from 'next/link'

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  date: string
  time: string
  emoji: string
  notes?: string
  activities?: string[]
  photos?: string[]
}

export default function FreeDemoPage() {
  const [moods, setMoods] = useState<MoodEntry[]>([])
  const [showUpgradePrompt, setShowUpgradePrompt] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Demo mood data to show free tier limitations
    const demoMoods: MoodEntry[] = [
      {
        id: 'demo_1',
        user_id: 'free_user',
        mood_score: 7,
        date: new Date().toISOString().split('T')[0],
        time: '14:30:00',
        emoji: ':)',
        notes: 'Had a good meeting today!',
        activities: ['work'],
        photos: []
      },
      {
        id: 'demo_2',
        user_id: 'free_user',
        mood_score: 5,
        date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        time: '18:00:00',
        emoji: ':|',
        notes: 'Average day',
        activities: ['home'],
        photos: []
      },
      {
        id: 'demo_3',
        user_id: 'free_user',
        mood_score: 8,
        date: new Date(Date.now() - 172800000).toISOString().split('T')[0],
        time: '12:15:00',
        emoji: '😄',
        notes: 'Great workout session!',
        activities: ['exercise'],
        photos: []
      }
    ]
    setMoods(demoMoods)
  }, [])

  const addMoodEntry = (moodScore: number, notes: string, activities?: string[]) => {
    // Show upgrade prompt after 3 free entries
    if (moods.filter(m => !m.id.includes('demo')).length >= 3) {
      setShowUpgradePrompt(true)
      return
    }

    const newMood: MoodEntry = {
      id: `free_${Date.now()}`,
      user_id: 'free_user',
      mood_score: moodScore,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toTimeString().split(' ')[0],
      emoji: getMoodEmoji(moodScore),
      notes: notes,
      activities: activities || []
    }
    
    setMoods([newMood, ...moods])
  }

  const getMoodEmoji = (score: number) => {
    if (score <= 2) return ':('
    if (score <= 4) return ':('
    if (score <= 6) return ':|'
    if (score <= 8) return ':)'
    return ':)'
  }

  const stats = {
    average: Math.round(moods.reduce((sum, mood) => sum + mood.mood_score, 0) / moods.length),
    total: moods.length,
    streak: 3
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎭</span>
              <div>
                <h1 className="text-xl font-bold text-gray-800">DailyMood AI - Free Demo</h1>
                <p className="text-sm text-gray-600">Experience the free tier</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Link href="/free-vs-premium">
                <button className="text-purple-600 hover:text-purple-700 px-4 py-2 rounded-lg hover:bg-purple-50 transition-colors font-medium">
                  Compare Plans
                </button>
              </Link>
              <Link href="/working-auth">
                <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                  Try Premium
                </button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Free Tier Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 mb-8 text-center">
          <h2 className="text-lg font-bold text-yellow-800 mb-2">🆓 Free Tier Experience</h2>
          <p className="text-yellow-700 text-sm">
            You're experiencing the free version with limited AI features. 
            <Link href="/free-vs-premium" className="text-yellow-800 font-medium underline ml-1">
              See what Premium unlocks →
            </Link>
          </p>
        </div>

        {/* Mood Entry */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">How are you feeling today?</h1>
          <p className="text-gray-600">Free users get basic mood tracking</p>
        </div>

        <div className="max-w-2xl mx-auto mb-12">
          <EnhancedMoodEntry onMoodSave={addMoodEntry} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-4 shadow-md border text-center">
            <div className="text-2xl font-bold text-purple-600">{isNaN(stats.average) ? 'N/A' : `${stats.average}/10`}</div>
            <div className="text-sm text-gray-600">Average</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md border text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Entries</div>
          </div>
          
          <div className="bg-white rounded-2xl p-4 shadow-md border text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.streak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>
        </div>

        {/* AI Features - Limited */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md border p-6 text-center">
            <AvatarCompanion 
              userMood={stats.average || 5}
              userName="friend"
              lastMoodEntry={moods[0] ? new Date(moods[0].date) : undefined}
            />
          </div>
          
          <div>
            <AIInsights moods={moods} userTier="free" />
          </div>
        </div>

        {/* Free Tier Limitations */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-2xl shadow-md border p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Entries</h3>
            
            <div className="space-y-3">
              {moods.slice(0, 3).map((mood, index) => (
                <div key={mood.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: mood.mood_score >= 8 ? '#4ADE80' : mood.mood_score >= 5 ? '#FCD34D' : '#F87171' }}
                  >
                    <span className="text-lg font-bold text-white" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>{mood.mood_score >= 8 ? ':)' : mood.mood_score >= 5 ? ':|' : ':('}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-gray-800">{mood.mood_score}/10</span>
                      <div className="text-sm text-gray-500">
                        {new Date(mood.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                    {mood.notes && (
                      <p className="text-sm text-gray-600 truncate mt-1">"{mood.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
              
              {moods.length === 0 && (
                <div className="text-center py-8">
                  <span className="text-4xl">🌟</span>
                  <p className="text-gray-600 mt-2">Start tracking your mood above!</p>
                </div>
              )}
            </div>
          </div>

          {/* Premium Features Teaser */}
          <div className="bg-gradient-to-br from-purple-100 to-blue-100 rounded-2xl shadow-md border-2 border-purple-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-purple-800">🔒 Premium AI Features</h3>
              <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded-full">LOCKED</span>
            </div>
            
            <div className="space-y-4 opacity-60">
              <div className="p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium text-purple-700 mb-1">🎯 Activity Correlation</h4>
                <p className="text-sm text-purple-600">Discover which activities boost your mood most</p>
              </div>
              
              <div className="p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium text-purple-700 mb-1">📈 Predictive Alerts</h4>
                <p className="text-sm text-purple-600">Get warned 2-3 days before mood drops</p>
              </div>
              
              <div className="p-3 bg-white/50 rounded-lg">
                <h4 className="font-medium text-purple-700 mb-1">🤖 Advanced AI Coach</h4>
                <p className="text-sm text-purple-600">24/7 personalized mental wellness guidance</p>
              </div>
            </div>
            
            <Link href="/free-vs-premium">
              <button className="w-full mt-4 bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors font-medium">
                Unlock Premium AI →
              </button>
            </Link>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">Ready for the Full AI Experience?</h2>
          <p className="mb-6">Unlock advanced AI coaching, predictive insights, and personalized recommendations.</p>
          <div className="flex justify-center gap-4">
            <Link href="/free-vs-premium">
              <button className="bg-white text-purple-600 px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors font-medium">
                Compare Plans
              </button>
            </Link>
            <Link href="/working-auth">
              <button className="bg-purple-500 text-white px-6 py-3 rounded-lg hover:bg-purple-400 transition-colors font-medium">
                Start Premium Trial
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Upgrade Prompt Modal */}
      {showUpgradePrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-800 mb-4">Free Limit Reached!</h3>
              <p className="text-gray-600 mb-6">
                You've used your 3 free mood entries. Upgrade to Premium for unlimited tracking plus advanced AI features.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowUpgradePrompt(false)}
                  className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Continue Free
                </button>
                <Link href="/free-vs-premium" className="flex-1">
                  <button className="w-full px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                    Upgrade Now
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

