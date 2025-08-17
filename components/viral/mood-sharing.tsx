'use client'

import { useState, useRef } from 'react'
import { Share2, Download, Instagram, Twitter, Facebook, Heart, Sparkles, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface MoodShareTemplate {
  id: string
  name: string
  description: string
  preview: string
  category: 'minimal' | 'vibrant' | 'elegant' | 'fun'
  tags: string[]
}

const moodTemplates: MoodShareTemplate[] = [
  {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Simple, elegant design for professional sharing',
    preview: '✨',
    category: 'minimal',
    tags: ['Professional', 'Clean', 'Simple']
  },
  {
    id: 'vibrant',
    name: 'Vibrant & Colorful',
    description: 'Eye-catching colors for social media',
    preview: '🎨',
    category: 'vibrant',
    tags: ['Social', 'Colorful', 'Fun']
  },
  {
    id: 'elegant',
    name: 'Elegant & Sophisticated',
    description: 'Premium design for special moments',
    preview: '💎',
    category: 'elegant',
    tags: ['Premium', 'Sophisticated', 'Luxury']
  },
  {
    id: 'fun',
    name: 'Fun & Playful',
    description: 'Lighthearted design for casual sharing',
    preview: '🎉',
    category: 'fun',
    tags: ['Casual', 'Playful', 'Friendly']
  }
]

const moodEmojis = ['😄', '🙂', '😐', '😔', '😢', '😤', '😴', '🤔', '😌', '🤗', '😎', '🥳']

export default function MoodSharing() {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('minimal')
  const [selectedMood, setSelectedMood] = useState<number>(7)
  const [customMessage, setCustomMessage] = useState('Feeling great today!')
  const [selectedEmoji, setSelectedEmoji] = useState('😄')
  const [backgroundColor, setBackgroundColor] = useState('#667eea')
  const [textColor, setTextColor] = useState('#ffffff')
  const [showPreview, setShowPreview] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const generateMoodCard = () => {
    setShowPreview(true)
    // In production, this would generate an actual image
  }

  const shareToSocial = async (platform: string) => {
    const shareData = {
      title: 'My DailyMood AI Journey',
      text: `${customMessage} ${selectedEmoji}`,
      url: 'https://dailymood-ai.vercel.app'
    }

    try {
      if (navigator.share && platform === 'native') {
        await navigator.share(shareData)
      } else {
        // Platform-specific sharing
        const urls = {
          twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareData.text)}&url=${encodeURIComponent(shareData.url)}`,
          facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareData.url)}`,
          instagram: 'https://instagram.com' // Instagram doesn't support direct sharing
        }
        
        if (urls[platform as keyof typeof urls]) {
          window.open(urls[platform as keyof typeof urls], '_blank')
        }
      }
    } catch (error) {
      console.error('Error sharing:', error)
    }
  }

  const downloadImage = () => {
    if (canvasRef.current) {
      const link = document.createElement('a')
      link.download = 'mood-card.png'
      link.href = canvasRef.current.toDataURL()
      link.click()
    }
  }

  const getMoodLabel = (mood: number) => {
    if (mood >= 8) return 'Excellent'
    if (mood >= 6) return 'Good'
    if (mood >= 4) return 'Neutral'
    if (mood >= 2) return 'Poor'
    return 'Very Poor'
  }

  const getMoodColor = (mood: number) => {
    if (mood >= 8) return '#10b981' // Green
    if (mood >= 6) return '#3b82f6' // Blue
    if (mood >= 4) return '#f59e0b' // Yellow
    if (mood >= 2) return '#ef4444' // Red
    return '#6b7280' // Gray
  }

  return (
    <div className="py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <Share2 className="h-12 w-12 text-blue-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-900">
              Share Your Mood Journey
            </h1>
          </div>
          <p className="text-xl text-gray-600 mb-6">
            Create beautiful, shareable mood cards and inspire others on their wellness journey
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Customization Panel */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-purple-600" />
                  Customize Your Mood Card
                </CardTitle>
                <CardDescription>
                  Personalize your mood card with colors, messages, and templates
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Template Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose Template
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {moodTemplates.map((template) => (
                      <div
                        key={template.id}
                        className={`p-3 border-2 rounded-lg cursor-pointer transition-all ${
                          selectedTemplate === template.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}
                      >
                        <div className="text-center">
                          <div className="text-2xl mb-2">{template.preview}</div>
                          <div className="text-sm font-medium">{template.name}</div>
                          <div className="text-xs text-gray-600">{template.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Mood Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Your Mood: {selectedMood}/10 - {getMoodLabel(selectedMood)}
                  </label>
                  <Slider
                    value={[selectedMood]}
                    onValueChange={(value) => setSelectedMood(value[0])}
                    max={10}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>1</span>
                    <span>5</span>
                    <span>10</span>
                  </div>
                </div>

                {/* Emoji Selection */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Choose Emoji
                  </label>
                  <div className="grid grid-cols-6 gap-2">
                    {moodEmojis.map((emoji) => (
                      <button
                        key={emoji}
                        className={`p-2 text-2xl rounded-lg transition-all ${
                          selectedEmoji === emoji
                            ? 'bg-blue-100 border-2 border-blue-500'
                            : 'hover:bg-gray-100'
                        }`}
                        onClick={() => setSelectedEmoji(emoji)}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Custom Message */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-3 block">
                    Custom Message
                  </label>
                  <textarea
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                    rows={3}
                    placeholder="How are you feeling today?"
                  />
                </div>

                {/* Color Customization */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Background Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={backgroundColor}
                        onChange={(e) => setBackgroundColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{backgroundColor}</span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-3 block">
                      Text Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={textColor}
                        onChange={(e) => setTextColor(e.target.value)}
                        className="w-12 h-10 border border-gray-300 rounded-lg cursor-pointer"
                      />
                      <span className="text-sm text-gray-600">{textColor}</span>
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <Button 
                  onClick={generateMoodCard}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Sparkles className="h-5 w-5 mr-2" />
                  Generate Mood Card
                </Button>
              </CardContent>
            </Card>

            {/* Quick Share Options */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Share</CardTitle>
                <CardDescription>
                  Share your mood card directly to social media
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('twitter')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('facebook')}
                    className="border-blue-200 text-blue-600 hover:bg-blue-50"
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('instagram')}
                    className="border-pink-200 text-pink-600 hover:bg-pink-50"
                  >
                    <Instagram className="h-4 w-4 mr-2" />
                    Instagram
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => shareToSocial('native')}
                    className="border-green-200 text-green-600 hover:bg-green-50"
                  >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            {/* Mood Card Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Preview</span>
                  {showPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadImage}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {showPreview ? (
                  <div className="relative">
                    <div
                      className="w-full h-80 rounded-lg flex flex-col items-center justify-center text-center p-8 relative overflow-hidden"
                      style={{ backgroundColor: backgroundColor }}
                    >
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-4 right-4 text-6xl">{selectedEmoji}</div>
                        <div className="absolute bottom-4 left-4 text-4xl">✨</div>
                      </div>
                      
                      {/* Main Content */}
                      <div className="relative z-10">
                        <div className="text-8xl mb-4">{selectedEmoji}</div>
                        <div 
                          className="text-3xl font-bold mb-4"
                          style={{ color: textColor }}
                        >
                          {customMessage}
                        </div>
                        <div 
                          className="text-xl mb-4"
                          style={{ color: textColor }}
                        >
                          Mood: {selectedMood}/10
                        </div>
                        <div 
                          className="text-lg"
                          style={{ color: textColor }}
                        >
                          {getMoodLabel(selectedMood)}
                        </div>
                        
                        {/* Branding */}
                        <div className="absolute bottom-4 right-4 opacity-70">
                          <div 
                            className="text-sm font-medium"
                            style={{ color: textColor }}
                          >
                            DailyMood AI
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Template Info */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium text-gray-900 mb-2">
                        Template: {moodTemplates.find(t => t.id === selectedTemplate)?.name}
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {moodTemplates.find(t => t.id === selectedTemplate)?.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="w-full h-80 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                    <div className="text-center text-gray-500">
                      <Share2 className="h-12 w-12 mx-auto mb-4" />
                      <div className="text-lg font-medium">Generate your mood card</div>
                      <div className="text-sm">Customize and preview your design</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Sharing Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Heart className="h-5 w-5 mr-2 text-red-600" />
                  Sharing Tips
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 mt-2"></div>
                    <span>Use relevant hashtags: #DailyMoodAI #MoodTracking #MentalHealth</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3 mt-2"></div>
                    <span>Share during peak social media hours (9 AM - 5 PM)</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3 mt-2"></div>
                    <span>Engage with others who share similar content</span>
                  </div>
                  <div className="flex items-start">
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3 mt-2"></div>
                    <span>Tag friends who might be interested in mood tracking</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Success Stories */}
        <div className="mt-12 text-center">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">
            Start Sharing Your Mood Journey
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-3xl mb-2">📱</div>
              <div className="text-2xl font-bold text-blue-600 mb-2">0</div>
              <div className="text-gray-600">Mood Cards Shared</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="text-2xl font-bold text-green-600 mb-2">0</div>
              <div className="text-gray-600">New Users from Sharing</div>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-2">🚀</div>
              <div className="text-2xl font-bold text-purple-600 mb-2">0</div>
              <div className="text-gray-600">Social Media Impressions</div>
            </div>
          </div>
        </div>

        {/* Hidden Canvas for Download */}
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="hidden"
        />
      </div>
    </div>
  )
}


