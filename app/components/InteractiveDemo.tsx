'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, TrendingUp, Brain } from 'lucide-react'

const moodEmojis = [
  { score: 1, emoji: '😔', label: 'Awful', color: 'from-red-500 to-red-600' },
  { score: 2, emoji: '😟', label: 'Bad', color: 'from-orange-500 to-orange-600' },
  { score: 3, emoji: '😕', label: 'Not Good', color: 'from-yellow-600 to-yellow-700' },
  { score: 4, emoji: '😐', label: 'Meh', color: 'from-yellow-500 to-yellow-600' },
  { score: 5, emoji: '🙂', label: 'Okay', color: 'from-lime-500 to-lime-600' },
  { score: 6, emoji: '😊', label: 'Good', color: 'from-green-500 to-green-600' },
  { score: 7, emoji: '😄', label: 'Great', color: 'from-emerald-500 to-emerald-600' },
  { score: 8, emoji: '😃', label: 'Very Good', color: 'from-teal-500 to-teal-600' },
  { score: 9, emoji: '🤗', label: 'Amazing', color: 'from-cyan-500 to-cyan-600' },
  { score: 10, emoji: '🤩', label: 'Fantastic', color: 'from-purple-500 to-purple-600' }
]

const demoInsights = {
  1: "I notice you're feeling down. Consider reaching out to a friend or doing something that usually brings you joy.",
  2: "It's okay to have tough days. Maybe try some gentle movement or listening to music you love.",
  3: "Your feelings are valid. Sometimes a walk outside or a warm cup of tea can help shift your mood.",
  4: "You're in neutral territory - this is normal! Consider what might help you feel a bit more positive today.",
  5: "You're doing okay! Maybe there's something small you can do to nudge your mood up a bit.",
  6: "Good mood detected! This is a great time to do activities you enjoy or connect with others.",
  7: "You're feeling great! Consider what contributed to this positive mood so you can recreate it.",
  8: "Excellent mood! This is perfect energy for tackling goals or helping others feel good too.",
  9: "You're in an amazing headspace! Use this high energy for something meaningful to you.",
  10: "Fantastic mood! You're radiating positivity - what's your secret? Remember this feeling!"
}

const personalizedTips = {
  1: "Based on users with similar low moods, try deep breathing for 3 minutes, take a warm shower, or call someone who cares about you.",
  2: "Users in similar situations found relief through gentle stretching, listening to calming music, or writing in a gratitude journal.",
  3: "People with similar feelings benefited from a 10-minute nature walk, drinking herbal tea, or practicing self-compassion exercises.",
  4: "Users at this mood level improved by doing light exercise, organizing their space, or engaging in a creative activity.",
  5: "Similar users found small boosts through upbeat music, completing a simple task, or spending time with pets or plants.",
  6: "People feeling similarly enhanced their mood by socializing with friends, trying a new recipe, or practicing a hobby they enjoy.",
  7: "Users with great moods like yours maintained momentum through physical activity, helping others, or pursuing passion projects.",
  8: "People in excellent moods maximized their energy by setting new goals, learning something new, or celebrating achievements.",
  9: "Users feeling amazing channeled this energy into meaningful work, inspiring others, or planning future adventures.",
  10: "People with fantastic moods like yours spread positivity by sharing their joy, mentoring others, or creating something beautiful."
}

export default function InteractiveDemo() {
  const [selectedMood, setSelectedMood] = useState(7)
  const [showInsight, setShowInsight] = useState(false)
  const [demoStep, setDemoStep] = useState<'mood' | 'insight' | 'chart'>('mood')

  const selectedMoodData = moodEmojis.find(m => m.score === selectedMood)
  
  const handleMoodChange = (newMood: number) => {
    setSelectedMood(newMood)
    setShowInsight(false)
    setDemoStep('mood')
  }

  const generateInsight = () => {
    setShowInsight(true)
    setDemoStep('insight')
  }

  const showChart = () => {
    setDemoStep('chart')
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
          <span className="text-4xl">🎯</span>
          Try DailyMood AI Now
        </h3>
        <p className="text-gray-600 text-lg">
          Experience how our AI transforms mood tracking into actionable insights
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Left: Interactive Mood Selector */}
        <div className="space-y-6">
          <div className="text-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedMood}
                initial={{ scale: 0.8, opacity: 0, rotateY: -90 }}
                animate={{ scale: 1, opacity: 1, rotateY: 0 }}
                exit={{ scale: 0.8, opacity: 0, rotateY: 90 }}
                transition={{ duration: 0.4 }}
                className={`inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br ${selectedMoodData?.color} rounded-full shadow-lg mb-4`}
              >
                <span className="text-4xl">{selectedMoodData?.emoji}</span>
              </motion.div>
            </AnimatePresence>
            <div className="text-2xl font-bold text-gray-800 mb-1">
              {selectedMoodData?.label}
            </div>
            <div className="text-lg text-gray-600">
              {selectedMood}/10
            </div>
          </div>

          {/* Mood Slider */}
          <div className="px-4">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>😢 Low</span>
              <span>😐 Neutral</span>
              <span>🥳 High</span>
            </div>
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                value={selectedMood}
                onChange={(e) => handleMoodChange(Number(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-red-200 via-yellow-200 to-green-200 rounded-full outline-none appearance-none cursor-pointer"
                style={{ 
                  background: `linear-gradient(to right, #EF4444 0%, #F59E0B 50%, #10B981 100%)`
                }}
              />
            </div>
          </div>

          {/* Demo Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={generateInsight}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-[1.02]"
            >
              <Brain className="w-5 h-5" />
              Get AI Insight
            </button>
            <button
              onClick={showChart}
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-[1.02]"
            >
              <TrendingUp className="w-5 h-5" />
              View Trends
            </button>
          </div>
        </div>

        {/* Right: Dynamic Content */}
        <div className="bg-gray-50 rounded-xl p-6 min-h-[300px] flex flex-col">
          <AnimatePresence mode="wait">
            {demoStep === 'mood' && (
              <motion.div
                key="mood-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="text-center space-y-4 flex-1 flex flex-col justify-center"
              >
                <div className="text-6xl mb-4">🎯</div>
                <h4 className="text-xl font-semibold text-gray-800">
                  Slide to Set Your Mood
                </h4>
                <p className="text-gray-600">
                  Move the slider to reflect how you're feeling right now. Our AI will provide personalized insights based on your mood.
                </p>
              </motion.div>
            )}

            {demoStep === 'insight' && (
              <motion.div
                key="insight-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">AI Insight</h4>
                </div>
                <div className="bg-white rounded-lg p-4 border-l-4 border-purple-500">
                  <p className="text-gray-700 leading-relaxed">
                    {demoInsights[selectedMood as keyof typeof demoInsights]}
                  </p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4 mt-4">
                  <h5 className="font-semibold text-blue-800 mb-2">💡 Personalized Tip:</h5>
                  <p className="text-blue-700 text-sm">
                    {personalizedTips[selectedMood as keyof typeof personalizedTips]}
                  </p>
                </div>
              </motion.div>
            )}

            {demoStep === 'chart' && (
              <motion.div
                key="chart-step"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-800">Mood Trends</h4>
                </div>
                
                {/* Mock Chart */}
                <div className="bg-white rounded-lg p-4">
                  <div className="flex items-end justify-between h-32 gap-2">
                    {[6, 4, 7, 5, 8, selectedMood, 9].map((mood, i) => (
                      <div key={i} className="flex-1 flex flex-col items-center">
                        <div
                          className={`bg-gradient-to-t ${moodEmojis[mood - 1]?.color} rounded-t-lg w-full transition-all duration-500`}
                          style={{ height: `${mood * 12}px` }}
                        />
                        <span className="text-xs text-gray-500 mt-2">
                          {i === 6 ? 'Today' : `${7-i}d ago`}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="bg-green-50 rounded-lg p-4">
                  <h5 className="font-semibold text-green-800 mb-2">📈 Your Progress:</h5>
                  <p className="text-green-700 text-sm">
                    Great news! Your mood has improved 15% this week. Keep up the positive momentum!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Call-to-Action */}
      <div className="mt-8 text-center">
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-100">
          <p className="text-lg font-semibold text-purple-900 mb-3">
            Ready to track your real mood journey?
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.02]"
            >
              Start Free Trial →
            </a>
            <a
              href="/pricing"
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              View Pricing
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
