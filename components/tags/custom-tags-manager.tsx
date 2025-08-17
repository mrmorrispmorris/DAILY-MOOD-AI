'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Tag, 
  Plus, 
  Edit3, 
  Trash2, 
  Search, 
  Filter, 
  TrendingUp,
  Heart,
  Zap,
  Coffee,
  BookOpen,
  Music,
  Gamepad2,
  Utensils,
  Car,
  Plane,
  Home,
  Briefcase,
  GraduationCap,
  Users,
  Palette,
  Camera,
  Dumbbell,
  Leaf,
  Sun,
  Moon,
  Cloud,
  CloudRain,
  Snowflake
} from 'lucide-react'
import { useMoodData } from '@/hooks/use-mood-data'
import { useSubscription } from '@/hooks/use-subscription'

interface CustomTag {
  id: string
  name: string
  emoji: string
  category: string
  color: string
  usageCount: number
  lastUsed: string
  isCustom: boolean
  description?: string
  relatedTags: string[]
}

const defaultTags: CustomTag[] = [
  // Mood-related
  { id: '1', name: 'Happy', emoji: '😊', category: 'mood', color: '#10B981', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['joy', 'excited', 'grateful'] },
  { id: '2', name: 'Sad', emoji: '😢', category: 'mood', color: '#3B82F6', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['depressed', 'lonely', 'hopeless'] },
  { id: '3', name: 'Anxious', emoji: '😰', category: 'mood', color: '#F59E0B', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['worried', 'stressed', 'nervous'] },
  { id: '4', name: 'Angry', emoji: '😠', category: 'mood', color: '#EF4444', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['frustrated', 'irritated', 'mad'] },
  { id: '5', name: 'Calm', emoji: '😌', category: 'mood', color: '#8B5CF6', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['peaceful', 'relaxed', 'serene'] },
  
  // Activities
  { id: '6', name: 'Exercise', emoji: '🏃‍♂️', category: 'activity', color: '#10B981', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['gym', 'running', 'yoga'] },
  { id: '7', name: 'Work', emoji: '💼', category: 'activity', color: '#6B7280', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['meeting', 'deadline', 'project'] },
  { id: '8', name: 'Social', emoji: '👥', category: 'activity', color: '#3B82F6', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['friends', 'family', 'party'] },
  { id: '9', name: 'Creative', emoji: '🎨', category: 'activity', color: '#8B5CF6', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['art', 'music', 'writing'] },
  { id: '10', name: 'Learning', emoji: '📚', category: 'activity', color: '#F59E0B', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['study', 'course', 'reading'] },
  
  // Environment
  { id: '11', name: 'Weather', emoji: '🌤️', category: 'environment', color: '#10B981', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['sunny', 'rainy', 'cold'] },
  { id: '12', name: 'Home', emoji: '🏠', category: 'environment', color: '#8B5CF6', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['comfortable', 'cozy', 'clean'] },
  { id: '13', name: 'Outdoors', emoji: '🌲', category: 'environment', color: '#059669', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['nature', 'park', 'hiking'] },
  
  // Health
  { id: '14', name: 'Sleep', emoji: '😴', category: 'health', color: '#6366F1', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['rested', 'tired', 'insomnia'] },
  { id: '15', name: 'Food', emoji: '🍕', category: 'health', color: '#F59E0B', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['healthy', 'junk', 'cooking'] },
  { id: '16', name: 'Pain', emoji: '🤕', category: 'health', color: '#EF4444', usageCount: 0, lastUsed: '', isCustom: false, relatedTags: ['headache', 'backache', 'sick'] }
]

const tagCategories = [
  { id: 'mood', name: 'Mood', icon: Heart, color: '#EF4444' },
  { id: 'activity', name: 'Activity', icon: Zap, color: '#10B981' },
  { id: 'environment', name: 'Environment', icon: Leaf, color: '#059669' },
  { id: 'health', name: 'Health', icon: TrendingUp, color: '#3B82F6' },
  { id: 'social', name: 'Social', icon: Users, color: '#8B5CF6' },
  { id: 'creative', name: 'Creative', icon: Palette, color: '#F59E0B' },
  { id: 'work', name: 'Work', icon: Briefcase, color: '#6B7280' },
  { id: 'custom', name: 'Custom', icon: Tag, color: '#EC4899' }
]

const emojiSuggestions = [
  '😊', '😢', '😰', '😠', '😌', '😴', '😎', '🤔', '😍', '😭',
  '🏃‍♂️', '💼', '👥', '🎨', '📚', '🏠', '🌲', '🍕', '☕', '🎵',
  '🎮', '✈️', '🚗', '🏋️‍♂️', '🧘‍♀️', '🎭', '📷', '🎪', '🏖️', '⛰️'
]

const colorPalette = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899',
  '#6B7280', '#059669', '#D97706', '#DC2626', '#7C3AED', '#BE185D'
]

export function CustomTagsManager() {
  const { moodEntries } = useMoodData()
  const { isPremium } = useSubscription()
  const [tags, setTags] = useState<CustomTag[]>(defaultTags)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTag, setEditingTag] = useState<CustomTag | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    emoji: '😊',
    category: 'custom',
    color: '#EF4444',
    description: '',
    relatedTags: [] as string[]
  })

  // Load custom tags from localStorage
  useEffect(() => {
    const savedTags = localStorage.getItem('dailymood-custom-tags')
    if (savedTags) {
      const customTags = JSON.parse(savedTags)
      setTags(prev => [...prev.filter(t => !t.isCustom), ...customTags])
    }
  }, [])

  // Save custom tags to localStorage
  useEffect(() => {
    const customTags = tags.filter(t => t.isCustom)
    localStorage.setItem('dailymood-custom-tags', JSON.stringify(customTags))
  }, [tags])

  // Update tag usage counts from mood entries
  useEffect(() => {
    setTags(prev => prev.map(tag => {
      const usageCount = moodEntries.filter(entry => 
        entry.tags.includes(tag.name)
      ).length
      
      const lastUsed = moodEntries
        .filter(entry => entry.tags.includes(tag.name))
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]?.date || ''
      
      return { ...tag, usageCount, lastUsed }
    }))
  }, [moodEntries])

  const createTag = () => {
    if (!formData.name.trim()) return
    
    const newTag: CustomTag = {
      id: Date.now().toString(),
      ...formData,
      usageCount: 0,
      lastUsed: '',
      isCustom: true
    }
    
    setTags(prev => [...prev, newTag])
    setShowCreateForm(false)
    setFormData({
      name: '',
      emoji: '😊',
      category: 'custom',
      color: '#EF4444',
      description: '',
      relatedTags: []
    })
  }

  const updateTag = () => {
    if (!editingTag) return
    
    setTags(prev => prev.map(tag => 
      tag.id === editingTag.id 
        ? { ...tag, ...formData }
        : tag
    ))
    
    setEditingTag(null)
    setFormData({
      name: '',
      emoji: '😊',
      category: 'custom',
      color: '#EF4444',
      description: '',
      relatedTags: []
    })
  }

  const deleteTag = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    if (tag && !tag.isCustom) {
      alert('Default tags cannot be deleted')
      return
    }
    
    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const getCategoryIcon = (categoryId: string) => {
    const category = tagCategories.find(c => c.id === categoryId)
    if (category) {
      const IconComponent = category.icon
      return <IconComponent className="h-4 w-4" style={{ color: category.color }} />
    }
    return <Tag className="h-4 w-4" />
  }

  const filteredTags = tags.filter(tag => {
    const matchesSearch = tag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         tag.description?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || tag.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const sortedTags = [...filteredTags].sort((a, b) => b.usageCount - a.usageCount)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Custom Tags
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Create unlimited custom tags to track what matters to you
          </p>
        </div>
        <Button
          onClick={() => setShowCreateForm(true)}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Tag
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        >
          <option value="all">All Categories</option>
          {tagCategories.map(category => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      {/* Create/Edit Tag Form */}
      {(showCreateForm || editingTag) && (
        <Card className="border-2 border-blue-200 dark:border-blue-700">
          <CardHeader>
            <CardTitle className="text-lg">
              {editingTag ? 'Edit Tag' : 'Create New Tag'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Tag name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              />
              <Input
                placeholder="Description (optional)"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              />
              
              {/* Emoji Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Emoji
                </label>
                <div className="grid grid-cols-10 gap-2">
                  {emojiSuggestions.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, emoji }))}
                      className={`w-8 h-8 text-xl rounded-lg border-2 transition-all ${
                        formData.emoji === emoji
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
              
              {/* Color Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Choose Color
                </label>
                <div className="grid grid-cols-6 gap-2">
                  {colorPalette.map((color, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setFormData(prev => ({ ...prev, color }))}
                      className={`w-8 h-8 rounded-lg border-2 transition-all ${
                        formData.color === color
                          ? 'border-gray-800 scale-110'
                          : 'border-gray-200 dark:border-gray-600 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              
              <select
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
              >
                {tagCategories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex gap-2">
              <Button
                onClick={editingTag ? updateTag : createTag}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                {editingTag ? 'Update Tag' : 'Create Tag'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setEditingTag(null)
                }}
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tags Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {sortedTags.map((tag) => (
          <Card key={tag.id} className="hover:shadow-lg transition-all duration-200">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{tag.emoji}</span>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                      {tag.name}
                    </h3>
                    <div className="flex items-center gap-1">
                      {getCategoryIcon(tag.category)}
                      <span className="text-xs text-gray-500 capitalize">
                        {tag.category}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-1">
                  {tag.isCustom && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingTag(tag)
                        setFormData({
                          name: tag.name,
                          emoji: tag.emoji,
                          category: tag.category,
                          color: tag.color,
                          description: tag.description || '',
                          relatedTags: tag.relatedTags
                        })
                      }}
                    >
                      <Edit3 className="h-3 w-3" />
                    </Button>
                  )}
                  {tag.isCustom && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => deleteTag(tag.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
              
              {tag.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  {tag.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <Badge 
                    variant="outline" 
                    style={{ borderColor: tag.color, color: tag.color }}
                  >
                    {tag.usageCount} uses
                  </Badge>
                  {tag.lastUsed && (
                    <span className="text-gray-500">
                      {new Date(tag.lastUsed).toLocaleDateString()}
                    </span>
                  )}
                </div>
                
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: tag.color }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {sortedTags.length === 0 && (
        <Card className="border-2 border-dashed border-gray-300 dark:border-gray-600">
          <CardContent className="p-8 text-center">
            <Tag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No tags found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchQuery || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filters'
                : 'Create your first custom tag to get started'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}




