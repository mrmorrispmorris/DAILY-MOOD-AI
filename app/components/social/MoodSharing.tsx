'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Share2, 
  Download, 
  Calendar, 
  Trophy, 
  TrendingUp, 
  Heart,
  Copy,
  Check,
  Camera,
  Sparkles,
  Instagram,
  Facebook,
  Twitter,
  MessageCircle
} from 'lucide-react'

interface MoodSharingProps {
  userId?: string
  moods: any[]
  streakData?: {
    current: number
    longest: number
  }
  achievements?: {
    total: number
    level: number
  }
}

interface ShareableContent {
  type: 'streak' | 'milestone' | 'progress' | 'achievement' | 'mood_summary'
  title: string
  description: string
  image?: string
  stats?: Record<string, any>
}

export default function MoodSharing({ userId, moods, streakData, achievements }: MoodSharingProps) {
  const [selectedShareType, setSelectedShareType] = useState<ShareableContent['type']>('streak')
  const [shareContent, setShareContent] = useState<ShareableContent | null>(null)
  const [isGeneratingImage, setIsGeneratingImage] = useState(false)
  const [copiedToClipboard, setCopiedToClipboard] = useState(false)
  const [shareModalOpen, setShareModalOpen] = useState(false)

  // Generate shareable content based on user data
  const generateShareContent = (type: ShareableContent['type']): ShareableContent => {
    switch (type) {
      case 'streak':
        return {
          type: 'streak',
          title: `${streakData?.current || 0} Day Mood Tracking Streak! 🔥`,
          description: `I've been consistently tracking my mood for ${streakData?.current || 0} days with DailyMood AI! Building better mental wellness habits one day at a time. #MoodTracking #MentalWellness #SelfCare`,
          stats: {
            current: streakData?.current || 0,
            longest: streakData?.longest || 0
          }
        }

      case 'milestone':
        const totalEntries = moods?.length || 0
        const milestone = totalEntries >= 365 ? '1 Year' : 
                         totalEntries >= 100 ? '100 Entries' : 
                         totalEntries >= 50 ? '50 Entries' : 
                         '10 Entries'
        return {
          type: 'milestone',
          title: `${milestone} Milestone Reached! 🎉`,
          description: `Just hit ${totalEntries} mood entries with DailyMood AI! Every entry is a step toward better self-awareness and mental wellness. Proud of my consistency! #MilestoneAchieved #MentalHealthJourney`,
          stats: {
            totalEntries,
            milestone
          }
        }

      case 'progress':
        const recentMoods = moods?.slice(0, 7) || []
        const averageMood = recentMoods.length > 0 
          ? (recentMoods.reduce((sum, mood) => sum + mood.mood_score, 0) / recentMoods.length).toFixed(1)
          : '7.0'
        return {
          type: 'progress',
          title: `Weekly Mood Average: ${averageMood}/10 📈`,
          description: `This week's mood tracking shows I'm averaging ${averageMood}/10! Grateful for the insights DailyMood AI provides to understand my emotional patterns. #WeeklyProgress #MoodTracking`,
          stats: {
            average: averageMood,
            entries: recentMoods.length
          }
        }

      case 'achievement':
        return {
          type: 'achievement',
          title: `Level ${achievements?.level || 1} Wellness Achiever! 🏆`,
          description: `Reached Level ${achievements?.level || 1} in my mental wellness journey with ${achievements?.total || 0} achievements unlocked! DailyMood AI helps me celebrate every win. #WellnessAchiever #MentalHealthWins`,
          stats: {
            level: achievements?.level || 1,
            totalAchievements: achievements?.total || 0
          }
        }

      case 'mood_summary':
        const last30Days = moods?.slice(0, 30) || []
        const summary = last30Days.length > 0 
          ? `Tracked ${last30Days.length} days this month`
          : 'Just started my mood tracking journey'
        return {
          type: 'mood_summary',
          title: `Monthly Mood Tracking Summary 📊`,
          description: `${summary} with DailyMood AI! Understanding my emotional patterns has been transformative for my mental wellness. #MonthlyReflection #SelfAwareness`,
          stats: {
            daysTracked: last30Days.length,
            period: 'last30days'
          }
        }

      default:
        return {
          type: 'streak',
          title: 'My Mood Tracking Journey 🌟',
          description: 'Building better mental wellness habits with DailyMood AI! #MoodTracking #MentalWellness'
        }
    }
  }

  // Generate shareable image (placeholder for future implementation)
  const generateShareableImage = async (content: ShareableContent): Promise<string> => {
    setIsGeneratingImage(true)
    
    // Simulate image generation delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // In a real implementation, this would:
    // 1. Use Canvas API or HTML-to-Canvas library
    // 2. Create attractive graphics with user stats
    // 3. Include branding and motivational elements
    // 4. Return base64 image data or blob URL
    
    setIsGeneratingImage(false)
    return '/api/placeholder/share-image' // Placeholder
  }

  // Share to different platforms
  const shareToSocial = async (platform: 'twitter' | 'facebook' | 'instagram' | 'copy') => {
    if (!shareContent) return

    const text = `${shareContent.title}\n\n${shareContent.description}`
    const url = window.location.origin

    switch (platform) {
      case 'twitter':
        const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`
        window.open(twitterUrl, '_blank', 'width=600,height=400')
        break

      case 'facebook':
        const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${encodeURIComponent(text)}`
        window.open(facebookUrl, '_blank', 'width=600,height=400')
        break

      case 'instagram':
        // Instagram doesn't support direct web sharing, so copy to clipboard
        await copyToClipboard(text)
        alert('Content copied to clipboard! Open Instagram and paste to share your story.')
        break

      case 'copy':
        await copyToClipboard(text)
        break
    }
  }

  // Copy content to clipboard
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedToClipboard(true)
      setTimeout(() => setCopiedToClipboard(false), 2000)
    } catch (error) {
      console.error('Failed to copy to clipboard:', error)
    }
  }

  // Handle share type selection
  useEffect(() => {
    const content = generateShareContent(selectedShareType)
    setShareContent(content)
  }, [selectedShareType, moods, streakData, achievements])

  const shareTypes = [
    { type: 'streak' as const, label: 'Streak', icon: Calendar, color: 'bg-orange-500' },
    { type: 'milestone' as const, label: 'Milestone', icon: Trophy, color: 'bg-purple-500' },
    { type: 'progress' as const, label: 'Progress', icon: TrendingUp, color: 'bg-blue-500' },
    { type: 'achievement' as const, label: 'Achievement', icon: Heart, color: 'bg-pink-500' },
    { type: 'mood_summary' as const, label: 'Summary', icon: Sparkles, color: 'bg-green-500' }
  ]

  return (
    <div className="space-y-6">
      {/* Share Your Journey Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <Share2 className="w-6 h-6 text-blue-600" />
          <div>
            <h2 className="text-xl font-bold text-gray-900">Share Your Journey</h2>
            <p className="text-gray-600">Inspire others with your wellness progress</p>
          </div>
        </div>

        {/* Share Type Selection */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {shareTypes.map(({ type, label, icon: Icon, color }) => (
            <motion.button
              key={type}
              onClick={() => setSelectedShareType(type)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex flex-col items-center gap-2 p-4 rounded-lg border-2 transition-all ${
                selectedShareType === type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-gray-50 hover:border-gray-300'
              }`}
            >
              <div className={`w-10 h-10 ${color} rounded-full flex items-center justify-center`}>
                <Icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700">{label}</span>
            </motion.button>
          ))}
        </div>

        {/* Preview Content */}
        {shareContent && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-lg text-gray-900 mb-2">{shareContent.title}</h3>
            <p className="text-gray-700 mb-4">{shareContent.description}</p>
            
            {/* Stats Display */}
            {shareContent.stats && (
              <div className="flex flex-wrap gap-4">
                {Object.entries(shareContent.stats).map(([key, value]) => (
                  <div key={key} className="bg-white/50 px-3 py-2 rounded-lg">
                    <span className="text-sm text-gray-600 capitalize">{key.replace(/([A-Z])/g, ' $1')}: </span>
                    <span className="font-medium">{value}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Share Actions */}
        <div className="flex flex-wrap gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareToSocial('twitter')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Twitter className="w-4 h-4" />
            <span>Twitter</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareToSocial('facebook')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
          >
            <Facebook className="w-4 h-4" />
            <span>Facebook</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareToSocial('instagram')}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:from-purple-600 hover:to-pink-600 transition-colors"
          >
            <Instagram className="w-4 h-4" />
            <span>Instagram</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => shareToSocial('copy')}
            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            {copiedToClipboard ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copiedToClipboard ? 'Copied!' : 'Copy Text'}</span>
          </motion.button>
        </div>
      </div>

      {/* Privacy & Community Guidelines */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-3">Privacy & Sharing Guidelines</h3>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Your shared content only includes general progress statistics, never specific mood details or personal notes.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Sharing your wellness journey can inspire others and help reduce mental health stigma.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>You control what you share and when - there's no automatic posting or data sharing.</p>
          </div>
          <div className="flex items-start gap-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
            <p>Consider sharing your achievements to celebrate your mental wellness journey with friends and family.</p>
          </div>
        </div>
      </div>

      {/* Community Support Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="w-6 h-6 text-green-600" />
          <div>
            <h3 className="font-semibold text-gray-900">Community Support</h3>
            <p className="text-sm text-gray-600">Connect with others on their wellness journey</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-medium text-green-800 mb-2">📱 Join Our Community</h4>
            <p className="text-sm text-green-700 mb-3">
              Connect with thousands of people working on their mental wellness journey. Share tips, celebrate wins, and support each other.
            </p>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                Join Discord
              </button>
              <button className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-lg hover:bg-green-200 transition-colors">
                Follow Updates
              </button>
            </div>
          </div>

          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="font-medium text-purple-800 mb-2">🏆 Monthly Challenges</h4>
            <p className="text-sm text-purple-700 mb-3">
              Participate in community wellness challenges and earn special badges while building healthy habits together.
            </p>
            <button className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors">
              View Challenges
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-medium text-blue-800 mb-2">💬 Share Your Story</h4>
            <p className="text-sm text-blue-700 mb-3">
              Inspire others by sharing how mood tracking has helped your mental wellness journey (anonymously if you prefer).
            </p>
            <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
              Share Story
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
