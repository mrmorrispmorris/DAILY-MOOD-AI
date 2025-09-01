'use client'
import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'

interface YearInPixelsProps {
  moods: any[]
}

export default function YearInPixels({ moods }: YearInPixelsProps) {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [hoveredDay, setHoveredDay] = useState<string | null>(null)

  const moodColors = {
    1: 'bg-red-600',     // Terrible
    2: 'bg-red-400',     // Bad
    3: 'bg-orange-400',  // Okay
    4: 'bg-yellow-400',  // Meh
    5: 'bg-yellow-300',  // Neutral
    6: 'bg-green-300',   // Good
    7: 'bg-green-400',   // Great
    8: 'bg-green-500',   // Excellent
    9: 'bg-emerald-500', // Amazing
    10: 'bg-emerald-600' // Perfect
  }

  const yearData = useMemo(() => {
    const startDate = new Date(selectedYear, 0, 1)
    const endDate = new Date(selectedYear, 11, 31)
    const days = []
    
    // Create mood lookup map
    const moodMap = new Map()
    moods.forEach(mood => {
      const date = new Date(mood.date).toISOString().split('T')[0]
      moodMap.set(date, mood)
    })

    // Generate all days of the year
    for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
      const dateStr = date.toISOString().split('T')[0]
      const mood = moodMap.get(dateStr)
      
      days.push({
        date: dateStr,
        dayOfWeek: date.getDay(),
        dayOfMonth: date.getDate(),
        month: date.getMonth(),
        mood: mood ? mood.mood_score : null,
        notes: mood ? mood.notes : null,
        emoji: mood ? mood.emoji : null
      })
    }

    return days
  }, [selectedYear, moods])

  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ]

  const weekdays = ['S', 'M', 'T', 'W', 'T', 'F', 'S']

  const getPixelColor = (mood: number | null) => {
    if (!mood) return 'bg-gray-200 hover:bg-gray-300'
    return `${moodColors[mood as keyof typeof moodColors]} hover:brightness-110`
  }

  const averageMood = useMemo(() => {
    const validMoods = yearData.filter(day => day.mood !== null)
    if (validMoods.length === 0) return 0
    return (validMoods.reduce((sum, day) => sum + day.mood!, 0) / validMoods.length).toFixed(1)
  }, [yearData])

  const totalEntries = yearData.filter(day => day.mood !== null).length

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-700 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">📅 Year in Pixels</h2>
            <p className="text-purple-100">Your emotional journey visualized - each square is a day</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right text-white">
              <p className="text-sm opacity-80">Average Mood</p>
              <p className="text-3xl font-bold">{averageMood}/10</p>
            </div>
            <div className="text-right text-white">
              <p className="text-sm opacity-80">Days Tracked</p>
              <p className="text-3xl font-bold">{totalEntries}</p>
            </div>
          </div>
        </div>

        {/* Year Selector */}
        <div className="flex items-center gap-2 mt-4">
          <button
            onClick={() => setSelectedYear(selectedYear - 1)}
            className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg transition-all"
          >
            ←
          </button>
          <h3 className="text-2xl font-bold text-white px-6">{selectedYear}</h3>
          <button
            onClick={() => setSelectedYear(selectedYear + 1)}
            disabled={selectedYear >= new Date().getFullYear()}
            className="bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-all"
          >
            →
          </button>
        </div>
      </div>

      <div className="p-8">
        {/* Mood Color Legend */}
        <div className="flex items-center justify-between mb-8 bg-gray-50 rounded-2xl p-4">
          <span className="text-sm font-medium text-gray-600">Terrible</span>
          <div className="flex items-center gap-1">
            {Object.entries(moodColors).map(([mood, color]) => (
              <div
                key={mood}
                className={`w-4 h-4 rounded ${color} border border-white shadow-sm`}
                title={`Mood ${mood}/10`}
              />
            ))}
          </div>
          <span className="text-sm font-medium text-gray-600">Perfect</span>
        </div>

        {/* Calendar Grid */}
        <div className="space-y-6">
          {months.map((month, monthIndex) => {
            const monthDays = yearData.filter(day => day.month === monthIndex)
            if (monthDays.length === 0) return null

            return (
              <div key={month} className="space-y-2">
                <h4 className="text-lg font-bold text-gray-800">{month} {selectedYear}</h4>
                
                {/* Weekday headers */}
                <div className="grid grid-cols-7 gap-1">
                  {weekdays.map(weekday => (
                    <div key={weekday} className="w-8 h-6 flex items-center justify-center text-xs font-medium text-gray-500">
                      {weekday}
                    </div>
                  ))}
                </div>

                {/* Days grid */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Empty cells for days before month starts */}
                  {Array.from({ length: monthDays[0]?.dayOfWeek || 0 }).map((_, i) => (
                    <div key={`empty-${i}`} className="w-8 h-8" />
                  ))}
                  
                  {monthDays.map(day => (
                    <motion.div
                      key={day.date}
                      className={`w-8 h-8 rounded cursor-pointer border border-white shadow-sm transition-all duration-200 ${getPixelColor(day.mood)}`}
                      whileHover={{ scale: 1.2, zIndex: 10 }}
                      onHoverStart={() => setHoveredDay(day.date)}
                      onHoverEnd={() => setHoveredDay(null)}
                      title={day.mood ? `${day.date}: ${day.mood}/10 ${day.emoji || ''}` : `${day.date}: No entry`}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Hover Tooltip */}
        {hoveredDay && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="fixed bg-black text-white px-3 py-2 rounded-lg text-sm pointer-events-none z-50"
            style={{ 
              left: '50%', 
              top: '50%',
              transform: 'translate(-50%, -50%)'
            }}
          >
            {(() => {
              const day = yearData.find(d => d.date === hoveredDay)
              return day ? (
                <div className="text-center">
                  <div className="font-bold">{new Date(day.date).toLocaleDateString()}</div>
                  {day.mood ? (
                    <>
                      <div className="text-lg">{day.emoji} {day.mood}/10</div>
                      {day.notes && <div className="text-xs opacity-75 max-w-xs">{day.notes}</div>}
                    </>
                  ) : (
                    <div className="text-gray-300">No entry</div>
                  )}
                </div>
              ) : null
            })()}
          </motion.div>
        )}

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 border border-purple-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-700">{averageMood}</div>
              <div className="text-sm text-purple-600">Average Mood</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 border border-blue-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-700">{totalEntries}</div>
              <div className="text-sm text-blue-600">Days Tracked</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 border border-green-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-700">{Math.round((totalEntries / 365) * 100)}%</div>
              <div className="text-sm text-green-600">Year Complete</div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-4 border border-orange-200">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-700">
                {yearData.filter(d => d.mood && d.mood >= 7).length}
              </div>
              <div className="text-sm text-orange-600">Great Days</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

