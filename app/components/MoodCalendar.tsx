'use client'
import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MoodEntry {
  id: string
  date: string
  mood_score: number
  emoji: string
  mood_label?: string
  notes?: string
  activities?: string[]
  tags?: string[]
}

interface MoodCalendarProps {
  moods: MoodEntry[]
  onDateSelect?: (date: string, mood?: MoodEntry) => void
}

const moodColors = {
  1: '#EF4444', // Awful - Red
  2: '#F97316', // Bad - Orange  
  3: '#F59E0B', // Meh - Yellow
  4: '#22C55E', // Good - Green
  5: '#10B981'  // Rad - Emerald
}

const monthNames = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export default function MoodCalendar({ moods, onDateSelect }: MoodCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  // Create mood lookup by date
  const moodsByDate = useMemo(() => {
    const lookup: { [date: string]: MoodEntry } = {}
    moods.forEach(mood => {
      lookup[mood.date] = mood
    })
    return lookup
  }, [moods])

  // Calculate calendar stats
  const calendarStats = useMemo(() => {
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const monthMoods = moods.filter(mood => {
      const moodDate = new Date(mood.date)
      return moodDate.getMonth() === currentMonth && moodDate.getFullYear() === currentYear
    })
    
    const averageMood = monthMoods.length > 0 
      ? monthMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / monthMoods.length
      : 0

    const bestDay = monthMoods.reduce((best, mood) => 
      mood.mood_score > (best?.mood_score || 0) ? mood : best, null as MoodEntry | null)
    
    const totalEntries = monthMoods.length
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate()
    const completion = (totalEntries / daysInMonth) * 100

    return {
      averageMood: Math.round(averageMood * 10) / 10,
      bestDay,
      totalEntries,
      completion: Math.round(completion)
    }
  }, [moods, currentDate])

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    const current = new Date(startDate)
    
    // Generate 6 weeks of calendar
    for (let week = 0; week < 6; week++) {
      for (let day = 0; day < 7; day++) {
        const dateStr = current.toISOString().split('T')[0]
        const isCurrentMonth = current.getMonth() === month
        const isToday = dateStr === new Date().toISOString().split('T')[0]
        const mood = moodsByDate[dateStr]
        
        days.push({
          date: new Date(current),
          dateStr,
          day: current.getDate(),
          isCurrentMonth,
          isToday,
          mood
        })
        
        current.setDate(current.getDate() + 1)
      }
    }
    
    return days
  }, [currentDate, moodsByDate])

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(prev.getMonth() + (direction === 'next' ? 1 : -1))
      return newDate
    })
  }

  const handleDateClick = (dateStr: string, mood?: MoodEntry) => {
    setSelectedDate(dateStr === selectedDate ? null : dateStr)
    onDateSelect?.(dateStr, mood)
  }

  const getMoodColor = (moodScore?: number) => {
    if (!moodScore) return '#F3F4F6'
    return moodColors[moodScore as keyof typeof moodColors] || '#F3F4F6'
  }

  const getMoodEmoji = (moodScore?: number) => {
    const emojis = { 1: '😢', 2: '😞', 3: '😐', 4: '🙂', 5: '😁' }
    return moodScore ? emojis[moodScore as keyof typeof emojis] : '📅'
  }

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-500 to-blue-500 p-6 text-white">
        <div className="flex justify-between items-center mb-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('prev')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
          
          <motion.h2 
            key={currentDate.getTime()}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="text-2xl font-bold"
          >
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </motion.h2>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => navigateMonth('next')}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>
        </div>
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{calendarStats.averageMood}</div>
            <div className="text-xs opacity-80">Avg Mood</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{calendarStats.totalEntries}</div>
            <div className="text-xs opacity-80">Entries</div>
          </div>
          <div className="bg-white/10 rounded-lg p-3">
            <div className="text-2xl font-bold">{calendarStats.completion}%</div>
            <div className="text-xs opacity-80">Complete</div>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Headers */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(dayName => (
            <div key={dayName} className="text-center text-sm font-medium text-gray-500 p-2">
              {dayName}
            </div>
          ))}
        </div>
        
        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((day, index) => {
            const isSelected = day.dateStr === selectedDate
            const isHovered = day.dateStr === hoveredDate
            
            return (
              <motion.button
                key={`${day.dateStr}-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleDateClick(day.dateStr, day.mood)}
                onHoverStart={() => setHoveredDate(day.dateStr)}
                onHoverEnd={() => setHoveredDate(null)}
                className={`
                  relative aspect-square p-2 rounded-xl transition-all duration-200
                  ${day.isCurrentMonth ? 'text-gray-900' : 'text-gray-300'}
                  ${day.isToday ? 'ring-2 ring-blue-500' : ''}
                  ${isSelected ? 'ring-2 ring-purple-500 shadow-lg' : ''}
                  ${day.mood ? 'shadow-md' : 'hover:shadow-md'}
                `}
                style={{
                  backgroundColor: day.mood 
                    ? getMoodColor(day.mood.mood_score)
                    : isHovered 
                      ? '#F3F4F6'
                      : 'transparent'
                }}
              >
                {/* Day Number */}
                <div className={`text-sm font-medium ${
                  day.mood ? 'text-white' : day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                }`}>
                  {day.day}
                </div>
                
                {/* Mood Emoji */}
                {day.mood && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute inset-0 flex items-center justify-center text-lg"
                  >
                    {day.mood.emoji}
                  </motion.div>
                )}
                
                {/* Today Indicator */}
                {day.isToday && !day.mood && (
                  <div className="absolute bottom-1 right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
                )}
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Selected Date Details */}
      <AnimatePresence>
        {selectedDate && moodsByDate[selectedDate] && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="border-t bg-gray-50 p-6"
          >
            <div className="flex items-start space-x-4">
              <div 
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg"
                style={{ backgroundColor: getMoodColor(moodsByDate[selectedDate].mood_score) }}
              >
                {moodsByDate[selectedDate].emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="font-semibold text-gray-900">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'long', 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </h3>
                  <span className="text-sm bg-gray-200 text-gray-700 px-2 py-1 rounded-full">
                    {moodsByDate[selectedDate].mood_label || `${moodsByDate[selectedDate].mood_score}/5`}
                  </span>
                </div>
                
                {moodsByDate[selectedDate].notes && (
                  <p className="text-gray-600 text-sm mb-2 italic">
                    "{moodsByDate[selectedDate].notes}"
                  </p>
                )}
                
                {moodsByDate[selectedDate].activities && moodsByDate[selectedDate].activities!.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {moodsByDate[selectedDate].activities!.map((activity, i) => (
                      <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {activity}
                      </span>
                    ))}
                  </div>
                )}
                
                {moodsByDate[selectedDate].tags && moodsByDate[selectedDate].tags!.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {moodsByDate[selectedDate].tags!.map((tag, i) => (
                      <span key={i} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}


