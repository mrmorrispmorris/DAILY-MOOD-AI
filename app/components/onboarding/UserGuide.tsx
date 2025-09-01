'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface UserGuideProps {
  onComplete: () => void
  userName?: string
}

export default function UserGuide({ onComplete, userName }: UserGuideProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isVisible, setIsVisible] = useState(true)

  const steps = [
    {
      title: 'Welcome to DailyMood AI! 👋',
      content: 'Your intelligent companion for mental wellness is ready to help you track, understand, and improve your emotional health.',
      icon: '🎭',
      highlight: 'dashboard-header'
    },
    {
      title: 'Why Track Your Mood? 🤔',
      content: 'Research shows mood tracking can reduce depression by 28%, improve emotional regulation, and help predict mental health episodes 2 weeks early.',
      icon: '🧠',
      highlight: 'education-section'
    },
    {
      title: 'Meet Your AI Companion 🤖',
      content: 'Your avatar learns from your patterns and provides personalized insights. It evolves based on your mood data and offers tailored support.',
      icon: '✨',
      highlight: 'avatar-section'
    },
    {
      title: 'Track Your Daily Mood 📝',
      content: 'Rate your mood (1-10), add notes about your day, and include activities or thoughts. It takes less than 2 minutes but provides lasting insights.',
      icon: '📊',
      highlight: 'mood-entry'
    },
    {
      title: 'Discover Patterns & Insights 📈',
      content: 'Our AI analyzes your data to reveal hidden patterns, predict mood trends, and suggest personalized recommendations for better mental health.',
      icon: '🔍',
      highlight: 'analytics-section'
    }
  ]

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleComplete()
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleComplete = () => {
    setIsVisible(false)
    setTimeout(() => {
      onComplete()
      localStorage.setItem('dailymood_onboarding_completed', 'true')
    }, 500)
  }

  const skipTour = () => {
    handleComplete()
  }

  if (!isVisible) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-lg w-full p-8 border-4 border-purple-200"
      >
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">{steps[currentStep].icon}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <button
              onClick={skipTour}
              className="text-gray-400 hover:text-gray-600 text-sm"
            >
              Skip Tour
            </button>
            <div className="text-sm text-gray-500">
              Step {currentStep + 1} of {steps.length}
            </div>
          </div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent">
            {steps[currentStep].title}
          </h2>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <motion.div
            className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="mb-8"
          >
            <p className="text-gray-700 text-lg leading-relaxed text-center">
              {steps[currentStep].content}
            </p>
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-6 py-3 bg-gray-200 text-gray-600 rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300 transition-colors"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentStep
                    ? 'bg-purple-600 scale-125'
                    : index < currentStep
                    ? 'bg-purple-300'
                    : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={nextStep}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all duration-300 shadow-lg"
          >
            {currentStep === steps.length - 1 ? 'Get Started!' : 'Next'}
          </button>
        </div>

        {/* Quick Actions */}
        {currentStep === steps.length - 1 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200"
          >
            <div className="text-center">
              <h4 className="text-lg font-bold text-green-800 mb-2">Ready to Start?</h4>
              <p className="text-green-700 text-sm mb-3">
                Log your first mood entry to begin your mental wellness journey!
              </p>
              <div className="flex gap-2 justify-center">
                <span className="inline-flex items-center gap-1 bg-green-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  AI Ready
                </span>
                <span className="inline-flex items-center gap-1 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Analytics Active
                </span>
                <span className="inline-flex items-center gap-1 bg-purple-500 text-white px-3 py-1 rounded-full text-xs font-medium">
                  <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                  Companion Ready
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </motion.div>
  )
}

