// Rate limiting utility for Phase 2.3 Security Hardening
import { NextRequest, NextResponse } from 'next/server'

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
  keyGenerator?: (req: NextRequest) => string
  message?: string
}

export function rateLimit(config: RateLimitConfig) {
  const {
    maxRequests,
    windowMs,
    keyGenerator = (req) => getClientIP(req),
    message = 'Too many requests, please try again later.'
  } = config

  return (req: NextRequest): NextResponse | null => {
    const key = keyGenerator(req)
    const now = Date.now()

    // Clean up expired entries
    for (const [k, v] of rateLimitStore.entries()) {
      if (now > v.resetTime) {
        rateLimitStore.delete(k)
      }
    }

    // Get or create entry for this key
    let entry = rateLimitStore.get(key)
    
    if (!entry || now > entry.resetTime) {
      entry = {
        count: 1,
        resetTime: now + windowMs
      }
      rateLimitStore.set(key, entry)
      return null // Request allowed
    }

    // Check if limit exceeded
    if (entry.count >= maxRequests) {
      return NextResponse.json(
        { error: message, retryAfter: Math.ceil((entry.resetTime - now) / 1000) },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((entry.resetTime - now) / 1000).toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': entry.resetTime.toString()
          }
        }
      )
    }

    // Increment counter
    entry.count++
    rateLimitStore.set(key, entry)

    return null // Request allowed
  }
}

// Get client IP address for rate limiting
function getClientIP(req: NextRequest): string {
  // Check various headers for real IP
  const forwarded = req.headers.get('x-forwarded-for')
  const realIp = req.headers.get('x-real-ip')
  const clientIp = req.headers.get('x-client-ip')

  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIp) {
    return realIp
  }
  
  if (clientIp) {
    return clientIp
  }

  // Fallback to a default identifier
  return 'unknown'
}

// Common rate limit configurations
export const RateLimits = {
  // Strict for sensitive operations
  strict: {
    maxRequests: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Moderate for API calls
  moderate: {
    maxRequests: 100,
    windowMs: 15 * 60 * 1000, // 15 minutes
  },
  
  // Lenient for general usage
  lenient: {
    maxRequests: 1000,
    windowMs: 15 * 60 * 1000, // 15 minutes
  }
}
