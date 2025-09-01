'use client'
import { useState } from 'react'
import { motion } from 'framer-motion'

// Daylio-style activity categories
const ACTIVITY_CATEGORIES = {
  'work': {
    label: 'Work',
    icon: '💼',
    activities: ['work', 'meeting', 'presentation', 'deadline', 'project']
  },
  'social': {
    label: 'Social',
    icon: '👥',
    activities: ['friends', 'family', 'date', 'party', 'call']
  },
  'health': {
    label: 'Health',
    icon: '🏃‍♂️',
    activities: ['exercise', 'gym', 'walk', 'yoga', 'meditation']
  },
  'leisure': {
    label: 'Leisure',
    icon: '🎮',
    activities: ['gaming', 'reading', 'movies', 'music', 'hobby']
  },
  'food': {
    label: 'Food',
    icon: '🍽️',
    activities: ['cooking', 'restaurant', 'healthy-meal', 'snacks', 'coffee']
  },
  'travel': {
    label: 'Travel',
    icon: '✈️',
    activities: ['vacation', 'commute', 'exploration', 'adventure', 'nature']
  },
  'home': {
    label: 'Home',
    icon: '🏠',
    activities: ['cleaning', 'organizing', 'relax', 'chores', 'family-time']
  },
  'learning': {
    label: 'Learning',
    icon: '📚',
    activities: ['study', 'course', 'research', 'skill', 'achievement']
  }
}

interface ActivitySelectorProps {
  selectedActivities: string[]
  onActivitiesChange: (activities: string[]) => void
  maxSelections?: number
}

export default function ActivitySelector({ 
  selectedActivities, 
  onActivitiesChange, 
  maxSelections = 5 
}: ActivitySelectorProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null)

  const toggleActivity = (activity: string) => {
    if (selectedActivities.includes(activity)) {
      // Remove activity
      onActivitiesChange(selectedActivities.filter(a => a !== activity))
    } else if (selectedActivities.length < maxSelections) {
      // Add activity
      onActivitiesChange([...selectedActivities, activity])
    }
  }

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategory(expandedCategory === categoryKey ? null : categoryKey)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          What did you do? <span className="text-sm text-gray-500">(Optional)</span>
        </h3>
        <span className="text-sm text-gray-500">
          {selectedActivities.length}/{maxSelections} selected
        </span>
      </div>

      {/* Selected Activities */}
      {selectedActivities.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-blue-50 rounded-xl border border-blue-200">
          {selectedActivities.map(activity => (
            <motion.button
              key={activity}
              onClick={() => toggleActivity(activity)}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-2 bg-blue-600 text-white px-3 py-1.5 rounded-full text-sm font-medium hover:bg-blue-700 transition-colors"
            >
              <span className="capitalize">{activity.replace('-', ' ')}</span>
              <span className="text-blue-200">×</span>
            </motion.button>
          ))}
        </div>
      )}

      {/* Activity Categories */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {Object.entries(ACTIVITY_CATEGORIES).map(([categoryKey, category]) => (
          <div key={categoryKey}>
            {/* Category Button */}
            <motion.button
              onClick={() => toggleCategory(categoryKey)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`w-full p-3 rounded-xl border-2 transition-all ${
                expandedCategory === categoryKey
                  ? 'border-purple-400 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300 bg-white'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{category.icon}</span>
                <span className="text-sm font-medium text-gray-700">{category.label}</span>
              </div>
            </motion.button>

            {/* Expanded Activities */}
            {expandedCategory === categoryKey && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 space-y-1"
              >
                {category.activities.map(activity => (
                  <button
                    key={activity}
                    onClick={() => toggleActivity(activity)}
                    disabled={!selectedActivities.includes(activity) && selectedActivities.length >= maxSelections}
                    className={`w-full p-2 text-left text-sm rounded-lg transition-all ${
                      selectedActivities.includes(activity)
                        ? 'bg-blue-600 text-white'
                        : selectedActivities.length >= maxSelections
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    <span className="capitalize">{activity.replace('-', ' ')}</span>
                  </button>
                ))}
              </motion.div>
            )}
          </div>
        ))}
      </div>

      {/* Help Text */}
      <div className="text-center text-sm text-gray-500">
        <p>💡 Activities help you discover what affects your mood</p>
      </div>
    </div>
  )
}

