'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/app/lib/supabase-client'
import Link from 'next/link'
import { User, Bell, Download, Palette, Shield, CreditCard, LogOut } from 'lucide-react'
import ExportData from '@/components/ExportData'
import NotificationSettings from '@/components/NotificationSettings'
import { motion, AnimatePresence } from 'framer-motion'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState('free')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadUserData()
  }, [])

  const loadUserData = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      setUser(user)
      
      // Get subscription status
      const { data } = await supabase
        .from('users')
        .select('subscription_level')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setSubscription(data.subscription_level || 'free')
      }
    }
    setLoading(false)
  }

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell, premium: true },
    { id: 'export', label: 'Export Data', icon: Download, premium: true },
    { id: 'appearance', label: 'Appearance', icon: Palette },
    { id: 'privacy', label: 'Privacy', icon: Shield },
    { id: 'billing', label: 'Billing', icon: CreditCard }
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-8">Settings</h1>

        <div className="grid md:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-4">
              <nav className="space-y-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      activeTab === tab.id
                        ? 'bg-purple-50 text-purple-600'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.premium && subscription === 'free' && (
                      <span className="ml-auto text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </button>
                ))}
                
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-red-600 hover:bg-red-50 mt-4 pt-4 border-t"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sign Out</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white rounded-xl shadow-sm p-6"
              >
                {activeTab === 'profile' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Profile Settings</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          value={user?.email || ''}
                          disabled
                          className="w-full px-4 py-2 border rounded-lg bg-gray-50"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Subscription
                        </label>
                        <div className="flex items-center justify-between p-4 border rounded-lg">
                          <span className="font-medium capitalize">{subscription}</span>
                          {subscription === 'free' && (
                            <Link
                              href="/pricing"
                              className="text-purple-600 hover:text-purple-700 font-medium"
                            >
                              Upgrade to Premium
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'notifications' && (
                  <div>
                    {subscription === 'premium' && user?.id ? (
                      <NotificationSettings userId={user.id} />
                    ) : (
                      <div className="text-center py-12">
                        <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                        <p className="text-gray-600 mb-4">
                          Unlock push notifications and reminders with Premium
                        </p>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'export' && (
                  <div>
                    {subscription === 'premium' && user?.id ? (
                      <ExportData userId={user.id} />
                    ) : (
                      <div className="text-center py-12">
                        <Download className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold mb-2">Premium Feature</h3>
                        <p className="text-gray-600 mb-4">
                          Export your mood data in CSV, JSON, or PDF format with Premium
                        </p>
                        <Link
                          href="/pricing"
                          className="inline-flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        >
                          Upgrade Now
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'appearance' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Appearance</h2>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Theme
                        </label>
                        <select className="w-full px-4 py-2 border rounded-lg">
                          <option>Light</option>
                          <option>Dark (Coming Soon)</option>
                          <option>Auto (Coming Soon)</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'privacy' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Privacy & Security</h2>
                    <div className="space-y-4">
                      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-green-800">
                          ✅ Your data is encrypted and secure
                        </p>
                      </div>
                      <button className="text-red-600 hover:text-red-700 font-medium">
                        Delete All Data
                      </button>
                    </div>
                  </div>
                )}

                {activeTab === 'billing' && (
                  <div>
                    <h2 className="text-xl font-bold mb-6">Billing & Subscription</h2>
                    <div className="space-y-4">
                      <div className="p-4 border rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">Current Plan</p>
                            <p className="text-gray-600 capitalize">{subscription}</p>
                          </div>
                          {subscription === 'free' ? (
                            <Link
                              href="/pricing"
                              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                            >
                              Upgrade
                            </Link>
                          ) : (
                            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                              Manage
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}
