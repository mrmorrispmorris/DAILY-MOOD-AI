'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import BelovedMoody from '@/app/components/avatar/BelovedMoody'
import DaylioStyleNavigation from '@/app/components/navigation/DaylioStyleNavigation'
import EnhancedMoodEntry from '@/app/components/premium/EnhancedMoodEntry'
import MultipleEntriesPerDay from '@/app/components/premium/MultipleEntriesPerDay'
import MonthlyCalendarView from '@/app/components/premium/MonthlyCalendarView'
import ActivityMoodCorrelation from '@/app/components/premium/ActivityMoodCorrelation'
import DataExporter from '@/app/components/premium/DataExporter'
import CloudBackupManager from '@/app/components/premium/CloudBackupManager'
import AIInsights from '@/app/components/ai/AIInsights'
import AIFollowUp from '@/app/components/ai/AIFollowUp'

interface SimplifiedDashboardProps {
  user: any
  moods: any[]
  stats: any
  onMoodSave: (mood: number, notes: string, activities: string[], photos: string[]) => void
  onRefresh: () => void
}

export default function SimplifiedDashboard({ 
  user, 
  moods, 
  stats, 
  onMoodSave, 
  onRefresh 
}: SimplifiedDashboardProps) {
  const [activeTab, setActiveTab] = useState('today')

  const renderTabContent = () => {
    switch (activeTab) {
      case 'today':
        return (
          <div className="space-y-8">
            {/* Welcome Section with Beloved Moody */}
            <div className="text-center">
              <div className="mb-6">
                <BelovedMoody 
                  mood={stats.average}
                  userName={user.email.split('@')[0]}
                  recentActivity={moods[0]?.activities?.[0] || 'none'}
                  streakDays={moods.length}
                  size="large"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-white mb-2">
                How are you feeling today? 💙
              </h2>
              <p className="text-cyan-300 mb-6">
                Moody is here to support you on your wellness journey
              </p>
              
              {/* Quick Stats */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-cyan-400">{moods.length}</div>
                  <div className="text-xs text-gray-400">Entries</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-purple-400">{stats.average.toFixed(1)}</div>
                  <div className="text-xs text-gray-400">Average</div>
                </div>
                <div className="bg-gray-800/50 rounded-xl p-3 border border-gray-700">
                  <div className="text-2xl font-bold text-pink-400">{stats.streak}</div>
                  <div className="text-xs text-gray-400">Streak</div>
                </div>
              </div>
            </div>

            {/* Mood Entry */}
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <EnhancedMoodEntry onMoodSave={onMoodSave} />
            </div>

            {/* Today's Entries */}
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <MultipleEntriesPerDay 
                userId={user.id}
                onEntryAdded={onRefresh}
                onEntryUpdated={onRefresh}
                onEntryDeleted={onRefresh}
              />
            </div>
          </div>
        )

      case 'calendar':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">📅 Your Mood Journey</h2>
              <p className="text-cyan-300">Visualize your emotional patterns over time</p>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <MonthlyCalendarView userId={user.id} />
            </div>
          </div>
        )

      case 'statistics':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">📊 Mood Analytics</h2>
              <p className="text-cyan-300">Discover what makes you happy</p>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <ActivityMoodCorrelation userId={user.id} />
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <DataExporter userId={user.id} />
            </div>
          </div>
        )

      case 'insights':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">🤖 AI Mood Coach</h2>
              <p className="text-cyan-300">Personalized guidance just for you</p>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <AIInsights moods={moods} userTier="premium" />
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <AIFollowUp 
                moods={moods}
                userTier="premium"
                onActionTaken={(action) => console.log('AI Action:', action)}
              />
            </div>
          </div>
        )

      case 'backup':
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-2">☁️ Data Protection</h2>
              <p className="text-cyan-300">Keep your mood data safe and secure</p>
            </div>
            <div className="bg-gray-800/30 rounded-2xl p-6 border border-gray-700">
              <CloudBackupManager userId={user.id} />
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-indigo-900 to-purple-900">
      {/* Header */}
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-20">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center">
                <span className="text-white font-bold text-lg">🦉</span>
              </div>
              <div>
                <h1 className="text-lg font-bold text-white">Moody AI</h1>
                <p className="text-xs text-cyan-300">Your Beloved Companion</p>
              </div>
            </div>
            <button className="text-cyan-400 hover:text-cyan-300 transition-colors">
              <span className="text-sm">👋 {user.email.split('@')[0]}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-md mx-auto px-4 py-6 pb-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderTabContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Navigation */}
      <DaylioStyleNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
      />
    </div>
  )
}

