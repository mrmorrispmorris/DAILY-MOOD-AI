'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Smartphone, 
  Zap, 
  Wifi, 
  Shield, 
  X,
  CheckCircle,
  Star
} from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)
  const [installSuccess, setInstallSuccess] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      setIsInstalled(true)
      return
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowInstallPrompt(true)
    }

    // Listen for appinstalled event
    const handleAppInstalled = () => {
      setInstallSuccess(true)
      setIsInstalled(true)
      setShowInstallPrompt(false)
      
      // Hide success message after 5 seconds
      setTimeout(() => setInstallSuccess(false), 5000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    try {
      // Show the install prompt
      await deferredPrompt.prompt()
      
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt')
        setInstallSuccess(true)
        setIsInstalled(true)
        setShowInstallPrompt(false)
      } else {
        console.log('User dismissed the install prompt')
        setShowInstallPrompt(false)
      }
      
      // Clear the deferredPrompt
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during install:', error)
    }
  }

  const handleDismiss = () => {
    setShowInstallPrompt(false)
    // Store dismissal in localStorage to avoid showing again immediately
    localStorage.setItem('pwa_install_dismissed', Date.now().toString())
  }

  // Don't show if already installed or recently dismissed
  if (isInstalled || !showInstallPrompt) {
    return null
  }

  // Check if recently dismissed (within 24 hours)
  const dismissedTime = localStorage.getItem('pwa_install_dismissed')
  if (dismissedTime && Date.now() - parseInt(dismissedTime) < 24 * 60 * 60 * 1000) {
    return null
  }

  if (installSuccess) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Card className="w-80 bg-green-50 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <div>
                <h4 className="font-semibold text-green-800">App Installed Successfully! 🎉</h4>
                <p className="text-sm text-green-700">DailyMood AI is now available on your device</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                <Download className="w-5 h-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-lg">Install DailyMood AI</CardTitle>
                <CardDescription>Get the full app experience</CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="pt-0">
          {/* Benefits */}
          <div className="space-y-3 mb-4">
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Smartphone className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Access like a native app</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Zap className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Faster loading & offline support</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Wifi className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Push notifications & reminders</span>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Shield className="w-3 h-3 text-blue-600" />
              </div>
              <span className="text-gray-700">Secure & private</span>
            </div>
          </div>

          {/* Install Button */}
          <Button 
            onClick={handleInstallClick}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Install App
          </Button>

          {/* Additional Info */}
          <div className="mt-3 text-center">
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500">
              <Star className="w-3 h-3 text-yellow-500" />
              <span>Free • No ads • Privacy focused</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Floating install button for mobile
export function FloatingInstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showButton, setShowButton] = useState(false)

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        (window.navigator as any).standalone === true) {
      return
    }

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowButton(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        setShowButton(false)
      }
      
      setDeferredPrompt(null)
    } catch (error) {
      console.error('Error during install:', error)
    }
  }

  if (!showButton) return null

  return (
    <div className="fixed bottom-20 right-4 z-40 md:hidden">
      <Button
        onClick={handleInstall}
        size="sm"
        className="rounded-full w-12 h-12 p-0 bg-blue-600 hover:bg-blue-700 shadow-lg"
      >
        <Download className="w-5 h-5" />
      </Button>
    </div>
  )
}

// PWA install instructions for manual installation
export function PWAInstallInstructions() {
  const [showInstructions, setShowInstructions] = useState(false)

  const getInstallInstructions = () => {
    const userAgent = navigator.userAgent.toLowerCase()
    
    if (/iphone|ipad|ipod/.test(userAgent)) {
      return {
        title: 'Install on iOS',
        steps: [
          'Tap the Share button (📤) in Safari',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to confirm',
          'The app will now appear on your home screen'
        ]
      }
    } else if (/android/.test(userAgent)) {
      return {
        title: 'Install on Android',
        steps: [
          'Tap the menu button (⋮) in Chrome',
          'Tap "Add to Home screen"',
          'Tap "Add" to confirm',
          'The app will now appear on your home screen'
        ]
      }
    } else {
      return {
        title: 'Install on Desktop',
        steps: [
          'Click the install icon (📥) in your browser address bar',
          'Click "Install" in the popup',
          'The app will open in a new window',
          'You can also find it in your app launcher'
        ]
      }
    }
  }

  const instructions = getInstallInstructions()

  return (
    <div className="text-center py-8">
      <Button
        onClick={() => setShowInstructions(!showInstructions)}
        variant="outline"
        className="mb-4"
      >
        <Download className="w-4 h-4 mr-2" />
        How to Install
      </Button>

      {showInstructions && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="w-5 h-5" />
              {instructions.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="text-left space-y-2">
              {instructions.steps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                    {index + 1}
                  </div>
                  <span className="text-gray-700">{step}</span>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      )}
    </div>
  )
}






