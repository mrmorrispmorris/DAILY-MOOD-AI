'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { AppLogo } from '@/components/ui/app-logo'
import { Badge } from '@/components/ui/badge'
import { ChevronRight, Heart, Brain, TrendingUp, Bell, CheckCircle } from 'lucide-react'
import { pushService } from '@/lib/notifications/push-service'

interface OnboardingFlowProps {
  onComplete: () => void
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    notifications: false,
    reminderTime: '20:00',
    goals: [] as string[]
  })

  const steps = [
    {
      title: 'Welcome to DailyMood AI! 🎉',
      description: 'Your personal mood tracking companion with AI-powered insights',
      content: (
        <div className="text-center space-y-6">
          <AppLogo size="xl" showText={true} className="justify-center" />
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <Heart className="h-6 w-6 text-blue-600" />
              <div className="text-left">
                <div className="font-semibold text-blue-900">Track Your Mood</div>
                <div className="text-sm text-blue-700">Log daily emotions with our 10-point scale</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-purple-50 rounded-lg">
              <Brain className="h-6 w-6 text-purple-600" />
              <div className="text-left">
                <div className="font-semibold text-purple-900">AI Insights</div>
                <div className="text-sm text-purple-700">Get personalized recommendations</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-600" />
              <div className="text-left">
                <div className="font-semibold text-green-900">Track Progress</div>
                <div className="text-sm text-green-700">Visualize your emotional journey</div>
              </div>
            </div>
          </div>
        </div>
      )
    },
    {
      title: 'Set Your Goals 🎯',
      description: 'What would you like to achieve with mood tracking?',
      content: (
        <div className="space-y-4">
          {[
            { id: 'awareness', label: 'Better Self-Awareness', desc: 'Understand your emotional patterns' },
            { id: 'stress', label: 'Manage Stress', desc: 'Identify and reduce stress triggers' },
            { id: 'happiness', label: 'Increase Happiness', desc: 'Find what makes you feel good' },
            { id: 'health', label: 'Mental Health', desc: 'Support your mental wellbeing' },
            { id: 'productivity', label: 'Boost Productivity', desc: 'Optimize your daily performance' },
            { id: 'relationships', label: 'Better Relationships', desc: 'Improve social connections' }
          ].map((goal) => (
            <button
              key={goal.id}
              onClick={() => {
                const newGoals = preferences.goals.includes(goal.id)
                  ? preferences.goals.filter(g => g !== goal.id)
                  : [...preferences.goals, goal.id]
                setPreferences({ ...preferences, goals: newGoals })
              }}
              className={`w-full p-4 rounded-lg border-2 transition-all duration-200 text-left ${
                preferences.goals.includes(goal.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-900">{goal.label}</div>
                  <div className="text-sm text-gray-600">{goal.desc}</div>
                </div>
                {preferences.goals.includes(goal.id) && (
                  <CheckCircle className="h-5 w-5 text-primary" />
                )}
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: 'Daily Reminders 🔔',
      description: 'Stay consistent with gentle daily notifications',
      content: (
        <div className="space-y-6">
          <div className="text-center">
            <Bell className="h-16 w-16 text-primary mx-auto mb-4" />
            <p className="text-gray-600 mb-6">
              We&apos;ll send you a friendly reminder each day to log your mood. 
              This helps build a consistent habit for better insights.
            </p>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <div className="font-semibold text-gray-900">Enable Notifications</div>
                <div className="text-sm text-gray-600">Get daily mood reminders</div>
              </div>
              <Button
                variant={preferences.notifications ? "default" : "outline"}
                onClick={async () => {
                  if (!preferences.notifications) {
                    const success = await pushService.scheduleDaily(preferences.reminderTime)
                    setPreferences({ ...preferences, notifications: success })
                  } else {
                    setPreferences({ ...preferences, notifications: false })
                  }
                }}
              >
                {preferences.notifications ? 'Enabled' : 'Enable'}
              </Button>
            </div>
            
            {preferences.notifications && (
              <div className="p-4 bg-green-50 rounded-lg animate-fade-in">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span className="font-semibold text-green-900">Notifications Enabled!</span>
                </div>
                <p className="text-sm text-green-700">
                  You&apos;ll receive a daily reminder at 8:00 PM to log your mood.
                </p>
              </div>
            )}
          </div>
        </div>
      )
    },
    {
      title: 'You&apos;re All Set! 🚀',
      description: 'Ready to start your mood tracking journey',
      content: (
        <div className="text-center space-y-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-gray-900">Welcome aboard!</h3>
            <p className="text-gray-600">
              You&apos;re ready to start tracking your mood and discovering insights about your emotional wellbeing.
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h4 className="font-semibold text-blue-900 mb-2">Quick Tips:</h4>
              <ul className="text-sm text-blue-800 space-y-1 text-left">
                <li>• Log your mood daily for best results</li>
                <li>• Add tags to identify patterns</li>
                <li>• Check your insights weekly</li>
                <li>• Be honest about your feelings</li>
              </ul>
            </div>
            
            {preferences.goals.length > 0 && (
              <div className="bg-purple-50 p-4 rounded-lg">
                <h4 className="font-semibold text-purple-900 mb-2">Your Goals:</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.goals.map(goal => (
                    <Badge key={goal} variant="secondary" className="text-xs">
                      {goal.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )
    }
  ]

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      // Save onboarding completion
      localStorage.setItem('dailymood_onboarding_completed', 'true')
      localStorage.setItem('dailymood_user_preferences', JSON.stringify(preferences))
      onComplete()
    }
  }

  const handleSkip = () => {
    localStorage.setItem('dailymood_onboarding_completed', 'true')
    onComplete()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex space-x-2">
              {steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index <= currentStep ? 'bg-primary' : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <CardTitle className="text-xl">{steps[currentStep].title}</CardTitle>
          <CardDescription>{steps[currentStep].description}</CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {steps[currentStep].content}
          
          <div className="flex space-x-3">
            {currentStep > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="flex-1"
              >
                Back
              </Button>
            )}
            
            <Button
              onClick={handleNext}
              className="flex-1"
            >
              {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          
          {currentStep < steps.length - 1 && (
            <Button
              variant="ghost"
              onClick={handleSkip}
              className="w-full text-sm"
            >
              Skip for now
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}