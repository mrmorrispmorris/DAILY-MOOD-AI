'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Palette, Sparkles, Crown, CheckCircle } from 'lucide-react'
import { useSubscription } from '@/hooks/use-subscription'

interface ThemeScheme {
  id: string
  name: string
  description: string
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
  }
  premium: boolean
}

const themeSchemes: ThemeScheme[] = [
  {
    id: 'calm-blue',
    name: 'Calm Blue',
    description: 'Soothing ocean vibes for relaxation',
    colors: {
      primary: '#4A90E2',
      secondary: '#7ED321',
      accent: '#F5A623',
      background: '#F8FBFF'
    },
    premium: false
  },
  {
    id: 'zen-green',
    name: 'Zen Green',
    description: 'Nature-inspired tranquility',
    colors: {
      primary: '#2ECC71',
      secondary: '#27AE60',
      accent: '#F39C12',
      background: '#F0FFF4'
    },
    premium: false
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm, energizing sunset tones',
    colors: {
      primary: '#E67E22',
      secondary: '#D35400',
      accent: '#E74C3C',
      background: '#FFF8F0'
    },
    premium: true
  },
  {
    id: 'lavender-dream',
    name: 'Lavender Dream',
    description: 'Peaceful purple meditation vibes',
    colors: {
      primary: '#9B59B6',
      secondary: '#8E44AD',
      accent: '#E74C3C',
      background: '#F8F4FF'
    },
    premium: true
  },
  {
    id: 'rose-gold',
    name: 'Rose Gold',
    description: 'Elegant and sophisticated luxury',
    colors: {
      primary: '#E91E63',
      secondary: '#C2185B',
      accent: '#FF9800',
      background: '#FFF0F5'
    },
    premium: true
  },
  {
    id: 'midnight-blue',
    name: 'Midnight Blue',
    description: 'Deep, calming night atmosphere',
    colors: {
      primary: '#34495E',
      secondary: '#2C3E50',
      accent: '#3498DB',
      background: '#F5F7FA'
    },
    premium: true
  }
]

export function ThemeCustomization() {
  const { isPremium } = useSubscription()
  const [selectedTheme, setSelectedTheme] = useState('calm-blue')
  const [isApplying, setIsApplying] = useState(false)

  const handleThemeChange = async (themeId: string) => {
    if (!isPremium && themeSchemes.find(t => t.id === themeId)?.premium) {
      // Show upgrade prompt
      return
    }

    setIsApplying(true)
    
    // Simulate theme application
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    setSelectedTheme(themeId)
    setIsApplying(false)
    
    // Apply theme to localStorage
    localStorage.setItem('dailymood-selected-theme', themeId)
    
    // Apply theme to document
    const theme = themeSchemes.find(t => t.id === themeId)
    if (theme) {
      document.documentElement.style.setProperty('--primary-color', theme.colors.primary)
      document.documentElement.style.setProperty('--secondary-color', theme.colors.secondary)
      document.documentElement.style.setProperty('--accent-color', theme.colors.accent)
      document.documentElement.style.setProperty('--background-color', theme.colors.background)
    }
  }

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <CardHeader className="text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Palette className="h-6 w-6 text-purple-600" />
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Customize Your Theme
          </CardTitle>
        </div>
        <p className="text-gray-600 dark:text-gray-400">
          Choose from beautiful color schemes to personalize your experience
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Theme Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {themeSchemes.map((theme) => (
            <div
              key={theme.id}
              className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:scale-105 ${
                selectedTheme === theme.id
                  ? 'border-purple-500 shadow-lg'
                  : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
              }`}
              onClick={() => handleThemeChange(theme.id)}
            >
              {/* Premium Badge */}
              {theme.premium && (
                <div className="absolute -top-2 -right-2">
                  <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs px-2 py-1">
                    <Crown className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </div>
              )}
              
              {/* Theme Preview */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: theme.colors.primary }}
                  />
                  <div
                    className="w-6 h-6 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: theme.colors.secondary }}
                  />
                  <div
                    className="w-4 h-4 rounded-full border-2 border-white shadow-md"
                    style={{ backgroundColor: theme.colors.accent }}
                  />
                </div>
                
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                    {theme.name}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {theme.description}
                  </p>
                </div>
                
                {/* Selected Indicator */}
                {selectedTheme === theme.id && (
                  <div className="flex items-center gap-2 text-purple-600">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm font-medium">Active</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {/* Premium Upgrade CTA */}
        {!isPremium && (
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 text-center border-2 border-purple-200 dark:border-purple-700">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Sparkles className="h-6 w-6 text-purple-600" />
              <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                Unlock Premium Themes
              </h3>
            </div>
            <p className="text-purple-700 dark:text-purple-300 mb-4">
              Get access to exclusive color schemes and advanced customization options
            </p>
            <Button className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </div>
        )}
        
        {/* Apply Button */}
        <div className="text-center">
          <Button
            onClick={() => handleThemeChange(selectedTheme)}
            disabled={isApplying}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3 text-lg font-semibold"
          >
            {isApplying ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Applying Theme...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Apply Selected Theme
              </div>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}




