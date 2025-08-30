'use client'
import { useState, useEffect } from 'react'

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
  const [showInstall, setShowInstall] = useState(false)

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      // Show our custom install prompt
      setShowInstall(true)
    }

    const handleAppInstalled = () => {
      console.log('DailyMood AI was installed')
      setShowInstall(false)
      setDeferredPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstall(false)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    
    // Show the install prompt
    deferredPrompt.prompt()
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice
    
    console.log(`User response to the install prompt: ${outcome}`)
    
    if (outcome === 'accepted') {
      console.log('User accepted the install prompt')
      setShowInstall(false)
    } else {
      console.log('User dismissed the install prompt')
      // Still hide for this session, but could show again later
      setShowInstall(false)
    }
    
    // Clear the deferredPrompt so it can only be used once
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstall(false)
    // Store dismissal in localStorage to avoid showing too frequently
    localStorage.setItem('pwa-install-dismissed', Date.now().toString())
  }

  // Don't show if user dismissed recently (within 7 days)
  useEffect(() => {
    const dismissed = localStorage.getItem('pwa-install-dismissed')
    if (dismissed) {
      const dismissedDate = new Date(parseInt(dismissed))
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      if (dismissedDate > weekAgo) {
        setShowInstall(false)
        return
      }
    }
  }, [])

  if (!showInstall) return null

  return (
    <div className="pwa-install-prompt">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <span className="text-2xl mr-3">📱</span>
          <div>
            <p className="font-semibold text-white">Install DailyMood AI</p>
            <p className="text-sm text-white/90">Get faster access and offline features!</p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/60 hover:text-white text-xl leading-none"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      
      <div className="flex gap-2">
        <button 
          onClick={handleInstall} 
          className="install-btn flex-1 bg-white/20 border border-white/30 text-white px-4 py-2 rounded-lg font-semibold hover:bg-white/30 transition-colors"
        >
          Install App
        </button>
        <button
          onClick={handleDismiss}
          className="px-4 py-2 text-white/80 hover:text-white text-sm"
        >
          Not now
        </button>
      </div>
      
      <div className="mt-2 text-xs text-white/70">
        ✨ Faster loading • 📴 Works offline • 🏠 Add to home screen
      </div>
    </div>
  )
}


