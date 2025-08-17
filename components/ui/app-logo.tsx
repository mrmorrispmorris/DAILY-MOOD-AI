'use client'

import { Brain } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  className?: string
}

export function AppLogo({ size = 'md', showText = false, className }: AppLogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
    xl: 'h-16 w-16'
  }

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl'
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-primary to-blue-600 rounded-full blur-sm opacity-20"></div>
        <div className="relative bg-gradient-to-br from-primary to-blue-600 rounded-full p-2">
          <Brain className={cn('text-white', sizeClasses[size])} />
        </div>
      </div>
      {showText && (
        <div className="flex flex-col">
          <span className={cn('font-bold text-gray-900', textSizeClasses[size])}>
            DailyMood AI
          </span>
          {size === 'lg' || size === 'xl' ? (
            <span className="text-sm text-gray-600 -mt-1">
              Smart Mood Tracking
            </span>
          ) : null}
        </div>
      )}
    </div>
  )
}