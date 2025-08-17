'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Plus, BarChart3, Settings, CreditCard } from 'lucide-react'
import { cn } from '@/lib/utils'

const tabs = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: Home,
    description: 'Dashboard'
  },
  {
    name: 'Log',
    href: '/log-mood',
    icon: Plus,
    description: 'Log Mood'
  },
  {
    name: 'Insights',
    href: '/insights',
    icon: BarChart3,
    description: 'AI Insights'
  },
  {
    name: 'Settings',
    href: '/profile',
    icon: Settings,
    description: 'Profile'
  },
  {
    name: 'Pricing',
    href: '/pricing',
    icon: CreditCard,
    description: 'Upgrade'
  }
]

export function BottomTabs() {
  const pathname = usePathname()
  const [activeTab, setActiveTab] = useState(pathname)

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 shadow-lg">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          const Icon = tab.icon
          
          return (
            <Link
              key={tab.name}
              href={tab.href}
              onClick={() => setActiveTab(tab.href)}
              className={cn(
                'flex flex-col items-center justify-center w-16 h-16 rounded-xl transition-all duration-200 group',
                isActive 
                  ? 'bg-calm-blue text-white shadow-lg scale-105' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-calm-blue dark:hover:text-calm-blue hover:bg-gray-50 dark:hover:bg-gray-800'
              )}
            >
              <Icon 
                className={cn(
                  'h-6 w-6 mb-1 transition-all duration-200',
                  isActive ? 'scale-110' : 'group-hover:scale-110'
                )} 
              />
              <span className={cn(
                'text-xs font-medium transition-all duration-200',
                isActive ? 'opacity-100' : 'opacity-80 group-hover:opacity-100'
              )}>
                {tab.name}
              </span>
              
              {/* Active indicator */}
              {isActive && (
                <div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-calm-blue rounded-full animate-pulse" />
              )}
            </Link>
          )
        })}
      </div>
      
      {/* Safe area for devices with home indicator */}
      <div className="h-4 bg-white dark:bg-gray-900" />
    </div>
  )
}

// Mobile-only wrapper component
export function MobileBottomTabs() {
  return (
    <div className="block md:hidden">
      <BottomTabs />
    </div>
  )
}

// Desktop navigation component
export function DesktopNavigation() {
  const pathname = usePathname()
  
  return (
    <nav className="hidden md:flex items-center space-x-8 px-6 py-4 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      {tabs.map((tab) => {
        const isActive = pathname === tab.href
        const Icon = tab.icon
        
        return (
          <Link
            key={tab.name}
            href={tab.href}
            className={cn(
              'flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 font-medium',
              isActive 
                ? 'bg-calm-blue text-white shadow-md' 
                : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-calm-blue'
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{tab.name}</span>
          </Link>
        )
      })}
    </nav>
  )
}




