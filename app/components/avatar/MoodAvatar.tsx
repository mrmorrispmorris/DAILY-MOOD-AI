'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HapticFeedback } from '@/app/utils/haptic'

interface MoodAvatarProps {
  currentMood?: number // 1-10 scale
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  onInteract?: () => void
}

export default function MoodAvatar({ 
  currentMood = 5, 
  size = 'medium',
  interactive = true,
  onInteract 
}: MoodAvatarProps) {
  const [expression, setExpression] = useState('neutral')
  const [isBlinking, setIsBlinking] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [touchCount, setTouchCount] = useState(0)
  
  // Avatar size configurations
  const sizes = {
    small: 'w-24 h-24',
    medium: 'w-40 h-40',
    large: 'w-64 h-64'
  }

  // Map mood score to expression
  useEffect(() => {
    if (currentMood <= 2) setExpression('sad')
    else if (currentMood <= 4) setExpression('worried')
    else if (currentMood <= 6) setExpression('neutral')
    else if (currentMood <= 8) setExpression('happy')
    else setExpression('excited')
  }, [currentMood])

  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 3000 + 2000) // Random blink every 2-5 seconds

    return () => clearInterval(blinkInterval)
  }, [])

  const handleTouch = () => {
    if (!interactive) return
    
    HapticFeedback.light()
    setTouchCount(prev => prev + 1)
    
    // Different reactions based on touch count
    if (touchCount < 3) {
      // Happy wiggle
      setExpression('happy')
      setTimeout(() => setExpression('neutral'), 1000)
    } else if (touchCount < 6) {
      // Excited jump
      setExpression('excited')
    } else {
      // Sleepy after too many touches
      setExpression('sleeping')
      setTimeout(() => {
        setExpression('neutral')
        setTouchCount(0)
      }, 3000)
    }
    
    onInteract?.()
  }

  return (
    <motion.div
      className={`relative ${sizes[size]} cursor-pointer select-none`}
      onClick={handleTouch}
      whileHover={interactive ? { scale: 1.05 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
    >
      {/* Avatar Base */}
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Body */}
        <motion.ellipse
          cx="100"
          cy="100"
          rx="70"
          ry="75"
          fill="url(#avatarGradient)"
          animate={{
            ry: expression === 'excited' ? 72 : 75,
          }}
          transition={{
            duration: 0.5,
            repeat: expression === 'excited' ? Infinity : 0,
            repeatType: 'reverse'
          }}
        />
        
        {/* Gradient Definition */}
        <defs>
          <linearGradient id="avatarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#7C3AED" />
          </linearGradient>
        </defs>

        {/* Eyes */}
        <g className="eyes">
          {/* Left Eye */}
          <motion.ellipse
            cx="80"
            cy="90"
            rx="8"
            ry={isBlinking ? 1 : 12}
            fill="#FFFFFF"
            transition={{ duration: 0.1 }}
          />
          <motion.circle
            cx="80"
            cy="90"
            r="5"
            fill="#1F2937"
            animate={{
              cx: 78 + (currentMood / 10) * 4
            }}
          />
          
          {/* Right Eye */}
          <motion.ellipse
            cx="120"
            cy="90"
            rx="8"
            ry={isBlinking ? 1 : 12}
            fill="#FFFFFF"
            transition={{ duration: 0.1 }}
          />
          <motion.circle
            cx="120"
            cy="90"
            r="5"
            fill="#1F2937"
            animate={{
              cx: 118 + (currentMood / 10) * 4
            }}
          />
        </g>

        {/* Mouth based on expression */}
        <AnimatePresence mode="wait">
          {expression === 'happy' && (
            <motion.path
              key="happy"
              d="M 75 120 Q 100 140 125 120"
              stroke="#1F2937"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 0 }}
            />
          )}
          
          {expression === 'sad' && (
            <motion.path
              key="sad"
              d="M 75 130 Q 100 110 125 130"
              stroke="#1F2937"
              strokeWidth="3"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 0 }}
            />
          )}
          
          {expression === 'neutral' && (
            <motion.line
              key="neutral"
              x1="85"
              y1="120"
              x2="115"
              y2="120"
              stroke="#1F2937"
              strokeWidth="3"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              exit={{ pathLength: 0 }}
            />
          )}
          
          {expression === 'excited' && (
            <motion.ellipse
              key="excited"
              cx="100"
              cy="120"
              rx="15"
              ry="20"
              fill="#1F2937"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            />
          )}
        </AnimatePresence>

        {/* Eyebrows for emotion */}
        {expression === 'worried' && (
          <>
            <motion.path
              d="M 70 75 L 85 70"
              stroke="#1F2937"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <motion.path
              d="M 115 70 L 130 75"
              stroke="#1F2937"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </>
        )}
      </svg>

      {/* Floating hearts when happy */}
      {expression === 'excited' && (
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl"
              initial={{ 
                bottom: '50%', 
                left: `${40 + i * 20}%`,
                opacity: 1 
              }}
              animate={{ 
                bottom: '120%',
                opacity: 0
              }}
              transition={{
                duration: 2,
                delay: i * 0.3,
                repeat: Infinity
              }}
            >
              ❤️
            </motion.div>
          ))}
        </div>
      )}

      {/* Sleep Z's when sleeping */}
      {expression === 'sleeping' && (
        <motion.div
          className="absolute top-0 right-0 text-2xl"
          animate={{
            y: [-10, -20, -10],
            opacity: [1, 0.5, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        >
          💤
        </motion.div>
      )}
    </motion.div>
  )
}

