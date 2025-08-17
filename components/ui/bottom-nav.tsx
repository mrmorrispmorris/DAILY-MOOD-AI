'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, TrendingUp, Plus, Calendar, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
    description: 'Dashboard overview'
  },
  {
    href: '/trends',
    label: 'Trends',
    icon: TrendingUp,
    description: 'View mood trends'
  },
  {
    href: '/log-mood',
    label: 'Log Mood',
    icon: Plus,
    isCenter: true,
    description: 'Log your current mood'
  },
  {
    href: '/calendar',
    label: 'Calendar',
    icon: Calendar,
    description: 'Calendar view'
  },
  {
    href: '/profile',
    label: 'Profile',
    icon: User,
    description: 'User settings'
  },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 z-50 shadow-lg">
      <div className="max-w-md mx-auto px-2">
        <div className="flex items-center justify-around py-3">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[60px]',
                  item.isCenter
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-xl scale-110 -mt-3 ring-4 ring-blue-100 dark:ring-blue-900/30'
                    : isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                    : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10'
                )}
                aria-label={`${item.label} - ${item.description}`}
                title={item.description}
              >
                <Icon className={cn(
                  'transition-all duration-300',
                  item.isCenter ? 'h-7 w-7' : 'h-6 w-6',
                  isActive && !item.isCenter ? 'scale-110' : 'scale-100'
                )} />
                <span className={cn(
                  'text-xs font-semibold mt-2 text-center leading-tight',
                  item.isCenter ? 'text-xs' : '',
                  isActive && !item.isCenter ? 'text-blue-600 dark:text-blue-400' : ''
                )}>
                  {item.label}
                </span>
                
                {/* Active indicator */}
                {isActive && !item.isCenter && (
                  <div className="w-1.5 h-1.5 bg-blue-600 dark:bg-blue-400 rounded-full mt-1 animate-pulse" />
                )}
              </Link>
            )
          })}
        </div>
      </div>
      
      {/* Safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom bg-white/95 dark:bg-gray-900/95" />
    </nav>
  )
}