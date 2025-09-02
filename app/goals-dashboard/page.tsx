'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
// Using elegant symbols instead of Lucide icons for consistency

export default function GoalsDashboard() {
  const [goals] = useState([
    {
      id: 1,
      title: 'Daily Mood Check-in',
      description: 'Log my mood every day',
      progress: 75,
      target: 30,
      current: 23,
      category: 'habits',
      color: 'teal'
    },
    {
      id: 2,
      title: 'Positive Mindset',
      description: 'Maintain mood above 6/10',
      progress: 60,
      target: 21,
      current: 13,
      category: 'wellness',
      color: 'blue'
    },
    {
      id: 3,
      title: 'Weekly Self-Care',
      description: 'Take time for self-care activities',
      progress: 40,
      target: 4,
      current: 2,
      category: 'self-care',
      color: 'purple'
    }
  ])

  const getProgressColor = (color: string) => {
    switch (color) {
      case 'teal': return 'var(--brand-primary)'
      case 'blue': return 'var(--brand-secondary)'
      case 'purple': return '#8B5CF6'
      default: return 'var(--brand-primary)'
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/working-dashboard" className="p-2 rounded-full bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Goals & Habits</h1>
        </div>
        <div className="w-8 h-8 rounded-full flex items-center justify-center"
             style={{ backgroundColor: 'rgba(255, 184, 92, 0.08)' }}>
          <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>◎</span>
        </div>
      </div>

      {/* Header Stats */}
      <div className="p-4">
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-br from-teal-50 to-cyan-50 p-4 rounded-xl border border-teal-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>◎</span>
              <span className="text-sm font-medium" style={{ color: 'var(--brand-tertiary)' }}>Active Goals</span>
            </div>
            <p className="text-2xl font-bold" style={{ color: 'var(--brand-primary)' }}>3</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-100">
            <div className="flex items-center gap-2 mb-2">
              <Check className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Completed</span>
            </div>
            <p className="text-2xl font-bold text-blue-800">12</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-100">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium text-amber-700">Avg Progress</span>
            </div>
            <p className="text-2xl font-bold text-amber-800">58%</p>
          </div>
        </div>

        {/* Goals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Your Goals</h2>
            <button 
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 hover:scale-105"
              style={{ 
                backgroundColor: 'var(--brand-tertiary)',
                color: 'var(--brand-on-tertiary)'
              }}
            >
                          <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>✚</span>
            Add Goal
            </button>
          </div>

          {goals.map((goal) => (
            <div key={goal.id} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-1">{goal.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{goal.description}</p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">Progress:</span>
                    <span className="font-medium" style={{ color: getProgressColor(goal.color) }}>
                      {goal.current} / {goal.target}
                    </span>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-2xl font-bold mb-1" style={{ color: getProgressColor(goal.color) }}>
                    {goal.progress}%
                  </div>
                  <span className="text-xs text-gray-500 capitalize">{goal.category}</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="h-2 rounded-full transition-all duration-500"
                  style={{ 
                    width: `${goal.progress}%`,
                    backgroundColor: getProgressColor(goal.color)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>

        {/* Motivational Section */}
        <div className="mt-8 p-6 rounded-2xl text-center"
             style={{ backgroundColor: 'rgba(125, 211, 192, 0.1)' }}>
          <div className="text-4xl mb-3">🎯</div>
          <h3 className="text-lg font-semibold mb-2" style={{ color: 'var(--brand-primary)' }}>
            Keep Going!
          </h3>
          <p className="text-gray-600 text-sm">
            Every small step brings you closer to your wellness goals. 
            You're making great progress!
          </p>
        </div>
      </div>

      {/* Mobile Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  )
}
