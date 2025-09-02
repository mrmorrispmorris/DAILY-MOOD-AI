'use client'
// Using elegant symbols instead of Lucide icons for consistency

const moodEmojis = [
  { value: 10, emoji: ':)', label: 'rad', color: '#4ADE80' }, // Green - happy
  { value: 8, emoji: ':)', label: 'good', color: '#FCD34D' }, // Yellow - good  
  { value: 5, emoji: ':|', label: 'meh', color: '#FB923C' }, // Orange/peach - meh
  { value: 3, emoji: ':(', label: 'bad', color: '#F87171' }, // Red - bad
  { value: 1, emoji: ';(', label: 'awful', color: '#9CA3AF' } // Gray - awful
]

const getMoodDetails = (moodScore: number) => {
  // Find closest mood based on score
  let closest = moodEmojis[0]
  let minDiff = Math.abs(moodScore - closest.value)
  
  for (const mood of moodEmojis) {
    const diff = Math.abs(moodScore - mood.value)
    if (diff < minDiff) {
      minDiff = diff
      closest = mood
    }
  }
  
  return closest
}

interface RecentEntriesProps {
  limit?: number
}

export default function RecentEntries({ limit = 5 }: RecentEntriesProps) {
  // Mock data - in real app this would come from database
  const entries = [
    {
      id: 1,
      mood: 8,
      time: '2:30 PM',
      activities: ['work', 'social'],
      note: 'Great meeting with the team today!'
    },
    {
      id: 2,
      mood: 5,
      time: '10:15 AM',
      activities: ['exercise'],
      note: 'Morning run felt good'
    }
  ].slice(0, limit)

  if (entries.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <span className="text-5xl font-light mx-auto mb-2 block" style={{ color: 'var(--brand-tertiary)' }}>◊</span>
        <p>No entries yet today</p>
        <p className="text-sm">Start tracking your mood!</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const moodDetails = getMoodDetails(entry.mood)
        return (
          <div key={entry.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
            <div 
              className="w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: moodDetails.color }}
            >
              <span className="text-lg font-bold text-white" style={{ transform: 'rotate(90deg)', display: 'inline-block' }}>{moodDetails.emoji}</span>
            </div>
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
        )
      })}
    </div>
  )
}

