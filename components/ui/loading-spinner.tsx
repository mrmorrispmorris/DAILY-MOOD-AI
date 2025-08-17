import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  className?: string
  variant?: 'default' | 'primary' | 'secondary' | 'success' | 'warning' | 'error'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6',
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const variantClasses = {
  default: 'text-gray-600 dark:text-gray-400',
  primary: 'text-blue-600 dark:text-blue-400',
  secondary: 'text-purple-600 dark:text-purple-400',
  success: 'text-green-600 dark:text-green-400',
  warning: 'text-yellow-600 dark:text-yellow-400',
  error: 'text-red-600 dark:text-red-400'
}

export function LoadingSpinner({ 
  size = 'md', 
  text, 
  className,
  variant = 'default' 
}: LoadingSpinnerProps) {
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <Loader2 
        className={cn(
          'animate-spin',
          sizeClasses[size],
          variantClasses[variant]
        )} 
      />
      {text && (
        <p className={cn(
          'mt-2 text-sm font-medium',
          variantClasses[variant]
        )}>
          {text}
        </p>
      )}
    </div>
  )
}

// Full page loading spinner
export function FullPageSpinner({ 
  text = 'Loading...',
  variant = 'primary'
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <LoadingSpinner size="xl" text={text} variant={variant} />
    </div>
  )
}

// Inline loading spinner
export function InlineSpinner({ 
  size = 'sm',
  variant = 'default'
}: Omit<LoadingSpinnerProps, 'text'>) {
  return <LoadingSpinner size={size} variant={variant} />
}

// Button loading spinner
export function ButtonSpinner({ 
  size = 'sm',
  variant = 'default'
}: Omit<LoadingSpinnerProps, 'text'>) {
  return (
    <div className="flex items-center gap-2">
      <LoadingSpinner size={size} variant={variant} />
      <span>Loading...</span>
    </div>
  )
}

// Chart loading spinner
export function ChartSpinner({ 
  height = 'h-64',
  text = 'Loading chart data...'
}: { height?: string; text?: string }) {
  return (
    <div className={`${height} w-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 rounded-xl border-2 border-dashed border-blue-200 dark:border-gray-700`}>
      <LoadingSpinner size="lg" text={text} variant="primary" />
    </div>
  )
}

// Data loading spinner
export function DataSpinner({ 
  text = 'Loading data...',
  variant = 'primary'
}: Omit<LoadingSpinnerProps, 'size'>) {
  return (
    <div className="flex items-center justify-center py-12">
      <LoadingSpinner size="lg" text={text} variant={variant} />
    </div>
  )
}