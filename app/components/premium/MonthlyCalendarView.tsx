'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '@/app/lib/supabase-client'

interface MoodEntry {
  id: string
  user_id: string
  mood_score: number
  emoji: string
  date: string
  time: string
  activities: string[]
  notes: string
  created_at: string
}

interface MonthlyCalendarViewProps {
  userId: string
  onDateSelected?: (date: string) => void
  onEntryClick?: (entry: MoodEntry) => void
  className?: string
}

interface DayData {
  date: string
  entries: MoodEntry[]
  averageMood: number
  hasData: boolean
}

export default function MonthlyCalendarView({ 
  userId, 
  onDateSelected,
  onEntryClick,
  className = ""
}: MonthlyCalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [monthData, setMonthData] = useState<Map<string, DayData>>(new Map())
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  // Mood color mapping
  const getMoodColor = (moodScore: number) => {
    if (moodScore >= 9) return 'bg-emerald-500'
    if (moodScore >= 7) return 'bg-green-500'
    if (moodScore >= 6) return 'bg-lime-500'
    if (moodScore >= 5) return 'bg-yellow-500'
    if (moodScore >= 4) return 'bg-orange-500'
    if (moodScore >= 3) return 'bg-red-400'
    if (moodScore >= 2) return 'bg-red-500'
    return 'bg-red-600'
  }

  const getMoodColorText = (moodScore: number) => {
    if (moodScore >= 9) return 'text-emerald-400'
    if (moodScore >= 7) return 'text-green-400'
    if (moodScore >= 6) return 'text-lime-400'
    if (moodScore >= 5) return 'text-yellow-400'
    if (moodScore >= 4) return 'text-orange-400'
    if (moodScore >= 3) return 'text-red-400'
    if (moodScore >= 2) return 'text-red-500'
    return 'text-red-600'
  }

  useEffect(() => {
    fetchMonthData()
  }, [currentDate, userId])

  const fetchMonthData = async () => {
    try {
      setLoading(true)
      
      // Get start and end of month
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      const startDate = startOfMonth.toISOString().split('T')[0]
      const endDate = endOfMonth.toISOString().split('T')[0]

      const { data, error } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: true })
        .order('time', { ascending: true })

      if (error) {
        console.error('Error fetching month data:', error)
        return
      }

      // Process data into daily summaries
      const dayDataMap = new Map<string, DayData>()
      
      // Initialize all days of the month
      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
        const dateString = date.toISOString().split('T')[0]
        
        dayDataMap.set(dateString, {
          date: dateString,
          entries: [],
          averageMood: 0,
          hasData: false
        })
      }

      // Group entries by date
      data?.forEach((entry: MoodEntry) => {
        const dayData = dayDataMap.get(entry.date)
        if (dayData) {
          dayData.entries.push(entry)
          dayData.hasData = true
        }
      })

      // Calculate average moods
      dayDataMap.forEach((dayData) => {
        if (dayData.entries.length > 0) {
          const total = dayData.entries.reduce((sum, entry) => sum + entry.mood_score, 0)
          dayData.averageMood = total / dayData.entries.length
        }
      })

      setMonthData(dayDataMap)
    } catch (error) {
      console.error('Failed to fetch month data:', error)
    } finally {
      setLoading(false)
    }
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

  const handleDateClick = (dateString: string) => {
    setSelectedDate(selectedDate === dateString ? null : dateString)
    onDateSelected?.(dateString)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    
    const days = []
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }
    
    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day)
    }
    
    return days
  }

  const formatMonth = () => {
    return currentDate.toLocaleDateString('en-US', { 
      month: 'long', 
      year: 'numeric' 
    })
  }

  const isToday = (day: number) => {
    const today = new Date()
    return today.getDate() === day &&
           today.getMonth() === currentDate.getMonth() &&
           today.getFullYear() === currentDate.getFullYear()
  }

  const getDateString = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date.toISOString().split('T')[0]
  }

  if (loading) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-400 mx-auto mb-4"></div>
        <p className="text-cyan-300">Loading calendar...</p>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-3xl font-bold text-white mb-2">
            📅 Monthly View
          </h3>
          <p className="text-cyan-300">
            Track your mood patterns over time
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-cyan-500 transition-colors text-cyan-400 hover:text-cyan-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h4 className="text-xl font-semibold text-white min-w-[200px] text-center">
            {formatMonth()}
          </h4>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 bg-gray-800/50 border border-gray-600 rounded-lg hover:border-cyan-500 transition-colors text-cyan-400 hover:text-cyan-300"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-800/30 rounded-xl p-4 border border-gray-700">
        <div className="flex items-center justify-between">
          <span className="text-gray-400 text-sm font-medium">Mood Scale:</span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Low</span>
            <div className="flex gap-1">
              <div className="w-4 h-4 bg-red-600 rounded-full"></div>
              <div className="w-4 h-4 bg-red-500 rounded-full"></div>
              <div className="w-4 h-4 bg-red-400 rounded-full"></div>
              <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
              <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
              <div className="w-4 h-4 bg-lime-500 rounded-full"></div>
              <div className="w-4 h-4 bg-green-500 rounded-full"></div>
              <div className="w-4 h-4 bg-emerald-500 rounded-full"></div>
            </div>
            <span className="text-xs text-gray-400">High</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="text-center text-sm font-medium text-gray-400 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {getDaysInMonth().map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square"></div>
            }

            const dateString = getDateString(day)
            const dayData = monthData.get(dateString)
            const isSelected = selectedDate === dateString
            const todayClass = isToday(day) ? 'ring-2 ring-cyan-400' : ''

            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`
                  aspect-square relative cursor-pointer rounded-lg border-2 transition-all duration-200 
                  ${isSelected ? 'border-cyan-400 bg-cyan-500/20' : 'border-gray-600 hover:border-gray-500'}
                  ${todayClass}
                `}
                onClick={() => handleDateClick(dateString)}
              >
                {/* Day number */}
                <div className="absolute top-1 left-1 text-sm font-medium text-white">
                  {day}
                </div>

                {/* Mood indicator */}
                {dayData?.hasData && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className={`
                        w-8 h-8 rounded-full ${getMoodColor(dayData.averageMood)} 
                        flex items-center justify-center text-white font-bold text-xs
                        shadow-lg
                      `}
                    >
                      {dayData.averageMood.toFixed(1)}
                    </div>
                  </div>
                )}

                {/* Entry count */}
                {dayData?.entries.length && dayData.entries.length > 1 && (
                  <div className="absolute bottom-1 right-1 bg-purple-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {dayData.entries.length}
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && monthData.get(selectedDate)?.hasData && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-xl font-semibold text-white">
                {new Date(selectedDate).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  month: 'long', 
                  day: 'numeric',
                  year: 'numeric'
                })}
              </h4>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-3">
              {monthData.get(selectedDate)?.entries.map((entry, index) => (
                <div
                  key={entry.id}
                  onClick={() => onEntryClick?.(entry)}
                  className="flex items-center gap-4 p-4 bg-gray-700/50 rounded-lg hover:bg-gray-700/70 transition-colors cursor-pointer"
                >
                  <div className="text-3xl">{entry.emoji}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`font-semibold ${getMoodColorText(entry.mood_score)}`}>
                        {entry.mood_score}/10
                      </span>
                      <span className="text-gray-400 text-sm">
                        at {entry.time.slice(0, 5)}
                      </span>
                    </div>
                    {entry.activities.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {entry.activities.slice(0, 3).map((activity) => (
                          <span
                            key={activity}
                            className="px-2 py-1 bg-purple-500/20 text-purple-300 rounded text-xs"
                          >
                            {activity}
                          </span>
                        ))}
                        {entry.activities.length > 3 && (
                          <span className="px-2 py-1 bg-gray-600 text-gray-300 rounded text-xs">
                            +{entry.activities.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                    {entry.notes && (
                      <p className="text-gray-300 text-sm truncate">"{entry.notes}"</p>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-600">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">
                  {monthData.get(selectedDate)?.entries.length} entries
                </span>
                <span className="text-cyan-300 font-medium">
                  Average: {monthData.get(selectedDate)?.averageMood.toFixed(1)}/10
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Stats */}
      <div className="bg-gray-800/30 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
        <h4 className="text-lg font-semibold text-white mb-4">📊 Monthly Statistics</h4>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(() => {
            const daysWithData = Array.from(monthData.values()).filter(day => day.hasData)
            const totalEntries = daysWithData.reduce((sum, day) => sum + day.entries.length, 0)
            const averageMood = daysWithData.length > 0 
              ? daysWithData.reduce((sum, day) => sum + day.averageMood, 0) / daysWithData.length
              : 0
            const bestDay = daysWithData.reduce((best, day) => 
              day.averageMood > best.averageMood ? day : best, 
              { averageMood: 0, date: '' }
            )

            return (
              <>
                <div className="text-center">
                  <div className="text-2xl font-bold text-cyan-400 mb-1">{daysWithData.length}</div>
                  <div className="text-sm text-gray-400">Days Tracked</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-400 mb-1">{totalEntries}</div>
                  <div className="text-sm text-gray-400">Total Entries</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${getMoodColorText(averageMood)}`}>
                    {averageMood.toFixed(1)}
                  </div>
                  <div className="text-sm text-gray-400">Average Mood</div>
                </div>
              </>
            )
          })()}
        </div>

        {(() => {
          const daysWithData = Array.from(monthData.values()).filter(day => day.hasData)
          const bestDay = daysWithData.reduce((best, day) => 
            day.averageMood > best.averageMood ? day : best, 
            { averageMood: 0, date: '' }
          )

          return bestDay.date && (
            <div className="mt-4 pt-4 border-t border-gray-600 text-center">
              <p className="text-sm text-gray-400 mb-1">Best Day:</p>
              <p className="text-green-400 font-medium">
                {new Date(bestDay.date).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric' 
                })} ({bestDay.averageMood.toFixed(1)}/10)
              </p>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

