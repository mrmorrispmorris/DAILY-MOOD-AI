'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Smartphone, Zap, CheckCircle } from 'lucide-react'

interface MobileOptimizerProps {
  children: React.ReactNode
  className?: string
}

export function MobileOptimizer({ children, className = "" }: MobileOptimizerProps) {
  const [isMobile, setIsMobile] = useState(false)
  const [touchSupport, setTouchSupport] = useState(false)
  const [orientation, setOrientation] = useState<'portrait' | 'landscape'>('portrait')

  useEffect(() => {
    const checkMobile = () => {
      const mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
      setIsMobile(mobile)
      setTouchSupport('ontouchstart' in window)
    }

    const checkOrientation = () => {
      setOrientation(window.innerHeight > window.innerWidth ? 'portrait' : 'landscape')
    }

    checkMobile()
    checkOrientation()
    
    window.addEventListener('resize', checkOrientation)
    window.addEventListener('orientationchange', checkOrientation)

    return () => {
      window.removeEventListener('resize', checkOrientation)
      window.removeEventListener('orientationchange', checkOrientation)
    }
  }, [])

  // Add mobile-specific CSS classes
  useEffect(() => {
    if (isMobile) {
      document.documentElement.classList.add('mobile-device')
      document.documentElement.classList.add(`orientation-${orientation}`)
    } else {
      document.documentElement.classList.remove('mobile-device', 'orientation-portrait', 'orientation-landscape')
    }
  }, [isMobile, orientation])

  if (!isMobile) {
    return <div className={className}>{children}</div>
  }

  return (
    <div className={`mobile-optimized ${className}`}>
      {/* Mobile Optimization Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-2 text-center text-sm font-medium">
        <div className="flex items-center justify-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span>Mobile Optimized</span>
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            {orientation === 'portrait' ? '📱 Portrait' : '🔄 Landscape'}
          </Badge>
        </div>
      </div>

      {/* Mobile Features Info */}
      <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
        <div className="flex items-center gap-2 mb-2">
          <Zap className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-blue-900 dark:text-blue-100">Mobile Features Active</h3>
        </div>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <CheckCircle className="h-3 w-3" />
            Thumb-friendly buttons
          </div>
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <CheckCircle className="h-3 w-3" />
            Touch gestures
          </div>
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <CheckCircle className="h-3 w-3" />
            Swipe navigation
          </div>
          <div className="flex items-center gap-1 text-blue-700 dark:text-blue-300">
            <CheckCircle className="h-3 w-3" />
            Mobile animations
          </div>
        </div>
      </div>

      {/* Optimized Content */}
      <div className="mobile-content">
        {children}
      </div>
    </div>
  )
}

// Mobile-specific CSS classes
const mobileStyles = `
  .mobile-device .mobile-content {
    padding-bottom: 80px; /* Account for bottom nav */
  }
  
  .mobile-device .mobile-content button,
  .mobile-device .mobile-content .btn {
    min-height: 48px; /* Thumb-friendly size */
    min-width: 48px;
    padding: 12px 16px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
  
  .mobile-device .mobile-content input,
  .mobile-device .mobile-content textarea,
  .mobile-device .mobile-content select {
    font-size: 16px; /* Prevent zoom on iOS */
    padding: 12px;
  }
  
  .mobile-device .mobile-content .card {
    margin: 8px;
    border-radius: 16px;
  }
  
  .mobile-device .mobile-content .chart-container {
    touch-action: pan-x pan-y pinch-zoom;
  }
  
  .orientation-portrait .mobile-content {
    max-width: 100%;
  }
  
  .orientation-landscape .mobile-content {
    max-width: 100%;
  }
  
  /* Touch gesture indicators */
  .mobile-device .swipeable {
    position: relative;
  }
  
  .mobile-device .swipeable::after {
    content: '← Swipe →';
    position: absolute;
    bottom: -20px;
    left: 50%;
    transform: translateX(-50%);
    font-size: 12px;
    color: #6B7280;
    opacity: 0.7;
  }
  
  /* Mobile-specific animations */
  .mobile-device .mobile-content * {
    transition: all 0.2s ease-out;
  }
  
  .mobile-device .mobile-content button:active {
    transform: scale(0.95);
  }
  
  /* Safe area support */
  .mobile-device .mobile-content {
    padding-left: env(safe-area-inset-left);
    padding-right: env(safe-area-inset-right);
    padding-top: env(safe-area-inset-top);
  }
`

// Inject mobile styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = mobileStyles
  document.head.appendChild(style)
}
