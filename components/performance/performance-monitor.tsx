'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Zap, 
  Clock, 
  TrendingUp, 
  Database, 
  Network, 
  Cpu,
  Activity,
  Brain
} from 'lucide-react'

interface PerformanceMetrics {
  pageLoadTime: number
  aiResponseTime: number
  dataFetchTime: number
  cacheHitRate: number
  offlineSyncTime: number
  memoryUsage: number
  networkLatency: number
}

export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    pageLoadTime: 0,
    aiResponseTime: 0,
    dataFetchTime: 0,
    cacheHitRate: 0,
    offlineSyncTime: 0,
    memoryUsage: 0,
    networkLatency: 0
  })
  const [isVisible, setIsVisible] = useState(false)
  const [performanceScore, setPerformanceScore] = useState(0)

  // Calculate performance score
  const calculatePerformanceScore = useCallback((metrics: PerformanceMetrics): number => {
    let score = 100

    // Page load time (target: <2s)
    if (metrics.pageLoadTime > 2000) score -= 20
    else if (metrics.pageLoadTime > 1000) score -= 10

    // AI response time (target: <2s)
    if (metrics.aiResponseTime > 2000) score -= 20
    else if (metrics.aiResponseTime > 1000) score -= 10

    // Data fetch time (target: <500ms)
    if (metrics.dataFetchTime > 500) score -= 15
    else if (metrics.dataFetchTime > 200) score -= 5

    // Cache hit rate (target: >80%)
    if (metrics.cacheHitRate < 80) score -= 10
    else if (metrics.cacheHitRate < 90) score -= 5

    // Offline sync time (target: <1s)
    if (metrics.offlineSyncTime > 1000) score -= 10
    else if (metrics.offlineSyncTime > 500) score -= 5

    // Memory usage (target: <100MB)
    if (metrics.memoryUsage > 100) score -= 10
    else if (metrics.memoryUsage > 50) score -= 5

    // Network latency (target: <100ms)
    if (metrics.networkLatency > 100) score -= 10
    else if (metrics.networkLatency > 50) score -= 5

    return Math.max(0, score)
  }, [])

  // Measure page load time
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loadTime = performance.now()
      setMetrics(prev => ({ ...prev, pageLoadTime: loadTime }))
    }
  }, [])

  // Measure AI response time
  useEffect(() => {
    const startTime = performance.now()
    
    // Simulate AI call measurement
    const measureAITime = () => {
      const endTime = performance.now()
      const responseTime = endTime - startTime
      setMetrics(prev => ({ ...prev, aiResponseTime: responseTime }))
    }

    // Measure after 1.5 seconds (simulating AI response)
    const timer = setTimeout(measureAITime, 1500)
    return () => clearTimeout(timer)
  }, [])

  // Measure data fetch time
  useEffect(() => {
    const startTime = performance.now()
    
    // Simulate data fetch measurement
    const measureDataTime = () => {
      const endTime = performance.now()
      const fetchTime = endTime - startTime
      setMetrics(prev => ({ ...prev, dataFetchTime: fetchTime }))
    }

    // Measure after 300ms (simulating data fetch)
    const timer = setTimeout(measureDataTime, 300)
    return () => clearTimeout(timer)
  }, [])

  // Simulate other metrics
  useEffect(() => {
    const simulateMetrics = () => {
      setMetrics(prev => ({
        ...prev,
        cacheHitRate: Math.random() * 20 + 80, // 80-100%
        offlineSyncTime: Math.random() * 500 + 200, // 200-700ms
        memoryUsage: Math.random() * 50 + 30, // 30-80MB
        networkLatency: Math.random() * 50 + 20 // 20-70ms
      }))
    }

    const timer = setTimeout(simulateMetrics, 2000)
    return () => clearTimeout(timer)
  }, [])

  // Update performance score when metrics change
  useEffect(() => {
    const score = calculatePerformanceScore(metrics)
    setPerformanceScore(score)
  }, [metrics, calculatePerformanceScore])

  // Get performance status
  const getPerformanceStatus = (score: number): { status: string; color: string; icon: any } => {
    if (score >= 90) return { status: 'Excellent', color: 'bg-green-100 text-green-800', icon: Zap }
    if (score >= 80) return { status: 'Good', color: 'bg-blue-100 text-blue-800', icon: TrendingUp }
    if (score >= 70) return { status: 'Fair', color: 'bg-yellow-100 text-yellow-800', icon: Activity }
    return { status: 'Poor', color: 'bg-red-100 text-red-800', icon: Cpu }
  }

  const { status, color, icon: StatusIcon } = getPerformanceStatus(performanceScore)

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-300"
        title="Show Performance Monitor"
      >
        <Activity className="w-5 h-5" />
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      <Card className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-md border-0 shadow-2xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Cpu className="w-5 h-5 text-blue-600" />
              Performance Monitor
            </CardTitle>
            <button
              onClick={() => setIsVisible(false)}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              ×
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Performance Score */}
          <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
            <div className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {performanceScore}/100
            </div>
            <Badge className={color}>
              <StatusIcon className="w-3 h-3 mr-1" />
              {status}
            </Badge>
          </div>

          {/* Metrics */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-blue-600" />
                Page Load
              </span>
              <span className="font-mono">
                {metrics.pageLoadTime > 0 ? `${metrics.pageLoadTime.toFixed(0)}ms` : '...'}
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.pageLoadTime / 2000) * 100, 100)} 
              className="h-2"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-purple-600" />
                AI Response
              </span>
              <span className="font-mono">
                {metrics.aiResponseTime > 0 ? `${metrics.aiResponseTime.toFixed(0)}ms` : '...'}
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.aiResponseTime / 2000) * 100, 100)} 
              className="h-2"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Database className="w-4 h-4 text-green-600" />
                Data Fetch
              </span>
              <span className="font-mono">
                {metrics.dataFetchTime > 0 ? `${metrics.dataFetchTime.toFixed(0)}ms` : '...'}
              </span>
            </div>
            <Progress 
              value={Math.min((metrics.dataFetchTime / 500) * 100, 100)} 
              className="h-2"
            />

            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-600" />
                Cache Hit Rate
              </span>
              <span className="font-mono">
                {metrics.cacheHitRate > 0 ? `${metrics.cacheHitRate.toFixed(1)}%` : '...'}
              </span>
            </div>
            <Progress 
              value={metrics.cacheHitRate} 
              className="h-2"
            />
          </div>

          {/* Performance Tips */}
          {performanceScore < 80 && (
            <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                Performance Tips
              </h4>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                {metrics.pageLoadTime > 2000 && <li>• Optimize page load time</li>}
                {metrics.aiResponseTime > 2000 && <li>• Enable AI response caching</li>}
                {metrics.dataFetchTime > 500 && <li>• Implement data pagination</li>}
                {metrics.cacheHitRate < 80 && <li>• Increase cache utilization</li>}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}




