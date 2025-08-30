'use client'

import React, { memo, useMemo, useCallback, useState, useEffect, ReactNode, Suspense, useRef } from 'react'
import { usePerformanceMonitor } from '@/lib/performance/performance-monitor'

/**
 * Higher-order component for performance monitoring
 */
export function withPerformanceMonitoring<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  componentName: string
) {
  const PerformanceMonitoredComponent = (props: P) => {
    const { trackComponentRender } = usePerformanceMonitor()
    
    useEffect(() => {
      trackComponentRender(componentName, () => {
        // Component rendered
      })
    }, [])

    return <Component {...props} />
  }

  PerformanceMonitoredComponent.displayName = `withPerformanceMonitoring(${componentName})`
  return PerformanceMonitoredComponent
}

/**
 * Memoized component wrapper for expensive components
 */
export function memoComponent<P extends Record<string, any>>(
  Component: React.ComponentType<P>,
  areEqual?: (prevProps: P, nextProps: P) => boolean
) {
  return memo(Component, areEqual)
}

/**
 * Lazy loading wrapper with suspense and error boundary
 */
interface LazyLoadWrapperProps {
  children: ReactNode
  fallback?: ReactNode
  errorFallback?: ReactNode
  minHeight?: string
}

export function LazyLoadWrapper({ 
  children, 
  fallback, 
  errorFallback,
  minHeight = '200px'
}: LazyLoadWrapperProps) {
  const [hasError, setHasError] = useState(false)

  const defaultFallback = (
    <div 
      className="flex items-center justify-center bg-gray-50 rounded-lg animate-pulse" 
      style={{ minHeight }}
    >
      <div className="text-gray-400">Loading...</div>
    </div>
  )

  const defaultErrorFallback = (
    <div 
      className="flex items-center justify-center bg-red-50 rounded-lg border border-red-200"
      style={{ minHeight }}
    >
      <div className="text-red-600">Failed to load component</div>
    </div>
  )

  if (hasError) {
    return <>{errorFallback || defaultErrorFallback}</>
  }

  return (
    <ErrorBoundary onError={() => setHasError(true)}>
      <Suspense fallback={fallback || defaultFallback}>
        {children}
      </Suspense>
    </ErrorBoundary>
  )
}

/**
 * Simple error boundary component
 */
interface ErrorBoundaryProps {
  children: ReactNode
  onError?: () => void
}

interface ErrorBoundaryState {
  hasError: boolean
}

class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Component error caught:', error, errorInfo)
    if (this.props.onError) {
      this.props.onError()
    }
  }

  render() {
    if (this.state.hasError) {
      return null // Let parent handle error display
    }

    return this.props.children
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  elementRef: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = useState(false)

  useEffect(() => {
    const element = elementRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsIntersecting(entry.isIntersecting)
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
        ...options
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [elementRef, options])

  return isIntersecting
}

/**
 * Virtual scrolling hook for large lists
 */
interface UseVirtualScrollingOptions {
  itemHeight: number
  containerHeight: number
  overscan?: number
}

export function useVirtualScrolling<T>(
  items: T[],
  { itemHeight, containerHeight, overscan = 5 }: UseVirtualScrollingOptions
) {
  const [scrollTop, setScrollTop] = useState(0)

  const visibleCount = Math.ceil(containerHeight / itemHeight)
  const totalHeight = items.length * itemHeight

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan)
  const endIndex = Math.min(
    items.length - 1,
    Math.floor((scrollTop + containerHeight) / itemHeight) + overscan
  )

  const visibleItems = useMemo(() => {
    return items.slice(startIndex, endIndex + 1).map((item, index) => ({
      item,
      index: startIndex + index
    }))
  }, [items, startIndex, endIndex])

  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
    setScrollTop(e.currentTarget.scrollTop)
  }, [])

  return {
    visibleItems,
    totalHeight,
    startIndex,
    handleScroll,
    offsetY: startIndex * itemHeight
  }
}

/**
 * Optimized image component with lazy loading
 */
interface OptimizedImageProps {
  src: string
  alt: string
  width?: number
  height?: number
  className?: string
  placeholder?: string
  onLoad?: () => void
  onError?: () => void
}

export function OptimizedImage({
  src,
  alt,
  width,
  height,
  className = '',
  placeholder = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2VlZSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ibW9ub3NwYWNlIiBmb250LXNpemU9IjE5cHgiIGZpbGw9IiNhYWEiPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
  onLoad,
  onError
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)
  const [shouldLoad, setShouldLoad] = useState(false)
  const imageRef = useRef<HTMLDivElement>(null)
  const isInView = useIntersectionObserver(imageRef, { rootMargin: '100px' })

  useEffect(() => {
    if (isInView) {
      setShouldLoad(true)
    }
  }, [isInView])

  const handleLoad = () => {
    setIsLoaded(true)
    onLoad?.()
  }

  const handleError = () => {
    setHasError(true)
    onError?.()
  }

  return (
    <div 
      ref={imageRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {!isLoaded && !hasError && (
        <img
          src={placeholder}
          alt="Loading..."
          className="absolute inset-0 w-full h-full object-cover"
        />
      )}
      
      {shouldLoad && !hasError && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
        />
      )}
      
      {hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <span className="text-gray-400 text-sm">Failed to load image</span>
        </div>
      )}
    </div>
  )
}

/**
 * Debounced value hook
 */
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

/**
 * Throttled callback hook
 */
export function useThrottle<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const [lastCall, setLastCall] = useState(0)

  return useCallback((...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      setLastCall(now)
      return callback(...args)
    }
  }, [callback, delay, lastCall]) as T
}
