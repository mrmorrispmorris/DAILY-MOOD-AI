'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface AdvancedAvatarProps {
  mood: number
  level?: number
  accessories?: string[]
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  userName?: string
}

export default function AdvancedAvatar({ 
  mood, 
  level = 1, 
  accessories = [],
  size = 'medium',
  interactive = true,
  userName = 'friend'
}: AdvancedAvatarProps) {
  const [expression, setExpression] = useState('neutral')
  const [isAnimating, setIsAnimating] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [eyeDirection, setEyeDirection] = useState({ x: 0, y: 0 })
  
  // Size configurations
  const sizes = {
    small: { container: 'w-20 h-20', avatar: 'w-16 h-16', level: 'w-6 h-6 text-xs' },
    medium: { container: 'w-32 h-32', avatar: 'w-28 h-28', level: 'w-8 h-8 text-sm' },
    large: { container: 'w-48 h-48', avatar: 'w-44 h-44', level: 'w-12 h-12 text-base' }
  }
  
  // Mood to expression mapping
  const getMoodExpression = (score: number) => {
    if (score <= 2) return 'very-sad'
    if (score <= 4) return 'sad'
    if (score <= 6) return 'neutral'
    if (score <= 8) return 'happy'
    return 'excited'
  }
  
  // Mood to color mapping
  const getMoodColors = (expr: string) => {
    const colors = {
      'very-sad': {
        primary: 'from-blue-400 to-blue-600',
        secondary: 'from-blue-300 to-blue-500',
        accent: 'bg-blue-200'
      },
      'sad': {
        primary: 'from-indigo-400 to-indigo-600',
        secondary: 'from-indigo-300 to-indigo-500',
        accent: 'bg-indigo-200'
      },
      'neutral': {
        primary: 'from-purple-400 to-purple-600',
        secondary: 'from-purple-300 to-purple-500',
        accent: 'bg-purple-200'
      },
      'happy': {
        primary: 'from-green-400 to-green-600',
        secondary: 'from-green-300 to-green-500',
        accent: 'bg-green-200'
      },
      'excited': {
        primary: 'from-yellow-400 via-pink-500 to-red-500',
        secondary: 'from-yellow-300 via-pink-400 to-red-400',
        accent: 'bg-yellow-200'
      }
    }
    return colors[expr] || colors.neutral
  }
  
  useEffect(() => {
    const newExpression = getMoodExpression(mood)
    setExpression(newExpression)
  }, [mood])
  
  // Blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, Math.random() * 3000 + 2000)
    
    return () => clearInterval(blinkInterval)
  }, [])
  
  // Eye tracking animation
  useEffect(() => {
    const moveEyes = () => {
      setEyeDirection({
        x: (Math.random() - 0.5) * 4,
        y: (Math.random() - 0.5) * 2
      })
    }
    
    const eyeInterval = setInterval(moveEyes, 2000)
    return () => clearInterval(eyeInterval)
  }, [])
  
  const handleClick = () => {
    if (!interactive) return
    
    setIsAnimating(true)
    setTimeout(() => setIsAnimating(false), 500)
    
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
  }
  
  const colors = getMoodColors(expression)
  const sizeConfig = sizes[size]
  
  return (
    <motion.div
      className={`relative ${sizeConfig.container} cursor-pointer`}
      whileHover={interactive ? { scale: 1.05 } : {}}
      whileTap={interactive ? { scale: 0.95 } : {}}
      animate={isAnimating ? {
        y: [0, -10, 0],
        rotate: [0, 5, -5, 0],
        transition: { duration: 0.5, ease: "easeOut" }
      } : {}}
      onClick={handleClick}
    >
      {/* Glowing background effect */}
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.primary} 
                      rounded-full opacity-20 blur-xl animate-pulse`} />
      
      {/* Main avatar container */}
      <div className={`relative ${sizeConfig.avatar} mx-auto bg-gradient-to-br ${colors.primary} 
                      rounded-full shadow-2xl border-4 border-white/30 overflow-hidden`}>
        
        {/* Face container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Eyes */}
            <g className="eyes">
              {/* Left eye background */}
              <ellipse 
                cx="30" 
                cy="35" 
                rx="8" 
                ry={isBlinking ? 1 : 10} 
                fill="white" 
                className="transition-all duration-100"
              />
              {/* Left pupil */}
              <motion.circle 
                cx={30 + eyeDirection.x} 
                cy={35 + eyeDirection.y} 
                r={isBlinking ? 0 : 4} 
                fill="#1a1a1a"
                animate={{ cx: 30 + eyeDirection.x, cy: 35 + eyeDirection.y }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Right eye background */}
              <ellipse 
                cx="70" 
                cy="35" 
                rx="8" 
                ry={isBlinking ? 1 : 10} 
                fill="white" 
                className="transition-all duration-100"
              />
              {/* Right pupil */}
              <motion.circle 
                cx={70 + eyeDirection.x} 
                cy={35 + eyeDirection.y} 
                r={isBlinking ? 0 : 4} 
                fill="#1a1a1a"
                animate={{ cx: 70 + eyeDirection.x, cy: 35 + eyeDirection.y }}
                transition={{ duration: 0.3 }}
              />
              
              {/* Eye shine effects */}
              {!isBlinking && (
                <>
                  <circle cx="32" cy="32" r="2" fill="white" opacity="0.8" />
                  <circle cx="72" cy="32" r="2" fill="white" opacity="0.8" />
                </>
              )}
            </g>
            
            {/* Eyebrows based on expression */}
            <g className="eyebrows">
              {(expression === 'sad' || expression === 'very-sad') && (
                <>
                  <path d="M 22 25 Q 30 20 38 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M 62 25 Q 70 20 78 25" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </>
              )}
              {expression === 'excited' && (
                <>
                  <path d="M 22 28 Q 30 23 38 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M 62 28 Q 70 23 78 28" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round"/>
                </>
              )}
            </g>
            
            {/* Mouth based on expression */}
            <g className="mouth">
              {expression === 'very-sad' && (
                <path d="M 30 70 Q 50 55 70 70" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              )}
              {expression === 'sad' && (
                <path d="M 35 68 Q 50 58 65 68" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              )}
              {expression === 'neutral' && (
                <line x1="42" y1="65" x2="58" y2="65" stroke="white" strokeWidth="3" strokeLinecap="round"/>
              )}
              {expression === 'happy' && (
                <path d="M 30 60 Q 50 75 70 60" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round"/>
              )}
              {expression === 'excited' && (
                <ellipse cx="50" cy="65" rx="12" ry="8" fill="white" />
              )}
            </g>
            
            {/* Cheeks for happy expressions */}
            {(expression === 'happy' || expression === 'excited') && (
              <g className="cheeks">
                <circle cx="20" cy="50" r="3" fill="white" opacity="0.6" />
                <circle cx="80" cy="50" r="3" fill="white" opacity="0.6" />
              </g>
            )}
          </svg>
        </div>
        
        {/* Level badge */}
        <div className={`absolute -top-2 -right-2 ${sizeConfig.level} bg-gradient-to-br from-yellow-400 to-orange-500 
                        rounded-full flex items-center justify-center text-white font-bold shadow-lg border-2 border-white`}>
          {level}
        </div>
        
        {/* Energy indicator (small pulsing dot) */}
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
          <div className={`w-2 h-2 ${colors.accent} rounded-full animate-pulse`} />
        </div>
      </div>
      
      {/* Floating elements based on mood */}
      {expression === 'excited' && (
        <>
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-lg pointer-events-none"
              style={{
                left: '50%',
                top: '50%',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.2, 0],
                x: [(Math.random() - 0.5) * 60],
                y: [-20 - Math.random() * 40],
                rotate: Math.random() * 360
              }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              {['✨', '🌟', '💫', '⭐', '🎉'][i]}
            </motion.div>
          ))}
        </>
      )}
      
      {/* Floating hearts for happy mood */}
      {expression === 'happy' && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm pointer-events-none text-red-400"
              style={{
                left: `${40 + i * 20}%`,
                top: '10%',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1, 0],
                y: [-30],
              }}
              transition={{
                duration: 2.5,
                delay: i * 0.4,
                repeat: Infinity,
                repeatDelay: 4
              }}
            >
              💝
            </motion.div>
          ))}
        </>
      )}
      
      {/* Sad tears */}
      {(expression === 'sad' || expression === 'very-sad') && (
        <>
          {[...Array(2)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute text-sm pointer-events-none"
              style={{
                left: `${35 + i * 30}%`,
                top: '60%',
              }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 1, 0.5, 0],
                scale: [0, 1, 1, 0],
                y: [0, 20],
              }}
              transition={{
                duration: 1.5,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              💧
            </motion.div>
          ))}
        </>
      )}
    </motion.div>
  )
}

