'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  Heart, 
  Brain, 
  Zap, 
  Coffee, 
  BookOpen,
  Music,
  Utensils,
  Dumbbell,
  Leaf,
  Sun,
  Moon,
  Users,
  Palette,
  Gamepad2,
  Camera,
  Plane,
  Car,
  Home,
  Briefcase,
  GraduationCap,
  Star,
  Target,
  Calendar,
  Plus,
  Edit3,
  Trash2
} from 'lucide-react'
import { useMoodData } from '@/hooks/use-mood-data'
import { useSubscription } from '@/hooks/use-subscription'
import { Input } from '@/components/ui/input'

interface Habit {
  id: string
  name: string
  description: string
  emoji: string
  category: 'wellness' | 'productivity' | 'social' | 'creative' | 'physical' | 'mental'
  difficulty: 'easy' | 'medium' | 'hard'
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'anytime'
  duration: number // in minutes
  moodTriggers: number[] // mood scores that trigger this habit
  moodBenefits: number[] // mood scores this habit improves
  completed: boolean
  completedDate?: string
  streak: number
  bestStreak: number
  xp: number
  isCustom: boolean
}

const defaultHabits: Habit[] = [
  // Wellness Habits
  {
    id: '1',
    name: 'Morning Meditation',
    description: 'Start your day with 10 minutes of mindfulness',
    emoji: '🧘‍♀️',
    category: 'wellness',
    difficulty: 'easy',
    timeOfDay: 'morning',
    duration: 10,
    moodTriggers: [1, 2, 3, 4], // Low mood triggers
    moodBenefits: [6, 7, 8, 9, 10], // Improves mood
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 50,
    isCustom: false
  },
  {
    id: '2',
    name: 'Deep Breathing',
    description: 'Take 5 deep breaths when feeling stressed',
    emoji: '🫁',
    category: 'wellness',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    duration: 2,
    moodTriggers: [1, 2, 3, 4, 5], // Stress triggers
    moodBenefits: [6, 7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 25,
    isCustom: false
  },
  {
    id: '3',
    name: 'Gratitude Journal',
    description: 'Write down 3 things you&apos;re grateful for',
    emoji: '📝',
    category: 'wellness',
    difficulty: 'easy',
    timeOfDay: 'evening',
    duration: 5,
    moodTriggers: [1, 2, 3, 4, 5, 6], // Low to medium mood
    moodBenefits: [7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 40,
    isCustom: false
  },
  
  // Physical Habits
  {
    id: '4',
    name: 'Quick Exercise',
    description: 'Do 10 push-ups or jumping jacks',
    emoji: '🏃‍♂️',
    category: 'physical',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    duration: 5,
    moodTriggers: [1, 2, 3, 4, 5], // Low energy
    moodBenefits: [6, 7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 60,
    isCustom: false
  },
  {
    id: '5',
    name: 'Stretch Break',
    description: 'Take a 3-minute stretch break',
    emoji: '🤸‍♀️',
    category: 'physical',
    difficulty: 'easy',
    timeOfDay: 'afternoon',
    duration: 3,
    moodTriggers: [4, 5, 6], // Mid-day slump
    moodBenefits: [6, 7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 30,
    isCustom: false
  },
  
  // Social Habits
  {
    id: '6',
    name: 'Reach Out',
    description: 'Send a message to a friend or family member',
    emoji: '💬',
    category: 'social',
    difficulty: 'easy',
    timeOfDay: 'anytime',
    duration: 2,
    moodTriggers: [1, 2, 3, 4, 5], // Lonely feelings
    moodBenefits: [6, 7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 45,
    isCustom: false
  },
  
  // Creative Habits
  {
    id: '7',
    name: 'Creative Expression',
    description: 'Draw, write, or create something for 5 minutes',
    emoji: '🎨',
    category: 'creative',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    duration: 5,
    moodTriggers: [1, 2, 3, 4, 5], // Creative block
    moodBenefits: [6, 7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 55,
    isCustom: false
  },
  
  // Mental Habits
  {
    id: '8',
    name: 'Learning Moment',
    description: 'Read or learn something new for 10 minutes',
    emoji: '📚',
    category: 'mental',
    difficulty: 'medium',
    timeOfDay: 'anytime',
    duration: 10,
    moodTriggers: [5, 6, 7], // Boredom
    moodBenefits: [6, 7, 8, 9, 10],
    completed: false,
    streak: 0,
    bestStreak: 0,
    xp: 50,
    isCustom: false
  }
]

const habitCategories = [
  { id: 'wellness', name: 'Wellness', icon: Heart, color: '#EF4444' },
  { id: 'productivity', name: 'Productivity', icon: TrendingUp, color: '#10B981' },
  { id: 'social', name: 'Social', icon: Users, color: '#3B82F6' },
  { id: 'creative', name: 'Creative', icon: Palette, color: '#8B5CF6' },
  { id: 'physical', name: 'Physical', icon: Dumbbell, color: '#F59E0B' },
  { id: 'mental', name: 'Mental', icon: Brain, color: '#6366F1' }
]

const timeOfDayLabels = {
  morning: '🌅 Morning',
  afternoon: '☀️ Afternoon',
  evening: '🌙 Evening',
  anytime: '⏰ Anytime'
}

const difficultyColors = {
  easy: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
  hard: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
}

export function DailyHabitSuggestions() {
  const { moodEntries } = useMoodData()
  const { isPremium } = useSubscription()
  const [habits, setHabits] = useState<Habit[]>(defaultHabits)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    emoji: '🧘‍♀️',
    category: 'wellness' as Habit['category'],
    difficulty: 'easy' as Habit['difficulty'],
    timeOfDay: 'anytime' as Habit['timeOfDay'],
    duration: 5,
    moodTriggers: [] as number[],
    moodBenefits: [] as number[]
  })

  // Load custom habits from localStorage
  useEffect(() => {
    const savedHabits = localStorage.getItem('dailymood-custom-habits')
    if (savedHabits) {
      const customHabits = JSON.parse(savedHabits)
      setHabits(prev => [...prev.filter(h => !h.isCustom), ...customHabits])
    }
  }, [])

  // Save custom habits to localStorage
  useEffect(() => {
    const customHabits = habits.filter(h => h.isCustom)
    localStorage.setItem('dailymood-custom-habits', JSON.stringify(customHabits))
  }, [habits])

  // Get today's mood to suggest relevant habits
  const todayMood = moodEntries
    .filter(entry => entry.date === new Date().toISOString().split('T')[0])
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.mood_score || 5

  // Suggest habits based on current mood
  const suggestedHabits = habits.filter(habit => 
    habit.moodTriggers.includes(todayMood) || 
    (todayMood <= 5 && habit.moodBenefits.some(benefit => benefit > todayMood))
  )

  // Get category icon
  const getCategoryIcon = (categoryId: string) => {
    const category = habitCategories.find(c => c.id === categoryId)
    if (category) {
      const IconComponent = category.icon
      return <IconComponent className="h-4 w-4" style={{ color: category.color }} />
    }
    return <Star className="h-4 w-4" />
  }

  // Filter habits by category
  const filteredHabits = habits.filter(habit => 
    selectedCategory === 'all' || habit.category === selectedCategory
  )

  // Complete a habit
  const toggleHabit = (habitId: string) => {
    setHabits(prev => prev.map(habit => {
      if (habit.id === habitId) {
        const today = new Date().toISOString().split('T')[0]
        const wasCompletedToday = habit.completedDate === today
        
        if (wasCompletedToday) {
          // Uncomplete
          return {
            ...habit,
            completed: false,
            completedDate: undefined,
            streak: Math.max(0, habit.streak - 1)
          }
        } else {
          // Complete
          const newStreak = habit.completedDate === 
            new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            ? habit.streak + 1
            : 1
          
          return {
            ...habit,
            completed: true,
            completedDate: today,
            streak: newStreak,
            bestStreak: Math.max(habit.bestStreak, newStreak)
          }
        }
      }
      return habit
    }))
  }

  // Create custom habit
  const createHabit = () => {
    if (!formData.name.trim()) return
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      ...formData,
      completed: false,
      streak: 0,
      bestStreak: 0,
      xp: formData.difficulty === 'easy' ? 25 : formData.difficulty === 'medium' ? 50 : 75,
      isCustom: true
    }
    
    setHabits(prev => [...prev, newHabit])
    setShowCreateForm(false)
    setFormData({
      name: '',
      description: '',
      emoji: '🧘‍♀️',
      category: 'wellness',
      difficulty: 'easy',
      timeOfDay: 'anytime',
      duration: 5,
      moodTriggers: [],
      moodBenefits: []
    })
  }

  // Update habit
  const updateHabit = () => {
    if (!editingHabit) return
    
    setHabits(prev => prev.map(habit => 
      habit.id === editingHabit.id 
        ? { ...habit, ...formData }
        : habit
    ))
    
    setEditingHabit(null)
    setFormData({
      name: '',
      description: '',
      emoji: '🧘‍♀️',
      category: 'wellness',
      difficulty: 'easy',
      timeOfDay: 'anytime',
      duration: 5,
      moodTriggers: [],
      moodBenefits: []
    })
  }

  // Delete habit
  const deleteHabit = (habitId: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (habit && !habit.isCustom) {
      alert('Default habits cannot be deleted')
      return
    }
    
    setHabits(prev => prev.filter(habit => habit.id !== habitId))
  }

  // Calculate daily progress
  const completedToday = habits.filter(h => h.completed).length
  const totalHabits = habits.length
  const progressPercentage = totalHabits > 0 ? (completedToday / totalHabits) * 100 : 0

  return (
    <div className="space-y-6">
      {/* Header with Progress */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Daily Habits
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Build positive habits based on your mood
            </p>
          </div>
          <Button
            onClick={() => setShowCreateForm(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Habit
          </Button>
        </div>
        
        {/* Progress Bar */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Today&apos;s Progress
              </span>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {completedToday}/{totalHabits} completed
              </span>
            </div>
            <Progress value={progressPercentage} className="h-2" />
            <div className="flex items-center gap-2 mt-2">
              <Target className="h-4 w-4 text-green-600" />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {progressPercentage >= 80 ? 'Excellent progress!' : 
                 progressPercentage >= 60 ? 'Good work!' : 
                 progressPercentage >= 40 ? 'Keep going!' : 
                 'Every habit counts!'}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mood-Based Suggestions */}
      {suggestedHabits.length > 0 && (
        <Card className="border-2 border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
              💡 Suggested for Today (Mood: {todayMood}/10)
            </CardTitle>
            <p className="text-blue-700 dark:text-blue-300">
              These habits can help improve your current mood
            </p>
          </CardHeader>
          <CardContent className="space-y-3">
            {suggestedHabits.slice(0, 3).map((habit) => (
              <div key={habit.id} className="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <Checkbox
                  checked={habit.completed}
                  onCheckedChange={() => toggleHabit(habit.id)}
                />
                <span className="text-2xl">{habit.emoji}</span>
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">
                    {habit.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {habit.description}
                  </p>
                </div>
                <Badge className={difficultyColors[habit.difficulty]}>
                  {habit.difficulty}
                </Badge>
                <span className="text-sm text-gray-500">
                  {habit.duration}min
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
        >
          All Categories
        </Button>
        {habitCategories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
          >
            {getCategoryIcon(category.id)}
            {category.name}
          </Button>
        ))}
      </div>

      {/* Create/Edit Habit Form */}
      {(showCreateForm || editingHabit) && (
        <Card className="border-2 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingHabit ? 'Edit Habit' : 'Create New Habit'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Habit name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              <Input
                placeholder="Emoji"
                value={formData.emoji}
                onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
              />
              <Input
                type="number"
                placeholder="Duration (minutes)"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: Number(e.target.value) }))}
              />
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Habit['category'] }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {habitCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <select
                value={formData.difficulty}
                onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as Habit['difficulty'] }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <select
                value={formData.timeOfDay}
                onChange={(e) => setFormData(prev => ({ ...prev, timeOfDay: e.target.value as Habit['timeOfDay'] }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                <option value="morning">Morning</option>
                <option value="afternoon">Afternoon</option>
                <option value="evening">Evening</option>
                <option value="anytime">Anytime</option>
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={editingHabit ? updateHabit : createHabit}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingHabit ? 'Update Habit' : 'Create Habit'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingHabit(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Habits List */}
      <div className="space-y-4">
        {filteredHabits.map((habit) => (
          <Card key={habit.id} className={`hover:shadow-lg transition-all duration-200 ${
            habit.completed ? 'border-l-4 border-l-green-500 bg-green-50 dark:bg-green-900/20' : ''
          }`}>
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Checkbox
                  checked={habit.completed}
                  onCheckedChange={() => toggleHabit(habit.id)}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">{habit.emoji}</span>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      {habit.name}
                    </h3>
                    {habit.completed && (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    )}
                  </div>
                  
                  <p className="text-gray-600 dark:text-gray-400 mb-3">
                    {habit.description}
                  </p>
                  
                  <div className="flex items-center gap-3 mb-3">
                    <Badge className={difficultyColors[habit.difficulty]}>
                      {habit.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {timeOfDayLabels[habit.timeOfDay]}
                    </Badge>
                    <Badge variant="outline">
                      {habit.duration} min
                    </Badge>
                    <Badge variant="outline">
                      {habit.xp} XP
                    </Badge>
                  </div>
                  
                  {/* Streak Display */}
                  {habit.streak > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span>Current Streak: {habit.streak} days</span>
                      {habit.bestStreak > habit.streak && (
                        <span>(Best: {habit.bestStreak})</span>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2">
                  {habit.isCustom && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingHabit(habit)
                        setFormData({
                          name: habit.name,
                          description: habit.description,
                          emoji: habit.emoji,
                          category: habit.category,
                          difficulty: habit.difficulty,
                          timeOfDay: habit.timeOfDay,
                          duration: habit.duration,
                          moodTriggers: habit.moodTriggers,
                          moodBenefits: habit.moodBenefits
                        })
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                  {habit.isCustom && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteHabit(habit.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredHabits.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-8 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No habits found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategory !== 'all' 
                ? 'No habits in this category yet'
                : 'Create your first habit to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
