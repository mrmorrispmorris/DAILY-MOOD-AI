'use client'

import { useState, useEffect } from 'react'
import { Bell, Clock, Target, Zap, Star, Trophy, Heart, Brain, TrendingUp, Settings, Smartphone, Calendar, Moon, Sun } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface NotificationSchedule {
  id: string
  type: 'daily' | 'weekly' | 'mood-based' | 'achievement' | 'pattern' | 'custom'
  title: string
  message: string
  time: string
  days: string[]
  isActive: boolean
  priority: 'low' | 'medium' | 'high'
  category: 'reminder' | 'motivation' | 'achievement' | 'insight' | 'challenge'
  lastSent?: Date
  nextSend?: Date
  frequency: 'once' | 'daily' | 'weekly' | 'monthly'
  conditions?: {
    moodThreshold?: number
    streakDays?: number
    timeOfDay?: string
    weather?: string
  }
}

interface NotificationTemplate {
  id: string
  name: string
  message: string
  category: string
  variables: string[]
  isCustomizable: boolean
}

const defaultSchedules: NotificationSchedule[] = [
  {
    id: 'daily_mood',
    type: 'daily',
    title: 'Daily Mood Check-in',
    message: 'How are you feeling today? Take a moment to reflect and log your mood.',
    time: '20:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    priority: 'high',
    category: 'reminder',
    frequency: 'daily'
  },
  {
    id: 'weekly_insight',
    type: 'weekly',
    title: 'Weekly Mood Insights',
    message: 'Your weekly mood summary is ready! Discover patterns and get personalized recommendations.',
    time: '10:00',
    days: ['monday'],
    isActive: true,
    priority: 'medium',
    category: 'insight',
    frequency: 'weekly'
  },
  {
    id: 'streak_celebration',
    type: 'achievement',
    title: 'Streak Celebration! 🎉',
    message: 'Congratulations! You\'ve maintained a {streak} day mood tracking streak. Keep it up!',
    time: '09:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    priority: 'high',
    category: 'achievement',
    frequency: 'daily',
    conditions: {
      streakDays: 7
    }
  },
  {
    id: 'low_mood_support',
    type: 'mood-based',
    title: 'Supportive Reminder',
    message: 'Remember, it&apos;s okay to have difficult days. Here are some quick mood boosters: take 3 deep breaths, listen to your favorite song, or reach out to a friend.',
    time: '15:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    priority: 'high',
    category: 'motivation',
    frequency: 'daily',
    conditions: {
      moodThreshold: 4
    }
  },
  {
    id: 'challenge_reminder',
    type: 'pattern',
    title: 'Daily Challenge Reminder',
    message: 'New daily challenge available! "{challenge_name}" - complete it to earn points and unlock achievements.',
    time: '12:00',
    days: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    isActive: true,
    priority: 'medium',
    category: 'challenge',
    frequency: 'daily'
  }
]

const notificationTemplates: NotificationTemplate[] = [
  {
    id: 'mood_boost',
    name: 'Mood Booster',
    message: 'Feeling down? Try this quick mood boost: {activity}',
    category: 'motivation',
    variables: ['activity'],
    isCustomizable: true
  },
  {
    id: 'achievement_unlocked',
    name: 'Achievement Unlocked',
    message: '🎉 You&apos;ve unlocked "{achievement_name}"! {description}',
    category: 'achievement',
    variables: ['achievement_name', 'description'],
    isCustomizable: false
  },
  {
    id: 'streak_milestone',
    name: 'Streak Milestone',
    message: '🔥 Amazing! You&apos;ve reached a {streak_days} day streak. You&apos;re on fire!',
    category: 'achievement',
    variables: ['streak_days'],
    isCustomizable: false
  },
  {
    id: 'pattern_discovery',
    name: 'Pattern Discovery',
    message: '🧠 AI Insight: We discovered that {pattern_description}. Try {recommendation}',
    category: 'insight',
    variables: ['pattern_description', 'recommendation'],
    isCustomizable: true
  },
  {
    id: 'social_reminder',
    name: 'Social Connection',
    message: '💙 Don&apos;t forget to connect with friends today. Social connections boost mood by up to 40%!',
    category: 'motivation',
    variables: [],
    isCustomizable: true
  }
]

export default function SmartNotificationSystem() {
  const [schedules, setSchedules] = useState<NotificationSchedule[]>(defaultSchedules)
  const [templates, setTemplates] = useState<NotificationTemplate[]>(notificationTemplates)
  const [selectedSchedule, setSelectedSchedule] = useState<string>('')
  const [isEditing, setIsEditing] = useState(false)
  const [notificationStats, setNotificationStats] = useState({
    totalSent: 0, // Will be updated when notifications are implemented
    openRate: 0,
    engagementRate: 0,
    userSatisfaction: 0
  })

  const toggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, isActive: !schedule.isActive }
        : schedule
    ))
  }

  const updateSchedule = (scheduleId: string, updates: Partial<NotificationSchedule>) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { ...schedule, ...updates }
        : schedule
    ))
  }

  const addCustomSchedule = () => {
    const newSchedule: NotificationSchedule = {
      id: `custom_${Date.now()}`,
      type: 'custom',
      title: 'Custom Notification',
      message: 'Your custom message here',
      time: '09:00',
      days: ['monday'],
      isActive: true,
      priority: 'medium',
      category: 'reminder',
      frequency: 'daily'
    }
    setSchedules(prev => [...prev, newSchedule])
    setSelectedSchedule(newSchedule.id)
    setIsEditing(true)
  }

  const deleteSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId))
    if (selectedSchedule === scheduleId) {
      setSelectedSchedule('')
      setIsEditing(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-200'
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'low': return 'bg-green-100 text-green-800 border-green-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'reminder': return <Clock className="h-4 w-4" />
      case 'motivation': return <Heart className="h-4 w-4" />
      case 'achievement': return <Trophy className="h-4 w-4" />
      case 'insight': return <Brain className="h-4 w-4" />
      case 'challenge': return <Target className="h-4 w-4" />
      default: return <Bell className="h-4 w-4" />
    }
  }

  const getFrequencyLabel = (frequency: string) => {
    switch (frequency) {
      case 'once': return 'One Time'
      case 'daily': return 'Daily'
      case 'weekly': return 'Weekly'
      case 'monthly': return 'Monthly'
      default: return frequency
    }
  }

  const testNotification = (schedule: NotificationSchedule) => {
    // In a real app, this would send a test notification
    console.log('Testing notification:', schedule)
    alert(`Test notification sent: "${schedule.title}"`)
  }

  const selectedScheduleData = schedules.find(s => s.id === selectedSchedule)

  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Bell className="h-12 w-12 text-primary mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Smart Notification System
            </h1>
          </div>
          <p className="text-xl text-gray-600">
            AI-powered notifications that engage users at the perfect moment
          </p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4 text-center">
              <Bell className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-blue-900">{notificationStats.totalSent.toLocaleString()}</div>
              <div className="text-sm text-blue-700">Notifications Sent</div>
            </CardContent>
          </Card>
          
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4 text-center">
              <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-900">{notificationStats.openRate}%</div>
              <div className="text-sm text-green-700">Open Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-purple-50 border-purple-200">
            <CardContent className="p-4 text-center">
              <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-purple-900">{notificationStats.engagementRate}%</div>
              <div className="text-sm text-purple-700">Engagement Rate</div>
            </CardContent>
          </Card>
          
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="p-4 text-center">
              <Star className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
              <div className="text-2xl font-bold text-yellow-900">{notificationStats.userSatisfaction}/5</div>
              <div className="text-sm text-yellow-700">User Satisfaction</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Schedule List */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle>Notification Schedules</CardTitle>
                  <CardDescription>Manage your smart notification system</CardDescription>
                </div>
                <Button onClick={addCustomSchedule} size="sm">
                  <Bell className="h-4 w-4 mr-2" />
                  Add Custom
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {schedules.map((schedule) => (
                    <div
                      key={schedule.id}
                      className={`p-4 border rounded-lg transition-all duration-200 ${
                        selectedSchedule === schedule.id 
                          ? 'ring-2 ring-primary bg-primary/5' 
                          : 'hover:bg-gray-50'
                      }`}
                      onClick={() => setSelectedSchedule(schedule.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Switch
                            checked={schedule.isActive}
                            onCheckedChange={() => toggleSchedule(schedule.id)}
                            onClick={(e) => e.stopPropagation()}
                          />
                          <div className="flex items-center space-x-2">
                            {getCategoryIcon(schedule.category)}
                            <Badge className={getPriorityColor(schedule.priority)}>
                              {schedule.priority}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline">
                            {getFrequencyLabel(schedule.frequency)}
                          </Badge>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={(e) => {
                              e.stopPropagation()
                              testNotification(schedule)
                            }}
                          >
                            Test
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <h4 className="font-semibold text-gray-900">{schedule.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{schedule.message}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>🕐 {schedule.time}</span>
                          <span>📅 {schedule.days.slice(0, 3).join(', ')}{schedule.days.length > 3 ? '...' : ''}</span>
                          {schedule.conditions?.moodThreshold && (
                            <span>😊 Mood &gt; {schedule.conditions.moodThreshold}</span>
                          )}
                          {schedule.conditions?.streakDays && (
                            <span>🔥 {schedule.conditions.streakDays}+ days</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Schedule Details */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Schedule Details</CardTitle>
                <CardDescription>
                  {selectedScheduleData ? 'Edit notification settings' : 'Select a schedule to edit'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedScheduleData ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="title">Title</Label>
                      <Input
                        id="title"
                        value={selectedScheduleData.title}
                        onChange={(e) => updateSchedule(selectedScheduleData.id, { title: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="message">Message</Label>
                      <Input
                        id="message"
                        value={selectedScheduleData.message}
                        onChange={(e) => updateSchedule(selectedScheduleData.id, { message: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={selectedScheduleData.time}
                        onChange={(e) => updateSchedule(selectedScheduleData.id, { time: e.target.value })}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="priority">Priority</Label>
                      <Select
                        value={selectedScheduleData.priority}
                        onValueChange={(value) => updateSchedule(selectedScheduleData.id, { priority: value as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="frequency">Frequency</Label>
                      <Select
                        value={selectedScheduleData.frequency}
                        onValueChange={(value) => updateSchedule(selectedScheduleData.id, { frequency: value as any })}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="once">Once</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        className="flex-1"
                        onClick={() => setIsEditing(!isEditing)}
                      >
                        {isEditing ? 'Save' : 'Edit'}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => deleteSchedule(selectedScheduleData.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a schedule to view and edit details</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Templates Section */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Notification Templates</CardTitle>
            <CardDescription>Pre-built templates for common notification types</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <div key={template.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold">{template.name}</h4>
                    <Badge variant="outline">{template.category}</Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{template.message}</p>
                  {template.variables.length > 0 && (
                    <div className="text-xs text-gray-500 mb-3">
                      Variables: {template.variables.join(', ')}
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Badge variant={template.isCustomizable ? 'default' : 'secondary'}>
                      {template.isCustomizable ? 'Customizable' : 'Fixed'}
                    </Badge>
                    <Button size="sm" variant="outline">
                      Use Template
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Smart Features */}
        <Card className="mt-8 bg-gradient-to-r from-purple-50 to-blue-50 border-0">
          <CardContent className="p-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Smart Notification Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-purple-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Timing</h4>
                <p className="text-sm text-gray-600">Notifications sent when users are most likely to engage</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Target className="h-8 w-8 text-blue-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Mood-Based Triggers</h4>
                <p className="text-sm text-gray-600">Supportive messages when users need them most</p>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Zap className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">Achievement Celebrations</h4>
                <p className="text-sm text-gray-600">Celebrate milestones and maintain motivation</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
