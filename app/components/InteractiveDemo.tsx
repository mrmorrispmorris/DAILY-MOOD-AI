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
  1: "Our AI has identified 12 specific strategies for low-mood recovery, including personalized breathing patterns and custom support networks. Unlock your full analysis →",
  2: "Advanced pattern matching shows 8 proven mood-lifting techniques tailored to your profile, plus emergency support protocols. Get complete plan →",
  3: "Premium members receive detailed mood intervention strategies, including timing optimization and personalized activity sequences. See full recommendations →", 
  4: "Unlock 15+ customized mood enhancement techniques based on your unique patterns, sleep data, and lifestyle factors. Upgrade for complete analysis →",
  5: "Get your personalized 'Mood Boost Protocol' with 10 targeted strategies, optimal timing, and progress tracking. Premium features available →",
  6: "Access your custom 'Feel-Good Amplifier Plan' with social strategies, activity recommendations, and mood maintenance protocols. Unlock full insights →",
  7: "Premium analysis reveals your optimal 'High Mood Sustainability Plan' with energy management and peak performance strategies. Get complete roadmap →",
  8: "Unlock advanced 'Excellence Optimization Protocol' with goal-setting frameworks and productivity maximization techniques. Premium analysis available →",
  9: "Get your personalized 'Peak State Management System' with energy channeling strategies and impact amplification methods. Unlock full potential →",
  10: "Access elite 'Positivity Leadership Protocol' with influence strategies and sustainable happiness frameworks. Premium coaching available →"
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
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 mt-4 border-2 border-purple-200 relative overflow-hidden">
                  <div className="absolute top-2 right-2">
                    <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                      🔒 PREMIUM
                    </span>
                  </div>
                  <h5 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
                    <span className="text-lg">🎯</span> 
                    AI-Powered Personalized Plan:
                  </h5>
                  <p className="text-purple-700 text-sm leading-relaxed">
                    {personalizedTips[selectedMood as keyof typeof personalizedTips]}
                  </p>
                  <div className="mt-3 pt-3 border-t border-purple-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-purple-600 font-medium">
                        ✨ Full Analysis Available
                      </span>
                      <button 
                        onClick={() => window.location.href = '/signup'}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs font-bold px-3 py-1 rounded-full hover:from-purple-700 hover:to-pink-700 transition-all"
                      >
                        Start Free Trial
                      </button>
                    </div>
                  </div>
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
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border-2 border-purple-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full opacity-10 transform translate-x-8 -translate-y-8"></div>
          
          <div className="mb-4">
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-bold px-3 py-1 rounded-full">
              🎯 UNLOCK FULL POWER
            </span>
          </div>
          
          <h4 className="text-2xl font-bold text-purple-900 mb-2">
            Get Your Complete AI Analysis
          </h4>
          <p className="text-purple-700 mb-4">
            This was just a preview! Get personalized mood protocols, detailed trend analysis, and custom intervention strategies tailored exactly to your patterns.
          </p>
          
          <div className="grid md:grid-cols-3 gap-3 mb-6 text-sm">
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="font-semibold text-purple-800">🧠 Custom AI Plans</div>
              <div className="text-purple-600">Personalized for your unique patterns</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="font-semibold text-purple-800">📊 Advanced Analytics</div>
              <div className="text-purple-600">Deep insights + predictive analysis</div>
            </div>
            <div className="bg-white rounded-lg p-3 border border-purple-200">
              <div className="font-semibold text-purple-800">🎯 Action Protocols</div>
              <div className="text-purple-600">Step-by-step mood optimization</div>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <a
              href="/signup"
              className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-[1.05] shadow-lg"
            >
              Start FREE 14-Day Trial →
            </a>
            <a
              href="/pricing"
              className="px-6 py-3 border-2 border-purple-600 text-purple-600 rounded-xl font-semibold hover:bg-purple-50 transition-colors"
            >
              View Plans
            </a>
          </div>
          
          <p className="text-purple-600 text-xs mt-3">
            ✅ No credit card required • ✅ Cancel anytime • ✅ Full access during trial
          </p>
        </div>
      </div>
    </div>
  )
}
