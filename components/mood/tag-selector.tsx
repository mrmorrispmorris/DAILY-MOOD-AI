'use client'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

interface TagSelectorProps {
  selectedTags: string[]
  onTagToggle: (tagId: string) => void
}

export function TagSelector({ selectedTags, onTagToggle }: TagSelectorProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">
        What influenced your mood?
      </h3>
      <div className="flex flex-wrap gap-2">
        {predefinedTags.map((tag) => (
          <button
            key={tag.id}
            onClick={() => onTagToggle(tag.id)}
            className={cn(
              'px-3 py-2 rounded-full text-sm font-medium transition-all duration-200',
              selectedTags.includes(tag.id)
                ? 'bg-primary text-white shadow-md'
                : tag.color
            )}
          >
            {tag.label}
          </button>
        ))}
      </div>
      {selectedTags.length > 0 && (
        <div className="text-sm text-gray-600 animate-fade-in">
          Selected: {selectedTags.length} tag{selectedTags.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}