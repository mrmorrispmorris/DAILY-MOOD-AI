'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw, CheckCircle, XCircle, AlertTriangle, 
  Download, Smartphone, Globe, Wifi, WifiOff
} from 'lucide-react'

interface ServiceWorkerState {
  isRegistered: boolean
  isActive: boolean
  isInstalled: boolean
  isUpdateAvailable: boolean
  version: string
  lastUpdate: Date | null
}

export function PWAServiceWorker() {
  const [swState, setSwState] = useState<ServiceWorkerState>({
    isRegistered: false,
    isActive: false,
    isInstalled: false,
    isUpdateAvailable: false,
    version: '1.0.0',
    lastUpdate: null
  })
  const [isInstalling, setIsInstalling] = useState(false)
  const [installPrompt, setInstallPrompt] = useState<any>(null)

  useEffect(() => {
    registerServiceWorker()
    checkInstallPrompt()
    checkServiceWorkerStatus()
  }, [])

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/enhanced-sw.js', {
          scope: '/'
        })

        setSwState(prev => ({
          ...prev,
          isRegistered: true,
          version: registration.active?.scriptURL ? '2.0.0' : '1.0.0'
        }))

        // Listen for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setSwState(prev => ({ ...prev, isUpdateAvailable: true }))
              }
            })
          }
        })

        // Listen for controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          setSwState(prev => ({ 
            ...prev, 
            isActive: true,
            isUpdateAvailable: false,
            lastUpdate: new Date()
          }))
        })

      } catch (error) {
        console.error('Service Worker registration failed:', error)
      }
    }
  }

  const checkInstallPrompt = () => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setInstallPrompt(e)
      setSwState(prev => ({ ...prev, isInstalled: false }))
    })

    window.addEventListener('appinstalled', () => {
      setInstallPrompt(null)
      setSwState(prev => ({ ...prev, isInstalled: true }))
    })
  }

  const checkServiceWorkerStatus = () => {
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      setSwState(prev => ({ ...prev, isActive: true }))
    }
  }

  const handleInstall = async () => {
    if (!installPrompt) return

    setIsInstalling(true)
    try {
      const result = await installPrompt.prompt()
      console.log('Install prompt result:', result)
      
      if (result.outcome === 'accepted') {
        setSwState(prev => ({ ...prev, isInstalled: true }))
      }
    } catch (error) {
      console.error('Install failed:', error)
    } finally {
      setIsInstalling(false)
    }
  }

  const updateServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration && registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
        }
      } catch (error) {
        console.error('Update failed:', error)
      }
    }
  }

  const unregisterServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.getRegistration()
        if (registration) {
          await registration.unregister()
          setSwState(prev => ({
            ...prev,
            isRegistered: false,
            isActive: false,
            isUpdateAvailable: false
          }))
        }
      } catch (error) {
        console.error('Unregister failed:', error)
      }
    }
  }

  const getStatusIcon = () => {
    if (swState.isUpdateAvailable) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    if (swState.isActive) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (swState.isRegistered) return <RefreshCw className="h-4 w-4 text-blue-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  const getStatusBadge = () => {
    if (swState.isUpdateAvailable) return <Badge variant="secondary">Update Available</Badge>
    if (swState.isActive) return <Badge variant="default">Active</Badge>
    if (swState.isRegistered) return <Badge variant="outline">Registered</Badge>
    return <Badge variant="destructive">Not Registered</Badge>
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-sm">
            {getStatusIcon()}
            PWA Status
            {getStatusBadge()}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Service Worker Status */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span>Service Worker:</span>
              <span className={swState.isRegistered ? 'text-green-600' : 'text-red-600'}>
                {swState.isRegistered ? 'Registered' : 'Not Registered'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Status:</span>
              <span className={swState.isActive ? 'text-green-600' : 'text-yellow-600'}>
                {swState.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span>Version:</span>
              <span className="text-blue-600">{swState.version}</span>
            </div>
          </div>

          {/* Install Status */}
          {installPrompt && !swState.isInstalled && (
            <div className="space-y-2">
              <div className="text-xs text-center text-gray-600">
                Install DailyMood AI as an app
              </div>
              <Button
                onClick={handleInstall}
                disabled={isInstalling}
                size="sm"
                className="w-full"
              >
                <Download className="h-4 w-4 mr-2" />
                {isInstalling ? 'Installing...' : 'Install App'}
              </Button>
            </div>
          )}

          {/* Update Available */}
          {swState.isUpdateAvailable && (
            <div className="space-y-2">
              <div className="text-xs text-center text-yellow-600">
                New version available
              </div>
              <Button
                onClick={updateServiceWorker}
                size="sm"
                variant="outline"
                className="w-full"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Update Now
              </Button>
            </div>
          )}

          {/* Network Status */}
          <div className="flex items-center justify-between text-xs">
            <span>Network:</span>
            <div className="flex items-center gap-1">
              {navigator.onLine ? (
                <>
                  <Wifi className="h-3 w-3 text-green-500" />
                  <span className="text-green-600">Online</span>
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 text-red-500" />
                  <span className="text-red-600">Offline</span>
                </>
              )}
            </div>
          </div>

          {/* Last Update */}
          {swState.lastUpdate && (
            <div className="text-xs text-center text-gray-500">
              Last updated: {swState.lastUpdate.toLocaleTimeString()}
            </div>
          )}

          {/* Debug Actions */}
          {process.env.NODE_ENV === 'development' && (
            <div className="pt-2 border-t">
              <Button
                onClick={unregisterServiceWorker}
                size="sm"
                variant="outline"
                className="w-full text-xs"
              >
                Unregister SW (Debug)
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




