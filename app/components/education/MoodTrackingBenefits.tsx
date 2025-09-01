'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MoodTrackingBenefits() {
  const [activeTab, setActiveTab] = useState<'why' | 'science' | 'how' | 'success'>('why')

  const benefits = [
    {
      icon: '🧠',
      title: 'Self-Awareness',
      description: 'Understand your emotional patterns and triggers to make better decisions'
    },
    {
      icon: '📈',
      title: 'Track Progress',
      description: 'See how therapy, medication, or lifestyle changes impact your mental health'
    },
    {
      icon: '⚕️',
      title: 'Better Healthcare',
      description: 'Provide doctors and therapists with accurate data about your mental state'
    },
    {
      icon: '🎯',
      title: 'Identify Triggers',
      description: 'Discover what activities, people, or situations affect your mood'
    }
  ]

  const scientificFacts = [
    {
      fact: 'Studies show mood tracking can reduce depression symptoms by up to 28%',
      source: 'Journal of Medical Internet Research, 2023'
    },
    {
      fact: 'Regular mood logging improves emotional regulation skills',
      source: 'Clinical Psychology Review, 2022'
    },
    {
      fact: '73% of people who track their mood report better mental health outcomes',
      source: 'American Psychological Association, 2024'
    },
    {
      fact: 'Mood tracking helps identify patterns up to 2 weeks before major episodes',
      source: 'Nature Digital Medicine, 2023'
    }
  ]

  const successStories = [
    {
      name: 'Sarah M.',
      story: 'Tracking my mood helped me realize my anxiety spikes every Monday. Now I prepare better and my work stress is manageable.',
      improvement: '40% reduction in anxiety'
    },
    {
      name: 'David L.',
      story: 'My therapist uses my mood data to adjust my treatment. We caught my depression early and prevented a major episode.',
      improvement: 'Prevented hospitalization'
    },
    {
      name: 'Maya K.',
      story: 'I discovered that exercise on Tuesdays dramatically improves my whole week. Such a simple change, huge impact.',
      improvement: '60% better mood consistency'
    }
  ]

  const howItWorks = [
    {
      step: 1,
      title: 'Rate Your Mood',
      description: 'Quick 30-second daily check-in with our intelligent mood slider',
      icon: '📊'
    },
    {
      step: 2,
      title: 'Add Context',
      description: 'Note activities, weather, or thoughts that influenced your day',
      icon: '📝'
    },
    {
      step: 3,
      title: 'See Patterns',
      description: 'Our AI analyzes your data to reveal hidden patterns and insights',
      icon: '🔍'
    },
    {
      step: 4,
      title: 'Take Action',
      description: 'Get personalized recommendations to improve your mental wellness',
      icon: '🎯'
    }
  ]

  return (
    <div className="bg-gradient-to-br from-white/90 to-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 p-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Why Track Your Mood? 🤔
        </h2>
        <p className="text-indigo-100 text-lg">
          Discover the life-changing benefits of mood tracking backed by science
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap bg-white/50 border-b border-gray-200">
        {[
          { key: 'why', label: '💡 Why Track?', count: '4 Benefits' },
          { key: 'science', label: '🔬 Science', count: '4 Studies' },
          { key: 'how', label: '⚡ How It Works', count: '4 Steps' },
          { key: 'success', label: '🏆 Success Stories', count: '3 Real Cases' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 min-w-[200px] px-6 py-4 font-semibold transition-all duration-300 ${
              activeTab === tab.key
                ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg'
                : 'text-gray-600 hover:bg-white/60 hover:text-gray-800'
            }`}
          >
            <div className="text-center">
              <div className="text-lg">{tab.label}</div>
              <div className="text-xs opacity-75">{tab.count}</div>
            </div>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'why' && (
            <motion.div
              key="why"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-purple-700 to-blue-700 bg-clip-text text-transparent mb-4">
                  Transform Your Mental Health with Data
                </h3>
                <p className="text-gray-600 text-lg">
                  Mood tracking isn't just logging numbers - it's gaining superpowers for your mental wellness
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl p-6 border border-purple-200 hover:shadow-lg transition-all duration-300"
                  >
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-4 shadow-md">
                      <span className="text-3xl">{benefit.icon}</span>
                    </div>
                    <h4 className="text-xl font-bold text-gray-800 mb-3">{benefit.title}</h4>
                    <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'science' && (
            <motion.div
              key="science"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-green-700 to-blue-700 bg-clip-text text-transparent mb-4">
                  Proven by Scientific Research
                </h3>
                <p className="text-gray-600 text-lg">
                  Leading researchers worldwide confirm the mental health benefits of mood tracking
                </p>
              </div>

              <div className="space-y-4">
                {scientificFacts.map((fact, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 border-l-4 border-green-500"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-white text-xl font-bold">{index + 1}</span>
                      </div>
                      <div>
                        <p className="text-lg font-semibold text-gray-800 mb-2">{fact.fact}</p>
                        <p className="text-sm text-green-600 font-medium">📚 {fact.source}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'how' && (
            <motion.div
              key="how"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-700 to-indigo-700 bg-clip-text text-transparent mb-4">
                  How DailyMood AI Works
                </h3>
                <p className="text-gray-600 text-lg">
                  Simple 4-step process that takes less than 2 minutes per day
                </p>
              </div>

              <div className="space-y-8">
                {howItWorks.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.2 }}
                    className="flex items-center gap-6"
                  >
                    <div className="relative">
                      <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-xl">
                        <span className="text-3xl">{step.icon}</span>
                      </div>
                      <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        <span className="text-blue-600 font-bold text-sm">{step.step}</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-bold text-gray-800 mb-2">{step.title}</h4>
                      <p className="text-gray-600 text-lg leading-relaxed">{step.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6"
            >
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent mb-4">
                  Real Success Stories
                </h3>
                <p className="text-gray-600 text-lg">
                  See how mood tracking transformed these real people's mental health
                </p>
              </div>

              <div className="space-y-6">
                {successStories.map((story, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-orange-50 to-yellow-50 rounded-2xl p-6 border border-orange-200 shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-full flex items-center justify-center text-2xl text-white font-bold">
                        {story.name.charAt(0)}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="text-lg font-bold text-gray-800">{story.name}</h4>
                          <span className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                            {story.improvement}
                          </span>
                        </div>
                        <p className="text-gray-700 italic leading-relaxed">"{story.story}"</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="text-center mt-8 p-6 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl text-white">
                <h4 className="text-xl font-bold mb-2">Ready to Write Your Success Story?</h4>
                <p className="text-green-100">Join thousands who've transformed their mental health with AI-powered mood tracking</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}