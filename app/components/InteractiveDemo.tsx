'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SparklesIcon, ChartBarIcon, HeartIcon } from '@heroicons/react/24/outline'

export default function InteractiveDemo() {
  const [demoMood, setDemoMood] = useState(5)
  const [showInsight, setShowInsight] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate([10, 5, 10]) // Pattern for better feedback
    }
  }

  const handleSliderChange = (value: number) => {
    setDemoMood(value)
    triggerHaptic()
    setShowInsight(false)
  }

  const generateInsight = () => {
    setIsAnalyzing(true)
    triggerHaptic()
    
    setTimeout(() => {
      setIsAnalyzing(false)
      setShowInsight(true)
      triggerHaptic()
    }, 2000)
  }

  const getMoodDetails = (score: number) => {
    if (score <= 3) return { emoji: '😔', color: 'from-red-400 to-red-500', message: 'Tough day? Let\'s work through it together.' }
    if (score <= 5) return { emoji: '😐', color: 'from-yellow-400 to-yellow-500', message: 'Room for improvement. Small steps matter.' }
    if (score <= 7) return { emoji: '😊', color: 'from-green-400 to-green-500', message: 'Good vibes! Keep the momentum going.' }
    return { emoji: '🤩', color: 'from-purple-400 to-purple-500', message: 'Amazing! You\'re thriving!' }
  }

  const mood = getMoodDetails(demoMood)

  return (
    <div className="relative bg-white rounded-3xl shadow-2xl p-8 max-w-4xl mx-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden rounded-3xl">
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-5`}
          animate={{
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </div>

      <div className="relative grid md:grid-cols-2 gap-8">
        {/* Input Side */}
        <div>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <HeartIcon className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
            Try Our Mood Tracker
          </h3>
          
          {/* Animated Emoji */}
          <motion.div
            key={demoMood}
            initial={{ scale: 0.5, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-center mb-6"
          >
            <span className="text-8xl">{mood.emoji}</span>
          </motion.div>

          {/* Mood Score Display */}
          <motion.div
            className="text-center mb-6"
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {demoMood}/10
            </span>
          </motion.div>

          {/* Interactive Slider */}
          <div className="mb-6">
            <input
              type="range"
              min="1"
              max="10"
              value={demoMood}
              onChange={(e) => handleSliderChange(Number(e.target.value))}
              className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full appearance-none cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                  #EF4444 0%, 
                  #F59E0B 30%, 
                  #10B981 70%, 
                  #8B5CF6 100%)`
              }}
            />
            <div className="flex justify-between text-xs text-gray-500 mt-2">
              <span>Awful</span>
              <span>Amazing</span>
            </div>
          </div>

          {/* Get Insight Button */}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={generateInsight}
            disabled={isAnalyzing}
            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            {isAnalyzing ? (
              <>
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                >
                  <SparklesIcon className="w-5 h-5" strokeWidth={1.5} />
                </motion.div>
                Analyzing...
              </>
            ) : (
              <>
                <SparklesIcon className="w-5 h-5" strokeWidth={1.5} />
                Get AI Insight
              </>
            )}
          </motion.button>
        </div>

        {/* Output Side */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6">
          <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-blue-600" strokeWidth={1.5} />
            AI Analysis
          </h3>
          
          <AnimatePresence mode="wait">
            {!showInsight ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <div className="bg-white/50 rounded-lg p-4 backdrop-blur">
                  <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
                </div>
                <p className="text-sm text-gray-500 text-center">
                  Move the slider and click "Get AI Insight"
                </p>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-4"
              >
                {/* Mood Assessment */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <p className="text-sm text-gray-600 mb-2">Current State</p>
                  <p className="font-medium">{mood.message}</p>
                </motion.div>

                {/* AI Recommendation */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="bg-white rounded-lg p-4 shadow-sm"
                >
                  <p className="text-sm text-gray-600 mb-2">AI Recommendation</p>
                  <p className="text-sm">
                    {demoMood <= 5 
                      ? "Try a 5-minute walk or breathing exercise. Small actions can shift your mood significantly."
                      : "Maintain this positive energy with gratitude journaling or sharing your joy with others."}
                  </p>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center pt-4"
                >
                  <p className="text-sm text-purple-600 font-medium">
                    Track your real moods for personalized insights
                  </p>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}