'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ReactiveAvatarProps {
  mood: number
  userName?: string
  size?: 'small' | 'medium' | 'large'
  interactive?: boolean
  onMoodChange?: (newMood: number) => void
  recentActivity?: string // Last logged activity
}

export default function ReactiveAvatar({ 
  mood, 
  userName = 'friend',
  size = 'medium',
  interactive = true,
  onMoodChange,
  recentActivity 
}: ReactiveAvatarProps) {
  
  // FORCE LOG TO CHECK IF COMPONENT LOADS
  console.log('🎭 ReactiveAvatar loaded!', { mood, userName, size });
  const [isHappy, setIsHappy] = useState(false)
  const [isTalking, setIsTalking] = useState(false)
  const [message, setMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [eyeStyle, setEyeStyle] = useState('normal')
  const [mouthStyle, setMouthStyle] = useState('neutral')
  const [colorTheme, setColorTheme] = useState('calm')

  // Size configurations with softer, more appealing dimensions
  const sizes = {
    small: 'w-16 h-16',
    medium: 'w-24 h-24', 
    large: 'w-32 h-32'
  }

  // Soft, appealing color themes based on mood
  const colorThemes = {
    joyful: {
      primary: 'from-yellow-200 via-orange-200 to-pink-200',
      secondary: 'from-yellow-300 to-orange-300',
      accent: '#f59e0b'
    },
    happy: {
      primary: 'from-green-200 via-emerald-200 to-teal-200',
      secondary: 'from-green-300 to-emerald-300', 
      accent: '#10b981'
    },
    calm: {
      primary: 'from-blue-100 via-indigo-100 to-purple-100',
      secondary: 'from-blue-200 to-indigo-200',
      accent: '#6366f1'
    },
    thoughtful: {
      primary: 'from-gray-100 via-slate-100 to-zinc-100',
      secondary: 'from-gray-200 to-slate-200',
      accent: '#64748b'
    },
    sad: {
      primary: 'from-blue-200 via-indigo-200 to-purple-200',
      secondary: 'from-blue-300 to-indigo-300',
      accent: '#3b82f6'
    }
  }

  // React to mood changes
  useEffect(() => {
    if (mood >= 8) {
      setColorTheme('joyful')
      setEyeStyle('sparkle')
      setMouthStyle('big-smile')
      setMessage(`${userName}, you're absolutely glowing! ✨`)
    } else if (mood >= 6) {
      setColorTheme('happy')
      setEyeStyle('happy')
      setMouthStyle('smile')
      setMessage(`Great to see you in good spirits, ${userName}! 😊`)
    } else if (mood >= 4) {
      setColorTheme('calm')
      setEyeStyle('normal')
      setMouthStyle('neutral')
      setMessage(`Hi ${userName}, how can I help brighten your day?`)
    } else if (mood >= 2) {
      setColorTheme('thoughtful')
      setEyeStyle('concerned')
      setMouthStyle('frown')
      setMessage(`${userName}, I'm here for you. Let's work through this together.`)
    } else {
      setColorTheme('sad')
      setEyeStyle('sad')
      setMouthStyle('sad')
      setMessage(`${userName}, you're not alone. I care about you. 💙`)
    }
    
    // Show reaction message
    setShowMessage(true)
    setIsTalking(true)
    
    setTimeout(() => {
      setIsTalking(false)
      setTimeout(() => setShowMessage(false), 3000)
    }, 1000)
  }, [mood, userName])

  // React to activities
  useEffect(() => {
    if (recentActivity && recentActivity !== 'none') {
      const activityMessages: { [key: string]: string } = {
        'exercise': `Love seeing you stay active, ${userName}! 💪`,
        'work': `Hope work is going well, ${userName}! 💼`,
        'social': `Social time is so important, ${userName}! 👥`,
        'relax': `Perfect time to recharge, ${userName}! 🧘`,
        'hobby': `Doing what you love - that's wonderful, ${userName}! 🎨`
      }
      
      const activityMessage = activityMessages[recentActivity] || `Nice activity, ${userName}!`
      setMessage(activityMessage)
      setShowMessage(true)
      setIsTalking(true)
      
      setTimeout(() => {
        setIsTalking(false)
        setTimeout(() => setShowMessage(false), 4000)
      }, 1200)
    }
  }, [recentActivity, userName])

  const handleClick = () => {
    if (!interactive) return
    
    const encouragements = [
      `You're doing great, ${userName}! Keep it up! 🌟`,
      `${userName}, you're stronger than you know! 💪`,
      `Sending you positive vibes, ${userName}! ✨`,
      `${userName}, your mood matters - thanks for tracking! 💚`,
      `I believe in you, ${userName}! 🌈`
    ]
    
    const randomMessage = encouragements[Math.floor(Math.random() * encouragements.length)]
    setMessage(randomMessage)
    setShowMessage(true)
    setIsTalking(true)
    
    setTimeout(() => {
      setIsTalking(false)
      setTimeout(() => setShowMessage(false), 3000)
    }, 1000)
  }

  const theme = colorThemes[colorTheme]

  return (
    <div className="relative">
      {/* Speech Bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 
                       bg-white rounded-2xl px-4 py-3 shadow-xl 
                       border-2 border-gray-100 min-w-[200px] text-center z-10"
          >
            <p className="text-sm text-gray-700 font-medium whitespace-nowrap">{message}</p>
            <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 
                          w-4 h-4 bg-white border-b-2 border-r-2 
                          border-gray-100 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar */}
      <motion.button
        onClick={handleClick}
        className={`relative ${sizes[size]} ${interactive ? 'cursor-pointer' : 'cursor-default'}`}
        whileHover={interactive ? { scale: 1.05 } : {}}
        whileTap={interactive ? { scale: 0.95 } : {}}
        animate={isTalking ? {
          y: [0, -2, 0],
          transition: { repeat: 3, duration: 0.3 }
        } : {}}
      >
        {/* Glow effect for high moods */}
        {mood >= 7 && (
          <motion.div
            className={`absolute inset-0 bg-gradient-to-br ${theme.primary} 
                       rounded-full blur-lg opacity-50`}
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.3, 0.6, 0.3]
            }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        )}
        
        {/* FORCED VISIBLE AVATAR - VERSION 3 MEGA DEBUG! */}
        <div 
          className="relative w-full h-full rounded-full shadow-lg border-8 flex items-center justify-center overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${theme.accent}, #8b5cf6)`,
            borderColor: '#dc2626',
            borderWidth: '8px',
            borderStyle: 'solid'
          }}>
          {/* SUPER VISIBLE INDICATORS - FORCE SHOW */}
          <div 
            className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full animate-bounce z-50 flex items-center justify-center text-white font-bold text-xs border-2 border-white" 
            style={{backgroundColor: '#ef4444 !important', zIndex: 9999}}
          >
            ✓
          </div>
          <div 
            className="absolute -top-1 -left-1 bg-green-500 text-white px-2 py-1 rounded text-xs font-bold z-50 border border-white"
            style={{backgroundColor: '#10b981 !important', zIndex: 9999, fontSize: '10px'}}
          >
            REACTIVE
          </div>
          <div 
            className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold z-50"
            style={{backgroundColor: '#3b82f6 !important', zIndex: 9999, fontSize: '10px'}}
          >
            WORKING
          </div>
          
          {/* Face SVG with improved design */}
          <svg viewBox="0 0 100 100" className="w-4/5 h-4/5">
            {/* Eyes */}
            <defs>
              <radialGradient id="eyeGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="rgba(255,255,255,0.8)" />
                <stop offset="100%" stopColor="rgba(255,255,255,0.2)" />
              </radialGradient>
            </defs>
            
            {/* Left Eye */}
            <motion.g
              animate={eyeStyle === 'sparkle' ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2 }
              } : {}}
            >
              <ellipse cx="30" cy="40" rx="8" ry={eyeStyle === 'sad' ? '6' : '10'} 
                      fill="white" stroke={theme.accent} strokeWidth="1" />
              <circle cx="30" cy="40" r="4" fill={theme.accent} />
              {eyeStyle === 'sparkle' && (
                <>
                  <circle cx="28" cy="38" r="1" fill="white" opacity="0.8" />
                  <circle cx="32" cy="42" r="0.5" fill="white" opacity="0.6" />
                </>
              )}
              {eyeStyle === 'happy' && (
                <path d="M 22 35 Q 30 30 38 35" stroke={theme.accent} strokeWidth="2" fill="none" />
              )}
            </motion.g>
            
            {/* Right Eye */}
            <motion.g
              animate={eyeStyle === 'sparkle' ? {
                scale: [1, 1.2, 1],
                transition: { duration: 0.5, repeat: Infinity, repeatDelay: 2.2 }
              } : {}}
            >
              <ellipse cx="70" cy="40" rx="8" ry={eyeStyle === 'sad' ? '6' : '10'} 
                      fill="white" stroke={theme.accent} strokeWidth="1" />
              <circle cx="70" cy="40" r="4" fill={theme.accent} />
              {eyeStyle === 'sparkle' && (
                <>
                  <circle cx="68" cy="38" r="1" fill="white" opacity="0.8" />
                  <circle cx="72" cy="42" r="0.5" fill="white" opacity="0.6" />
                </>
              )}
              {eyeStyle === 'happy' && (
                <path d="M 62 35 Q 70 30 78 35" stroke={theme.accent} strokeWidth="2" fill="none" />
              )}
            </motion.g>
            
            {/* Mouth based on mood */}
            <motion.g
              animate={isTalking ? {
                scaleY: [1, 0.8, 1.1, 1],
                transition: { duration: 0.3, repeat: 3 }
              } : {}}
            >
              {mouthStyle === 'big-smile' && (
                <path d="M 25 60 Q 50 80 75 60" stroke={theme.accent} strokeWidth="3" 
                      fill="none" strokeLinecap="round" />
              )}
              {mouthStyle === 'smile' && (
                <path d="M 30 65 Q 50 75 70 65" stroke={theme.accent} strokeWidth="2" 
                      fill="none" strokeLinecap="round" />
              )}
              {mouthStyle === 'neutral' && (
                <line x1="40" y1="70" x2="60" y2="70" stroke={theme.accent} strokeWidth="2" 
                      strokeLinecap="round" />
              )}
              {mouthStyle === 'frown' && (
                <path d="M 30 75 Q 50 65 70 75" stroke={theme.accent} strokeWidth="2" 
                      fill="none" strokeLinecap="round" />
              )}
              {mouthStyle === 'sad' && (
                <path d="M 25 75 Q 50 60 75 75" stroke={theme.accent} strokeWidth="3" 
                      fill="none" strokeLinecap="round" />
              )}
            </motion.g>
            
            {/* Cheeks for happy moods */}
            {mood >= 6 && (
              <>
                <circle cx="15" cy="55" r="3" fill="rgba(255,182,193,0.6)" />
                <circle cx="85" cy="55" r="3" fill="rgba(255,182,193,0.6)" />
              </>
            )}
          </svg>
          
          {/* Floating particles for very happy moods */}
          {mood >= 8 && (
            <div className="absolute inset-0">
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute text-yellow-400 text-xs"
                  style={{
                    left: `${20 + i * 30}%`,
                    top: `${10 + i * 20}%`
                  }}
                  animate={{
                    y: [0, -20, 0],
                    opacity: [0, 1, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    repeatDelay: 3
                  }}
                >
                  ✨
                </motion.div>
              ))}
            </div>
          )}
        </div>

        {/* Mood indicator ring */}
        <div className="absolute inset-0 rounded-full border-2 border-transparent 
                        bg-gradient-to-r from-transparent via-white to-transparent opacity-30" />
      </motion.button>
    </div>
  )
}
