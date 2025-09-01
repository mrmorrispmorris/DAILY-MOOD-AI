'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface NavigationProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function DaylioStyleNavigation({ activeTab, onTabChange }: NavigationProps) {
  const tabs = [
    { 
      id: 'today', 
      label: 'Today', 
      icon: '📝',
      description: 'Log your mood'
    },
    { 
      id: 'calendar', 
      label: 'Calendar', 
      icon: '📅',
      description: 'View patterns'
    },
    { 
      id: 'statistics', 
      label: 'Statistics', 
      icon: '📊',
      description: 'Analyze data'
    },
    { 
      id: 'insights', 
      label: 'AI Coach', 
      icon: '🤖',
      description: 'Get guidance'
    },
    { 
      id: 'backup', 
      label: 'Backup', 
      icon: '☁️',
      description: 'Save data'
    }
  ]

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm border-t border-gray-700 sticky bottom-0 z-10">
      <div className="max-w-md mx-auto">
        <div className="flex justify-around py-3">
          {tabs.map((tab) => (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center px-3 py-2 rounded-xl transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-cyan-500/20 text-cyan-300'
                  : 'text-gray-400 hover:text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <div className="text-2xl mb-1">{tab.icon}</div>
              <div className="text-xs font-medium">{tab.label}</div>
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-cyan-400 rounded-full"
                />
              )}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  )
}

