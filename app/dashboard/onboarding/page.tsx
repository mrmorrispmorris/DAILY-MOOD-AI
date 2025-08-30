'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, Bell, Download, ChevronRight, Sparkles, Check } from 'lucide-react'

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(0)
  const [preferences, setPreferences] = useState({
    notifications: false,
    reminderTime: '20:00',
    goals: [] as string[]
  })

  const steps = [
    {
      title: "Welcome to DailyMood AI! 🎉",
      subtitle: "Let's personalize your experience",
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Brain className="w-12 h-12 text-white" />
          </div>
          <p className="text-gray-600 mb-8">
            Track your mood, understand patterns, and improve your mental wellness with AI-powered insights.
          </p>
          <div className="text-left space-y-3 max-w-sm mx-auto">
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-700">Daily mood tracking in seconds</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-700">AI insights from GPT-4</span>
            </div>
            <div className="flex items-start gap-3">
              <Check className="w-5 h-5 text-green-500 mt-0.5" />
              <span className="text-gray-700">Beautiful charts and analytics</span>
            </div>
          </div>
        </div>
      )
    },
    {
      title: "What are your wellness goals?",
      subtitle: "Select all that apply",
      content: (
        <div className="space-y-3">
          {[
            'Reduce anxiety',
            'Improve mood',
            'Better sleep',
            'Increase productivity',
            'Manage stress',
            'Track patterns'
          ].map((goal) => (
            <button
              key={goal}
              onClick={() => {
                setPreferences(prev => ({
                  ...prev,
                  goals: prev.goals.includes(goal)
                    ? prev.goals.filter(g => g !== goal)
                    : [...prev.goals, goal]
                }))
              }}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                preferences.goals.includes(goal)
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-medium">{goal}</span>
                {preferences.goals.includes(goal) && (
                  <Check className="w-5 h-5 text-purple-600" />
                )}
              </div>
            </button>
          ))}
        </div>
      )
    },
    {
      title: "Enable daily reminders?",
      subtitle: "Never forget to log your mood",
      content: (
        <div className="space-y-6">
          <div className="flex items-center justify-center">
            <Bell className="w-16 h-16 text-purple-600" />
          </div>
          <div className="space-y-4">
            <button
              onClick={() => setPreferences(prev => ({ ...prev, notifications: true }))}
              className={`w-full p-4 rounded-xl border-2 ${
                preferences.notifications
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold">Yes, remind me daily</p>
                  <p className="text-sm text-gray-600">Get a gentle nudge to track your mood</p>
                </div>
                {preferences.notifications && <Check className="w-5 h-5 text-purple-600" />}
              </div>
            </button>
            
            {preferences.notifications && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reminder time
                </label>
                <input
                  type="time"
                  value={preferences.reminderTime}
                  onChange={(e) => setPreferences(prev => ({ ...prev, reminderTime: e.target.value }))}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            )}

            <button
              onClick={() => setPreferences(prev => ({ ...prev, notifications: false }))}
              className={`w-full p-4 rounded-xl border-2 ${
                !preferences.notifications
                  ? 'border-purple-500 bg-purple-50'
                  : 'border-gray-200'
              }`}
            >
              <div className="text-left">
                <p className="font-semibold">No thanks</p>
                <p className="text-sm text-gray-600">I'll remember on my own</p>
              </div>
            </button>
          </div>
        </div>
      )
    },
    {
      title: "You're all set! 🎊",
      subtitle: "Ready to log your first mood?",
      content: (
        <div className="text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Sparkles className="w-12 h-12 text-white" />
          </div>
          
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-8">
            <p className="text-sm font-semibold text-purple-900 mb-2">
              🎁 Special Offer
            </p>
            <p className="text-purple-700 mb-4">
              Try Premium FREE for 14 days
            </p>
            <ul className="text-sm text-left space-y-2 text-purple-600">
              <li>✨ AI-powered insights</li>
              <li>📊 Advanced analytics</li>
              <li>🔔 Smart notifications</li>
              <li>💾 Export your data</li>
            </ul>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/pricing')}
              className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700"
            >
              Start Free Trial
            </button>
            <button
              onClick={() => completeOnboarding()}
              className="w-full py-4 text-gray-600 hover:text-gray-800"
            >
              Maybe later
            </button>
          </div>
        </div>
      )
    }
  ]

  const completeOnboarding = async () => {
    // Save preferences
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('user_preferences').upsert({
        user_id: user.id,
        notifications_enabled: preferences.notifications,
        reminder_time: preferences.reminderTime,
        goals: preferences.goals,
        onboarding_completed: true
      })
    }
    
    router.push('/dashboard')
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      completeOnboarding()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 flex-1 mx-1 rounded-full transition-colors ${
                  index <= currentStep ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
          <p className="text-center text-sm text-gray-600">
            Step {currentStep + 1} of {steps.length}
          </p>
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="bg-white rounded-2xl shadow-xl p-8"
          >
            <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
            <p className="text-gray-600 mb-8">{steps[currentStep].subtitle}</p>
            
            {steps[currentStep].content}
            
            {currentStep < steps.length - 1 && (
              <button
                onClick={nextStep}
                disabled={currentStep === 1 && preferences.goals.length === 0}
                className="w-full mt-8 py-4 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                Continue
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
