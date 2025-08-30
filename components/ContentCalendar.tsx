'use client'
import { useState } from 'react'
import { contentCalendar, generateSocialPost, addHashtags } from '@/lib/social-media'

interface ContentItem {
  date: string
  platform: string
  type: string
  content: string
  status: 'draft' | 'scheduled' | 'published'
  hashtags: string[]
}

const platforms = [
  { id: 'twitter', name: 'Twitter', color: 'bg-blue-500' },
  { id: 'instagram', name: 'Instagram', color: 'bg-pink-500' },
  { id: 'linkedin', name: 'LinkedIn', color: 'bg-blue-700' },
  { id: 'tiktok', name: 'TikTok', color: 'bg-black' }
]

const contentTypes = {
  twitter: ['educational', 'engagement', 'promotional'],
  instagram: ['carousel', 'reels', 'stories'],
  linkedin: ['professional', 'thoughtLeadership', 'companyUpdates'],
  tiktok: ['trending', 'educational']
}

export default function ContentCalendar() {
  const [content, setContent] = useState<ContentItem[]>([])
  const [selectedWeek, setSelectedWeek] = useState(new Date())
  const [showGenerator, setShowGenerator] = useState(false)
  
  const generateWeekContent = () => {
    const week: ContentItem[] = []
    const startDate = new Date(selectedWeek)
    
    Object.entries(contentCalendar.themes).forEach(([day, theme], index) => {
      const date = new Date(startDate)
      date.setDate(date.getDate() + index)
      
      // Generate 2-3 posts per day across different platforms
      const dailyPosts = [
        {
          date: date.toISOString().split('T')[0],
          platform: 'twitter',
          type: 'educational',
          content: `${theme.theme}: ${theme.focus} - ${generateSocialPost('twitter', 'educational')}`,
          status: 'draft' as const,
          hashtags: ['MentalHealth', 'MoodTracking', 'Wellness']
        },
        {
          date: date.toISOString().split('T')[0],
          platform: 'instagram', 
          type: 'stories',
          content: `${theme.theme} story about ${theme.focus}`,
          status: 'draft' as const,
          hashtags: ['MentalHealthMatters', 'SelfCare', 'Wellness']
        }
      ]
      
      // Add LinkedIn posts on weekdays
      if (index < 5) {
        dailyPosts.push({
          date: date.toISOString().split('T')[0],
          platform: 'linkedin',
          type: 'professional',
          content: `Professional insight: ${theme.focus}`,
          status: 'draft' as const,
          hashtags: ['WorkplaceWellness', 'MentalHealthAtWork']
        })
      }
      
      week.push(...dailyPosts)
    })
    
    setContent(week)
  }
  
  const updateContentStatus = (index: number, status: ContentItem['status']) => {
    const updated = [...content]
    updated[index].status = status
    setContent(updated)
  }
  
  const deleteContent = (index: number) => {
    setContent(content.filter((_, i) => i !== index))
  }
  
  const addCustomContent = () => {
    const newContent: ContentItem = {
      date: new Date().toISOString().split('T')[0],
      platform: 'twitter',
      type: 'educational', 
      content: 'Custom post content...',
      status: 'draft',
      hashtags: ['MentalHealth']
    }
    setContent([...content, newContent])
  }
  
  const getStatusColor = (status: ContentItem['status']) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-700'
      case 'scheduled': return 'bg-blue-100 text-blue-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }
  
  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'twitter': return '🐦'
      case 'instagram': return '📷'
      case 'linkedin': return '💼'
      case 'tiktok': return '🎵'
      default: return '📱'
    }
  }
  
  const upcomingPosts = content.filter(post => 
    new Date(post.date) >= new Date() && post.status !== 'published'
  ).length
  
  const publishedPosts = content.filter(post => post.status === 'published').length
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Content Calendar</h2>
          <p className="text-gray-600">Plan and schedule your social media content</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowGenerator(!showGenerator)}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            {showGenerator ? 'Hide Generator' : 'AI Generator'}
          </button>
          <button 
            onClick={addCustomContent}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Add Custom Post
          </button>
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900">Upcoming Posts</h3>
          <p className="text-2xl font-bold text-blue-600">{upcomingPosts}</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <h3 className="font-semibold text-green-900">Published</h3>
          <p className="text-2xl font-bold text-green-600">{publishedPosts}</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <h3 className="font-semibold text-purple-900">Total Planned</h3>
          <p className="text-2xl font-bold text-purple-600">{content.length}</p>
        </div>
      </div>
      
      {/* AI Content Generator */}
      {showGenerator && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🤖 AI Content Generator</h3>
          <div className="flex flex-wrap gap-3 mb-4">
            <input
              type="date"
              value={selectedWeek.toISOString().split('T')[0]}
              onChange={(e) => setSelectedWeek(new Date(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button 
              onClick={generateWeekContent}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Generate Week's Content
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Generates themed content for each day of the week based on our proven content strategy
          </p>
        </div>
      )}
      
      {/* Weekly Themes Reference */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h3 className="font-semibold text-gray-900 mb-3">Weekly Themes</h3>
        <div className="grid grid-cols-7 gap-2 text-sm">
          {Object.entries(contentCalendar.themes).map(([day, theme]) => (
            <div key={day} className="text-center">
              <div className="font-medium text-purple-600 capitalize">{day}</div>
              <div className="text-xs text-gray-600">{theme.theme}</div>
              <div className="text-xs text-gray-500">{theme.focus}</div>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content List */}
      <div className="space-y-4">
        <h3 className="font-semibold text-gray-900">Scheduled Content</h3>
        {content.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No content scheduled yet.</p>
            <p className="text-sm">Use the AI Generator to create a week's worth of content!</p>
          </div>
        ) : (
          content.map((item, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{getPlatformIcon(item.platform)}</span>
                  <div>
                    <span className="font-medium capitalize">{item.platform}</span>
                    <span className="text-gray-500 text-sm ml-2">{item.type}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                    {item.status}
                  </span>
                  <span className="text-sm text-gray-500">{item.date}</span>
                  <button
                    onClick={() => deleteContent(index)}
                    className="text-red-500 hover:text-red-700 text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
              
              <p className="text-gray-700 mb-3 leading-relaxed">{item.content}</p>
              
              <div className="flex flex-wrap gap-1 mb-3">
                {item.hashtags.map((tag, tagIndex) => (
                  <span key={tagIndex} className="text-xs text-purple-600 bg-purple-100 px-2 py-1 rounded">
                    #{tag}
                  </span>
                ))}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => updateContentStatus(index, 'scheduled')}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded text-sm hover:bg-blue-200 transition-colors"
                >
                  Schedule
                </button>
                <button
                  onClick={() => updateContentStatus(index, 'published')}
                  className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200 transition-colors"
                >
                  Mark Published
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}


