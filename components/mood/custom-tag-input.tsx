'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CustomTagInputProps {
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
  onAddCustomTag: (tag: string) => void
  maxTags?: number
}

const predefinedTags = [
  { id: 'work', label: 'Work', color: 'bg-blue-100 text-blue-800 hover:bg-blue-200' },
  { id: 'exercise', label: 'Exercise', color: 'bg-green-100 text-green-800 hover:bg-green-200' },
  { id: 'sleep', label: 'Sleep', color: 'bg-purple-100 text-purple-800 hover:bg-purple-200' },
  { id: 'stress', label: 'Stress', color: 'bg-red-100 text-red-800 hover:bg-red-200' },
  { id: 'family', label: 'Family', color: 'bg-pink-100 text-pink-800 hover:bg-pink-200' },
  { id: 'friends', label: 'Friends', color: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200' },
  { id: 'health', label: 'Health', color: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200' },
  { id: 'hobby', label: 'Hobby', color: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200' },
]

export function CustomTagInput({ selectedTags, onTagToggle, onAddCustomTag, maxTags = 10 }: CustomTagInputProps) {
  const [customTag, setCustomTag] = useState('')
  const [showCustomInput, setShowCustomInput] = useState(false)

  // Get custom tags from localStorage
  const getCustomTags = () => {
    if (typeof window === 'undefined') return []
    const stored = localStorage.getItem('dailymood_custom_tags')
    return stored ? JSON.parse(stored) : []
  }

  const [customTags, setCustomTags] = useState<string[]>(getCustomTags())

  const handleAddCustomTag = () => {
    if (!customTag.trim() || customTag.length > 20) return
    
    const newTag = customTag.trim().toLowerCase()
    
    // Check if tag already exists
    const allTags = [...predefinedTags.map(t => t.id), ...customTags]
    if (allTags.includes(newTag)) {
      setCustomTag('')
      return
    }

    // Add to custom tags
    const updatedCustomTags = [...customTags, newTag]
    setCustomTags(updatedCustomTags)
    
    // Save to localStorage
    localStorage.setItem('dailymood_custom_tags', JSON.stringify(updatedCustomTags))
    
    // Add to selected tags
    onAddCustomTag(newTag)
    onTagToggle(newTag)
    
    setCustomTag('')
    setShowCustomInput(false)
  }

  const removeCustomTag = (tagToRemove: string) => {
    const updatedCustomTags = customTags.filter(tag => tag !== tagToRemove)
    setCustomTags(updatedCustomTags)
    localStorage.setItem('dailymood_custom_tags', JSON.stringify(updatedCustomTags))
    
    // Remove from selected if it was selected
    if (selectedTags.includes(tagToRemove)) {
      onTagToggle(tagToRemove)
    }
  }

  const allTags = [
    ...predefinedTags,
    ...customTags.map(tag => ({
      id: tag,
      label: tag.charAt(0).toUpperCase() + tag.slice(1),
      color: 'bg-gray-100 text-gray-800 hover:bg-gray-200'
    }))
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          What influenced your mood?
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowCustomInput(!showCustomInput)}
          disabled={selectedTags.length >= maxTags}
        >
          <Plus className="h-4 w-4 mr-1" />
          Custom
        </Button>
      </div>

      {/* Custom tag input */}
      {showCustomInput && (
        <div className="flex space-x-2 p-3 bg-gray-50 rounded-lg">
          <Input
            placeholder="Add custom activity (max 20 chars)"
            value={customTag}
            onChange={(e) => setCustomTag(e.target.value)}
            maxLength={20}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleAddCustomTag()
              }
            }}
          />
          <Button
            onClick={handleAddCustomTag}
            disabled={!customTag.trim()}
            size="sm"
          >
            Add
          </Button>
        </div>
      )}

      {/* Tags grid */}
      <div className="flex flex-wrap gap-2">
        {allTags.map((tag) => (
          <div key={tag.id} className="relative group">
            <button
              onClick={() => onTagToggle(tag.id)}
              disabled={!selectedTags.includes(tag.id) && selectedTags.length >= maxTags}
              className={cn(
                'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 disabled:opacity-50',
                selectedTags.includes(tag.id)
                  ? 'bg-primary text-white shadow-md'
                  : tag.color
              )}
            >
              {tag.label}
            </button>
            
            {/* Remove button for custom tags */}
            {customTags.includes(tag.id) && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  removeCustomTag(tag.id)
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
              >
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
        ))}
      </div>

      {selectedTags.length > 0 && (
        <div className="text-sm text-gray-600 animate-fade-in">
          Selected: {selectedTags.length}/{maxTags} tag{selectedTags.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}