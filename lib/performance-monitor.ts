// Performance monitoring utilities for production
export class PerformanceMonitor {
  private static instance: PerformanceMonitor | null = null
  private metrics: Map<string, number> = new Map()

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor()
    }
    return PerformanceMonitor.instance
  }

  // Measure page load time
  measurePageLoad(pageName: string): void {
    if (typeof window === 'undefined') return
    
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      entries.forEach((entry) => {
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming
          const loadTime = navEntry.loadEventEnd - navEntry.fetchStart
          this.metrics.set(`${pageName}_load_time`, loadTime)
          
          // Log slow pages (>3 seconds)
          if (loadTime > 3000) {
            console.warn(`Slow page load detected: ${pageName} took ${loadTime}ms`)
          }
        }
      })
    })
    
    observer.observe({ entryTypes: ['navigation'] })
  }

  // Measure API response time
  measureApiCall(endpoint: string, startTime: number): void {
    const endTime = performance.now()
    const duration = endTime - startTime
    this.metrics.set(`api_${endpoint}`, duration)
    
    // Log slow API calls (>2 seconds)
    if (duration > 2000) {
      console.warn(`Slow API call detected: ${endpoint} took ${duration}ms`)
    }
  }

  // Measure Core Web Vitals
  measureWebVitals(): void {
    if (typeof window === 'undefined') return

    // Largest Contentful Paint
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.metrics.set('lcp', lastEntry.startTime)
      
      if (lastEntry.startTime > 2500) {
        console.warn(`Poor LCP detected: ${lastEntry.startTime}ms`)
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] })

    // First Input Delay
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        const delay = (entry as any).processingStart - entry.startTime
        this.metrics.set('fid', delay)
        
        if (delay > 100) {
          console.warn(`Poor FID detected: ${delay}ms`)
        }
      })
    }).observe({ entryTypes: ['first-input'] })

    // Cumulative Layout Shift
    let cumulativeLayoutShiftScore = 0
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries()
      entries.forEach((entry) => {
        if (!(entry as any).hadRecentInput) {
          cumulativeLayoutShiftScore += (entry as any).value
        }
      })
      
      this.metrics.set('cls', cumulativeLayoutShiftScore)
      
      if (cumulativeLayoutShiftScore > 0.1) {
        console.warn(`Poor CLS detected: ${cumulativeLayoutShiftScore}`)
      }
    }).observe({ entryTypes: ['layout-shift'] })
  }

  // Get all collected metrics
  getMetrics(): Record<string, number> {
    return Object.fromEntries(this.metrics)
  }

  // Send metrics to analytics (placeholder)
  sendMetrics(): void {
    const metrics = this.getMetrics()
    
    // In a real app, send to your analytics service
    if (process.env.NODE_ENV === 'development') {
      console.log('Performance Metrics:', metrics)
    }
    
    // Example: Send to your analytics endpoint
    // fetch('/api/analytics/performance', {
    //   method: 'POST',
    //   body: JSON.stringify(metrics)
    // })
  }
}

// Hook for React components
export function usePerformanceMonitor() {
  const monitor = PerformanceMonitor.getInstance()
  
  return {
    measurePageLoad: (pageName: string) => monitor.measurePageLoad(pageName),
    measureApiCall: (endpoint: string, startTime: number) => monitor.measureApiCall(endpoint, startTime),
    measureWebVitals: () => monitor.measureWebVitals(),
    getMetrics: () => monitor.getMetrics(),
    sendMetrics: () => monitor.sendMetrics()
  }
}

// Auto-initialize web vitals monitoring
if (typeof window !== 'undefined') {
  const monitor = PerformanceMonitor.getInstance()
  monitor.measureWebVitals()
  
  // Send metrics on page unload
  window.addEventListener('beforeunload', () => {
    monitor.sendMetrics()
  })
}

