'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Share2, Facebook, Twitter, Instagram, Copy, CheckCircle, TrendingUp, Heart, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SocialShareProps {
  type: 'mood-chart' | 'insight' | 'streak' | 'achievement'
  title: string
  description: string
  data?: any
  imageUrl?: string
}

interface SharePlatform {
  id: string
  name: string
  icon: any
  color: string
  bgColor: string
  shareUrl: string
  enabled: boolean
}

const platforms: SharePlatform[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20',
    shareUrl: 'https://www.facebook.com/sharer/sharer.php',
    enabled: true
  },
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    color: 'text-sky-500',
    bgColor: 'bg-sky-50 hover:bg-sky-100 dark:bg-sky-900/20',
    shareUrl: 'https://twitter.com/intent/tweet',
    enabled: true
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 hover:bg-pink-100 dark:bg-pink-900/20',
    shareUrl: '#',
    enabled: false // Instagram doesn't support direct sharing via URL
  }
]

export function SocialSharing({ type, title, description, data, imageUrl }: SocialShareProps) {
  const [copied, setCopied] = useState(false)
  const [shareCount, setShareCount] = useState(0)

  const generateShareText = () => {
    const baseText = `Check out my mood journey with DailyMood AI! 📊`
    
    switch (type) {
      case 'mood-chart':
        return `${baseText} ${title} - ${description} #MoodTracking #MentalHealth #DailyMoodAI`
      case 'insight':
        return `${baseText} ${title} - ${description} #AIInsights #Wellness #DailyMoodAI`
      case 'streak':
        return `${baseText} ${title} - ${description} #StreakGoals #Consistency #DailyMoodAI`
      case 'achievement':
        return `${baseText} ${title} - ${description} #Achievement #Wellness #DailyMoodAI`
      default:
        return `${baseText} ${title} #DailyMoodAI`
    }
  }

  const generateShareUrl = () => {
    const baseUrl = window.location.origin
    const params = new URLSearchParams({
      type,
      title: encodeURIComponent(title),
      description: encodeURIComponent(description)
    })
    
    if (data) {
      params.append('data', JSON.stringify(data))
    }
    
    return `${baseUrl}/share?${params.toString()}`
  }

  const shareToFacebook = () => {
    const shareUrl = generateShareUrl()
    const shareText = generateShareText()
    
    const url = `${platforms[0].shareUrl}?u=${encodeURIComponent(shareUrl)}&quote=${encodeURIComponent(shareText)}`
    window.open(url, '_blank', 'width=600,height=400')
    
    incrementShareCount()
  }

  const shareToTwitter = () => {
    const shareUrl = generateShareUrl()
    const shareText = generateShareText()
    
    const url = `${platforms[1].shareUrl}?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}&hashtags=MoodTracking,MentalHealth,DailyMoodAI`
    window.open(url, '_blank', 'width=600,height=400')
    
    incrementShareCount()
  }

  const copyToClipboard = async () => {
    const shareUrl = generateShareUrl()
    const shareText = generateShareText()
    const fullText = `${shareText}\n\n${shareUrl}`
    
    try {
      await navigator.clipboard.writeText(fullText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      incrementShareCount()
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  const incrementShareCount = () => {
    setShareCount(prev => prev + 1)
    // Save to localStorage for persistence
    localStorage.setItem('dailymood-share-count', (shareCount + 1).toString())
  }

  const getTypeIcon = () => {
    switch (type) {
      case 'mood-chart':
        return <TrendingUp className="h-5 w-5 text-calm-blue" />
      case 'insight':
        return <Heart className="h-5 w-5 text-pink-500" />
      case 'streak':
        return <Zap className="h-5 w-5 text-orange-500" />
      case 'achievement':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      default:
        return <Share2 className="h-5 w-5 text-gray-500" />
    }
  }

  const getTypeColor = () => {
    switch (type) {
      case 'mood-chart':
        return 'border-calm-blue/30 bg-calm-blue/5'
      case 'insight':
        return 'border-pink-300 bg-pink-50 dark:bg-pink-900/20'
      case 'streak':
        return 'border-orange-300 bg-orange-50 dark:bg-orange-900/20'
      case 'achievement':
        return 'border-green-300 bg-green-50 dark:bg-green-900/20'
      default:
        return 'border-gray-300 bg-gray-50 dark:bg-gray-900/20'
    }
  }

  return (
    <div className="space-y-4">
      {/* Share Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {getTypeIcon()}
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Share This</h3>
        </div>
        
        {shareCount > 0 && (
          <Badge variant="outline" className="text-xs">
            <Share2 className="h-3 w-3 mr-1" />
            {shareCount} share{shareCount !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* Share Preview Card */}
      <Card className={cn("border-2", getTypeColor())}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 dark:text-gray-400 mb-4">{description}</p>
          
          {/* Share Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
            <div className="flex items-center gap-1">
              <Share2 className="h-4 w-4" />
              {shareCount} share{shareCount !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Viral potential
            </div>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {platforms.filter(p => p.enabled).map((platform) => (
                <Button
                  key={platform.id}
                  variant="outline"
                  onClick={platform.id === 'facebook' ? shareToFacebook : shareToTwitter}
                  className={cn(
                    "w-full justify-start",
                    platform.bgColor,
                    platform.color
                  )}
                >
                  <platform.icon className="h-4 w-4 mr-2" />
                  Share on {platform.name}
                </Button>
              ))}
            </div>

            <Button
              variant="outline"
              onClick={copyToClipboard}
              className="w-full justify-start bg-gray-50 hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700"
            >
              {copied ? (
                <>
                  <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy Link
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Share Tips */}
      <Card className="bg-gradient-to-r from-calm-blue/5 to-calm-teal/5 border-calm-blue/20">
        <CardContent className="p-4">
          <h4 className="font-semibold text-calm-blue mb-2 flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Sharing Tips for Maximum Impact
          </h4>
          
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Share during peak social media hours (9 AM - 5 PM)</li>
            <li>• Use relevant hashtags to reach your target audience</li>
            <li>• Add a personal message to make it more engaging</li>
            <li>• Tag friends who might be interested in mood tracking</li>
            <li>• Share progress updates regularly to build momentum</li>
          </ul>
        </CardContent>
      </Card>

      {/* Viral Growth Stats */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
        <CardContent className="p-4">
          <h4 className="font-semibold text-purple-700 dark:text-purple-300 mb-2 flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Viral Growth Potential
          </h4>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-purple-600">2.5x</div>
              <div className="text-xs text-purple-500">Engagement Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">15%</div>
              <div className="text-xs text-purple-500">Share Rate</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">3.2x</div>
              <div className="text-xs text-purple-500">Reach Multiplier</div>
            </div>
          </div>
          
          <p className="text-xs text-purple-600 dark:text-purple-400 mt-3 text-center">
            Mood tracking content has higher engagement than typical social media posts
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

// Quick Share Button Component
export function QuickShareButton({ 
  type, 
  title, 
  description, 
  data 
}: Omit<SocialShareProps, 'imageUrl'>) {
  const [showShare, setShowShare] = useState(false)

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowShare(!showShare)}
        className="bg-calm-blue/10 border-calm-blue/30 text-calm-blue hover:bg-calm-blue/20"
      >
        <Share2 className="h-4 w-4 mr-2" />
        Share
      </Button>
      
      {showShare && (
        <div className="absolute top-full right-0 mt-2 w-80 z-50">
          <SocialSharing
            type={type}
            title={title}
            description={description}
            data={data}
          />
        </div>
      )}
    </div>
  )
}




