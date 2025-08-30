'use client'

import { useState } from 'react'
import Link from 'next/link'
import toast from 'react-hot-toast'

// Mock data for demo
const mockMoodData = [
  { date: '2025-01-30', mood_score: 7, emoji: '😊', notes: 'Had a great day at work!', tags: ['work', 'productive'] },
  { date: '2025-01-29', mood_score: 5, emoji: '😐', notes: 'Average day, nothing special', tags: ['neutral'] },
  { date: '2025-01-28', mood_score: 8, emoji: '😄', notes: 'Went for a hike, felt amazing!', tags: ['exercise', 'nature'] },
  { date: '2025-01-27', mood_score: 6, emoji: '🙂', notes: 'Good morning coffee', tags: ['coffee', 'morning'] },
  { date: '2025-01-26', mood_score: 4, emoji: '😕', notes: 'Feeling a bit down today', tags: ['tired'] },
  { date: '2025-01-25', mood_score: 9, emoji: '🤗', notes: 'Celebrated with friends!', tags: ['social', 'celebration'] },
  { date: '2025-01-24', mood_score: 7, emoji: '😊', notes: 'Productive work session', tags: ['work', 'focused'] }
]

export default function DemoDashboard() {
  const [selectedMood, setSelectedMood] = useState(7)
  
  const averageMood = mockMoodData.reduce((sum, entry) => sum + entry.mood_score, 0) / mockMoodData.length
  const streak = 7 // Mock streak
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Demo Notice */}
        <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded-lg mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🎯</span>
            <div>
              <p className="font-bold">Developer Demo Dashboard</p>
              <p className="text-sm">This is a demo version with mock data - no authentication required!</p>
            </div>
          </div>
        </div>

        {/* Beautiful Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-2xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-purple-600 mb-3">
            Welcome to DailyMood AI!
          </h1>
          <p className="text-gray-600 mt-2">Here&apos;s how you&apos;ve been feeling (Demo Data)</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Average Mood</h3>
            <p className="text-3xl font-bold text-purple-600">{averageMood.toFixed(1)}/10</p>
            <p className="text-sm text-gray-500 mt-1">Last 7 days</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-3xl mb-2">🔥</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Current Streak</h3>
            <p className="text-3xl font-bold text-orange-500">{streak} days</p>
            <p className="text-sm text-gray-500 mt-1">Keep it going!</p>
          </div>

          <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-6">
            <div className="text-3xl mb-2">📝</div>
            <h3 className="text-lg font-semibold text-gray-800 mb-1">Total Entries</h3>
            <p className="text-3xl font-bold text-green-500">{mockMoodData.length}</p>
            <p className="text-sm text-gray-500 mt-1">Mood logs recorded</p>
          </div>
        </div>

        {/* Quick Mood Entry */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-purple-600 mb-2">
              How are you feeling today?
            </h2>
            <p className="text-gray-600">Quick mood entry (Demo Mode)</p>
          </div>

          <div className="flex flex-col items-center mb-8">
            <div className="text-6xl mb-4">
              {selectedMood <= 2 ? '😔' : selectedMood <= 4 ? '😕' : selectedMood <= 6 ? '😐' : selectedMood <= 8 ? '😊' : '🤗'}
            </div>
            <div className="text-2xl font-bold text-gray-800 mb-4">
              {selectedMood}/10
            </div>
            <input
              type="range"
              min="1"
              max="10"
              value={selectedMood}
              onChange={(e) => setSelectedMood(parseInt(e.target.value))}
              className="w-full max-w-md h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full outline-none appearance-none cursor-pointer"
            />
          </div>

          <div className="text-center">
            <button 
              onClick={() => {
                toast.success('Demo mood entry saved! This is just a preview - sign up to save real entries.')
              }}
              className="px-8 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              Save Mood Entry (Demo)
            </button>
          </div>
        </div>

        {/* Recent Mood Entries */}
        <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 mb-8">
          <h3 className="text-2xl font-bold text-gray-800 mb-6">Recent Mood Entries</h3>
          
          <div className="space-y-4">
            {mockMoodData.slice(0, 5).map((entry, index) => (
              <div
                key={entry.date}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
              >
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{entry.emoji}</div>
                  <div>
                    <p className="font-semibold text-gray-800">{new Date(entry.date).toLocaleDateString()}</p>
                    <p className="text-sm text-gray-600">{entry.notes}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-purple-600">{entry.mood_score}/10</p>
                  <div className="flex space-x-1 mt-1">
                    {entry.tags.map(tag => (
                      <span key={tag} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Insights Demo */}
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-3xl shadow-xl border border-purple-200 p-8 mb-8">
          <div className="flex items-center mb-6">
            <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center mr-4">
              <span className="text-white text-xl">🤖</span>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-purple-800">AI Insights (Demo)</h3>
              <p className="text-purple-600">Powered by GPT-4</p>
            </div>
          </div>
          
          <div className="bg-white rounded-xl p-6 border-l-4 border-purple-500">
            <p className="text-gray-700 leading-relaxed mb-4">
              <strong>Pattern Analysis:</strong> Your mood shows a positive trend over the past week! 
              You seem to feel best when engaging in physical activities like hiking and social interactions. 
              Consider scheduling more outdoor activities and social time to maintain this upward trajectory.
            </p>
            <p className="text-gray-700 leading-relaxed">
              <strong>Recommendation:</strong> Based on your patterns, morning coffee and productive work sessions 
              contribute positively to your mood. Try to maintain consistent morning routines for optimal wellbeing.
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="text-center">
          <div className="space-y-4 mb-8">
            <h3 className="text-xl font-semibold text-gray-800">Explore More Features</h3>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/" className="px-6 py-3 bg-purple-600 text-white rounded-lg font-medium hover:bg-purple-700 transition-colors">
                Landing Page
              </Link>
              <Link href="/features" className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                Features
              </Link>
              <Link href="/pricing" className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
                Pricing
              </Link>
              <Link href="/blog" className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition-colors">
                Blog (23+ Articles)
              </Link>
            </div>
          </div>
          
          <p className="text-gray-600">
            This demo shows the dashboard functionality without requiring authentication. 
            All data shown is mock data for demonstration purposes.
          </p>
        </div>
      </div>
    </div>
  )
}
