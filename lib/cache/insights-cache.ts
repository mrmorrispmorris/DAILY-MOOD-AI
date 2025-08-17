'use client'

interface CachedInsight {
  data: any
  timestamp: number
  userId: string
}

export class InsightsCache {
  private static CACHE_KEY = 'dailymood_insights_cache'
  private static CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  static saveInsights(userId: string, insights: any): void {
    if (typeof window === 'undefined') return

    const cached: CachedInsight = {
      data: insights,
      timestamp: Date.now(),
      userId
    }

    localStorage.setItem(this.CACHE_KEY, JSON.stringify(cached))
  }

  static getCachedInsights(userId: string): any | null {
    if (typeof window === 'undefined') return null

    try {
      const stored = localStorage.getItem(this.CACHE_KEY)
      if (!stored) return null

      const cached: CachedInsight = JSON.parse(stored)
      
      // Check if cache is for the same user and still valid
      if (cached.userId !== userId) return null
      if (Date.now() - cached.timestamp > this.CACHE_DURATION) {
        this.clearCache()
        return null
      }

      return cached.data
    } catch (error) {
      console.error('Error reading insights cache:', error)
      return null
    }
  }

  static clearCache(): void {
    if (typeof window === 'undefined') return
    localStorage.removeItem(this.CACHE_KEY)
  }

  static isCacheValid(userId: string): boolean {
    return this.getCachedInsights(userId) !== null
  }
}