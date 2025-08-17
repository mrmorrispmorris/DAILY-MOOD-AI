'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tag, Plus, X, Edit2, Save, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomTag {
  id: string
  name: string
  color: string
  isCustom: boolean
  usageCount: number
  createdAt: string
}

const defaultTags: CustomTag[] = [
  { id: 'work', name: 'Work', color: '#3B82F6', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'family', name: 'Family', color: '#10B981', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'exercise', name: 'Exercise', color: '#F59E0B', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'social', name: 'Social', color: '#8B5CF6', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'health', name: 'Health', color: '#EF4444', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'creativity', name: 'Creativity', color: '#EC4899', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'sleep', name: 'Sleep', color: '#6B7280', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() },
  { id: 'food', name: 'Food', color: '#F97316', isCustom: false, usageCount: 0, createdAt: new Date().toISOString() }
]

const tagColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#EC4899', '#6B7280', '#F97316',
  '#06B6D4', '#84CC16', '#F472B6', '#A855F7', '#F43F5E', '#22C55E', '#EAB308', '#6366F1'
]

interface CustomTagInputProps {
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  onAddCustomTag: (tag: CustomTag) => void
  maxTags?: number
}

export function CustomTagInput({ 
  selectedTags, 
  onTagToggle, 
  onAddCustomTag, 
  maxTags = 10 
}: CustomTagInputProps) {
  const [tags, setTags] = useState<CustomTag[]>(defaultTags)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [selectedColor, setSelectedColor] = useState(tagColors[0])
  const [editingTag, setEditingTag] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  // Load custom tags from localStorage
  useEffect(() => {
    const savedTags = localStorage.getItem('dailymood-custom-tags')
    if (savedTags) {
      const customTags = JSON.parse(savedTags)
      setTags(prev => [...defaultTags, ...customTags])
    }
  }, [])

  // Save custom tags to localStorage
  useEffect(() => {
    const customTags = tags.filter(tag => tag.isCustom)
    localStorage.setItem('dailymood-custom-tags', JSON.stringify(customTags))
  }, [tags])

  const createCustomTag = () => {
    if (!newTagName.trim()) return

    const newTag: CustomTag = {
      id: `custom-${Date.now()}`,
      name: newTagName.trim(),
      color: selectedColor,
      isCustom: true,
      usageCount: 0,
      createdAt: new Date().toISOString()
    }

    setTags(prev => [...prev, newTag])
    onAddCustomTag(newTag)
    setNewTagName('')
    setSelectedColor(tagColors[0])
    setShowCreateForm(false)
  }

  const updateTag = (tagId: string) => {
    if (!editName.trim()) return

    setTags(prev => prev.map(tag => 
      tag.id === tagId ? { ...tag, name: editName.trim() } : tag
    ))
    setEditingTag(null)
    setEditName('')
  }

  const deleteTag = (tagId: string) => {
    // Remove from selected tags if it was selected
    if (selectedTags.includes(tagId)) {
      onTagToggle(tagId)
    }
    
    setTags(prev => prev.filter(tag => tag.id !== tagId))
  }

  const startEditing = (tag: CustomTag) => {
    setEditingTag(tag.id)
    setEditName(tag.name)
  }

  const getTagUsageCount = (tagId: string) => {
    const tag = tags.find(t => t.id === tagId)
    return tag?.usageCount || 0
  }

  const isTagLimitReached = selectedTags.length >= maxTags

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Tag className="h-5 w-5 text-calm-blue" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100">Tags</h3>
        </div>
        
        {!showCreateForm && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowCreateForm(true)}
            disabled={isTagLimitReached}
            className="text-calm-blue border-calm-blue hover:bg-calm-blue/10"
          >
            <Plus className="h-4 w-4 mr-1" />
            Custom Tag
          </Button>
        )}
      </div>

      {/* Create Custom Tag Form */}
      {showCreateForm && (
        <Card className="border-2 border-dashed border-calm-blue/30 bg-calm-blue/5">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-calm-blue">Create Custom Tag</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tag Name
              </label>
              <Input
                placeholder="e.g., Meditation, Reading, Travel"
                value={newTagName}
                onChange={(e) => setNewTagName(e.target.value)}
                maxLength={20}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Tag Color
              </label>
              <div className="flex flex-wrap gap-2">
                {tagColors.map((color) => (
                  <button
                    key={color}
                    onClick={() => setSelectedColor(color)}
                    className={cn(
                      'w-8 h-8 rounded-full border-2 transition-all duration-200',
                      selectedColor === color 
                        ? 'border-gray-800 scale-110' 
                        : 'border-gray-300 hover:scale-105'
                    )}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={createCustomTag}
                disabled={!newTagName.trim()}
                className="flex-1 bg-calm-blue hover:bg-calm-blue/90"
              >
                Create Tag
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCreateForm(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tag Limit Warning */}
      {isTagLimitReached && (
        <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            You&apos;ve reached the maximum of {maxTags} tags. 
            Remove some tags or upgrade to Premium for unlimited tags.
          </p>
        </div>
      )}

      {/* Tags Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {tags.map((tag) => {
          const isSelected = selectedTags.includes(tag.id)
          const isEditing = editingTag === tag.id
          
          return (
            <div key={tag.id} className="relative">
              {isEditing ? (
                <div className="space-y-2">
                  <Input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="text-sm"
                    maxLength={20}
                  />
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      onClick={() => updateTag(tag.id)}
                      disabled={!editName.trim()}
                      className="flex-1 h-8 text-xs"
                    >
                      <Save className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingTag(null)}
                      className="h-8 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => onTagToggle(tag.id)}
                  disabled={!isSelected && isTagLimitReached}
                  className={cn(
                    'w-full p-3 rounded-lg border-2 transition-all duration-200 text-left group',
                    isSelected
                      ? 'border-calm-blue bg-calm-blue text-white shadow-md'
                      : 'border-gray-200 dark:border-gray-700 hover:border-calm-blue/50 hover:bg-calm-blue/5',
                    !isSelected && isTagLimitReached && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                    {tag.isCustom && (
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            startEditing(tag)
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Edit2 className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteTag(tag.id)
                          }}
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  <div className="font-medium text-sm">{tag.name}</div>
                  
                  <div className="flex items-center justify-between mt-2 text-xs opacity-70">
                    <span>{getTagUsageCount(tag.id)} uses</span>
                    {tag.isCustom && (
                      <span className="text-calm-blue">Custom</span>
                    )}
                  </div>
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Selected Tags Summary */}
      {selectedTags.length > 0 && (
        <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Selected: {selectedTags.length}/{maxTags} tags
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedTags.map(tagId => {
              const tag = tags.find(t => t.id === tagId)
              if (!tag) return null
              
              return (
                <Badge
                  key={tagId}
                  variant="secondary"
                  className="cursor-pointer hover:bg-red-100 hover:text-red-800 transition-colors"
                  onClick={() => onTagToggle(tagId)}
                >
                  <div 
                    className="w-2 h-2 rounded-full mr-2"
                    style={{ backgroundColor: tag.color }}
                  />
                  {tag.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}




