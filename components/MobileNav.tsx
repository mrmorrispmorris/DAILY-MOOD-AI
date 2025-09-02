'use client'

import { useState } from 'react'
import Link from 'next/link'
// Using elegant symbols instead of Lucide icons for consistency
import { motion, AnimatePresence } from 'framer-motion'

interface MenuItemProps {
  icon: string
  iconBg: string
  title: string
  subtitle?: string
  href: string
  onClick: () => void
}

function MenuItem({ icon, iconBg, title, subtitle, href, onClick }: MenuItemProps) {
  return (
    <Link href={href} onClick={onClick} className="block">
      <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: iconBg }}>
            <span className="text-lg">{icon}</span>
          </div>
          <span className="text-lg font-medium">{title}</span>
        </div>
        <div className="flex items-center space-x-2">
          {subtitle && (
            <span className="text-sm text-gray-500">{subtitle}</span>
          )}
          <span className="text-gray-400">›</span>
        </div>
      </div>
    </Link>
  )
}

export default function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Mobile Bottom Navigation */}
      {/* Professional Lumen Mood Palette Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 border-t z-40" 
           style={{ 
             backgroundColor: 'var(--brand-primary)', 
             borderColor: 'rgba(255,255,255,0.2)' 
           }}>
        <div className="flex items-center justify-around px-2 py-2 safe-area-inset-bottom">
          <Link href="/working-dashboard" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <span className="text-lg font-light" style={{ color: 'var(--brand-on-primary)' }}>◉</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--brand-on-primary)' }}>Entries</span>
          </Link>
          
          <Link href="/analytics-dashboard" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <span className="text-lg font-light" style={{ color: 'var(--brand-on-primary)' }}>◈</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--brand-on-primary)' }}>Stats</span>
          </Link>
          
          <Link href="/log-mood" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg relative -mt-2 transition-all duration-150 hover:scale-105 active:scale-95">
            <div className="w-12 h-12 rounded-full flex items-center justify-center shadow-lg" 
                 style={{ backgroundColor: 'var(--brand-secondary)' }}>
              <span className="text-2xl font-light" style={{ color: 'var(--brand-on-secondary)' }}>✕</span>
            </div>
          </Link>
          
          <Link href="/calendar-view" className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95">
            <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <span className="text-lg font-light" style={{ color: 'var(--brand-on-primary)' }}>◇</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--brand-on-primary)' }}>Calendar</span>
          </Link>
          
          <button
            onClick={() => setIsOpen(true)}
            className="flex flex-col items-center space-y-1 px-2 py-1 rounded-lg transition-all duration-150 hover:scale-105 active:scale-95"
          >
            <div className="w-8 h-8 rounded-full flex items-center justify-center" 
                 style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}>
              <span className="text-lg font-light" style={{ color: 'var(--brand-on-primary)' }}>◊</span>
            </div>
            <span className="text-xs font-medium" style={{ color: 'var(--brand-on-primary)' }}>More</span>
          </button>
        </div>
      </div>

      {/* Mobile Header Menu - REMOVED to fix overlap */}

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            className="md:hidden fixed inset-0 bg-white z-50"
          >
            {/* Header */}
            <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center">
                  <span className="text-lg">🌿</span>
                </div>
                <div>
                  <h2 className="text-xl font-semibold">More</h2>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-red-400 text-sm">Hi, Ben</span>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-white hover:text-gray-300"
                >
                  <span className="text-2xl font-light">×</span>
                </button>
              </div>
            </div>
            
            <div className="p-4">
              
              <nav className="space-y-2 max-h-[80vh] overflow-y-auto">
                
                {/* Main Features Section */}
                <div className="space-y-2">
                  <MenuItem 
                    icon="😊" 
                    iconBg="#4ADE80" 
                    title="Edit Moods" 
                    href="/edit-moods" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="🏃" 
                    iconBg="#6B7280" 
                    title="Edit Activities" 
                    href="/edit-activities" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="✏️" 
                    iconBg="#FCD34D" 
                    title="Writing Templates" 
                    href="/writing-templates" 
                    onClick={() => setIsOpen(false)}
                  />
                </div>

                {/* Settings & Security */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <MenuItem 
                    icon="🔒" 
                    iconBg="#F87171" 
                    title="PIN Lock" 
                    subtitle="Off"
                    href="/pin-lock" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="⚙️" 
                    iconBg="#FB923C" 
                    title="Settings" 
                    href="/settings" 
                    onClick={() => setIsOpen(false)}
                  />
                </div>

                {/* Customization */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#4ADE80' }}>
                        <span className="text-lg">🎨</span>
                      </div>
                      <span className="text-lg font-medium">Change Colors</span>
                    </div>
                    <div className="flex space-x-1">
                      <div className="w-6 h-6 rounded-full bg-green-500"></div>
                      <div className="w-6 h-6 rounded-full bg-yellow-500"></div>
                      <div className="w-6 h-6 rounded-full bg-orange-500"></div>
                      <div className="w-6 h-6 rounded-full bg-red-500"></div>
                      <div className="w-6 h-6 rounded-full bg-gray-500"></div>
                    </div>
                  </div>
                  <MenuItem 
                    icon="🌗" 
                    iconBg="#6B7280" 
                    title="Color Mode" 
                    subtitle="Dark"
                    href="/color-mode" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="📱" 
                    iconBg="#7DD3C0" 
                    title="App Icon" 
                    href="/app-icon" 
                    onClick={() => setIsOpen(false)}
                  />
                </div>

                {/* Data & Backup */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <MenuItem 
                    icon="☁️" 
                    iconBg="#FB923C" 
                    title="Backup & Restore" 
                    href="/backup-restore" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="📁" 
                    iconBg="#4ADE80" 
                    title="Export Entries" 
                    href="/export-entries" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="❤️" 
                    iconBg="#6B7280" 
                    title="Apple Health" 
                    href="/apple-health" 
                    onClick={() => setIsOpen(false)}
                  />
                </div>

                {/* Premium Features */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <div className="bg-red-50 rounded-xl p-4 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-red-500">
                        <span className="text-white text-lg">😊</span>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-red-600">Free Version</h3>
                        <p className="text-sm text-gray-600">All essentials for unlimited time</p>
                      </div>
                      <span className="text-red-500">›</span>
                    </div>
                  </div>
                  
                  <MenuItem 
                    icon="🎯" 
                    iconBg="#4ADE80" 
                    title="Goals" 
                    href="/goals-dashboard" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="📊" 
                    iconBg="#6B7280" 
                    title="Weekly Reports" 
                    href="/weekly-reports" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="📈" 
                    iconBg="#FCD34D" 
                    title="Monthly Reports" 
                    href="/monthly-reports" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="📅" 
                    iconBg="#4ADE80" 
                    title="Important Days" 
                    href="/important-days" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="📷" 
                    iconBg="#FCD34D" 
                    title="Photo Gallery" 
                    href="/photo-gallery" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="🏆" 
                    iconBg="#F87171" 
                    title="Achievements" 
                    href="/achievements" 
                    onClick={() => setIsOpen(false)}
                  />
                </div>

                {/* Reminders */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#FB923C' }}>
                        <span className="text-lg">🔔</span>
                      </div>
                      <span className="text-lg font-medium">Reminders</span>
                    </div>
                    <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                      <div className="w-5 h-5 bg-white rounded-full shadow-sm absolute top-0.5 right-0.5"></div>
                    </div>
                  </div>
                </div>

                {/* Social & Support */}
                <div className="border-t border-gray-200 pt-4 mt-6 space-y-2">
                  <MenuItem 
                    icon="👥" 
                    iconBg="#FCD34D" 
                    title="Tell Your Friends" 
                    href="/tell-friends" 
                    onClick={() => setIsOpen(false)}
                  />
                  <div className="flex items-center justify-between py-3 px-4 hover:bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#F87171' }}>
                        <span className="text-lg">❤️</span>
                      </div>
                      <span className="text-lg font-medium">Connect with Us</span>
                    </div>
                    <div className="flex space-x-2">
                      <span className="text-gray-400">f</span>
                      <span className="text-gray-400">🐦</span>
                      <span className="text-gray-400">📷</span>
                    </div>
                  </div>
                  <MenuItem 
                    icon="ℹ️" 
                    iconBg="#FB923C" 
                    title="About" 
                    href="/about" 
                    onClick={() => setIsOpen(false)}
                  />
                  <MenuItem 
                    icon="👑" 
                    iconBg="#4ADE80" 
                    title="Subscription" 
                    href="/pricing" 
                    onClick={() => setIsOpen(false)}
                  />
                </div>

              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

