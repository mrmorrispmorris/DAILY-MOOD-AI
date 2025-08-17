'use client'

import { ReactNode, useEffect, useRef } from 'react'
import { useTheme } from '@/hooks/use-theme'

interface AccessibilityWrapperProps {
  children: ReactNode
  role?: string
  'aria-label'?: string
  'aria-describedby'?: string
  'aria-live'?: 'polite' | 'assertive' | 'off'
  tabIndex?: number
  className?: string
  onKeyDown?: (event: React.KeyboardEvent) => void
  focusable?: boolean
  skipLink?: boolean
}

export function AccessibilityWrapper({
  children,
  role,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  'aria-live': ariaLive = 'polite',
  tabIndex = 0,
  className = '',
  onKeyDown,
  focusable = true,
  skipLink = false
}: AccessibilityWrapperProps) {
  const { isDarkMode } = useTheme()
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Focus management
  useEffect(() => {
    if (focusable && wrapperRef.current) {
      wrapperRef.current.focus()
    }
  }, [focusable])

  // Keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Standard keyboard navigation
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault()
        if (onKeyDown) onKeyDown(event)
        break
      case 'Escape':
        // Close or cancel action
        if (onKeyDown) onKeyDown(event)
        break
      case 'Tab':
        // Allow normal tab navigation
        break
      default:
        if (onKeyDown) onKeyDown(event)
    }
  }

  // Skip link functionality
  const handleSkipLink = () => {
    const mainContent = document.querySelector('main')
    if (mainContent) {
      mainContent.focus()
      mainContent.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <>
      {/* Skip Link for Screen Readers */}
      {skipLink && (
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-lg z-50"
          onClick={handleSkipLink}
        >
          Skip to main content
        </a>
      )}

      {/* Main Accessibility Wrapper */}
      <div
        ref={wrapperRef}
        role={role}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-live={ariaLive}
        tabIndex={focusable ? tabIndex : undefined}
        className={`accessibility-wrapper ${className}`}
        onKeyDown={handleKeyDown}
        style={{
          // High contrast mode support
          '--high-contrast-border': isDarkMode ? '#FFFFFF' : '#000000',
          '--high-contrast-text': isDarkMode ? '#FFFFFF' : '#000000',
        } as React.CSSProperties}
      >
        {children}
      </div>
    </>
  )
}

// Accessibility utilities
export const accessibilityUtils = {
  // Generate unique IDs for ARIA relationships
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  // Announce changes to screen readers
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  },
  
  // Focus trap for modals
  createFocusTrap: (container: HTMLElement) => {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault()
            lastElement.focus()
          }
        } else {
          if (document.activeElement === lastElement) {
            e.preventDefault()
            firstElement.focus()
          }
        }
      }
    }
    
    container.addEventListener('keydown', handleTabKey)
    
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }
}

// High contrast mode support
const highContrastStyles = `
  @media (prefers-contrast: high) {
    .accessibility-wrapper {
      border: 2px solid var(--high-contrast-border) !important;
    }
    
    .accessibility-wrapper button,
    .accessibility-wrapper input,
    .accessibility-wrapper select,
    .accessibility-wrapper textarea {
      border: 2px solid var(--high-contrast-border) !important;
    }
    
    .accessibility-wrapper * {
      color: var(--high-contrast-text) !important;
    }
  }
  
  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    .accessibility-wrapper *,
    .accessibility-wrapper *::before,
    .accessibility-wrapper *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
  
  /* Screen reader only content */
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
`

// Inject accessibility styles
if (typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent = highContrastStyles
  document.head.appendChild(style)
}




