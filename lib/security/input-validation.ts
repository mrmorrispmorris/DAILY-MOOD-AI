// Input validation and sanitization for Phase 2.3 Security Hardening

export class InputValidator {
  // Sanitize string input to prevent XSS
  static sanitizeString(input: string, maxLength: number = 500): string {
    if (typeof input !== 'string') {
      return ''
    }
    
    return input
      .trim()
      .slice(0, maxLength)
      // Remove potentially dangerous HTML/script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/javascript:/gi, '') // Remove javascript: URLs
      .replace(/on\w+\s*=/gi, '') // Remove event handlers
  }

  // Validate email format
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') {
      return false
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email) && email.length <= 254 // RFC 5321 limit
  }

  // Validate mood score
  static validateMoodScore(score: any): boolean {
    return typeof score === 'number' && 
           Number.isInteger(score) && 
           score >= 1 && 
           score <= 10
  }

  // Validate date string (YYYY-MM-DD format)
  static validateDateString(dateStr: string): boolean {
    if (!dateStr || typeof dateStr !== 'string') {
      return false
    }
    
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(dateStr)) {
      return false
    }
    
    const date = new Date(dateStr)
    return date instanceof Date && !isNaN(date.getTime())
  }

  // Validate user ID format (UUID-like)
  static validateUserId(userId: string): boolean {
    if (!userId || typeof userId !== 'string') {
      return false
    }
    
    // Basic UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    return uuidRegex.test(userId)
  }

  // Validate and sanitize mood entry data
  static validateMoodEntry(data: any): {
    isValid: boolean
    errors: string[]
    sanitized?: {
      mood_score: number
      notes: string
      user_id: string
      date: string
      emoji: string
      tags: string[]
    }
  } {
    const errors: string[] = []
    
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid data format'] }
    }

    // Validate mood score
    if (!this.validateMoodScore(data.mood_score)) {
      errors.push('Invalid mood score (must be integer 1-10)')
    }

    // Validate user ID
    if (!this.validateUserId(data.user_id)) {
      errors.push('Invalid user ID format')
    }

    // Validate date
    if (!this.validateDateString(data.date)) {
      errors.push('Invalid date format (must be YYYY-MM-DD)')
    }

    // Sanitize notes
    const notes = this.sanitizeString(data.notes || '', 1000)
    
    // Sanitize emoji (basic validation)
    const emoji = typeof data.emoji === 'string' ? data.emoji.slice(0, 10) : '😐'
    
    // Validate tags array
    let tags: string[] = []
    if (Array.isArray(data.tags)) {
      tags = data.tags
        .filter(tag => typeof tag === 'string')
        .slice(0, 10) // Max 10 tags
        .map(tag => this.sanitizeString(tag, 50)) // Max 50 chars per tag
    }

    if (errors.length > 0) {
      return { isValid: false, errors }
    }

    return {
      isValid: true,
      errors: [],
      sanitized: {
        mood_score: data.mood_score,
        notes,
        user_id: data.user_id,
        date: data.date,
        emoji,
        tags
      }
    }
  }

  // Validate Stripe checkout session data
  static validateStripeCheckout(data: any): {
    isValid: boolean
    errors: string[]
    sanitized?: {
      userId: string
      email: string
      priceId: string
    }
  } {
    const errors: string[] = []
    
    if (!data || typeof data !== 'object') {
      return { isValid: false, errors: ['Invalid data format'] }
    }

    // Validate user ID
    if (!this.validateUserId(data.userId)) {
      errors.push('Invalid user ID format')
    }

    // Validate email
    if (!this.validateEmail(data.email)) {
      errors.push('Invalid email format')
    }

    // Validate price ID (basic format check)
    if (!data.priceId || typeof data.priceId !== 'string' || 
        !data.priceId.startsWith('price_') || data.priceId.length < 10) {
      errors.push('Invalid Stripe price ID format')
    }

    if (errors.length > 0) {
      return { isValid: false, errors }
    }

    return {
      isValid: true,
      errors: [],
      sanitized: {
        userId: data.userId,
        email: data.email.toLowerCase().trim(),
        priceId: data.priceId
      }
    }
  }

  // General object sanitization
  static sanitizeObject(obj: any, allowedKeys: string[]): Record<string, any> {
    if (!obj || typeof obj !== 'object') {
      return {}
    }

    const sanitized: Record<string, any> = {}
    
    for (const key of allowedKeys) {
      if (key in obj) {
        const value = obj[key]
        
        if (typeof value === 'string') {
          sanitized[key] = this.sanitizeString(value)
        } else if (typeof value === 'number' && Number.isFinite(value)) {
          sanitized[key] = value
        } else if (typeof value === 'boolean') {
          sanitized[key] = value
        } else if (Array.isArray(value)) {
          sanitized[key] = value.slice(0, 100) // Limit array size
        }
      }
    }

    return sanitized
  }
}
