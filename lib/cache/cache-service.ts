'use client'

/**
 * Client-side caching service for performance optimization
 * Provides intelligent caching with TTL and memory management
 */

export interface CacheEntry<T> {
  data: T
  timestamp: number
  ttl: number // Time to live in milliseconds
  hits: number
}

export interface CacheOptions {
  ttl?: number // Default 5 minutes
  maxSize?: number // Default 100 entries
  onEvict?: (key: string, value: any) => void
}

class CacheService {
  private cache = new Map<string, CacheEntry<any>>()
  private maxSize: number
  private defaultTTL: number
  private onEvict?: (key: string, value: any) => void

  constructor(options: CacheOptions = {}) {
    this.maxSize = options.maxSize || 100
    this.defaultTTL = options.ttl || 5 * 60 * 1000 // 5 minutes
    this.onEvict = options.onEvict

    // Cleanup expired entries every minute
    if (typeof window !== 'undefined') {
      setInterval(() => this.cleanup(), 60000)
    }
  }

  /**
   * Store data in cache with optional TTL
   */
  public set<T>(key: string, data: T, ttl?: number): void {
    // If cache is full, remove least recently used entry
    if (this.cache.size >= this.maxSize) {
      this.evictLRU()
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttl || this.defaultTTL,
      hits: 0
    }

    this.cache.set(key, entry)
  }

  /**
   * Retrieve data from cache
   */
  public get<T>(key: string): T | null {
    const entry = this.cache.get(key)
    
    if (!entry) {
      return null
    }

    // Check if entry is expired
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key)
      return null
    }

    // Increment hit counter for LRU tracking
    entry.hits++
    entry.timestamp = Date.now() // Update access time
    
    return entry.data as T
  }

  /**
   * Check if key exists and is not expired
   */
  public has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * Remove entry from cache
   */
  public delete(key: string): boolean {
    const entry = this.cache.get(key)
    if (entry && this.onEvict) {
      this.onEvict(key, entry.data)
    }
    return this.cache.delete(key)
  }

  /**
   * Clear all cache entries
   */
  public clear(): void {
    if (this.onEvict) {
      this.cache.forEach((entry, key) => {
        this.onEvict!(key, entry.data)
      })
    }
    this.cache.clear()
  }

  /**
   * Get or set pattern - retrieve from cache or compute and store
   */
  public async getOrSet<T>(
    key: string, 
    computeFn: () => Promise<T> | T, 
    ttl?: number
  ): Promise<T> {
    const cached = this.get<T>(key)
    
    if (cached !== null) {
      return cached
    }

    const computed = await computeFn()
    this.set(key, computed, ttl)
    return computed
  }

  /**
   * Get cache statistics
   */
  public getStats(): {
    size: number
    maxSize: number
    hitRate: number
    entries: Array<{ key: string; hits: number; age: number }>
  } {
    const now = Date.now()
    const entries = Array.from(this.cache.entries()).map(([key, entry]) => ({
      key,
      hits: entry.hits,
      age: now - entry.timestamp
    }))

    const totalHits = entries.reduce((sum, entry) => sum + entry.hits, 0)
    const hitRate = totalHits > 0 ? (totalHits / (totalHits + this.cache.size)) * 100 : 0

    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: Math.round(hitRate * 100) / 100,
      entries: entries.sort((a, b) => b.hits - a.hits)
    }
  }

  /**
   * Remove expired entries
   */
  private cleanup(): void {
    const now = Date.now()
    const toDelete: string[] = []

    this.cache.forEach((entry, key) => {
      if (now - entry.timestamp > entry.ttl) {
        toDelete.push(key)
      }
    })

    toDelete.forEach(key => {
      const entry = this.cache.get(key)
      if (entry && this.onEvict) {
        this.onEvict(key, entry.data)
      }
      this.cache.delete(key)
    })

    if (toDelete.length > 0) {
      console.debug(`Cache cleanup: removed ${toDelete.length} expired entries`)
    }
  }

  /**
   * Evict least recently used entry
   */
  private evictLRU(): void {
    let oldestKey = ''
    let oldestTime = Date.now()

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp
        oldestKey = key
      }
    })

    if (oldestKey) {
      const entry = this.cache.get(oldestKey)
      if (entry && this.onEvict) {
        this.onEvict(oldestKey, entry.data)
      }
      this.cache.delete(oldestKey)
    }
  }
}

// Specialized cache instances
export const apiCache = new CacheService({
  ttl: 2 * 60 * 1000, // 2 minutes for API responses
  maxSize: 50,
  onEvict: (key, value) => {
    console.debug(`API cache evicted: ${key}`)
  }
})

export const userDataCache = new CacheService({
  ttl: 10 * 60 * 1000, // 10 minutes for user data
  maxSize: 20,
  onEvict: (key, value) => {
    console.debug(`User data cache evicted: ${key}`)
  }
})

export const staticCache = new CacheService({
  ttl: 60 * 60 * 1000, // 1 hour for static data
  maxSize: 30,
  onEvict: (key, value) => {
    console.debug(`Static cache evicted: ${key}`)
  }
})

/**
 * Hook for using cache in React components
 */
export function useCache(cacheInstance: CacheService = apiCache) {
  return {
    get: <T>(key: string) => cacheInstance.get<T>(key),
    set: <T>(key: string, data: T, ttl?: number) => cacheInstance.set(key, data, ttl),
    getOrSet: <T>(key: string, computeFn: () => Promise<T> | T, ttl?: number) =>
      cacheInstance.getOrSet(key, computeFn, ttl),
    has: (key: string) => cacheInstance.has(key),
    delete: (key: string) => cacheInstance.delete(key),
    clear: () => cacheInstance.clear(),
    getStats: () => cacheInstance.getStats()
  }
}

/**
 * Cache middleware for API calls
 */
export async function cachedFetch<T>(
  url: string, 
  options: RequestInit = {}, 
  cacheKey?: string,
  ttl?: number
): Promise<T> {
  const key = cacheKey || `${options.method || 'GET'}:${url}`
  
  // Only cache GET requests by default
  if (options.method && options.method.toUpperCase() !== 'GET') {
    const response = await fetch(url, options)
    return response.json()
  }

  return apiCache.getOrSet(key, async () => {
    const response = await fetch(url, options)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.json()
  }, ttl)
}

export default CacheService


