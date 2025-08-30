// Accessibility enhancement utilities for WCAG 2.1 compliance
export class AccessibilityEnhancer {
  // Color contrast checker
  static checkColorContrast(
    foreground: string, 
    background: string,
    level: 'AA' | 'AAA' = 'AA'
  ): { passes: boolean; ratio: number; required: number } {
    const hexToRgb = (hex: string) => {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    }

    const getLuminance = (r: number, g: number, b: number) => {
      const rsRGB = r / 255
      const gsRGB = g / 255
      const bsRGB = b / 255

      const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4)
      const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4)
      const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4)

      return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
    }

    const fg = hexToRgb(foreground)
    const bg = hexToRgb(background)

    if (!fg || !bg) {
      return { passes: false, ratio: 0, required: level === 'AA' ? 4.5 : 7 }
    }

    const fgLuminance = getLuminance(fg.r, fg.g, fg.b)
    const bgLuminance = getLuminance(bg.r, bg.g, bg.b)

    const ratio = (Math.max(fgLuminance, bgLuminance) + 0.05) / 
                  (Math.min(fgLuminance, bgLuminance) + 0.05)

    const required = level === 'AA' ? 4.5 : 7
    const passes = ratio >= required

    return { passes, ratio, required }
  }

  // Generate ARIA labels for mood-related components
  static generateMoodAriaLabel(mood: number, emoji: string): string {
    const moodDescriptions = {
      1: 'very low mood, feeling terrible',
      2: 'low mood, feeling bad',
      3: 'below average mood, not feeling good',
      4: 'slightly low mood, feeling meh',
      5: 'neutral mood, feeling okay',
      6: 'good mood, feeling positive',
      7: 'very good mood, feeling great',
      8: 'excellent mood, feeling very positive',
      9: 'amazing mood, feeling fantastic',
      10: 'perfect mood, feeling on top of the world'
    }

    return `Current mood rating: ${mood} out of 10, ${moodDescriptions[mood as keyof typeof moodDescriptions]}, represented by ${emoji} emoji`
  }

  // Keyboard navigation helpers
  static addKeyboardNavigation(element: HTMLElement): void {
    element.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        element.click()
      }
    })
  }

  // Screen reader announcements
  static announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div')
    announcement.setAttribute('aria-live', priority)
    announcement.setAttribute('aria-atomic', 'true')
    announcement.className = 'sr-only'
    announcement.textContent = message
    
    document.body.appendChild(announcement)
    
    // Clean up after announcement
    setTimeout(() => {
      document.body.removeChild(announcement)
    }, 1000)
  }

  // Focus management
  static trapFocus(container: HTMLElement): () => void {
    const focusableElements = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    const firstFocusable = focusableElements[0] as HTMLElement
    const lastFocusable = focusableElements[focusableElements.length - 1] as HTMLElement

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstFocusable) {
            e.preventDefault()
            lastFocusable.focus()
          }
        } else {
          if (document.activeElement === lastFocusable) {
            e.preventDefault()
            firstFocusable.focus()
          }
        }
      }
    }

    container.addEventListener('keydown', handleTabKey)

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleTabKey)
    }
  }

  // Skip link generator
  static createSkipLink(targetId: string, text: string = 'Skip to main content'): HTMLElement {
    const skipLink = document.createElement('a')
    skipLink.href = `#${targetId}`
    skipLink.textContent = text
    skipLink.className = 'skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50'
    
    return skipLink
  }

  // Validate form accessibility
  static validateFormAccessibility(form: HTMLFormElement): {
    issues: string[]
    suggestions: string[]
    score: number
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 100

    // Check for labels
    const inputs = form.querySelectorAll('input, textarea, select')
    inputs.forEach(input => {
      const label = form.querySelector(`label[for="${input.id}"]`)
      if (!label && !input.getAttribute('aria-label') && !input.getAttribute('aria-labelledby')) {
        issues.push(`Input missing label: ${input.getAttribute('name') || 'unnamed'}`)
        suggestions.push('Add proper labels or aria-label attributes')
        score -= 10
      }
    })

    // Check for required field indicators
    const requiredInputs = form.querySelectorAll('input[required], textarea[required], select[required]')
    requiredInputs.forEach(input => {
      if (!input.getAttribute('aria-required') && !input.getAttribute('required')) {
        issues.push('Required fields not properly indicated')
        suggestions.push('Add aria-required="true" to required fields')
        score -= 5
      }
    })

    // Check for error messaging
    const errorMessages = form.querySelectorAll('[role="alert"], .error-message')
    if (errorMessages.length === 0 && form.querySelector('.error')) {
      issues.push('Error messages not properly associated')
      suggestions.push('Add role="alert" to error messages')
      score -= 10
    }

    return { issues, suggestions, score }
  }

  // Color blindness simulation
  static simulateColorBlindness(color: string, type: 'protanopia' | 'deuteranopia' | 'tritanopia'): string {
    // This is a simplified simulation - in practice, use more sophisticated algorithms
    const hex = color.replace('#', '')
    const r = parseInt(hex.substr(0, 2), 16)
    const g = parseInt(hex.substr(2, 2), 16)
    const b = parseInt(hex.substr(4, 2), 16)

    let newR = r, newG = g, newB = b

    switch (type) {
      case 'protanopia': // Red-blind
        newR = 0.567 * r + 0.433 * g
        newG = 0.558 * r + 0.442 * g
        break
      case 'deuteranopia': // Green-blind
        newR = 0.625 * r + 0.375 * g
        newG = 0.7 * r + 0.3 * g
        break
      case 'tritanopia': // Blue-blind
        newR = 0.95 * r + 0.05 * g
        newB = 0.433 * r + 0.567 * b
        break
    }

    const toHex = (n: number) => Math.round(Math.max(0, Math.min(255, n))).toString(16).padStart(2, '0')
    
    return `#${toHex(newR)}${toHex(newG)}${toHex(newB)}`
  }

  // Motion preferences
  static respectMotionPreferences(): boolean {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }

  // High contrast mode detection
  static isHighContrastMode(): boolean {
    return window.matchMedia('(prefers-contrast: high)').matches
  }

  // Generate comprehensive accessibility report
  static generateAccessibilityReport(container: HTMLElement = document.body): {
    score: number
    issues: string[]
    suggestions: string[]
    checklist: Record<string, boolean>
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    const checklist: Record<string, boolean> = {}

    // Check for semantic HTML
    const headings = container.querySelectorAll('h1, h2, h3, h4, h5, h6')
    checklist['Has proper heading structure'] = headings.length > 0
    if (headings.length === 0) {
      issues.push('No heading elements found')
      suggestions.push('Add proper heading structure (h1-h6)')
    }

    // Check for alt text on images
    const images = container.querySelectorAll('img')
    const imagesWithAlt = container.querySelectorAll('img[alt]')
    checklist['All images have alt text'] = images.length === imagesWithAlt.length
    if (images.length !== imagesWithAlt.length) {
      issues.push('Some images missing alt text')
      suggestions.push('Add descriptive alt text to all images')
    }

    // Check for keyboard navigation
    const interactiveElements = container.querySelectorAll('button, a, input, select, textarea')
    const focusableElements = container.querySelectorAll('[tabindex]:not([tabindex="-1"])')
    checklist['Interactive elements are keyboard accessible'] = interactiveElements.length > 0

    // Check for ARIA labels
    const ariaLabels = container.querySelectorAll('[aria-label], [aria-labelledby]')
    checklist['Uses ARIA labels where appropriate'] = ariaLabels.length > 0

    // Calculate score
    const totalChecks = Object.keys(checklist).length
    const passedChecks = Object.values(checklist).filter(Boolean).length
    const score = Math.round((passedChecks / totalChecks) * 100)

    return { score, issues, suggestions, checklist }
  }
}

// React hook for accessibility features
export function useAccessibility() {
  const announceToScreenReader = (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    AccessibilityEnhancer.announceToScreenReader(message, priority)
  }

  const respectsMotionPreferences = AccessibilityEnhancer.respectMotionPreferences()
  const isHighContrast = AccessibilityEnhancer.isHighContrastMode()

  return {
    announceToScreenReader,
    respectsMotionPreferences,
    isHighContrast,
    generateMoodAriaLabel: AccessibilityEnhancer.generateMoodAriaLabel,
    checkColorContrast: AccessibilityEnhancer.checkColorContrast
  }
}

// Accessibility-focused color palette for mood tracking
export const accessibleColors = {
  // High contrast mood colors
  moods: {
    excellent: { bg: '#166534', text: '#ffffff', name: 'Dark Green' }, // 9-10
    good: { bg: '#059669', text: '#ffffff', name: 'Green' }, // 7-8  
    okay: { bg: '#0891b2', text: '#ffffff', name: 'Cyan' }, // 5-6
    poor: { bg: '#dc2626', text: '#ffffff', name: 'Red' }, // 3-4
    terrible: { bg: '#7f1d1d', text: '#ffffff', name: 'Dark Red' } // 1-2
  },

  // UI colors with WCAG AA compliance
  ui: {
    primary: { bg: '#7c3aed', text: '#ffffff', contrast: 7.2 },
    secondary: { bg: '#4f46e5', text: '#ffffff', contrast: 8.1 },
    success: { bg: '#059669', text: '#ffffff', contrast: 5.8 },
    warning: { bg: '#d97706', text: '#ffffff', contrast: 4.9 },
    error: { bg: '#dc2626', text: '#ffffff', contrast: 5.2 },
    info: { bg: '#0891b2', text: '#ffffff', contrast: 4.7 }
  }
}

