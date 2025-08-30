// Security hardening utilities and validators
export class SecurityHardening {
  // Input sanitization for user content
  static sanitizeInput(input: string, type: 'text' | 'email' | 'url' | 'number' = 'text'): string {
    if (!input || typeof input !== 'string') {
      return ''
    }

    // Basic XSS prevention
    let sanitized = input
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+=/gi, '')

    // Type-specific sanitization
    switch (type) {
      case 'email':
        sanitized = sanitized.replace(/[^a-zA-Z0-9@._-]/g, '')
        break
      case 'url':
        sanitized = sanitized.replace(/[^a-zA-Z0-9:/?#[\]@!$&'()*+,;=._-]/g, '')
        break
      case 'number':
        sanitized = sanitized.replace(/[^0-9.-]/g, '')
        break
      case 'text':
        // Allow basic punctuation but remove dangerous characters
        sanitized = sanitized.replace(/[<>\"'&]/g, (char) => {
          const map: Record<string, string> = {
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#x27;',
            '&': '&amp;'
          }
          return map[char] || char
        })
        break
    }

    return sanitized.trim()
  }

  // Content Security Policy generator
  static generateCSP(environment: 'development' | 'production' = 'production'): string {
    const baseCSP = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://js.stripe.com https://maps.googleapis.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "img-src 'self' data: https: blob:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self' https://api.stripe.com https://*.supabase.co https://api.openai.com",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "upgrade-insecure-requests"
    ]

    if (environment === 'development') {
      // Add localhost for development
      baseCSP[1] += " 'unsafe-eval' http://localhost:*"
      baseCSP[4] += " http://localhost:*"
    }

    return baseCSP.join('; ')
  }

  // Rate limiting implementation
  private static rateLimitStore = new Map<string, { count: number; resetTime: number }>()

  static checkRateLimit(
    identifier: string, 
    maxRequests: number = 100, 
    windowMs: number = 15 * 60 * 1000 // 15 minutes
  ): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now()
    const key = identifier
    const windowStart = now - windowMs

    // Clean up old entries
    this.rateLimitStore.forEach((data, id) => {
      if (data.resetTime < now) {
        this.rateLimitStore.delete(id)
      }
    })

    const current = this.rateLimitStore.get(key)

    if (!current || current.resetTime < now) {
      // First request or window expired
      const resetTime = now + windowMs
      this.rateLimitStore.set(key, { count: 1, resetTime })
      return { allowed: true, remaining: maxRequests - 1, resetTime }
    }

    if (current.count >= maxRequests) {
      return { allowed: false, remaining: 0, resetTime: current.resetTime }
    }

    current.count++
    this.rateLimitStore.set(key, current)
    return { allowed: true, remaining: maxRequests - current.count, resetTime: current.resetTime }
  }

  // Password strength validator
  static validatePasswordStrength(password: string): {
    score: number
    feedback: string[]
    isStrong: boolean
  } {
    const feedback: string[] = []
    let score = 0

    if (password.length >= 8) score += 1
    else feedback.push('Use at least 8 characters')

    if (/[a-z]/.test(password)) score += 1
    else feedback.push('Include lowercase letters')

    if (/[A-Z]/.test(password)) score += 1
    else feedback.push('Include uppercase letters')

    if (/[0-9]/.test(password)) score += 1
    else feedback.push('Include numbers')

    if (/[^A-Za-z0-9]/.test(password)) score += 1
    else feedback.push('Include special characters')

    if (password.length >= 12) score += 1

    // Check for common patterns
    const commonPatterns = [
      /123456/, /password/, /qwerty/, /abc123/, /admin/i, /user/i, /test/i
    ]
    
    if (commonPatterns.some(pattern => pattern.test(password))) {
      score -= 2
      feedback.push('Avoid common passwords or patterns')
    }

    const isStrong = score >= 4 && feedback.length === 0

    return { score: Math.max(0, score), feedback, isStrong }
  }

  // SQL injection prevention for dynamic queries
  static escapeSQL(input: string): string {
    return input
      .replace(/'/g, "''")
      .replace(/\\/g, '\\\\')
      .replace(/\x00/g, '\\0')
      .replace(/\n/g, '\\n')
      .replace(/\r/g, '\\r')
      .replace(/\x1a/g, '\\Z')
  }

  // Session security validator
  static validateSession(sessionData: any): {
    isValid: boolean
    issues: string[]
    recommendations: string[]
  } {
    const issues: string[] = []
    const recommendations: string[] = []

    if (!sessionData.userId) {
      issues.push('Missing user ID in session')
      recommendations.push('Ensure all sessions have valid user IDs')
    }

    if (!sessionData.expiresAt || new Date(sessionData.expiresAt) < new Date()) {
      issues.push('Session expired or missing expiration')
      recommendations.push('Set appropriate session expiration times')
    }

    if (!sessionData.csrfToken) {
      issues.push('Missing CSRF token')
      recommendations.push('Include CSRF tokens in all sessions')
    }

    const isValid = issues.length === 0

    return { isValid, issues, recommendations }
  }

  // Environment variable validator
  static validateEnvironmentVariables(): {
    missing: string[]
    insecure: string[]
    recommendations: string[]
  } {
    const required = [
      'NEXT_PUBLIC_SUPABASE_URL',
      'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
      'SUPABASE_SERVICE_ROLE_KEY',
      'STRIPE_SECRET_KEY',
      'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
      'OPENAI_API_KEY',
      'NEXT_PUBLIC_URL'
    ]

    const missing: string[] = []
    const insecure: string[] = []
    const recommendations: string[] = []

    required.forEach(key => {
      const value = process.env[key]
      
      if (!value) {
        missing.push(key)
        return
      }

      // Check for insecure patterns
      if (value.includes('localhost') && process.env.NODE_ENV === 'production') {
        insecure.push(`${key} contains localhost in production`)
      }

      if (value.length < 10 && key.includes('KEY')) {
        insecure.push(`${key} appears too short for a secure key`)
      }

      if (key.includes('SECRET') && value.startsWith('sk_test_')) {
        insecure.push(`${key} is using test key in production`)
      }
    })

    if (missing.length > 0) {
      recommendations.push('Add all required environment variables')
    }

    if (insecure.length > 0) {
      recommendations.push('Review and update insecure environment variable values')
    }

    recommendations.push('Rotate API keys regularly')
    recommendations.push('Use separate keys for development and production')

    return { missing, insecure, recommendations }
  }

  // Generate security headers
  static getSecurityHeaders(): Record<string, string> {
    return {
      'X-Frame-Options': 'DENY',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'origin-when-cross-origin',
      'X-XSS-Protection': '1; mode=block',
      'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      'Content-Security-Policy': this.generateCSP()
    }
  }

  // Comprehensive security audit
  static performSecurityAudit(): {
    score: number
    critical: string[]
    warnings: string[]
    recommendations: string[]
    passed: string[]
  } {
    const critical: string[] = []
    const warnings: string[] = []
    const recommendations: string[] = []
    const passed: string[] = []

    // Check environment variables
    const envCheck = this.validateEnvironmentVariables()
    if (envCheck.missing.length > 0) {
      critical.push(`Missing critical environment variables: ${envCheck.missing.join(', ')}`)
    } else {
      passed.push('All required environment variables present')
    }

    if (envCheck.insecure.length > 0) {
      warnings.push(...envCheck.insecure)
    }

    // Check HTTPS
    if (typeof window !== 'undefined' && location.protocol !== 'https:' && 
        !location.hostname.includes('localhost')) {
      critical.push('Not using HTTPS in production')
    } else {
      passed.push('HTTPS properly configured')
    }

    // Check for development tools in production
    if (process.env.NODE_ENV === 'production') {
      if (process.env.NEXT_PUBLIC_SUPABASE_URL?.includes('localhost')) {
        critical.push('Using localhost URLs in production')
      } else {
        passed.push('Production URLs configured correctly')
      }
    }

    recommendations.push(...envCheck.recommendations)
    recommendations.push('Implement proper error logging')
    recommendations.push('Set up monitoring and alerting')
    recommendations.push('Regular security dependency updates')

    // Calculate score
    const totalChecks = critical.length + warnings.length + passed.length
    const score = totalChecks > 0 ? Math.round((passed.length / totalChecks) * 100) : 0

    return { score, critical, warnings, recommendations, passed }
  }
}

// Security middleware for API routes
export function withSecurity(handler: Function) {
  return async (req: any, res: any) => {
    try {
      // Rate limiting
      const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress
      const rateLimit = SecurityHardening.checkRateLimit(clientIP, 100, 15 * 60 * 1000)
      
      if (!rateLimit.allowed) {
        return res.status(429).json({ 
          error: 'Too many requests',
          retryAfter: Math.ceil((rateLimit.resetTime - Date.now()) / 1000)
        })
      }

      // Add security headers
      const headers = SecurityHardening.getSecurityHeaders()
      Object.entries(headers).forEach(([key, value]) => {
        res.setHeader(key, value)
      })

      // Call original handler
      return await handler(req, res)
    } catch (error) {
      console.error('Security middleware error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}

export default SecurityHardening

