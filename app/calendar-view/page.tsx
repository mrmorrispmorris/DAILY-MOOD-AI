'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
// Using elegant symbols instead of Lucide icons for consistency

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
  const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
  }
  
  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
  }

  const getMoodColor = (day: number) => {
    // Mock mood data - in real app this would come from database
    const colors = ['#7DD3C0', '#A8D8E8', '#FFB347', '#F08080', '#98FB98']
    return colors[day % colors.length]
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Top Navigation */}
      <div className="bg-white px-4 py-3 flex items-center justify-between border-b sticky top-0 z-10">
        <div className="flex items-center gap-3">
          <Link href="/working-dashboard" className="p-2 rounded-full bg-gray-100">
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </Link>
          <h1 className="text-lg font-semibold text-gray-900">Calendar</h1>
        </div>
        <div className="w-8 h-8 bg-teal-100 rounded-full flex items-center justify-center">
          <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>◊</span>
        </div>
      </div>

      {/* Calendar Header */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="p-2 rounded-full bg-gray-100">
            <span className="text-xl font-light" style={{ color: 'var(--brand-tertiary)' }}>‹</span>
          </button>
          <h2 className="text-xl font-semibold text-gray-900">
            {months[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          <button onClick={nextMonth} className="p-2 rounded-full bg-gray-100">
            <span className="text-xl font-light" style={{ color: 'var(--brand-tertiary)' }}>›</span>
          </button>
        </div>

        {/* Days of Week */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center py-2">
              <span className="text-sm font-medium text-gray-500">{day}</span>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before month starts */}
          {Array.from({ length: firstDay }, (_, i) => (
            <div key={`empty-${i}`} className="aspect-square"></div>
          ))}
          
          {/* Days of the month */}
          {Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1
            const hasEntry = Math.random() > 0.6 // Mock data
            return (
              <div key={day} className="aspect-square p-1">
                <div 
                  className="w-full h-full rounded-lg flex flex-col items-center justify-center relative cursor-pointer hover:scale-105 transition-all duration-200"
                  style={{ 
                    backgroundColor: hasEntry ? getMoodColor(day) : '#F9F9F9',
                    border: hasEntry ? 'none' : '1px solid #E0E0E0'
                  }}
                >
                  <span className={`text-sm font-medium ${hasEntry ? 'text-white' : 'text-gray-700'}`}>
                    {day}
                  </span>
                  {hasEntry && (
                    <div 
                      className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: '#4ADE80' }}
                    >
                      <span className="text-sm font-bold text-white" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>:)</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">Mood Legend</h3>
          <div className="flex flex-wrap gap-2">
            {[
              { color: '#7DD3C0', label: 'Great' },
              { color: '#A8D8E8', label: 'Good' },
              { color: '#FFB347', label: 'Okay' },
              { color: '#F08080', label: 'Low' },
              { color: '#F9F9F9', label: 'No Entry' }
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: item.color, border: item.color === '#F9F9F9' ? '1px solid #E0E0E0' : 'none' }}
                ></div>
                <span className="text-xs text-gray-600">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Spacer */}
      <div className="h-20"></div>
    </div>
  )
}
