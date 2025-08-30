'use client'

import { motion } from 'framer-motion'

// Main loading component for mood entry
export const MoodEntryLoading = () => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 animate-pulse">
    <div className="text-center mb-8">
      <div className="h-6 bg-purple-200 rounded w-48 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
    </div>
    
    {/* Emoji placeholder */}
    <div className="text-center mb-8">
      <div className="w-32 h-32 bg-purple-200 rounded-full mx-auto mb-4"></div>
      <div className="h-6 bg-gray-200 rounded w-24 mx-auto mb-2"></div>
      <div className="h-4 bg-gray-200 rounded w-16 mx-auto"></div>
    </div>
    
    {/* Slider placeholder */}
    <div className="mb-8">
      <div className="flex justify-between mb-2">
        <div className="h-3 bg-gray-200 rounded w-16"></div>
        <div className="h-3 bg-gray-200 rounded w-12"></div>
        <div className="h-3 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="h-4 bg-purple-200 rounded-full"></div>
    </div>
    
    {/* Activities placeholder */}
    <div className="mb-6">
      <div className="h-4 bg-gray-200 rounded w-48 mb-3"></div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-16 bg-purple-100 rounded-xl"></div>
        ))}
      </div>
    </div>
    
    {/* Button placeholder */}
    <div className="h-12 bg-purple-200 rounded-2xl"></div>
  </div>
)

// Chart loading component
export const MoodChartLoading = () => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8 animate-pulse">
    <div className="h-6 bg-purple-200 rounded w-32 mb-6"></div>
    
    {/* Chart area */}
    <div className="h-64 bg-gradient-to-t from-purple-100 to-purple-50 rounded-2xl mb-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
    </div>
    
    {/* Legend */}
    <div className="flex justify-center gap-4">
      <div className="h-3 bg-gray-200 rounded w-16"></div>
      <div className="h-3 bg-gray-200 rounded w-20"></div>
      <div className="h-3 bg-gray-200 rounded w-18"></div>
    </div>
  </div>
)

// AI Insights loading with animated dots
export const AIInsightsLoading = () => (
  <div className="bg-white/80 backdrop-blur-md rounded-3xl shadow-xl border border-white/30 p-8">
    <div className="flex items-center gap-3 mb-6">
      <div className="w-8 h-8 bg-purple-200 rounded-full animate-pulse"></div>
      <div className="h-6 bg-purple-200 rounded w-40 animate-pulse"></div>
    </div>
    
    <div className="space-y-4 mb-6">
      <div className="h-4 bg-gray-200 rounded w-full animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-5/6 animate-pulse"></div>
      <div className="h-4 bg-gray-200 rounded w-4/6 animate-pulse"></div>
    </div>
    
    {/* Animated thinking dots */}
    <div className="flex items-center justify-center gap-1 py-4">
      <span className="text-purple-600 text-lg">AI is analyzing your patterns</span>
      <div className="flex gap-1 ml-2">
        {[0, 1, 2].map(i => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-purple-600 rounded-full"
            animate={{ 
              scale: [1, 1.2, 1],
              opacity: [0.7, 1, 0.7]
            }}
            transition={{ 
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
      </div>
    </div>
  </div>
)

// Stats card loading
export const StatsCardLoading = () => (
  <div className="bg-white/80 backdrop-blur rounded-xl p-4 shadow-lg animate-pulse">
    <div className="flex items-center justify-between">
      <div>
        <div className="h-3 bg-gray-200 rounded w-20 mb-2"></div>
        <div className="h-6 bg-gray-200 rounded w-16"></div>
      </div>
      <div className="w-8 h-8 bg-purple-200 rounded"></div>
    </div>
  </div>
)

// Page loading overlay
export const PageLoading = ({ message = "Loading..." }: { message?: string }) => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin mb-4 mx-auto"></div>
      <p className="text-gray-600 text-lg">{message}</p>
    </div>
  </div>
)

// Skeleton list for mood history
export const MoodHistoryLoading = () => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {Array.from({ length: 6 }).map((_, i) => (
      <div key={i} className="bg-white/70 backdrop-blur-sm p-6 rounded-2xl shadow-lg animate-pulse">
        <div className="flex items-center justify-between mb-3">
          <div className="w-8 h-8 bg-purple-200 rounded"></div>
          <div className="h-4 bg-purple-200 rounded-full w-12"></div>
        </div>
        <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-3 bg-gray-200 rounded w-full"></div>
        <div className="h-3 bg-gray-200 rounded w-3/4 mt-1"></div>
      </div>
    ))}
  </div>
)

// Button loading state
export const ButtonLoading = ({ children, loading, ...props }: { 
  children: React.ReactNode
  loading: boolean
  [key: string]: any 
}) => (
  <button disabled={loading} {...props}>
    {loading ? (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
        Loading...
      </div>
    ) : (
      children
    )}
  </button>
)

// Shimmer animation for placeholders
export const Shimmer = ({ className = "h-4 bg-gray-200 rounded" }: { className?: string }) => (
  <div className={`${className} animate-pulse relative overflow-hidden`}>
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent animate-shimmer"></div>
  </div>
)

const LoadingStates = {
  MoodEntryLoading,
  MoodChartLoading,
  AIInsightsLoading,
  StatsCardLoading,
  PageLoading,
  MoodHistoryLoading,
  ButtonLoading,
  Shimmer
}

export default LoadingStates
