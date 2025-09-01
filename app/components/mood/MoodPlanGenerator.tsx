'use client'
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MoodEntry {
  id: string
  mood_score: number
  date: string
  time: string
  activities?: string[]
  notes?: string
  emoji: string
}

interface MoodPlanGeneratorProps {
  moods: MoodEntry[]
  userName?: string
}

export default function MoodPlanGenerator({ moods, userName = 'friend' }: MoodPlanGeneratorProps) {
  const [planType, setPlanType] = useState<'daily' | 'weekly' | 'emergency'>('daily')
  const [isGenerating, setIsGenerating] = useState(false)

  const intelligentPlan = useMemo(() => {
    if (moods.length === 0) {
      return {
        title: "Welcome to Your Mood Journey!",
        description: "Start logging moods to unlock personalized plans",
        actions: [
          "🎯 Log your first mood above",
          "📝 Add notes about your day", 
          "🏃‍♀️ Try different activities",
          "📊 Watch patterns emerge"
        ],
        emergency: [
          "🧘‍♀️ Take 5 deep breaths",
          "🚶‍♀️ Go for a short walk",
          "💧 Drink some water",
          "📞 Call someone you trust"
        ]
      }
    }

    const recentMoods = moods.slice(0, 7)
    const averageMood = recentMoods.reduce((sum, m) => sum + m.mood_score, 0) / recentMoods.length
    
    // Analyze patterns
    const activities = moods.reduce((acc, mood) => {
      if (mood.activities) {
        mood.activities.forEach(activity => {
          if (!acc[activity]) acc[activity] = { total: 0, count: 0, scores: [] }
          acc[activity].total += mood.mood_score
          acc[activity].count += 1
          acc[activity].scores.push(mood.mood_score)
        })
      }
      return acc
    }, {} as Record<string, { total: number, count: number, scores: number[] }>)

    // Find best activities
    const activityAverages = Object.entries(activities)
      .map(([activity, data]) => ({
        activity,
        average: data.total / data.count,
        count: data.count
      }))
      .filter(item => item.count >= 2) // Only activities done more than once
      .sort((a, b) => b.average - a.average)

    const bestActivities = activityAverages.slice(0, 3)
    
    // Time analysis
    const timePatterns = moods.reduce((acc, mood) => {
      const hour = new Date(`${mood.date}T${mood.time}`).getHours()
      const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'
      if (!acc[timeOfDay]) acc[timeOfDay] = { total: 0, count: 0 }
      acc[timeOfDay].total += mood.mood_score
      acc[timeOfDay].count += 1
      return acc
    }, {} as Record<string, { total: number, count: number }>)

    const bestTime = Object.entries(timePatterns)
      .map(([time, data]) => ({ time, average: data.total / data.count }))
      .sort((a, b) => b.average - a.average)[0]

    // Generate plans based on current state
    let title = ""
    let description = ""
    let actions: string[] = []

    if (averageMood >= 7) {
      title = `✨ Keep the Momentum, ${userName}!`
      description = "You're in a great headspace - let's maintain this energy"
      actions = [
        `🌟 Continue with ${bestActivities[0]?.activity.replace('-', ' ') || 'your favorite activities'}`,
        `⏰ Best time for important tasks: ${bestTime?.time || 'when you feel most energetic'}`,
        "🎯 Set a meaningful goal for the week",
        "🤗 Share your positive energy with others",
        "📝 Reflect on what's working well"
      ]
    } else if (averageMood >= 5) {
      title = `🌱 Growth Mode Activated, ${userName}`
      description = "You're in a stable place - perfect for building better habits"
      actions = [
        `💪 Try more ${bestActivities[0]?.activity.replace('-', ' ') || 'mood-boosting activities'}`,
        "🧘‍♀️ Add 10 minutes of mindfulness daily",
        "🌅 Create a consistent morning routine",
        "📚 Learn something new each day",
        "🎵 Listen to uplifting music"
      ]
    } else {
      title = `💙 Gentle Care Plan, ${userName}`
      description = "You're going through a tough time - let's focus on basics"
      actions = [
        "😴 Prioritize 7-8 hours of sleep",
        "🥗 Eat nourishing meals regularly",
        "☀️ Get sunlight for at least 15 minutes",
        "🧘‍♀️ Practice self-compassion",
        "📞 Connect with supportive people"
      ]
    }

    const emergency = [
      "🛑 Stop and acknowledge: this feeling will pass",
      "🫁 Box breathing: 4 counts in, hold 4, out 4, hold 4",
      "🚶‍♀️ Step outside or change your environment",
      "💧 Drink water and have a healthy snack",
      "📱 Text someone who cares about you",
      "🎵 Play your favorite calming music",
      "📝 Write down 3 things you're grateful for"
    ]

    return { title, description, actions, emergency }
  }, [moods, userName])

  const generatePlan = async () => {
    setIsGenerating(true)
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsGenerating(false)
  }

  const planContent = {
    daily: {
      title: intelligentPlan.title,
      subtitle: "Your personalized daily action plan",
      items: intelligentPlan.actions,
      color: "blue"
    },
    weekly: {
      title: `📅 Weekly Mood Strategy for ${userName}`,
      subtitle: "Build sustainable habits over the next 7 days",
      items: [
        "🎯 Set 3 realistic mood goals for the week",
        "📊 Check your mood patterns every 2-3 days",
        "🏃‍♀️ Try 2 new mood-boosting activities",
        "🧘‍♀️ Practice mindfulness 4+ times this week",
        "🤝 Have meaningful conversations with 2 people",
        "🌟 Celebrate small wins and progress",
        "📝 Write a weekly reflection on Sunday"
      ],
      color: "green"
    },
    emergency: {
      title: "🆘 Emergency Support Plan",
      subtitle: "When you need immediate mood support",
      items: intelligentPlan.emergency,
      color: "red"
    }
  }

  const currentPlan = planContent[planType]
  const colorClasses = {
    blue: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600', button: 'bg-blue-600' },
    green: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-600', button: 'bg-green-600' },
    red: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-600', button: 'bg-red-600' }
  }

  return (
    <motion.div 
      className="card-soft rounded-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className={`${colorClasses[currentPlan.color].bg} ${colorClasses[currentPlan.color].border} border-b p-6`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-readable">{currentPlan.title}</h3>
            <p className="text-readable-secondary text-sm">{currentPlan.subtitle}</p>
          </div>
          <button
            onClick={generatePlan}
            disabled={isGenerating}
            className={`${colorClasses[currentPlan.color].button} text-white px-4 py-2 rounded-lg font-medium transition-all hover:scale-105 disabled:opacity-50`}
          >
            {isGenerating ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Generating...
              </div>
            ) : (
              'Refresh Plan'
            )}
          </button>
        </div>

        {/* Plan type selector */}
        <div className="flex gap-2">
          {(['daily', 'weekly', 'emergency'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setPlanType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                planType === type
                  ? 'bg-white shadow-md text-readable'
                  : 'text-readable-secondary hover:text-readable hover:bg-white/50'
              }`}
            >
              {type === 'daily' ? '📅 Daily' : type === 'weekly' ? '📊 Weekly' : '🆘 Emergency'}
            </button>
          ))}
        </div>
      </div>

      {/* Plan content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={planType}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {currentPlan.items.map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-3 bg-white rounded-lg border border-gray-100"
              >
                <span className={`${colorClasses[currentPlan.color].text} mt-0.5 font-medium`}>
                  {index + 1}.
                </span>
                <p className="text-readable-secondary flex-1">{item}</p>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>

        {/* Encouragement footer */}
        <motion.div 
          className="mt-6 p-4 bg-gray-50 rounded-lg text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-readable-secondary text-sm">
            {planType === 'daily' && `💝 Remember ${userName}, small daily actions create big life changes!`}
            {planType === 'weekly' && `🌟 You've got this, ${userName}! One week at a time.`}
            {planType === 'emergency' && `🤗 You're not alone, ${userName}. Reach out for support when you need it.`}
          </p>
        </motion.div>
      </div>
    </motion.div>
  )
}

