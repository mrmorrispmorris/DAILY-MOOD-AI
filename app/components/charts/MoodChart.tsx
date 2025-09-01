'use client'
import { useState } from 'react'
import { Calendar, TrendingUp } from 'lucide-react'

interface MoodChartProps {
  type: 'week' | 'month' | 'year'
}

export default function MoodChart({ type }: MoodChartProps) {
  // Mock data for demonstration
  const weekData = [
    { day: 'Mon', mood: 7 },
    { day: 'Tue', mood: 8 },
    { day: 'Wed', mood: 6 },
    { day: 'Thu', mood: 9 },
    { day: 'Fri', mood: 7 },
    { day: 'Sat', mood: 8 },
    { day: 'Sun', mood: 6 }
  ]

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return '#10b981' // Green
    if (mood >= 6) return '#84cc16' // Light green
    if (mood >= 4) return '#fbbf24' // Yellow
    return '#f87171' // Red
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Mood Trends</h3>
        <span className="text-sm text-gray-500 capitalize">{type} view</span>
      </div>
      
      {type === 'week' && (
        <div className="space-y-3">
          {weekData.map((data) => (
            <div key={data.day} className="flex items-center gap-3">
              <span className="text-sm font-medium w-8">{data.day}</span>
              <div className="flex-1 bg-gray-200 rounded-full h-4 overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-300"
                  style={{
                    width: `${(data.mood / 10) * 100}%`,
                    backgroundColor: getMoodColor(data.mood)
                  }}
                />
              </div>
              <span className="text-sm font-medium w-8">{data.mood}</span>
            </div>
          ))}
        </div>
      )}
      
      {type === 'month' && (
        <div className="text-center text-gray-500 py-8">
          <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Monthly chart coming soon</p>
        </div>
      )}
      
      {type === 'year' && (
        <div className="text-center text-gray-500 py-8">
          <TrendingUp className="w-12 h-12 mx-auto mb-2 text-gray-400" />
          <p>Yearly trends coming soon</p>
        </div>
      )}
    </div>
  )
}

