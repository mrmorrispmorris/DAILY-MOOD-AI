'use client'
import { useState, useEffect } from 'react'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize dismissal state FIRST to prevent flash
  useEffect(() => {
    const initializeDismissalState = () => {
      // Check if permanently dismissed
      const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed')
      if (permanentlyDismissed === 'true') {
        setShowInstall(false)
        setIsInitialized(true)
        return
      }

      // Check if dismissed recently (within 30 days for better UX)
      const dismissed = localStorage.getItem('pwa-install-dismissed')
      if (dismissed) {
        const dismissedDate = new Date(parseInt(dismissed))
        const monthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        if (dismissedDate > monthAgo) {
          setShowInstall(false)
          setIsInitialized(true)
          return
        }
      }

      // Check if app is already installed
      if (window.matchMedia('(display-mode: standalone)').matches) {
        setShowInstall(false)
        setIsInitialized(true)
        return
      }

      setIsInitialized(true)
    }

    initializeDismissalState()
  }, [])

  useEffect(() => {
    if (!isInitialized) return

    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      
      // Only show if not dismissed and initialized
      const permanentlyDismissed = localStorage.getItem('pwa-install-permanently-dismissed')
      if (permanentlyDismissed !== 'true') {
        setShowInstall(true)
      }
    }

    const handleAppInstalled = () => {
      console.log('DailyMood AI was installed')
      setShowInstall(false)
      setDeferredPrompt(null)
      // Mark as permanently dismissed since app is installed
      localStorage.setItem('pwa-install-permanently-dismissed', 'true')
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [isInitialized])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    try {
      // Show the install prompt
      deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      console.log(`User response to the install prompt: ${outcome}`)
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        localStorage.setItem('pwa-install-permanently-dismissed', 'true')
      } else {
        console.log('User dismissed the install prompt')
        localStorage.setItem('pwa-install-dismissed', Date.now().toString())
      }
      
      setShowInstall(false)
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Install prompt error:', error)
      setShowInstall(false)
    }
  }

  const handleDismiss = () => {
    setShowInstall(false)
    // Store dismissal timestamp for temporary dismissal
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  const handlePermanentDismiss = () => {
    setShowInstall(false)
    // Store permanent dismissal - will never show again
    localStorage.setItem('pwa-install-permanently-dismissed', 'true')
  }

  // TEMPORARY: Force show for debugging text visibility
  // Original: if (!isInitialized || !showInstall) return null
  if (!isInitialized) return null
  
  // Force show for testing (ignore dismissal logic temporarily)
  const forceShow = true
  
  // Only show if forced or normal conditions met
  if (!forceShow && !showInstall) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-20 md:max-w-sm text-white p-4 rounded-xl shadow-lg backdrop-blur-sm z-40 animate-in slide-in-from-bottom duration-300"
         style={{ 
           background: 'rgba(10, 127, 122, 0.95)', // Solid aqua with slight transparency
           border: '1px solid #FFD700'
         }}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📱</span>
          <div>
            <p className="font-semibold text-white text-base mb-1" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
               Install DailyMood AI
            </p>
            <p className="text-white text-sm" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.8)' }}>
               Get faster access and offline features!
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white text-xl leading-none p-1 rounded"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      
      <div className="flex gap-2 mb-2">
        <button 
          onClick={handleInstall} 
          className="flex-1 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 active:scale-95"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            border: '1px solid rgba(255, 255, 255, 0.3)'
          }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.2)'}
        >
          Install App
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-white/80 hover:text-white text-sm rounded-lg transition-colors"
          style={{ backgroundColor: 'transparent' }}
          onMouseEnter={(e) => e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
        >
          Later
        </button>
      </div>

      <div className="flex justify-between items-center">
        <div className="text-xs text-white/70">
          ✨ Faster • 📴 Offline • 🏠 Home screen
        </div>
        <button
          onClick={handlePermanentDismiss}
          className="text-xs text-white/50 hover:text-white/70 underline"
        >
          Don't ask again
        </button>
      </div>
    </div>
  )
}


