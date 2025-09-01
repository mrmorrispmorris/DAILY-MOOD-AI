'use client'

import Link from 'next/link'
import { LogoWithText } from '@/components/Logo'
import InteractiveDemo from '@/app/components/InteractiveDemo'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  SparklesIcon, 
  ChartBarIcon, 
  HeartIcon,
  ShieldCheckIcon,
  BellAlertIcon,
  ArrowTrendingUpIcon,
  ArrowRightIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function LandingPage() {
  const [currentMood, setCurrentMood] = useState(5)
  const [pulseAnimation, setPulseAnimation] = useState(false)

  // Haptic feedback for mobile
  const triggerHaptic = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(10) // Light haptic feedback
    }
  }

  return (
    <>
      {/* NEW HERO SECTION */}
      <section className="bg-gradient-to-br from-purple-50 via-white to-blue-50 overflow-hidden py-16">
        <div className="max-w-7xl mx-auto px-4">
          
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute top-20 left-10 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                rotate: [360, 180, 0],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: "linear"
              }}
              className="absolute bottom-20 right-10 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30"
            />
          </div>

          {/* Navigation - Keep existing */}
          <nav className="relative z-10 flex justify-between items-center mb-16">
            <LogoWithText />
            <div className="flex items-center space-x-6">
              <Link href="/free-vs-premium" className="text-gray-700 hover:text-purple-600 transition font-medium">Free vs Premium</Link>
              <Link href="/features" className="text-gray-700 hover:text-purple-600 transition font-medium">Features</Link>
              <Link href="/blog" className="text-gray-700 hover:text-purple-600 transition font-medium">Blog</Link>
              <Link href="/login" className="text-gray-700 hover:text-purple-600 transition font-medium">Login</Link>
              <Link href="/working-auth" className="px-6 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full font-semibold hover:shadow-lg transition-all">
                Try Demo
              </Link>
            </div>
          </nav>

          {/* NEW Hero Content */}
          <div className="relative z-10 text-center max-w-4xl mx-auto py-12">
            
            {/* Animated Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-medium mb-6"
            >
              <SparklesIcon className="w-4 h-4" />
              AI-Powered Mental Wellness
              <SparklesIcon className="w-4 h-4" />
            </motion.div>

            {/* Main Headline with Problem Statement */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl md:text-6xl font-bold mb-6"
            >
              <span className="text-gray-900">Your Mental Health Deserves</span>
              <br />
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                More Than Just Tracking
              </span>
            </motion.h1>

            {/* Clear Value Proposition */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 max-w-2xl mx-auto mb-8"
            >
              DailyMood AI doesn&apos;t just log your feelings—it understands them. 
              Using advanced AI, we identify patterns, predict mood changes, 
              and provide personalized strategies to improve your mental wellness.
            </motion.p>

            {/* Key Benefits List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto mb-8"
            >
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span>Predict mood patterns</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span>Personalized insights</span>
              </div>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-700">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
                <span>Science-backed strategies</span>
              </div>
            </motion.div>

            {/* Interactive CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
            >
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerHaptic}
                className="group px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-full font-semibold text-lg shadow-lg hover:shadow-xl transition-all"
              >
                <Link href="/signup" className="flex items-center justify-center gap-2">
                  Start Free for 14 Days
                  <ArrowRightIcon className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Link>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={triggerHaptic}
                className="px-8 py-4 border-2 border-green-600 text-green-600 rounded-full font-semibold text-lg hover:bg-green-50 transition-all"
              >
                <Link href="/working-auth">
                  🎭 Try Avatar System Now
                </Link>
              </motion.button>
            </motion.div>

            {/* Social Proof */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-wrap justify-center items-center gap-8 text-sm text-gray-600"
            >
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 border-2 border-white" />
                  ))}
                </div>
                <span>10,000+ active users</span>
              </div>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(i => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="text-yellow-400 text-xl"
                  >
                    ★
                  </motion.span>
                ))}
                <span className="ml-2">4.9/5 rating</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}  
      <section id="how-it-works" className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How DailyMood AI Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Three simple steps to better mental health
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Track Your Mood Daily",
                description: "Spend 30 seconds logging how you feel with our intuitive mood slider. Add context with activities, weather, and notes.",
                icon: HeartIcon,
                color: "from-purple-500 to-purple-600"
              },
              {
                step: "2",
                title: "AI Analyzes Patterns",
                description: "Our AI examines your mood history to identify triggers, patterns, and correlations you might miss.",
                icon: ChartBarIcon,
                color: "from-blue-500 to-blue-600"
              },
              {
                step: "3",
                title: "Get Personalized Insights",
                description: "Receive actionable recommendations tailored to your unique patterns and proven strategies to improve your wellbeing.",
                icon: SparklesIcon,
                color: "from-green-500 to-green-600"
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.2 }}
                whileHover={{ y: -10 }}
                className="relative"
              >
                <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all p-8">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8">
                    <div className={`w-8 h-8 bg-gradient-to-r ${item.color} rounded-full flex items-center justify-center text-white font-bold`}>
                      {item.step}
                    </div>
                  </div>
                  
                  {/* Icon */}
                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 4,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className={`w-16 h-16 bg-gradient-to-r ${item.color} rounded-2xl flex items-center justify-center mb-6 mt-4`}
                  >
                    <item.icon className="w-8 h-8 text-white" strokeWidth={1.5} />
                  </motion.div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {item.title}
                  </h3>
                  <p className="text-gray-600">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
                   {/* Interactive Demo section */}
             <section id="demo" className="py-16 bg-gray-50">
               <div className="max-w-6xl mx-auto px-4">
                 <div className="text-center mb-12">
                   <h2 className="text-3xl font-bold text-gray-900 mb-4">
                     See DailyMood AI in Action
                   </h2>
                   <p className="text-xl text-gray-600">
                     Experience how our AI transforms your mood data into actionable insights
                   </p>
                 </div>
                 
                 {/* Interactive Demo Component */}
                 <InteractiveDemo />
               </div>
             </section>
      
      {/* BENEFITS SECTION */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why 10,000+ People Choose DailyMood AI
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Real benefits that transform your mental wellness journey
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: ArrowTrendingUpIcon,
                title: "Predict Mood Changes",
                description: "Our AI identifies patterns and warns you before low moods hit, helping you take preventive action.",
                stat: "87% accuracy"
              },
              {
                icon: BellAlertIcon,
                title: "Smart Notifications",
                description: "Get gentle reminders at optimal times based on your patterns, not random schedules.",
                stat: "3x more effective"
              },
              {
                icon: ChartBarIcon,
                title: "Correlation Discovery",
                description: "Uncover hidden connections between activities, weather, sleep, and your mood.",
                stat: "45+ factors analyzed"
              },
              {
                icon: HeartIcon,
                title: "Personalized Strategies",
                description: "Receive evidence-based recommendations tailored to your unique patterns.",
                stat: "92% find helpful"
              },
              {
                icon: ShieldCheckIcon,
                title: "Complete Privacy",
                description: "Your data is encrypted and never shared. You own your mental health journey.",
                stat: "HIPAA compliant"
              },
              {
                icon: SparklesIcon,
                title: "AI Therapist Assistant",
                description: "Get 24/7 support with empathetic AI that understands your history and context.",
                stat: "Always available"
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <benefit.icon className="w-6 h-6 text-purple-600" strokeWidth={1.5} />
                    </div>
                  </div>
                  <div className="flex-grow">
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {benefit.title}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      {benefit.description}
                    </p>
                    <div className="inline-flex items-center gap-1 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                      <CheckCircleIcon className="w-3 h-3" />
                      {benefit.stat}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      
      {/* Features section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Why Choose DailyMood AI?
          </h2>
          <p className="text-xl text-gray-600 mb-12">
            The most intelligent mood tracking experience
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 bg-purple-50 rounded-xl">
              <div className="text-4xl mb-4">🤖</div>
              <h3 className="font-bold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600">Advanced analytics and personalized recommendations</p>
            </div>
            <div className="p-6 bg-pink-50 rounded-xl">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="font-bold mb-2">Beautiful Charts</h3>
              <p className="text-gray-600">Visualize your emotional journey with stunning graphics</p>
            </div>
            <div className="p-6 bg-blue-50 rounded-xl">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="font-bold mb-2">Privacy First</h3>
              <p className="text-gray-600">Your data stays secure and completely private</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Mental Health?
          </h2>
          <p className="text-xl text-purple-100 mb-8">
            Join thousands of users who have improved their emotional wellbeing with DailyMood AI
          </p>
          <Link 
            href="/signup"
            className="inline-block px-12 py-4 bg-white text-purple-600 rounded-lg font-bold text-lg hover:bg-gray-100 transition shadow-lg"
          >
            Start Your Free Trial Today
          </Link>
          <p className="text-purple-200 text-sm mt-4">
            No commitment • Cancel anytime • Free for 14 days
          </p>
        </div>
      </section>
    </>
  )
}