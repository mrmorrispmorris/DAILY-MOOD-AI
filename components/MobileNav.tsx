'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Home, BarChart3, Settings, Menu, X, Plus } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40">
        <div className="grid grid-cols-4 py-2">
          <Link href="/dashboard" className="flex flex-col items-center py-2">
            <Home className="w-6 h-6 text-gray-600" />
            <span className="text-xs mt-1">Home</span>
          </Link>
          
          <button 
            onClick={() => window.location.href = '/log-mood'}
            className="flex flex-col items-center py-2"
          >
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center -mt-6 shadow-lg">
              <Plus className="w-6 h-6 text-white" />
            </div>
            <span className="text-xs mt-1">Log Mood</span>
          </button>
          
          <Link href="/dashboard/analytics" className="flex flex-col items-center py-2">
            <BarChart3 className="w-6 h-6 text-gray-600" />
            <span className="text-xs mt-1">Analytics</span>
          </Link>
          
          <Link href="/dashboard/settings" className="flex flex-col items-center py-2">
            <Settings className="w-6 h-6 text-gray-600" />
            <span className="text-xs mt-1">Settings</span>
          </Link>
        </div>
      </div>

      {/* Mobile Header Menu */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-40">
        <div className="flex justify-between items-center p-4">
          <Link href="/dashboard" className="font-bold text-xl">
            DailyMood AI
          </Link>
          
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="md:hidden fixed inset-0 bg-white z-50"
          >
            <div className="p-4">
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4"
              >
                <X className="w-6 h-6" />
              </button>
              
              <nav className="mt-12 space-y-4">
                <Link
                  href="/dashboard"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 text-lg font-medium hover:bg-gray-50 rounded-lg"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard/analytics"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 text-lg font-medium hover:bg-gray-50 rounded-lg"
                >
                  Analytics
                </Link>
                <Link
                  href="/dashboard/settings"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 text-lg font-medium hover:bg-gray-50 rounded-lg"
                >
                  Settings
                </Link>
                <Link
                  href="/pricing"
                  onClick={() => setIsOpen(false)}
                  className="block py-3 px-4 text-lg font-medium text-purple-600 hover:bg-purple-50 rounded-lg"
                >
                  Upgrade to Premium
                </Link>
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

