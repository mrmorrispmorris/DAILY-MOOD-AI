'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/use-auth'
import { useMoodData } from '@/hooks/use-mood-data'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { BottomNav } from '@/components/ui/bottom-nav'
import { Calendar, ChevronLeft, ChevronRight, Plus } from 'lucide-react'

interface CalendarDay {
  date: Date
  mood?: number
  emoji?: string
  isCurrentMonth: boolean
  isToday: boolean
}

export default function CalendarPage() {
  const { user, loading } = useAuth()
  const { moodEntries } = useMoodData()
  const router = useRouter()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState<CalendarDay | null>(null)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!user) {
    router.push('/login')
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    // First day of the month
    const firstDay = new Date(year, month, 1)
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0)
    
    // Start from the first Sunday of the week containing the first day
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - startDate.getDay())
    
    // End at the last Saturday of the week containing the last day
    const endDate = new Date(lastDay)
    endDate.setDate(endDate.getDate() + (6 - endDate.getDay()))
    
    const days: CalendarDay[] = []
    const today = new Date()
    
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const moodEntry = moodEntries.find(entry => (entry as any).date === dateStr || entry.created_at?.split('T')[0] === dateStr)
      
      days.push({
        date: new Date(date),
        mood: moodEntry?.mood_score,
        emoji: (moodEntry as any)?.emoji || '😊',
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString()
      })
    }
    
    return days
  }

  const calendarDays = generateCalendarDays()

  const getMoodColor = (mood?: number) => {
    if (!mood) return 'bg-gray-100'
    if (mood <= 3) return 'bg-red-200'
    if (mood <= 5) return 'bg-orange-200'
    if (mood <= 7) return 'bg-yellow-200'
    if (mood <= 8) return 'bg-green-200'
    return 'bg-blue-200'
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const handleDayClick = (day: CalendarDay) => {
    setSelectedDay(day)
  }

  const handleAddMood = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    router.push(`/log-mood?date=${dateStr}`)
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="min-h-screen bg-gray-50 pb-20 animate-fade-in">
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-center">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold text-primary">Mood Calendar</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-md mx-auto px-4 py-6 space-y-6">
        {/* Month Navigation */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('prev')}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <CardTitle className="text-lg">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </CardTitle>
              
              <Button
                variant="outline"
                size="icon"
                onClick={() => navigateMonth('next')}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent>
            {/* Day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, index) => (
                <button
                  key={index}
                  onClick={() => handleDayClick(day)}
                  className={`
                    relative aspect-square p-1 rounded-lg text-sm font-medium transition-all duration-200
                    ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                    ${day.isToday ? 'ring-2 ring-primary' : ''}
                    ${getMoodColor(day.mood)}
                    hover:scale-105 hover:shadow-md
                  `}
                >
                  <div className="flex flex-col items-center justify-center h-full">
                    <span className="text-xs">{day.date.getDate()}</span>
                    {day.emoji && (
                      <span className="text-xs mt-0.5">{day.emoji}</span>
                    )}
                  </div>
                  
                  {day.mood && (
                    <div className="absolute top-0 right-0 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Selected Day Details */}
        {selectedDay && (
          <Card className="animate-fade-in">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center justify-between">
                <span>
                  {selectedDay.date.toLocaleDateString('en-US', { 
                    weekday: 'long',
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </span>
                {selectedDay.isToday && (
                  <span className="text-sm bg-primary text-white px-2 py-1 rounded-full">
                    Today
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            
            <CardContent>
              {selectedDay.mood ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{selectedDay.emoji}</span>
                      <div>
                        <div className="font-semibold">Mood Score: {selectedDay.mood}/10</div>
                        <div className="text-sm text-gray-600">
                          {selectedDay.mood <= 3 ? 'Low mood' :
                           selectedDay.mood <= 5 ? 'Below average' :
                           selectedDay.mood <= 7 ? 'Good mood' :
                           selectedDay.mood <= 8 ? 'Great mood' : 'Excellent mood'}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleAddMood(selectedDay.date)}
                  >
                    Edit Entry
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <div className="text-gray-500 mb-4">
                    No mood logged for this day
                  </div>
                  <Button
                    onClick={() => handleAddMood(selectedDay.date)}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Log Mood
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Month Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Month Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-700">
                  {calendarDays.filter(day => day.mood && day.mood >= 7 && day.isCurrentMonth).length}
                </div>
                <div className="text-sm text-green-600">Good Days</div>
              </div>
              
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">
                  {calendarDays.filter(day => day.mood && day.isCurrentMonth).length}
                </div>
                <div className="text-sm text-blue-600">Days Logged</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>

      <BottomNav />
    </div>
  )
}