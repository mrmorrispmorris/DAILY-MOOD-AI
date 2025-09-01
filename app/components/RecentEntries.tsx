'use client'
import { Calendar } from 'lucide-react'

interface RecentEntriesProps {
  limit?: number
}

export default function RecentEntries({ limit = 5 }: RecentEntriesProps) {
  // Mock data - in real app this would come from database
  const entries = [
    {
      id: 1,
      mood: 8,
      emoji: '😊',
      time: '2:30 PM',
      activities: ['work', 'social'],
      note: 'Great meeting with the team today!'
    },
    {
      id: 2,
      mood: 6,
      emoji: '🙂',
      time: '10:15 AM',
      activities: ['exercise'],
      note: 'Morning run felt good'
    }
  ].slice(0, limit)

  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-400" />
        <p>No entries yet today</p>
        <p className="text-sm">Start tracking your mood!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
          <span className="text-2xl">{entry.emoji}</span>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-medium">{entry.time}</span>
              <div className="flex gap-1">
                {entry.activities.map((activity) => (
                  <span key={activity} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">
                    {activity}
                  </span>
                ))}
              </div>
            </div>
            {entry.note && (
              <p className="text-sm text-gray-600">{entry.note}</p>
            )}
          </div>
          <span className="text-sm font-bold text-gray-700">{entry.mood}/10</span>
        </div>
      ))}
    </div>
  )
}

