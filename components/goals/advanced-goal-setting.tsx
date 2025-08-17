'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Target, 
  Trophy, 
  Flame, 
  Calendar, 
  TrendingUp, 
  Plus, 
  Edit3, 
  Trash2,
  CheckCircle,
  XCircle,
  Star,
  Zap
} from 'lucide-react'
import { useMoodData } from '@/hooks/use-mood-data'
import { useSubscription } from '@/hooks/use-subscription'

interface Goal {
  id: string
  title: string
  description: string
  targetValue: number
  currentValue: number
  targetType: 'mood_score' | 'frequency' | 'streak' | 'custom'
  frequency: 'daily' | 'weekly' | 'monthly'
  startDate: string
  endDate?: string
  streak: number
  bestStreak: number
  completed: boolean
  xp: number
  level: number
  category: 'mood' | 'habits' | 'social' | 'wellness'
  difficulty: 'easy' | 'medium' | 'hard' | 'expert'
}

const goalTemplates = [
  {
    title: 'Improve Weekly Mood',
    description: 'Maintain an average mood score of 8/10 for the week',
    targetType: 'mood_score' as const,
    targetValue: 8,
    frequency: 'weekly' as const,
    category: 'mood' as const,
    difficulty: 'medium' as const,
    xp: 100
  },
  {
    title: 'Daily Mood Tracking',
    description: 'Log your mood every day for 30 days',
    targetType: 'streak' as const,
    targetValue: 30,
    frequency: 'daily' as const,
    category: 'habits' as const,
    difficulty: 'hard' as const,
    xp: 200
  },
  {
    title: 'Stress Management',
    description: 'Practice mindfulness on high-stress days',
    targetType: 'frequency' as const,
    targetValue: 5,
    frequency: 'weekly' as const,
    category: 'wellness' as const,
    difficulty: 'medium' as const,
    xp: 150
  },
  {
    title: 'Social Connection',
    description: 'Share mood insights with friends 3 times this week',
    targetType: 'frequency' as const,
    targetValue: 3,
    frequency: 'weekly' as const,
    category: 'social' as const,
    difficulty: 'easy' as const,
    xp: 75
  }
]

export function AdvancedGoalSetting() {
  const { moodEntries } = useMoodData()
  const { isPremium } = useSubscription()
  const [goals, setGoals] = useState<Goal[]>([])
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    targetValue: 8,
    targetType: 'mood_score' as Goal['targetType'],
    frequency: 'weekly' as Goal['frequency'],
    category: 'mood' as Goal['category'],
    difficulty: 'medium' as Goal['difficulty']
  })

  // Load goals from localStorage
  useEffect(() => {
    const savedGoals = localStorage.getItem('dailymood-goals')
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [])

  // Save goals to localStorage
  useEffect(() => {
    localStorage.setItem('dailymood-goals', JSON.stringify(goals))
  }, [goals])

  // Update goal progress based on mood data
  useEffect(() => {
    setGoals(prevGoals => 
      prevGoals.map(goal => {
        const updatedGoal = { ...goal }
        
        switch (goal.targetType) {
          case 'mood_score':
            if (goal.frequency === 'weekly') {
              const weekStart = new Date()
              weekStart.setDate(weekStart.getDate() - 7)
              const weekEntries = moodEntries.filter(entry => 
                new Date(entry.date) >= weekStart
              )
              if (weekEntries.length > 0) {
                const avgMood = weekEntries.reduce((sum, entry) => 
                  sum + entry.mood_score, 0
                ) / weekEntries.length
                updatedGoal.currentValue = Math.round(avgMood * 10) / 10
                updatedGoal.completed = avgMood >= goal.targetValue
              }
            }
            break
            
          case 'streak':
            // Calculate current streak
            const sortedEntries = [...moodEntries].sort((a, b) => 
              new Date(b.date).getTime() - new Date(a.date).getTime()
            )
            let streak = 0
            let currentDate = new Date()
            
            for (let i = 0; i < 30; i++) {
              const dateStr = currentDate.toISOString().split('T')[0]
              const hasEntry = sortedEntries.some(entry => 
                entry.date === dateStr
              )
              
              if (hasEntry) {
                streak++
                currentDate.setDate(currentDate.getDate() - 1)
              } else {
                break
              }
            }
            
            updatedGoal.currentValue = streak
            updatedGoal.streak = streak
            updatedGoal.bestStreak = Math.max(goal.bestStreak, streak)
            updatedGoal.completed = streak >= goal.targetValue
            break
            
          case 'frequency':
            if (goal.frequency === 'weekly') {
              const weekStart = new Date()
              weekStart.setDate(weekStart.getDate() - 7)
              const weekEntries = moodEntries.filter(entry => 
                new Date(entry.date) >= weekStart
              )
              updatedGoal.currentValue = weekEntries.length
              updatedGoal.completed = weekEntries.length >= goal.targetValue
            }
            break
        }
        
        return updatedGoal
      })
    )
  }, [moodEntries])

  const createGoal = () => {
    const newGoal: Goal = {
      id: Date.now().toString(),
      ...formData,
      currentValue: 0,
      startDate: new Date().toISOString().split('T')[0],
      streak: 0,
      bestStreak: 0,
      completed: false,
      xp: goalTemplates.find(t => t.difficulty === formData.difficulty)?.xp || 100,
      level: 1
    }
    
    setGoals(prev => [...prev, newGoal])
    setShowCreateForm(false)
    setFormData({
      title: '',
      description: '',
      targetValue: 8,
      targetType: 'mood_score',
      frequency: 'weekly',
      category: 'mood',
      difficulty: 'medium'
    })
  }

  const updateGoal = () => {
    if (!editingGoal) return
    
    setGoals(prev => prev.map(goal => 
      goal.id === editingGoal.id 
        ? { ...goal, ...formData }
        : goal
    ))
    
    setEditingGoal(null)
    setFormData({
      title: '',
      description: '',
      targetValue: 8,
      targetType: 'mood_score',
      frequency: 'weekly',
      category: 'mood',
      difficulty: 'medium'
    })
  }

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  const getDifficultyColor = (difficulty: Goal['difficulty']) => {
    switch (difficulty) {
      case 'easy': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400'
      case 'hard': return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-600'
      case 'expert': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
    }
  }

  const getCategoryIcon = (category: Goal['category']) => {
    switch (category) {
      case 'mood': return <TrendingUp className="h-4 w-4" />
      case 'habits': return <Calendar className="h-4 w-4" />
      case 'social': return <Star className="h-4 w-4" />
      case 'wellness': return <Zap className="h-4 w-4" />
    }
  }

  const totalXP = goals.reduce((sum, goal) => sum + goal.xp, 0)
  const totalLevel = Math.floor(totalXP / 100) + 1

  return (
    <div className="space-y-6">
      {/* XP and Level Display */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-0 shadow-lg">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                <Trophy className="h-8 w-8 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                  Level {totalLevel}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {totalXP} XP • {totalXP % 100}/100 to next level
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {goals.filter(g => g.completed).length}/{goals.length}
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Goals Completed</p>
            </div>
          </div>
          <Progress value={(totalXP % 100)} className="mt-4" />
        </CardContent>
      </Card>

      {/* Create Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
          Your Goals
        </h2>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Goal
        </Button>
      </div>

      {/* Create/Edit Goal Form */}
      {(showCreateForm || editingGoal) && (
        <Card className="border-2 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Goal title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Target value"
                value={formData.targetValue}
                onChange={(e) => setFormData(prev => ({ ...prev, targetValue: Number(e.target.value) }))}
              />
              <select
                value={formData.targetType}
                onChange={(e) => setFormData(prev => ({ ...prev, targetType: e.target.value as Goal['targetType'] }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="mood_score">Mood Score</option>
                <option value="frequency">Frequency</option>
                <option value="streak">Streak</option>
                <option value="custom">Custom</option>
              </select>
              <select
                value={formData.frequency}
                onChange={(e) => setFormData(prev => ({ ...prev, frequency: e.target.value as Goal['frequency'] }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Goal['difficulty'] }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="expert">Expert</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={editingGoal ? updateGoal : createGoal}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingGoal ? 'Update Goal' : 'Create Goal'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingGoal(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Goal Templates */}
      {!showCreateForm && goals.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-6 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Goals Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Start with one of our recommended goals or create your own
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {goalTemplates.map((template, index) => (
                <Button
                  key={index}
                  variant="outline"
                  onClick={() => {
                    setFormData({
                      title: template.title,
                      description: template.description,
                      targetValue: template.targetValue,
                      targetType: template.targetType,
                      frequency: template.frequency,
                      category: template.category,
                      difficulty: template.difficulty
                    })
                    setShowCreateForm(true)
                  }}
                  className="justify-start h-auto p-3"
                >
                  <div className="text-left">
                    <div className="font-medium text-gray-900 dark:text-gray-100">
                      {template.title}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {template.description}
                    </div>
                    <Badge className={`mt-2 ${getDifficultyColor(template.difficulty)}`}>
                      {template.difficulty} • {template.xp} XP
                    </Badge>
                  </div>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <div className="space-y-4">
        {goals.map((goal) => (
          <Card key={goal.id} className={`border-l-4 ${
            goal.completed 
              ? 'border-l-green-500 bg-green-50 dark:bg-green-900/20' 
              : 'border-l-blue-500'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getCategoryIcon(goal.category)}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {goal.title}
                    </h3>
                    {goal.completed && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {goal.description}
                  </p>
                  
                  <div className="flex items-center gap-4 mb-3">
                    <Badge className={getDifficultyColor(goal.difficulty)}>
                      {goal.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {goal.xp} XP
                    </Badge>
                    <Badge variant="outline">
                      Level {goal.level}
                    </Badge>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        Progress: {goal.currentValue}/{goal.targetValue}
                      </span>
                      <span className="text-gray-600 dark:text-gray-400">
                        {Math.round((goal.currentValue / goal.targetValue) * 100)}%
                      </span>
                    </div>
                    <Progress 
                      value={(goal.currentValue / goal.targetValue) * 100} 
                      className="h-2"
                    />
                  </div>
                  
                  {/* Streak Display */}
                  {goal.streak > 0 && (
                    <div className="flex items-center gap-2 mt-3">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Current Streak: {goal.streak} days
                      </span>
                      {goal.bestStreak > goal.streak && (
                        <span className="text-sm text-gray-500">
                          (Best: {goal.bestStreak})
                        </span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 ml-4">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setEditingGoal(goal)
                      setFormData({
                        title: goal.title,
                        description: goal.description,
                        targetValue: goal.targetValue,
                        targetType: goal.targetType,
                        frequency: goal.frequency,
                        category: goal.category,
                        difficulty: goal.difficulty
                      })
                    }}
                  >
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => deleteGoal(goal.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}




