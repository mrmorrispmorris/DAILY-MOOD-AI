'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react'

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
  const [mounted, setMounted] = useState(false)

  // Only run after component mounts (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

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

    return () => {
      motionQuery.removeEventListener('change', handleMotionChange)
      contrastQuery.removeEventListener('change', handleContrastChange)
    }
  }, [mounted])

  useEffect(() => {
    if (!mounted) return

    // Apply font size to document
    const fontSizeMap = {
      small: '0.9rem',
      medium: '1rem',
      large: '1.2rem'
    }

    document.documentElement.style.setProperty('--base-font-size', fontSizeMap[fontSize])
    localStorage.setItem('accessibility-font-size', fontSize)
  }, [fontSize, mounted])

  const announceToScreenReader = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    if (!mounted) return
    
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }, [mounted])

  const handleSetFontSize = useCallback((size: 'small' | 'medium' | 'large') => {
    setFontSize(size)
    announceToScreenReader(`Font size changed to ${size}`)
  }, [announceToScreenReader])

  const value: AccessibilityContextType = {
    reducedMotion,
    highContrast,
    fontSize,
    announceToScreenReader,
    setFontSize: handleSetFontSize
  }

  if (!mounted) {
    return <>{children}</>
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
