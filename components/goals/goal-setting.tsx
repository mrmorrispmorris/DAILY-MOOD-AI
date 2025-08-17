'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Target, Trophy, Flame, TrendingUp, Calendar, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Goal {
  id: string
  title: string
  targetScore: number
  currentStreak: number
  bestStreak: number
  weeklyTarget: number
  weeklyProgress: number
  startDate: string
  isActive: boolean
  type: 'mood' | 'consistency' | 'improvement'
}

const goalTypes = [
  { value: 'mood', label: 'Mood Target', icon: Target, description: 'Maintain specific mood score' },
  { value: 'consistency', label: 'Daily Logging', icon: Calendar, description: 'Log mood every day' },
  { value: 'improvement', label: 'Mood Improvement', icon: TrendingUp, description: 'Improve average mood over time' }
]

export function GoalSetting() {
  const [goals, setGoals] = useState<Goal[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newGoal, setNewGoal] = useState({
    title: '',
    targetScore: 7,
    weeklyTarget: 5,
    type: 'mood' as Goal['type']
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

  const createGoal = () => {
    if (!newGoal.title.trim()) return

    const goal: Goal = {
      id: Date.now().toString(),
      title: newGoal.title.trim(),
      targetScore: newGoal.targetScore,
      currentStreak: 0,
      bestStreak: 0,
      weeklyTarget: newGoal.weeklyTarget,
      weeklyProgress: 0,
      startDate: new Date().toISOString(),
      isActive: true,
      type: newGoal.type
    }

    setGoals(prev => [...prev, goal])
    setNewGoal({ title: '', targetScore: 7, weeklyTarget: 5, type: 'mood' })
    setShowForm(false)
  }

  const toggleGoal = (goalId: string) => {
    setGoals(prev => prev.map(goal => 
      goal.id === goalId ? { ...goal, isActive: !goal.isActive } : goal
    ))
  }

  const deleteGoal = (goalId: string) => {
    setGoals(prev => prev.filter(goal => goal.id !== goalId))
  }

  const getGoalIcon = (type: Goal['type']) => {
    const goalType = goalTypes.find(gt => gt.value === type)
    return goalType ? goalType.icon : Target
  }

  const getProgressColor = (progress: number, target: number) => {
    const percentage = (progress / target) * 100
    if (percentage >= 80) return 'text-green-600'
    if (percentage >= 60) return 'text-yellow-600'
    if (percentage >= 40) return 'text-orange-600'
    return 'text-red-600'
  }

  const getStreakEmoji = (streak: number) => {
    if (streak >= 30) return '🔥🔥🔥'
    if (streak >= 20) return '🔥🔥'
    if (streak >= 10) return '🔥'
    if (streak >= 5) return '⚡'
    if (streak >= 3) return '✨'
    return '🌟'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <Target className="h-6 w-6 text-calm-blue" />
            Goal Setting
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Set targets and build streaks like Duolingo
          </p>
        </div>
        <Button 
          onClick={() => setShowForm(!showForm)}
          className="bg-calm-blue hover:bg-calm-blue/90"
        >
          {showForm ? 'Cancel' : '+ New Goal'}
        </Button>
      </div>

      {/* Goal Creation Form */}
      {showForm && (
        <Card className="border-2 border-dashed border-calm-blue/30 bg-calm-blue/5">
          <CardHeader>
            <CardTitle className="text-lg text-calm-blue">Create New Goal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="goal-title">Goal Title</Label>
                <Input
                  id="goal-title"
                  placeholder="e.g., Improve mood to 8/10 weekly"
                  value={newGoal.title}
                  onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="goal-type">Goal Type</Label>
                <Select 
                  value={newGoal.type} 
                  onValueChange={(value: Goal['type']) => setNewGoal(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {goalTypes.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="target-score">Target Mood Score</Label>
                <Select 
                  value={newGoal.targetScore.toString()} 
                  onValueChange={(value) => setNewGoal(prev => ({ ...prev, targetScore: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[6, 7, 8, 9, 10].map(score => (
                      <SelectItem key={score} value={score.toString()}>
                        {score}/10
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="weekly-target">Weekly Target (Days)</Label>
                <Select 
                  value={newGoal.weeklyTarget.toString()} 
                  onValueChange={(value) => setNewGoal(prev => ({ ...prev, weeklyTarget: parseInt(value) }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[3, 4, 5, 6, 7].map(days => (
                      <SelectItem key={days} value={days.toString()}>
                        {days} days
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button 
              onClick={createGoal}
              disabled={!newGoal.title.trim()}
              className="w-full bg-calm-blue hover:bg-calm-blue/90"
            >
              Create Goal
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Active Goals */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
          Active Goals ({goals.filter(g => g.isActive).length})
        </h3>
        
        {goals.filter(g => g.isActive).length === 0 ? (
          <Card className="text-center py-8">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No active goals yet</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
              Create your first goal to start building streaks!
            </p>
          </Card>
        ) : (
          goals.filter(g => g.isActive).map(goal => (
            <Card key={goal.id} className="border-l-4 border-l-calm-blue">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {React.createElement(getGoalIcon(goal.type), { 
                      className: "h-6 w-6 text-calm-blue" 
                    })}
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                        {goal.title}
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Target: {goal.targetScore}/10 • {goal.weeklyTarget} days/week
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {goal.type}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGoal(goal.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Progress Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span>Weekly Progress</span>
                    <span className={getProgressColor(goal.weeklyProgress, goal.weeklyTarget)}>
                      {goal.weeklyProgress}/{goal.weeklyTarget} days
                    </span>
                  </div>
                  <Progress 
                    value={(goal.weeklyProgress / goal.weeklyTarget) * 100} 
                    className="h-2"
                  />
                </div>

                {/* Streak Section */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Flame className="h-4 w-4 text-orange-500" />
                        Current
                      </div>
                      <div className="text-lg font-bold text-orange-600">
                        {goal.currentStreak}
                      </div>
                    </div>
                    
                    <div className="text-center">
                      <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
                        <Trophy className="h-4 w-4 text-yellow-500" />
                        Best
                      </div>
                      <div className="text-lg font-bold text-yellow-600">
                        {goal.bestStreak}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl mb-1">
                      {getStreakEmoji(goal.currentStreak)}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {goal.currentStreak >= 7 ? 'Week streak!' : 'Keep going!'}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Inactive Goals */}
      {goals.filter(g => !g.isActive).length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Inactive Goals ({goals.filter(g => !g.isActive).length})
          </h3>
          
          {goals.filter(g => !g.isActive).map(goal => (
            <Card key={goal.id} className="opacity-60">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {React.createElement(getGoalIcon(goal.type), { 
                      className: "h-5 w-5 text-gray-400" 
                    })}
                    <span className="text-gray-600 dark:text-gray-400">{goal.title}</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleGoal(goal.id)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <CheckCircle className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteGoal(goal.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <XCircle className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
