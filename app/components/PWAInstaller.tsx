'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export default function PWAInstaller() {
  const [isInstallable, setIsInstallable] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [showPrompt, setShowPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [isIOS, setIsIOS] = useState(false)

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // Check if iOS
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    setIsIOS(isIOSDevice)

    // Listen for install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setIsInstallable(true)
      
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 3000)
    }

    // Listen for app installed
    const handleAppInstalled = () => {
      setIsInstalled(true)
      setIsInstallable(false)
      setShowPrompt(false)
      setDeferredPrompt(null)
      
      // Track installation
      if (typeof window !== 'undefined') {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'pwa_installed',
            timestamp: new Date().toISOString(),
            platform: navigator.platform
          })
        })
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Service worker registration
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('[PWA] Service Worker registered successfully')
          
          // Listen for updates
          registration.addEventListener('updatefound', () => {
            console.log('[PWA] New service worker found')
          })
        })
        .catch(error => {
          console.error('[PWA] Service Worker registration failed:', error)
        })

      // Listen for service worker messages
      navigator.serviceWorker.addEventListener('message', event => {
        if (event.data?.type === 'INSTALL_AVAILABLE') {
          setIsInstallable(true)
          setShowPrompt(true)
        }
      })
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice

      // Track user choice
      if (typeof window !== 'undefined') {
        fetch('/api/analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            event: 'pwa_install_prompt',
            outcome,
            timestamp: new Date().toISOString()
          })
        })
      }

      if (outcome === 'accepted') {
        setIsInstallable(false)
        setShowPrompt(false)
      }
    } catch (error) {
      console.error('[PWA] Install prompt failed:', error)
    }

    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    
    // Track dismissal
    if (typeof window !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'pwa_install_dismissed',
          timestamp: new Date().toISOString()
        })
      })
    }
    
    // Show again later
    setTimeout(() => setShowPrompt(true), 300000) // 5 minutes
  }

  if (isInstalled || (!isInstallable && !isIOS)) {
    return null
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50"
        >
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-6">
              <button
                onClick={handleDismiss}
                className="absolute top-3 right-3 text-white/60 hover:text-white text-xl font-bold"
              >
                ×
              </button>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
                  📱
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-2">
                    {isIOS ? 'Add to Home Screen' : 'Install DailyMood AI'}
                  </h3>
                  <p className="text-white/90 text-sm mb-4">
                    {isIOS 
                      ? 'Get the best experience by adding DailyMood AI to your home screen!'
                      : 'Install DailyMood AI for quick access and offline mood tracking!'
                    }
                  </p>
                  
                  <div className="flex space-x-2">
                    {isIOS ? (
                      <div className="text-white/90 text-sm">
                        <p className="mb-2">Tap the share button <span className="inline-block">📤</span> then "Add to Home Screen"</p>
                      </div>
                    ) : (
                      <button
                        onClick={handleInstallClick}
                        className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-100 transition-colors"
                      >
                        Install App
                      </button>
                    )}
                    
                    <button
                      onClick={handleDismiss}
                      className="bg-white/20 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-white/30 transition-colors"
                    >
                      Later
                    </button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Benefits */}
            <div className="bg-black/10 px-6 py-3">
              <div className="flex items-center space-x-4 text-xs text-white/80">
                <span className="flex items-center">
                  <span className="mr-1">⚡</span>
                  Faster loading
                </span>
                <span className="flex items-center">
                  <span className="mr-1">📴</span>
                  Works offline
                </span>
                <span className="flex items-center">
                  <span className="mr-1">🔔</span>
                  Mood reminders
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Hook for PWA install status
export function usePWA() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isInstallable, setIsInstallable] = useState(false)
  
  useEffect(() => {
    // Check if running as PWA
    const checkPWAStatus = () => {
      const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      const isNavigatorStandalone = (window.navigator as any).standalone === true
      setIsInstalled(isStandalone || isNavigatorStandalone)
    }
    
    checkPWAStatus()
    
    const handleBeforeInstallPrompt = () => {
      setIsInstallable(true)
    }
    
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])
  
  return { isInstalled, isInstallable }
}


