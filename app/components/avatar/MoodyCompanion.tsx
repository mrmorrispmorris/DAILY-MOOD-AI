'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface MoodyCompanionProps {
  mood: number
  userName?: string
  onMoodChange?: (newMood: number) => void
  recentActivity?: string
  streakDays?: number
  size?: 'small' | 'medium' | 'large'
}

export default function MoodyCompanion({ 
  mood, 
  userName = 'friend',
  onMoodChange,
  recentActivity,
  streakDays = 0,
  size = 'medium'
}: MoodyCompanionProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [expression, setExpression] = useState('happy')
  const [isActive, setIsActive] = useState(false)

  // Moody's personality-based responses
  const getMoodResponse = (moodScore: number) => {
    if (moodScore >= 9) {
      return [
        `🎉 WOW ${userName}! You're absolutely glowing today!`,
        `✨ This energy is INCREDIBLE! What's your secret?`,
        `🚀 You're on fire! Let's keep this amazing vibe going!`
      ][Math.floor(Math.random() * 3)]
    } else if (moodScore >= 7) {
      return [
        `😊 Looking great today, ${userName}! I can feel the positive energy!`,
        `🌟 You're doing awesome! That smile looks good on you!`,
        `👏 Nice work staying positive! I'm here if you need me!`
      ][Math.floor(Math.random() * 3)]
    } else if (moodScore >= 5) {
      return [
        `🤗 Hey ${userName}, I'm here for you. Want to talk about it?`,
        `💙 Some days are tougher than others. You're not alone in this!`,
        `🌈 Remember, every feeling is temporary. Tomorrow's a new day!`
      ][Math.floor(Math.random() * 3)]
    } else if (moodScore >= 3) {
      return [
        `💜 ${userName}, I see you're struggling. Let's take this one step at a time.`,
        `🫂 It's okay to not be okay. I'm here to support you through this.`,
        `🌸 You're braver than you believe. Let's find something small that helps.`
      ][Math.floor(Math.random() * 3)]
    } else {
      return [
        `💙 ${userName}, I'm really worried about you. Please know you're not alone.`,
        `🤗 This feels overwhelming, but we'll get through it together. One breath at a time.`,
        `🌟 You matter more than you know. Let's find some support for you right now.`
      ][Math.floor(Math.random() * 3)]
    }
  }

  const getActivityResponse = (activity: string) => {
    const responses = {
      'exercise': [
        "💪 YES! Exercise is my favorite mood booster!",
        "🏃‍♀️ Look at you crushing those workout goals!",
        "⚡ I bet you feel amazing after that exercise!"
      ],
      'work': [
        "💼 Getting things done! I respect that hustle!",
        "📝 Work can be tough, but you're handling it like a pro!",
        "🎯 Hope work went well! Remember to take breaks!"
      ],
      'social': [
        "🤝 Social time is the BEST! Humans need connection!",
        "👥 I love that you're spending time with people!",
        "💬 Good relationships are like medicine for the soul!"
      ],
      'relaxation': [
        "🧘‍♀️ Self-care time! This is exactly what you need!",
        "🛀 Relaxation is productive too! Great choice!",
        "☕ Taking time to recharge is so important!"
      ]
    }
    
    for (const [act, msgs] of Object.entries(responses)) {
      if (activity?.toLowerCase().includes(act)) {
        return msgs[Math.floor(Math.random() * msgs.length)]
      }
    }
    
    return "🌟 I love that you're staying active in life!"
  }

  const getEncouragement = () => {
    const encouragements = [
      `🌈 Hey ${userName}! Just checking in - how are you feeling?`,
      `⭐ Remember, I'm always here when you need a friendly chat!`,
      `💫 You've been tracking your mood for ${streakDays} days - that's amazing!`,
      `🎯 Small steps every day lead to big changes!`,
      `🌸 I believe in you! You're doing better than you think!`,
      `🦋 Every mood you track helps you understand yourself better!`,
      `🌻 I'm proud of you for taking care of your mental health!`
    ]
    return encouragements[Math.floor(Math.random() * encouragements.length)]
  }

  // Moody's expressions based on user's mood
  const getExpression = (moodScore: number) => {
    if (moodScore >= 8) return 'ecstatic'
    if (moodScore >= 6) return 'happy'  
    if (moodScore >= 4) return 'concerned'
    if (moodScore >= 2) return 'worried'
    return 'caring'
  }

  // Moody's appearance based on expression
  const getAppearance = (expr: string) => {
    const appearances = {
      ecstatic: {
        color: 'from-yellow-300 via-orange-300 to-pink-300',
        eyes: '✨',
        mouth: '😊',
        cheeks: '🌟',
        glow: 'shadow-yellow-300/50'
      },
      happy: {
        color: 'from-green-300 via-emerald-300 to-teal-300',
        eyes: '😊',
        mouth: '😌',
        cheeks: '💖',
        glow: 'shadow-green-300/50'
      },
      concerned: {
        color: 'from-blue-300 via-indigo-300 to-purple-300', 
        eyes: '🤗',
        mouth: '😐',
        cheeks: '💙',
        glow: 'shadow-blue-300/50'
      },
      worried: {
        color: 'from-purple-300 via-pink-300 to-rose-300',
        eyes: '😟',
        mouth: '😞',
        cheeks: '💜',
        glow: 'shadow-purple-300/50'
      },
      caring: {
        color: 'from-rose-300 via-pink-300 to-red-300',
        eyes: '🥺',
        mouth: '😢',
        cheeks: '❤️',
        glow: 'shadow-rose-300/50'
      }
    }
    return appearances[expr] || appearances.happy
  }

  const sizes = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-40 h-40'
  }

  const appearance = getAppearance(expression)

  // React to mood changes
  useEffect(() => {
    const newExpression = getExpression(mood)
    setExpression(newExpression)
    
    // Show reaction message
    const message = getMoodResponse(mood)
    setCurrentMessage(message)
    setShowMessage(true)
    setIsActive(true)
    
    const timer = setTimeout(() => {
      setShowMessage(false)
      setIsActive(false)
    }, 5000)
    
    return () => clearTimeout(timer)
  }, [mood, userName])

  // React to activities
  useEffect(() => {
    if (recentActivity) {
      const message = getActivityResponse(recentActivity)
      setCurrentMessage(message)
      setShowMessage(true)
      setIsActive(true)
      
      const timer = setTimeout(() => {
        setShowMessage(false)
        setIsActive(false)
      }, 4000)
      
      return () => clearTimeout(timer)
    }
  }, [recentActivity])

  // Periodic encouragement
  useEffect(() => {
    const interval = setInterval(() => {
      if (!showMessage) {
        const message = getEncouragement()
        setCurrentMessage(message)
        setShowMessage(true)
        setIsActive(true)
        
        setTimeout(() => {
          setShowMessage(false)
          setIsActive(false)
        }, 4000)
      }
    }, 45000) // Every 45 seconds when idle
    
    return () => clearInterval(interval)
  }, [userName, streakDays, showMessage])

  const handleClick = () => {
    const messages = [
      `Hey ${userName}! I'm Moody, your mood companion! 🌈`,
      `I'm here to support you on your mental health journey! 💜`,
      `Click on me anytime you want encouragement! ✨`,
      `You're doing great by tracking your moods! 🎯`,
      `Remember: every small step counts! 🌟`,
      `I believe in your strength and resilience! 💪`,
      `Your mental health matters, and so do you! ❤️`
    ]
    
    const randomMessage = messages[Math.floor(Math.random() * messages.length)]
    setCurrentMessage(randomMessage)
    setShowMessage(true)
    setIsActive(true)
    
    setTimeout(() => {
      setShowMessage(false)
      setIsActive(false)
    }, 6000)
  }

  return (
    <div className="relative inline-block">
      {/* Speech bubble */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            className="absolute -top-16 left-1/2 transform -translate-x-1/2 mb-4 z-50"
          >
            <div className="bg-white rounded-2xl shadow-lg border-2 border-gray-200 p-3 max-w-xs">
              <p className="text-sm font-medium text-gray-800 text-center">
                {currentMessage}
              </p>
              <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 border-gray-200 rotate-45"></div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Moody Avatar */}
      <motion.button
        onClick={handleClick}
        className={`relative ${sizes[size]} cursor-pointer group`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        animate={isActive ? { 
          y: [0, -8, 0],
          rotate: [0, -5, 5, 0]
        } : {}}
        transition={isActive ? {
          duration: 0.8,
          repeat: 2,
          ease: "easeInOut"
        } : {}}
      >
        {/* Glow effect */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-r ${appearance.color} opacity-30 blur-xl ${appearance.glow} animate-pulse`} />
        
        {/* Main body */}
        <div className={`relative w-full h-full rounded-full bg-gradient-to-br ${appearance.color} shadow-xl border-4 border-white flex items-center justify-center overflow-hidden transition-all duration-300 group-hover:shadow-2xl`}>
          
          {/* Face container */}
          <div className="text-center">
            {/* Eyes */}
            <div className="text-2xl mb-1 animate-pulse">
              {appearance.eyes}
            </div>
            
            {/* Mouth */}
            <div className="text-xl">
              {appearance.mouth}
            </div>
            
            {/* Cheeks */}
            <div className="absolute top-1/2 left-2 text-sm transform -translate-y-1/2">
              {appearance.cheeks}
            </div>
            <div className="absolute top-1/2 right-2 text-sm transform -translate-y-1/2">
              {appearance.cheeks}
            </div>
          </div>
          
          {/* Name badge */}
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2">
            <div className="bg-white text-purple-600 px-2 py-1 rounded-full text-xs font-bold shadow-lg border-2 border-purple-200">
              Moody
            </div>
          </div>
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-ping"></div>
          )}
        </div>
        
        {/* Interaction hint */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-xs text-gray-600 text-center whitespace-nowrap">
            Click me for encouragement! 💜
          </p>
        </div>
      </motion.button>
    </div>
  )
}

