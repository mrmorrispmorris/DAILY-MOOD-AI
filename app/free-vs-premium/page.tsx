'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  CheckCircleIcon, 
  XMarkIcon,
  SparklesIcon,
  ChartBarIcon,
  BellAlertIcon,
  CameraIcon,
  CloudArrowUpIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline'

export default function FreeVsPremiumPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-6xl mx-auto px-4 py-12">
        
        {/* Header */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl font-bold text-gray-900 mb-4"
          >
            Free vs Premium: Choose Your AI Journey
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-gray-600 max-w-2xl mx-auto"
          >
            Both tiers help improve your mental wellness, but Premium unlocks the full power of AI-driven insights
          </motion.p>
        </div>

        {/* Comparison Cards */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* Free Tier */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-3xl shadow-xl border-2 border-gray-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-8 text-center">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Free Tier</h2>
              <p className="text-gray-600 mb-4">Perfect for getting started with mood tracking</p>
              <div className="text-4xl font-bold text-gray-700">$0</div>
              <div className="text-sm text-gray-500">Forever free</div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">What you get:</h3>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />}
                  text="Basic mood tracking (1-10 scale)"
                  included={true}
                />
                <FeatureItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />}
                  text="Simple notes for each entry"
                  included={true}
                />
                <FeatureItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />}
                  text="Basic calendar view"
                  included={true}
                />
                <FeatureItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />}
                  text="Simple statistics (average, streak)"
                  included={true}
                />
                <FeatureItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />}
                  text="Cute avatar companion"
                  included={true}
                />
                <FeatureItem 
                  icon={<CheckCircleIcon className="w-5 h-5" />}
                  text="Basic AI insights (3 per day)"
                  included={true}
                />
                <FeatureItem 
                  icon={<XMarkIcon className="w-5 h-5" />}
                  text="Advanced AI pattern recognition"
                  included={false}
                />
                <FeatureItem 
                  icon={<XMarkIcon className="w-5 h-5" />}
                  text="Activity correlation analysis"
                  included={false}
                />
                <FeatureItem 
                  icon={<XMarkIcon className="w-5 h-5" />}
                  text="Predictive mood alerts"
                  included={false}
                />
                <FeatureItem 
                  icon={<XMarkIcon className="w-5 h-5" />}
                  text="Personalized AI coaching"
                  included={false}
                />
              </div>

              <div className="mt-8 p-6 bg-green-50 rounded-xl border border-green-200">
                <h4 className="font-bold text-green-800 mb-2">🌱 How Free Tier Helps You:</h4>
                <ul className="text-green-700 text-sm space-y-1">
                  <li>• Build a mood tracking habit</li>
                  <li>• Identify basic emotional patterns</li>
                  <li>• Get gentle AI encouragement</li>
                  <li>• See your mood trends over time</li>
                  <li>• Start your mental wellness journey</li>
                </ul>
              </div>

              <Link href="/working-auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-gray-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-700 transition-colors"
                >
                  Try Free Forever
                </motion.button>
              </Link>
            </div>
          </motion.div>

          {/* Premium Tier */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl shadow-2xl border-2 border-purple-400 overflow-hidden relative"
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-purple-600 text-white px-6 py-2 rounded-full font-bold text-sm">
                🔥 MOST POPULAR
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-center">
              <h2 className="text-3xl font-bold text-white mb-2">Premium AI</h2>
              <p className="text-purple-100 mb-4">Unlock your full mental wellness potential</p>
              <div className="text-4xl font-bold text-white">$9.99</div>
              <div className="text-sm text-purple-100">per month</div>
            </div>

            <div className="p-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Everything in Free, plus:</h3>
              
              <div className="space-y-4">
                <FeatureItem 
                  icon={<SparklesIcon className="w-5 h-5 text-purple-600" />}
                  text="Advanced AI pattern recognition"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<ChartBarIcon className="w-5 h-5 text-purple-600" />}
                  text="Activity correlation analysis"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<BellAlertIcon className="w-5 h-5 text-purple-600" />}
                  text="Predictive mood alerts & interventions"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<AcademicCapIcon className="w-5 h-5 text-purple-600" />}
                  text="Personalized AI coaching (unlimited)"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<CameraIcon className="w-5 h-5 text-purple-600" />}
                  text="Photo attachments for entries"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<CloudArrowUpIcon className="w-5 h-5 text-purple-600" />}
                  text="Cloud sync across devices"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<ShieldCheckIcon className="w-5 h-5 text-purple-600" />}
                  text="Advanced privacy controls"
                  included={true}
                  premium={true}
                />
                <FeatureItem 
                  icon={<UserGroupIcon className="w-5 h-5 text-purple-600" />}
                  text="Share insights with therapist/coach"
                  included={true}
                  premium={true}
                />
              </div>

              <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                <h4 className="font-bold text-purple-800 mb-2">🚀 How Premium AI Transforms Your Life:</h4>
                <ul className="text-purple-700 text-sm space-y-1">
                  <li>• <strong>Predict</strong> mood drops 2-3 days before they happen</li>
                  <li>• <strong>Discover</strong> which activities boost your mood most</li>
                  <li>• <strong>Receive</strong> personalized interventions during tough times</li>
                  <li>• <strong>Optimize</strong> your daily routine for peak mental health</li>
                  <li>• <strong>Track</strong> correlation with sleep, weather, social interactions</li>
                  <li>• <strong>Get</strong> 24/7 AI coaching tailored to your unique patterns</li>
                </ul>
              </div>

              <Link href="/working-auth">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full mt-6 bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-xl transition-all"
                >
                  Start 14-Day Free Trial
                </motion.button>
              </Link>
              <p className="text-center text-sm text-gray-500 mt-3">
                Cancel anytime. No commitment.
              </p>
            </div>
          </motion.div>
        </div>

        {/* Value Demonstration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-3xl p-12 text-white text-center"
        >
          <h2 className="text-3xl font-bold mb-6">Why AI-Powered Mood Tracking Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <div className="text-4xl mb-4">🧠</div>
              <h3 className="text-xl font-bold mb-2">Pattern Recognition</h3>
              <p className="text-indigo-100">AI spots patterns humans miss - like how weather affects your mood or which social activities energize you most.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold mb-2">Personalized Actions</h3>
              <p className="text-indigo-100">Get specific, personalized recommendations based on what actually works for YOUR unique mind and lifestyle.</p>
            </div>
            <div>
              <div className="text-4xl mb-4">🚨</div>
              <h3 className="text-xl font-bold mb-2">Early Intervention</h3>
              <p className="text-indigo-100">Premium AI predicts mood drops before they happen, giving you time to take preventive action.</p>
            </div>
          </div>
        </motion.div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <Link href="/working-auth">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-12 py-4 rounded-full font-bold text-xl shadow-xl hover:shadow-2xl transition-all"
            >
              🎭 Try Your AI Companion Now
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  )
}

interface FeatureItemProps {
  icon: React.ReactNode
  text: string
  included: boolean
  premium?: boolean
}

function FeatureItem({ icon, text, included, premium = false }: FeatureItemProps) {
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-shrink-0 ${
        included 
          ? premium 
            ? 'text-purple-600' 
            : 'text-green-600'
          : 'text-gray-400'
      }`}>
        {icon}
      </div>
      <span className={`${
        included 
          ? premium
            ? 'text-gray-800 font-medium'
            : 'text-gray-700'
          : 'text-gray-400'
      }`}>
        {text}
      </span>
      {premium && (
        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-bold">
          AI
        </span>
      )}
    </div>
  )
}

