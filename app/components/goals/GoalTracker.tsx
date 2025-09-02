'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Target,
  Activity,
  Star,
  Heart,
  Coffee,
  Book
} from 'lucide-react'
// Using elegant symbols instead of Lucide icons for consistency
import { supabase } from '@/app/lib/supabase-client'

interface Goal {
  id: number
  user_id: string
  goal_name: string
  goal_type: 'mood_target' | 'habit' | 'wellness' | 'custom'
  description?: string
  target_value: number
  current_value: number
  unit: string
  frequency: 'daily' | 'weekly' | 'monthly'
  start_date: string
  end_date?: string
  status: 'active' | 'completed' | 'paused'
  color: string
  icon: string
  created_at: string
}

interface GoalProgress {
  id: number
  goal_id: number
  user_id: string
  progress_value: number
  progress_date: string
  notes?: string
  created_at: string
}

interface GoalTrackerProps {
  userId?: string
}

const GOAL_ICONS = [
  { icon: Target, name: 'target', label: 'Target' },
  { icon: Heart, name: 'heart', label: 'Health' },
  { icon: Activity, name: 'activity', label: 'Activity' },
  { icon: Coffee, name: 'coffee', label: 'Routine' },
  { icon: Book, name: 'book', label: 'Learning' },
  { icon: Star, name: 'star', label: 'Achievement' }
]

const GOAL_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4',
  '#84cc16', '#f97316', '#ec4899', '#6366f1', '#14b8a6', '#eab308'
]

const GOAL_TEMPLATES = [
  {
    name: 'Daily Mood Target',
    type: 'mood_target' as const,
    description: 'Maintain average mood above target',
    target_value: 7,
    unit: '/10',
    frequency: 'daily' as const,
    color: '#10b981',
    icon: 'heart'
  },
  {
    name: 'Exercise Streak',
    type: 'habit' as const,
    description: 'Exercise regularly for better mental health',
    target_value: 5,
    unit: 'times/week',
    frequency: 'weekly' as const,
    color: '#3b82f6',
    icon: 'activity'
  },
  {
    name: 'Meditation Practice',
    type: 'wellness' as const,
    description: 'Daily mindfulness and meditation',
    target_value: 10,
    unit: 'minutes/day',
    frequency: 'daily' as const,
    color: '#8b5cf6',
    icon: 'target'
  },
  {
    name: 'Sleep Quality',
    type: 'wellness' as const,
    description: 'Maintain consistent sleep schedule',
    target_value: 8,
    unit: 'hours/night',
    frequency: 'daily' as const,
    color: '#06b6d4',
    icon: 'star'
  }
]

export default function GoalTracker({ userId }: GoalTrackerProps) {
  const [goals, setGoals] = useState<Goal[]>([])
  const [goalProgress, setGoalProgress] = useState<GoalProgress[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    goal_name: '',
    goal_type: 'habit' as Goal['goal_type'],
    description: '',
    target_value: 0,
    unit: '',
    frequency: 'daily' as Goal['frequency'],
    end_date: '',
    color: GOAL_COLORS[0],
    icon: 'target'
  })

  useEffect(() => {
    if (userId) {
      fetchGoals()
      fetchGoalProgress()
    }
  }, [userId])

  const fetchGoals = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setGoals(data || [])
    } catch (error) {
      console.error('Error fetching goals:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchGoalProgress = async () => {
    if (!userId) return

    try {
      const { data, error } = await supabase
        .from('goal_progress')
        .select('*')
        .eq('user_id', userId)
        .order('progress_date', { ascending: false })

      if (error) throw error
      setGoalProgress(data || [])
    } catch (error) {
      console.error('Error fetching goal progress:', error)
    }
  }

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId) return

    try {
      const goalData = {
        ...formData,
        user_id: userId,
        current_value: 0,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active'
      }

      const { data, error } = await supabase
        .from('user_goals')
        .insert([goalData])
        .select()

      if (error) throw error

      if (data?.[0]) {
        setGoals([data[0], ...goals])
        setShowCreateForm(false)
        resetForm()
      }
    } catch (error) {
      console.error('Error creating goal:', error)
    }
  }

  const handleUpdateGoal = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userId || !editingGoal) return

    try {
      const { data, error } = await supabase
        .from('user_goals')
        .update(formData)
        .eq('id', editingGoal.id)
        .eq('user_id', userId)
        .select()

      if (error) throw error

      if (data?.[0]) {
        setGoals(goals.map(g => g.id === editingGoal.id ? data[0] : g))
        setEditingGoal(null)
        resetForm()
      }
    } catch (error) {
      console.error('Error updating goal:', error)
    }
  }

  const handleDeleteGoal = async (goalId: number) => {
    if (!userId) return

    try {
      const { error } = await supabase
        .from('user_goals')
        .delete()
        .eq('id', goalId)
        .eq('user_id', userId)

      if (error) throw error

      setGoals(goals.filter(g => g.id !== goalId))
      setSelectedGoal(null)
    } catch (error) {
      console.error('Error deleting goal:', error)
    }
  }

  const handleProgressUpdate = async (goalId: number, progressValue: number, notes?: string) => {
    if (!userId) return

    try {
      const progressData = {
        goal_id: goalId,
        user_id: userId,
        progress_value: progressValue,
        progress_date: new Date().toISOString().split('T')[0],
        notes: notes || ''
      }

      const { data, error } = await supabase
        .from('goal_progress')
        .insert([progressData])
        .select()

      if (error) throw error

      if (data?.[0]) {
        setGoalProgress([data[0], ...goalProgress])
        
        // Update current value in goal
        const goal = goals.find(g => g.id === goalId)
        if (goal) {
          const updatedCurrentValue = goal.current_value + progressValue
          
          await supabase
            .from('user_goals')
            .update({ current_value: updatedCurrentValue })
            .eq('id', goalId)
            .eq('user_id', userId)

          setGoals(goals.map(g => 
            g.id === goalId 
              ? { ...g, current_value: updatedCurrentValue }
              : g
          ))
        }
      }
    } catch (error) {
      console.error('Error updating progress:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      goal_name: '',
      goal_type: 'habit',
      description: '',
      target_value: 0,
      unit: '',
      frequency: 'daily',
      end_date: '',
      color: GOAL_COLORS[0],
      icon: 'target'
    })
  }

  const handleTemplateUse = (template: typeof GOAL_TEMPLATES[0]) => {
    setFormData({
      goal_name: template.name,
      goal_type: template.type,
      description: template.description,
      target_value: template.target_value,
      unit: template.unit,
      frequency: template.frequency,
      end_date: '',
      color: template.color,
      icon: template.icon
    })
    setShowCreateForm(true)
  }

  const getGoalProgress = (goal: Goal) => {
    const percentage = goal.target_value > 0 ? (goal.current_value / goal.target_value) * 100 : 0
    return Math.min(100, percentage)
  }

  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, any> = {
      target: Target,
      heart: Heart,
      activity: Activity,
      coffee: Coffee,
      book: Book,
      star: Star
    }
    return iconMap[iconName] || Target
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Goal Tracker</h2>
            <p className="text-gray-600">Set goals and track your progress towards better mental health</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>✚</span>
            New Goal
          </button>
        </div>

        {/* Goal Templates */}
        {goals.length === 0 && !showCreateForm && (
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Quick Start Templates</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {GOAL_TEMPLATES.map((template, index) => {
                const IconComponent = getIconComponent(template.icon)
                return (
                  <button
                    key={index}
                    onClick={() => handleTemplateUse(template)}
                    className="text-left p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div 
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: template.color }}
                      >
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <span className="font-medium">{template.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{template.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>Target: {template.target_value} {template.unit}</span>
                      <span className="capitalize">{template.frequency}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {(showCreateForm || editingGoal) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-white rounded-xl shadow-lg p-6"
          >
            <h3 className="text-lg font-semibold mb-4">
              {editingGoal ? 'Edit Goal' : 'Create New Goal'}
            </h3>
            
            <form onSubmit={editingGoal ? handleUpdateGoal : handleCreateGoal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.goal_name}
                    onChange={(e) => setFormData({ ...formData, goal_name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Daily Exercise"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Type
                  </label>
                  <select
                    value={formData.goal_type}
                    onChange={(e) => setFormData({ ...formData, goal_type: e.target.value as Goal['goal_type'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="habit">Habit</option>
                    <option value="mood_target">Mood Target</option>
                    <option value="wellness">Wellness</option>
                    <option value="custom">Custom</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={2}
                  placeholder="Describe your goal and why it's important..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Value *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unit
                  </label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., times, minutes, /10"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Frequency
                  </label>
                  <select
                    value={formData.frequency}
                    onChange={(e) => setFormData({ ...formData, frequency: e.target.value as Goal['frequency'] })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Color
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {GOAL_COLORS.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setFormData({ ...formData, color })}
                        className={`w-8 h-8 rounded-full border-2 ${
                          formData.color === color ? 'border-gray-900' : 'border-gray-300'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Icon
                  </label>
                  <div className="flex gap-2 flex-wrap">
                    {GOAL_ICONS.map(({ icon: IconComponent, name, label }) => (
                      <button
                        key={name}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: name })}
                        className={`p-2 rounded-lg border-2 ${
                          formData.icon === name 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-300 hover:border-gray-400'
                        }`}
                        title={label}
                      >
                        <IconComponent className="w-4 h-4" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date (Optional)
                </label>
                <input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingGoal ? 'Update Goal' : 'Create Goal'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setEditingGoal(null)
                    resetForm()
                  }}
                  className="bg-gray-200 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Goals List */}
      {goals.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Your Goals ({goals.length})</h3>
          
          <div className="space-y-4">
            {goals.map(goal => {
              const IconComponent = getIconComponent(goal.icon)
              const progress = getGoalProgress(goal)
              
              return (
                <motion.div
                  key={goal.id}
                  layout
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                        style={{ backgroundColor: goal.color }}
                      >
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900">{goal.goal_name}</h4>
                        <p className="text-sm text-gray-600 capitalize">{goal.goal_type.replace('_', ' ')} • {goal.frequency}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => {
                          setEditingGoal(goal)
                          setFormData({
                            goal_name: goal.goal_name,
                            goal_type: goal.goal_type,
                            description: goal.description || '',
                            target_value: goal.target_value,
                            unit: goal.unit,
                            frequency: goal.frequency,
                            end_date: goal.end_date || '',
                            color: goal.color,
                            icon: goal.icon
                          })
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                      >
                        <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>✎</span>
                      </button>
                      <button
                        onClick={() => handleDeleteGoal(goal.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <span className="text-lg font-light" style={{ color: 'var(--brand-tertiary)' }}>🗑</span>
                      </button>
                    </div>
                  </div>

                  {goal.description && (
                    <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                  )}

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span>Progress: {goal.current_value} / {goal.target_value} {goal.unit}</span>
                      <span className="font-medium">{progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: goal.color }}
                      />
                    </div>
                  </div>

                  {/* Quick Progress Update */}
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Quick update:</span>
                    <button
                      onClick={() => handleProgressUpdate(goal.id, 1)}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-md text-sm hover:bg-green-200 transition-colors"
                    >
                      +1
                    </button>
                    {goal.target_value >= 5 && (
                      <button
                        onClick={() => handleProgressUpdate(goal.id, 5)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded-md text-sm hover:bg-blue-200 transition-colors"
                      >
                        +5
                      </button>
                    )}
                    {progress >= 100 && (
                      <span className="ml-2 flex items-center gap-1 text-green-600 font-medium">
                        <CheckCircle2 className="w-4 h-4" />
                        Complete!
                      </span>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>
      )}

      {goals.length === 0 && !loading && !showCreateForm && (
        <div className="bg-white rounded-xl shadow-lg p-12 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Goals Yet</h3>
          <p className="text-gray-600 mb-6">Start your wellness journey by setting your first goal!</p>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Create Your First Goal
          </button>
        </div>
      )}
    </div>
  )
}
