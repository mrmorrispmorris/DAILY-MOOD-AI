'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import MoodyCompanion from './MoodyCompanion'
import { useAvatarState } from '@/app/hooks/useAvatarState'

interface AvatarWidgetProps {
  userId?: string
  currentMood: number
}

export default function AvatarWidget({ userId, currentMood }: AvatarWidgetProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const { avatarState, feed, play, rest, earnXP } = useAvatarState(userId)
  
  return (
    <motion.div
      className="fixed bottom-20 right-4 z-50"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
    >
      {/* Floating Avatar Button */}
      <motion.button
        onClick={() => setIsExpanded(!isExpanded)}
        className="relative"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {/* 🎯 MOODY - YOUR FLOATING COMPANION! */}
        <MoodyCompanion
          mood={currentMood}
          userName="friend"
          size="small"
          streakDays={7} // You can pass real streak data
        />
        
        {/* Energy Bar */}
        <div className="absolute -bottom-2 left-0 right-0 h-2 bg-gray-200 
                      rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-green-400 to-green-600"
            animate={{ width: `${avatarState.energy}%` }}
          />
        </div>
      </motion.button>
      
      {/* Expanded Menu */}
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="absolute bottom-full right-0 mb-4 bg-white rounded-2xl 
                   shadow-2xl p-4 min-w-[250px] border-2 border-purple-200"
        >
          <h3 className="font-bold text-purple-600 mb-3">Your Mood Buddy</h3>
          
          {/* Stats */}
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Level {avatarState.level}</span>
              <span>{avatarState.experience} XP</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Energy</span>
              <span>{avatarState.energy}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Mood</span>
              <span className="capitalize">{avatarState.mood}</span>
            </div>
          </div>
          
          {/* Actions */}
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={feed}
              className="p-2 bg-green-100 rounded-lg hover:bg-green-200 
                       transition-colors text-center"
            >
              <span className="text-xl">🍎</span>
              <p className="text-xs">Feed</p>
            </button>
            
            <button
              onClick={play}
              className="p-2 bg-blue-100 rounded-lg hover:bg-blue-200 
                       transition-colors text-center"
            >
              <span className="text-xl">🎮</span>
              <p className="text-xs">Play</p>
            </button>
            
            <button
              onClick={rest}
              className="p-2 bg-purple-100 rounded-lg hover:bg-purple-200 
                       transition-colors text-center"
            >
              <span className="text-xl">😴</span>
              <p className="text-xs">Rest</p>
            </button>
          </div>
          
          {/* Achievements Preview */}
          {avatarState.achievements.length > 0 && (
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs text-gray-600 mb-2">Recent Achievements</p>
              <div className="flex gap-2">
                {avatarState.achievements.slice(0, 3).map((achievement, i) => (
                  <span key={i} className="text-xl" title={achievement}>
                    🏆
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
