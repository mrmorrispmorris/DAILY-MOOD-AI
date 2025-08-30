'use client'

export interface PerformanceMetrics {
  pageLoadTime: number
  apiResponseTimes: Record<string, number>
  renderTimes: Record<string, number>
  memoryUsage?: any
  connectionSpeed?: 'slow-2g' | '2g' | '3g' | '4g'
  timestamp: string
}

export interface DatabasePerformance {
  queryTimes: Record<string, number>
  connectionCount: number
  cacheHitRatio: number
  slowQueries: Array<{ query: string; avgTime: number; calls: number }>
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = []
  private observers: PerformanceObserver[] = []
  private isMonitoring = false

  constructor() {
    if (typeof window !== 'undefined') {
      this.initializeMonitoring()
    }
  }

  private initializeMonitoring() {
    try {
      // Monitor navigation timing
      if ('PerformanceObserver' in window) {
        const navigationObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'navigation') {
              const navEntry = entry as PerformanceNavigationTiming
              this.recordPageLoad(navEntry)
            }
          }
        })
        navigationObserver.observe({ entryTypes: ['navigation'] })
        this.observers.push(navigationObserver)

        // Monitor API calls
        const resourceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource' && entry.name.includes('/api/')) {
              this.recordApiCall(entry as PerformanceResourceTiming)
            }
          }
        })
        resourceObserver.observe({ entryTypes: ['resource'] })
        this.observers.push(resourceObserver)

        // Monitor component renders (if available)
        try {
          const measureObserver = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (entry.entryType === 'measure') {
                this.recordRenderTime(entry.name, entry.duration)
              }
            }
          })
          measureObserver.observe({ entryTypes: ['measure'] })
          this.observers.push(measureObserver)
        } catch (e) {
          // Measure observer not supported
        }
      }

      this.isMonitoring = true
    } catch (error) {
      console.warn('Performance monitoring initialization failed:', error)
    }
  }

  private recordPageLoad(entry: PerformanceNavigationTiming) {
    const loadTime = entry.loadEventEnd - (entry as any).navigationStart
    
    const metrics: PerformanceMetrics = {
      pageLoadTime: loadTime,
      apiResponseTimes: {},
      renderTimes: {},
      timestamp: new Date().toISOString()
    }

    // Add memory usage if available
    if ('memory' in performance) {
      metrics.memoryUsage = (performance as any).memory
    }

    // Add connection info if available
    if ('connection' in navigator) {
      const conn = (navigator as any).connection
      metrics.connectionSpeed = conn.effectiveType
    }

    this.metrics.push(metrics)
    this.trimMetrics()

    // Report slow page loads
    if (loadTime > 3000) {
      this.reportSlowPerformance('page_load', loadTime, { url: window.location.href })
    }
  }

  private recordApiCall(entry: PerformanceResourceTiming) {
    const apiPath = new URL(entry.name).pathname
    const responseTime = entry.responseEnd - entry.requestStart

    // Update current metrics or create new ones
    let currentMetrics = this.metrics[this.metrics.length - 1]
    if (!currentMetrics || Date.now() - new Date(currentMetrics.timestamp).getTime() > 60000) {
      currentMetrics = {
        pageLoadTime: 0,
        apiResponseTimes: {},
        renderTimes: {},
        timestamp: new Date().toISOString()
      }
      this.metrics.push(currentMetrics)
    }

    currentMetrics.apiResponseTimes[apiPath] = responseTime

    // Report slow API calls
    if (responseTime > 2000) {
      this.reportSlowPerformance('api_call', responseTime, { 
        endpoint: apiPath,
        method: 'unknown' // Can't detect method from PerformanceResourceTiming
      })
    }
  }

  private recordRenderTime(componentName: string, duration: number) {
    let currentMetrics = this.metrics[this.metrics.length - 1]
    if (!currentMetrics) {
      currentMetrics = {
        pageLoadTime: 0,
        apiResponseTimes: {},
        renderTimes: {},
        timestamp: new Date().toISOString()
      }
      this.metrics.push(currentMetrics)
    }

    currentMetrics.renderTimes[componentName] = duration

    // Report slow renders
    if (duration > 100) {
      this.reportSlowPerformance('component_render', duration, { component: componentName })
    }
  }

  private trimMetrics() {
    // Keep only last 50 metric entries
    if (this.metrics.length > 50) {
      this.metrics = this.metrics.slice(-50)
    }
  }

  private reportSlowPerformance(type: string, duration: number, metadata: Record<string, any>) {
    // Report to analytics service
    if (typeof fetch !== 'undefined') {
      fetch('/api/analytics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'performance_issue',
          eventData: {
            type,
            duration,
            ...metadata,
            userAgent: navigator.userAgent,
            url: window.location.href
          },
          timestamp: new Date().toISOString()
        })
      }).catch(err => console.warn('Failed to report performance issue:', err))
    }
  }

  /**
   * Manually track API call performance
   */
  public async trackApiCall<T>(
    endpoint: string, 
    apiCall: () => Promise<T>
  ): Promise<T> {
    const startTime = performance.now()
    
    try {
      const result = await apiCall()
      const duration = performance.now() - startTime
      
      // Record the API call time
      let currentMetrics = this.metrics[this.metrics.length - 1]
      if (!currentMetrics) {
        currentMetrics = {
          pageLoadTime: 0,
          apiResponseTimes: {},
          renderTimes: {},
          timestamp: new Date().toISOString()
        }
        this.metrics.push(currentMetrics)
      }
      
      currentMetrics.apiResponseTimes[endpoint] = duration
      
      // Report if slow
      if (duration > 2000) {
        this.reportSlowPerformance('api_call', duration, { endpoint })
      }
      
      return result
    } catch (error) {
      const duration = performance.now() - startTime
      this.reportSlowPerformance('api_error', duration, { 
        endpoint, 
        error: (error as Error).message 
      })
      throw error
    }
  }

  /**
   * Manually track component render time
   */
  public trackComponentRender(componentName: string, renderFunction: () => void) {
    const startTime = performance.now()
    
    // Start performance mark
    if (typeof performance.mark === 'function') {
      performance.mark(`${componentName}-start`)
    }
    
    renderFunction()
    
    const duration = performance.now() - startTime
    
    // End performance mark and measure
    if (typeof performance.mark === 'function' && typeof performance.measure === 'function') {
      performance.mark(`${componentName}-end`)
      performance.measure(`${componentName}-render`, `${componentName}-start`, `${componentName}-end`)
    }
    
    this.recordRenderTime(componentName, duration)
  }

  /**
   * Get current performance metrics
   */
  public getMetrics(): PerformanceMetrics[] {
    return [...this.metrics]
  }

  /**
   * Get performance summary
   */
  public getSummary(): {
    averagePageLoadTime: number
    averageApiResponseTime: number
    slowestApi: string | null
    totalMetrics: number
  } {
    if (this.metrics.length === 0) {
      return {
        averagePageLoadTime: 0,
        averageApiResponseTime: 0,
        slowestApi: null,
        totalMetrics: 0
      }
    }

    const avgPageLoad = this.metrics
      .filter(m => m.pageLoadTime > 0)
      .reduce((sum, m) => sum + m.pageLoadTime, 0) / 
      this.metrics.filter(m => m.pageLoadTime > 0).length || 0

    const allApiTimes: Array<{ endpoint: string; time: number }> = []
    this.metrics.forEach(m => {
      Object.entries(m.apiResponseTimes).forEach(([endpoint, time]) => {
        allApiTimes.push({ endpoint, time })
      })
    })

    const avgApiTime = allApiTimes.length > 0 
      ? allApiTimes.reduce((sum, api) => sum + api.time, 0) / allApiTimes.length
      : 0

    const slowestApi = allApiTimes.length > 0
      ? allApiTimes.reduce((slowest, current) => 
          current.time > slowest.time ? current : slowest
        ).endpoint
      : null

    return {
      averagePageLoadTime: Math.round(avgPageLoad),
      averageApiResponseTime: Math.round(avgApiTime),
      slowestApi,
      totalMetrics: this.metrics.length
    }
  }

  /**
   * Clean up observers
   */
  public cleanup() {
    this.observers.forEach(observer => observer.disconnect())
    this.observers = []
    this.isMonitoring = false
  }
}

// Export singleton instance
export const performanceMonitor = new PerformanceMonitor()

// Export hook for React components
export function usePerformanceMonitor() {
  return {
    trackApiCall: performanceMonitor.trackApiCall.bind(performanceMonitor),
    trackComponentRender: performanceMonitor.trackComponentRender.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    getSummary: performanceMonitor.getSummary.bind(performanceMonitor)
  }
}


