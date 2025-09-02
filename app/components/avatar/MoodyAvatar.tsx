'use client'
import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MoodyAvatarProps {
  mood: number
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  message?: string
  showMessage?: boolean
}

export default function MoodyAvatar({ 
  mood, 
  size = 'medium', 
  interactive = true, 
  message,
  showMessage = false 
}: MoodyAvatarProps) {
  const [expression, setExpression] = useState('neutral')
  const [isBlinking, setIsBlinking] = useState(false)
  const [isFloating, setIsFloating] = useState(true)
  const [touchCount, setTouchCount] = useState(0)
  
  // PRD-specified dimensions (Duolingo-inspired)
  const sizeMap = {
    small: 'w-16 h-16',
    medium: 'w-32 h-32',
    large: 'w-48 h-48'
  }
  
  // Enhanced empathetic mood mapping (mental health focused)
  const getMoodExpression = useCallback((score: number) => {
    console.log('📱 MOODY Expression - mood score:', score) // Mobile debugging
    if (score <= 1) return 'very_sad'      // Very sad/crisis
    if (score <= 2) return 'concerned'     // Crisis-aware response  
    if (score <= 3) return 'sad'           // Sad expression
    if (score <= 4) return 'supportive'    // Gentle support
    if (score <= 5) return 'calm'          // Neutral peace
    if (score <= 6) return 'content'       // Slightly positive
    if (score <= 7) return 'happy'         // Happy smile
    if (score <= 8) return 'encouraging'   // Positive reinforcement
    if (score <= 9) return 'very_happy'    // Very happy
    return 'celebrating'                   // Joyful celebration
  }, [])
  
  useEffect(() => {
    setExpression(getMoodExpression(mood))
  }, [mood, getMoodExpression])
  
  // Natural blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 120)
    }, 3000 + Math.random() * 2000) // Natural randomness
    
    return () => clearInterval(blinkInterval)
  }, [])
  
  // Gentle floating animation
  useEffect(() => {
    const floatInterval = setInterval(() => {
      setIsFloating(prev => !prev)
    }, 4000)
    
    return () => clearInterval(floatInterval)
  }, [])
  
  // Interactive touch handling
  const handleInteraction = () => {
    if (!interactive) return
    
    setTouchCount(prev => prev + 1)
    
    // Gentle haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    // Reset touch count after period of inactivity
    setTimeout(() => {
      setTouchCount(0)
    }, 3000)
  }
  
  // Get empathetic messages based on mood
  const getEmpatheticMessage = (score: number) => {
    if (score <= 2) return "I'm here for you 💙"
    if (score <= 4) return "You're doing your best ✨"
    if (score <= 6) return "Taking it one step at a time 🌱"
    if (score <= 8) return "I see your progress! 🌟"
    return "You're absolutely glowing! 🎉"
  }
  
  return (
    <div className="relative">
      <motion.div 
        className={`${sizeMap[size]} relative cursor-pointer select-none`}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        animate={{
          y: isFloating ? [-2, 2] : [2, -2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: 'reverse',
          ease: 'easeInOut'
        }}
        onClick={handleInteraction}
      >
        {/* Soft glow effect - Lumen Aqua Prime */}
        <div className="absolute inset-0 rounded-full blur-md scale-110" 
             style={{
               background: `radial-gradient(circle, var(--brand-primary)20, var(--brand-primary)10)`
             }} />
        
        {/* Main MOODY character - PRD compliant design */}
        <svg viewBox="0 0 120 120" className="relative z-10 w-full h-full drop-shadow-lg">
          <defs>
            {/* Subtle Professional Color System - Daylio Inspired */}
            <linearGradient id="moodyBodyGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#7DD3C0" />  {/* Soft muted teal */}
              <stop offset="100%" stopColor="#6BB6A5" stopOpacity="0.9" />
            </linearGradient>
            <linearGradient id="moodyAccentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A8D8E8" />  {/* Soft blue accent */}
              <stop offset="100%" stopColor="#91C7D9" stopOpacity="0.8" />
            </linearGradient>
            <radialGradient id="eyeGradient">
              <stop offset="0%" stopColor="#4A5568" />
              <stop offset="100%" stopColor="#2D3748" />
            </radialGradient>
          </defs>
          
          {/* Body (Duolingo-inspired shape) */}
          <ellipse 
            cx="60" 
            cy="65" 
            rx="45" 
            ry="40" 
            fill="url(#moodyBodyGradient)"
            stroke="#E6E6FA"  // Gentle lavender accent
            strokeWidth="2"
          />
          
          {/* Head (soft, rounded) */}
          <circle 
            cx="60" 
            cy="45" 
            r="35" 
            fill="url(#moodyBodyGradient)"
            stroke="#E6E6FA"
            strokeWidth="2"
          />
          
          {/* Large expressive eyes (40% of face as per PRD) */}
          <g className="eyes">
            {/* Left eye background */}
            <ellipse 
              cx="45" 
              cy="40" 
              rx="12" 
              ry={isBlinking ? 2 : 14}
              fill="#FFFFFF"
              stroke="#E6E6FA"
              strokeWidth="1"
              style={{ 
                transition: 'ry 0.12s ease-out',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
            
            {/* Left pupil */}
            <ellipse 
              cx="45" 
              cy="40" 
              rx="7" 
              ry={isBlinking ? 1 : 8}
              fill="url(#eyeGradient)"
              style={{ transition: 'ry 0.12s ease-out' }}
            />
            
            {/* Left eye sparkle */}
            <circle cx="42" cy="37" r="2" fill="#FFFFFF" opacity="0.9" />
            
            {/* Right eye background */}
            <ellipse 
              cx="75" 
              cy="40" 
              rx="12" 
              ry={isBlinking ? 2 : 14}
              fill="#FFFFFF"
              stroke="#E6E6FA"
              strokeWidth="1"
              style={{ 
                transition: 'ry 0.12s ease-out',
                filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
              }}
            />
            
            {/* Right pupil */}
            <ellipse 
              cx="75" 
              cy="40" 
              rx="7" 
              ry={isBlinking ? 1 : 8}
              fill="url(#eyeGradient)"
              style={{ transition: 'ry 0.12s ease-out' }}
            />
            
            {/* Right eye sparkle */}
            <circle cx="78" cy="37" r="2" fill="#FFFFFF" opacity="0.9" />
          </g>
          
          {/* Expression-based features - Enhanced mood expressions */}
          {expression === 'very_sad' && (
            <g>
              {/* Very sad downturned mouth */}
              <path d="M 45 60 Q 60 50 75 60" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Sad eyebrows - angled down */}
              <path d="M 35 35 Q 45 30 55 35" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 65 35 Q 75 30 85 35" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
              {/* Tear drops */}
              <ellipse cx="35" cy="50" rx="2" ry="4" fill="#A8D8E8" opacity="0.7" />
              <ellipse cx="85" cy="50" rx="2" ry="4" fill="#A8D8E8" opacity="0.7" />
            </g>
          )}
          
          {expression === 'concerned' && (
            <g>
              {/* Gentle, understanding expression */}
              <path d="M 45 55 Q 60 50 75 55" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Caring eyebrows */}
              <path d="M 35 30 Q 45 25 55 30" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 65 30 Q 75 25 85 30" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          )}
          
          {expression === 'sad' && (
            <g>
              {/* Sad downturned mouth */}
              <path d="M 45 58 Q 60 52 75 58" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Slightly sad eyebrows */}
              <path d="M 35 32 Q 45 28 55 32" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
              <path d="M 65 32 Q 75 28 85 32" stroke="#2D3748" strokeWidth="2" fill="none" strokeLinecap="round" />
            </g>
          )}
          
          {expression === 'supportive' && (
            <g>
              {/* Encouraging small smile */}
              <path d="M 45 55 Q 60 60 75 55" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Gentle blush */}
              <circle cx="35" cy="50" r="4" fill="url(#moodyAccentGradient)" opacity="0.4" />
              <circle cx="85" cy="50" r="4" fill="url(#moodyAccentGradient)" opacity="0.4" />
            </g>
          )}
          
          {expression === 'calm' && (
            <g>
              {/* Peaceful neutral expression */}
              <path d="M 50 55 Q 60 58 70 55" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
            </g>
          )}
          
          {expression === 'content' && (
            <g>
              {/* Gentle content smile */}
              <path d="M 48 55 Q 60 62 72 55" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Soft blush */}
              <circle cx="38" cy="50" r="3" fill="url(#moodyAccentGradient)" opacity="0.3" />
              <circle cx="82" cy="50" r="3" fill="url(#moodyAccentGradient)" opacity="0.3" />
            </g>
          )}
          
          {expression === 'happy' && (
            <g>
              {/* Happy smile */}
              <path d="M 42 55 Q 60 65 78 55" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Happy blush */}
              <circle cx="35" cy="50" r="4" fill="url(#moodyAccentGradient)" opacity="0.5" />
              <circle cx="85" cy="50" r="4" fill="url(#moodyAccentGradient)" opacity="0.5" />
            </g>
          )}
          
          {expression === 'encouraging' && (
            <g>
              {/* Big encouraging smile */}
              <path d="M 40 55 Q 60 68 80 55" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              <circle cx="35" cy="50" r="5" fill="url(#moodyAccentGradient)" opacity="0.6" />
              <circle cx="85" cy="50" r="5" fill="url(#moodyAccentGradient)" opacity="0.6" />
            </g>
          )}
          
          {expression === 'very_happy' && (
            <g>
              {/* Very happy big smile with closed eyes */}
              <path d="M 38 55 Q 60 70 82 55" stroke="#2D3748" strokeWidth="4" fill="none" strokeLinecap="round" />
              {/* Closed happy eyes (crescent shapes) */}
              <path d="M 37 38 Q 53 32 53 38" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              <path d="M 67 38 Q 83 32 83 38" stroke="#2D3748" strokeWidth="3" fill="none" strokeLinecap="round" />
              {/* Big happy blush */}
              <circle cx="32" cy="50" r="6" fill="url(#moodyAccentGradient)" opacity="0.7" />
              <circle cx="88" cy="50" r="6" fill="url(#moodyAccentGradient)" opacity="0.7" />
            </g>
          )}
          
          {expression === 'celebrating' && (
            <g>
              {/* Joyful wide open mouth */}
              <ellipse cx="60" cy="55" rx="8" ry="12" fill="#2D3748" />
              {/* Sparkly eyes */}
              <path d="M 40 35 L 50 38 L 40 41 L 50 44 L 40 35" fill="#FFD700" />
              <path d="M 70 35 L 80 38 L 70 41 L 80 44 L 70 35" fill="#FFD700" />
              {/* Celebration blush */}
              <circle cx="30" cy="50" r="7" fill="url(#moodyAccentGradient)" opacity="0.8" />
              <circle cx="90" cy="50" r="7" fill="url(#moodyAccentGradient)" opacity="0.8" />
            </g>
          )}
          
          {/* Detached limbs (Duolingo style) */}
          <g className="limbs">
            {/* Left arm */}
            <ellipse 
              cx="20" 
              cy="70" 
              rx="8" 
              ry="15" 
              fill="url(#moodyBodyGradient)"
              transform="rotate(-15 20 70)"
            />
            
            {/* Right arm */}
            <ellipse 
              cx="100" 
              cy="70" 
              rx="8" 
              ry="15" 
              fill="url(#moodyBodyGradient)"
              transform="rotate(15 100 70)"
            />
            
            {/* Left leg */}
            <ellipse 
              cx="45" 
              cy="105" 
              rx="6" 
              ry="12" 
              fill="url(#moodyBodyGradient)"
            />
            
            {/* Right leg */}
            <ellipse 
              cx="75" 
              cy="105" 
              rx="6" 
              ry="12" 
              fill="url(#moodyBodyGradient)"
            />
          </g>
          
          {/* Name badge removed for cleaner look */}
        </svg>
        
        {/* Floating elements based on expression */}
        <AnimatePresence>
          {expression === 'celebrating' && (
            <div className="absolute inset-0 pointer-events-none">
              {[...Array(4)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-xl"
                  initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
                  animate={{ 
                    opacity: [0, 1, 0],
                    scale: [0, 1, 0],
                    y: [0, -40],
                    x: [(i - 1.5) * 15, (i - 1.5) * 25]
                  }}
                  exit={{ opacity: 0, scale: 0 }}
                  transition={{ 
                    duration: 2.5,
                    delay: i * 0.3,
                    repeat: Infinity,
                    repeatDelay: 1
                  }}
                  style={{ 
                    top: '20%', 
                    left: '50%',
                    transform: 'translateX(-50%)'
                  }}
                >
                  {['🌟', '✨', '💫', '⭐'][i]}
                </motion.div>
              ))}
            </div>
          )}
          
          {expression === 'supportive' && (
            <div className="absolute inset-0 pointer-events-none">
              <motion.div
                className="absolute text-lg"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ 
                  opacity: [0, 0.8, 0],
                  scale: [0, 1.2, 0],
                  rotate: [0, 10, -10, 0]
                }}
                transition={{ 
                  duration: 3,
                  repeat: Infinity,
                  repeatDelay: 2
                }}
                style={{ 
                  top: '10%', 
                  right: '10%'
                }}
              >
                💙
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        
        {/* Interactive touch count indicator */}
        {touchCount > 0 && (
          <motion.div
            className="absolute -top-2 -right-2 bg-teal-400 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
          >
            {touchCount}
          </motion.div>
        )}
      </motion.div>
      
      {/* Speech bubble for empathetic messages */}
      <AnimatePresence>
        {showMessage && (message || mood <= 6) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white rounded-2xl px-4 py-2 shadow-lg border-2 border-teal-200 min-w-[200px] text-center z-20"
          >
            <p className="text-sm text-gray-700 whitespace-nowrap">
              {message || getEmpatheticMessage(mood)}
            </p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-teal-200 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

