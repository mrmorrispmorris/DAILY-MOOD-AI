'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Goal {
  id: string
  title: string
  description: string
  target: number
  current: number
  type: 'streak' | 'mood' | 'entries'
  emoji: string
  completed: boolean
}

interface GoalsAndAchievementsProps {
  moods: any[]
  currentStreak: number
}

export default function GoalsAndAchievements({ moods, currentStreak }: GoalsAndAchievementsProps) {
  const [activeTab, setActiveTab] = useState<'goals' | 'achievements'>('goals')
  const [goals, setGoals] = useState<Goal[]>([
    {
      id: '1',
      title: '7-Day Streak',
      description: 'Track your mood for 7 consecutive days',
      target: 7,
      current: currentStreak,
      type: 'streak',
      emoji: '🔥',
      completed: currentStreak >= 7
    },
    {
      id: '2',
      title: 'Mood Master',
      description: 'Log 30 mood entries',
      target: 30,
      current: moods.length,
      type: 'entries',
      emoji: '📊',
      completed: moods.length >= 30
    },
    {
      id: '3',
      title: 'Positive Mindset',
      description: 'Have 5 days with mood 8+ this month',
      target: 5,
      current: moods.filter(m => m.mood_score >= 8).length,
      type: 'mood',
      emoji: '🌟',
      completed: moods.filter(m => m.mood_score >= 8).length >= 5
    },
    {
      id: '4',
      title: 'Consistency Champion',
      description: 'Track mood for 30 consecutive days',
      target: 30,
      current: currentStreak,
      type: 'streak',
      emoji: '👑',
      completed: currentStreak >= 30
    }
  ])

  const achievements = [
    {
      id: 'first_entry',
      title: 'First Steps',
      description: 'Logged your first mood entry',
      emoji: '🎯',
      unlocked: moods.length > 0,
      date: moods.length > 0 ? moods[moods.length - 1]?.created_at || moods[0]?.date : null
    },
    {
      id: 'week_streak',
      title: 'Week Warrior',
      description: 'Maintained a 7-day streak',
      emoji: '🔥',
      unlocked: currentStreak >= 7,
      date: currentStreak >= 7 ? new Date().toISOString().split('T')[0] : null
    },
    {
      id: 'mood_explorer',
      title: 'Mood Explorer',
      description: 'Experienced the full mood range (1-10)',
      emoji: '🌈',
      unlocked: new Set(moods.map(m => m.mood_score)).size >= 8,
      date: new Set(moods.map(m => m.mood_score)).size >= 8 ? new Date().toISOString().split('T')[0] : null
    },
    {
      id: 'reflection_master',
      title: 'Reflection Master',
      description: 'Added notes to 10 mood entries',
      emoji: '📝',
      unlocked: moods.filter(m => m.notes && m.notes.length > 0).length >= 10,
      date: moods.filter(m => m.notes && m.notes.length > 0).length >= 10 ? new Date().toISOString().split('T')[0] : null
    }
  ]

  const completedGoals = goals.filter(g => g.completed).length
  const unlockedAchievements = achievements.filter(a => a.unlocked).length

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 p-8">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">🏆 Goals & Achievements</h2>
            <p className="text-emerald-100">Track your progress and celebrate milestones</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center text-white">
              <div className="text-3xl font-bold">{completedGoals}</div>
              <div className="text-sm opacity-80">Goals Complete</div>
            </div>
            <div className="text-center text-white">
              <div className="text-3xl font-bold">{unlockedAchievements}</div>
              <div className="text-sm opacity-80">Achievements</div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mt-6">
          <button
            onClick={() => setActiveTab('goals')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'goals'
                ? 'bg-white text-emerald-700 shadow-lg'
                : 'text-emerald-100 hover:bg-white/20'
            }`}
          >
            🎯 Goals ({completedGoals}/{goals.length})
          </button>
          <button
            onClick={() => setActiveTab('achievements')}
            className={`px-6 py-3 rounded-xl font-semibold transition-all ${
              activeTab === 'achievements'
                ? 'bg-white text-emerald-700 shadow-lg'
                : 'text-emerald-100 hover:bg-white/20'
            }`}
          >
            🏅 Achievements ({unlockedAchievements}/{achievements.length})
          </button>
        </div>
      </div>

      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'goals' && (
            <motion.div
              key="goals"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              {goals.map((goal, index) => (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    goal.completed
                      ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                      : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl ${
                        goal.completed ? 'bg-green-200' : 'bg-gray-200'
                      }`}>
                        {goal.completed ? '✅' : goal.emoji}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-2">{goal.title}</h3>
                        <p className="text-gray-600 mb-4">{goal.description}</p>
                        
                        {/* Progress Bar */}
                        <div className="mb-2">
                          <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Progress</span>
                            <span>{Math.min(goal.current, goal.target)}/{goal.target}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              className={`h-full rounded-full ${
                                goal.completed
                                  ? 'bg-gradient-to-r from-green-500 to-emerald-600'
                                  : 'bg-gradient-to-r from-blue-500 to-purple-600'
                              }`}
                              initial={{ width: 0 }}
                              animate={{ width: `${Math.min((goal.current / goal.target) * 100, 100)}%` }}
                              transition={{ duration: 0.8, delay: index * 0.1 }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {goal.completed && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, delay: 0.5 }}
                        className="bg-green-500 text-white px-4 py-2 rounded-full text-sm font-bold"
                      >
                        Completed! 🎉
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div
              key="achievements"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid md:grid-cols-2 gap-6"
            >
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-2xl border-2 transition-all ${
                    achievement.unlocked
                      ? 'bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-300 shadow-lg'
                      : 'bg-gradient-to-br from-gray-50 to-gray-100 border-gray-200 opacity-60'
                  }`}
                >
                  <div className="text-center">
                    <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl ${
                      achievement.unlocked
                        ? 'bg-gradient-to-br from-yellow-400 to-orange-500 shadow-xl'
                        : 'bg-gray-200'
                    }`}>
                      {achievement.unlocked ? achievement.emoji : '🔒'}
                    </div>
                    
                    <h3 className={`text-lg font-bold mb-2 ${
                      achievement.unlocked ? 'text-gray-800' : 'text-gray-500'
                    }`}>
                      {achievement.title}
                    </h3>
                    
                    <p className={`text-sm mb-4 ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    
                    {achievement.unlocked && achievement.date && (
                      <div className="text-xs text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block">
                        Unlocked: {new Date(achievement.date).toLocaleDateString()}
                      </div>
                    )}
                    
                    {!achievement.unlocked && (
                      <div className="text-xs text-gray-400">
                        🔒 Keep tracking to unlock!
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Motivational Message */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-gradient-to-r from-purple-500 to-blue-600 rounded-2xl text-white text-center"
        >
          <div className="text-2xl mb-2">🌟</div>
          <h3 className="text-xl font-bold mb-2">Keep Going!</h3>
          <p className="text-purple-100">
            {completedGoals === 0 
              ? 'Start achieving your first goal by logging your mood daily!'
              : `You've completed ${completedGoals} goal${completedGoals > 1 ? 's' : ''}! Your mental health journey is making real progress.`
            }
          </p>
        </motion.div>
      </div>
    </div>
  )
}

