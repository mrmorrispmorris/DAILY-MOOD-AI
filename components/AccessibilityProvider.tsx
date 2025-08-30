'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { AccessibilityEnhancer } from '@/lib/accessibility-enhancer'

interface AccessibilityContextType {
  reducedMotion: boolean
  highContrast: boolean
  fontSize: 'small' | 'medium' | 'large'
  announceToScreenReader: (message: string, priority?: 'polite' | 'assertive') => void
  setFontSize: (size: 'small' | 'medium' | 'large') => void
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined)

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [reducedMotion, setReducedMotion] = useState(false)
  const [highContrast, setHighContrast] = useState(false)
  const [fontSize, setFontSize] = useState<'small' | 'medium' | 'large'>('medium')

  useEffect(() => {
    // Check for motion preferences
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReducedMotion(motionQuery.matches)
    
    const handleMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches)
    motionQuery.addEventListener('change', handleMotionChange)

    // Check for contrast preferences  
    const contrastQuery = window.matchMedia('(prefers-contrast: high)')
    setHighContrast(contrastQuery.matches)
    
    const handleContrastChange = (e: MediaQueryListEvent) => setHighContrast(e.matches)
    contrastQuery.addEventListener('change', handleContrastChange)

    // Load saved font size preference
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'small' | 'medium' | 'large'
    if (savedFontSize) {
      setFontSize(savedFontSize)
    }

    // Add skip link to page
    const skipLink = AccessibilityEnhancer.createSkipLink('main-content')
    document.body.insertBefore(skipLink, document.body.firstChild)

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [])

  useEffect(() => {
    // Apply font size to document
    const fontSizeMap = {
      small: '0.9rem',
      medium: '1rem',
      large: '1.2rem'
    }

    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[fontSize])
    localStorage.setItem('accessibility-font-size', fontSize)
  }, [fontSize])

  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityEnhancer.announceToScreenReader(message, priority)
  }

  const handleSetFontSize = (size: 'small' | 'medium' | 'large') => {
    setFontSize(size)
    announceToScreenReader(`Font size changed to ${size}`)
  }

  const value: AccessibilityContextType = {
    reducedMotion,
    highContrast,
    fontSize,
    announceToScreenReader,
    setFontSize: handleSetFontSize
  }

  return (
    <AccessibilityContext.Provider value={value}>
      <div 
        className={`accessibility-wrapper ${reducedMotion ? 'reduce-motion' : ''} ${highContrast ? 'high-contrast' : ''}`}
        style={{ fontSize: `var(--base-font-size, 1rem)` }}
      >
        {children}
      </div>
    </AccessibilityContext.Provider>
  )
}

export function useAccessibilityContext() {
  const context = useContext(AccessibilityContext)
  if (context === undefined) {
    throw new Error('useAccessibilityContext must be used within an AccessibilityProvider')
  }
  return context
}

// Accessibility controls component
export function AccessibilityControls() {
  const { fontSize, setFontSize, reducedMotion, highContrast } = useAccessibilityContext()

  return (
    <div className="accessibility-controls fixed bottom-4 right-4 bg-white shadow-xl rounded-lg p-4 border-2 border-purple-200 z-50">
      <h3 className="text-sm font-semibold mb-3 text-gray-800">Accessibility Settings</h3>
      
      <div className="space-y-3">
        {/* Font size controls */}
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Text Size
          </label>
          <div className="flex gap-1">
            {(['small', 'medium', 'large'] as const).map((size) => (
              <button
                key={size}
                onClick={() => setFontSize(size)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  fontSize === size
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
                aria-pressed={fontSize === size}
              >
                {size[0].toUpperCase() + size.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Status indicators */}
        <div className="text-xs space-y-1">
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${reducedMotion ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-gray-600">Reduced Motion: {reducedMotion ? 'On' : 'Off'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${highContrast ? 'bg-green-500' : 'bg-gray-300'}`} />
            <span className="text-gray-600">High Contrast: {highContrast ? 'On' : 'Off'}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

