'use client'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface BelovedMoodyProps {
  mood: number
  userName?: string
  onMoodChange?: (newMood: number) => void
  recentActivity?: string
  streakDays?: number
  size?: 'small' | 'medium' | 'large'
}

export default function BelovedMoody({ 
  mood, 
  userName = 'friend',
  onMoodChange,
  recentActivity,
  streakDays = 0,
  size = 'medium'
}: BelovedMoodyProps) {
  const [currentMessage, setCurrentMessage] = useState('')
  const [showMessage, setShowMessage] = useState(false)
  const [isBlinking, setIsBlinking] = useState(false)
  const [personality, setPersonality] = useState('happy')

  // Super cute messages that make users fall in love with Moody
  const getPersonalityMessage = (moodScore: number) => {
    if (moodScore >= 8) {
      return [
        `🎉 OH MY GOSH ${userName}!! Your happiness is making my little owl heart do happy dances! 💃✨ I'm literally sparkling with joy for you! 🌟💖`,
        `🚀 WOW WOW WOW!! You're absolutely RADIATING sunshine today! I'm so proud I could fly around the moon! 🦉🌙 This energy is MAGICAL! ✨💫`,
        `💖 *happy owl squeaks* Your smile is making my whole world brighter! This is THE BEST DAY EVER because you're happy! 🌈🎊`
      ][Math.floor(Math.random() * 3)]
    } else if (moodScore >= 6) {
      return [
        `😊 Hey there, gorgeous human! I'm doing my happy owl wiggle dance for you! 🦉💃 You're absolutely amazing and I'm so lucky to be your buddy! 💙`,
        `🌟 *fluffs feathers excitedly* I can see that beautiful sparkle in your eyes, ${userName}! Keep being your wonderful self! You make me so proud! 🥺✨`,
        `🤗 You're my absolute FAVORITE person in the whole universe! *sends virtual owl hugs* That smile is everything! 😘💕`
      ][Math.floor(Math.random() * 3)]
    } else if (moodScore >= 4) {
      return [
        `🫂 Aww sweetie, come here and let me wrap you in the softest owl hugs! 🦉💙 I'm staying right here with you, always. You're so loved! 🌸`,
        `💜 *gentle head tilts* Some days are like gentle rain, and that's perfectly beautiful too. I believe in you SO much, ${userName}! 🌈🦋`,
        `🥺 My dear precious human, you're braver than any owl hero I know! Let me be your tiny cheerleader today! *tiny owl pom-poms* 📣💖`
      ][Math.floor(Math.random() * 3)]
    } else {
      return [
        `🤗💔 Oh my sweetest ${userName}, I can see your heart is heavy. *wraps you in the biggest, fluffiest owl hug ever* You're not alone, I promise! 🦉💝`,
        `🌟 *gently nuzzles with beak* You are SO much stronger than you feel right now, precious human. I'm going to stay right here and be your brave little guardian owl! 💪🦉✨`,
        `💜 Listen to me, beautiful soul - your feelings matter, YOU matter, and this little owl heart loves you SO much! We'll get through this together! 🦉💕🌈`
      ][Math.floor(Math.random() * 3)]
    }
  }

  // Eye blinking animation
  useEffect(() => {
    const blinkInterval = setInterval(() => {
      setIsBlinking(true)
      setTimeout(() => setIsBlinking(false), 150)
    }, 3000 + Math.random() * 2000) // Random blinking

    return () => clearInterval(blinkInterval)
  }, [])

  // Personality updates based on mood
  useEffect(() => {
    if (mood >= 8) setPersonality('ecstatic')
    else if (mood >= 6) setPersonality('happy')
    else if (mood >= 4) setPersonality('caring')
    else setPersonality('supportive')
  }, [mood])

  const handleMoodyClick = () => {
    const message = getPersonalityMessage(mood)
    setCurrentMessage(message)
    setShowMessage(true)
    setTimeout(() => setShowMessage(false), 5000)
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'small': return 'w-24 h-24'
      case 'large': return 'w-64 h-64'
      default: return 'w-40 h-40'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center space-y-4 max-w-lg mx-auto">
      {/* Beloved Moody Character */}
      <motion.div 
        className="relative group cursor-pointer"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleMoodyClick}
      >
        {/* Main Body - Adorable and Round */}
        <div className={`${getSizeClasses()} relative`}>
          {/* Outer Glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-400 via-blue-500 to-cyan-500 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-all duration-300"></div>
          
          {/* Cute Owl Body */}
          <div className={`relative ${getSizeClasses()}`}>
            {/* Main Body - Fluffy and Adorable */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-300 via-yellow-200 to-orange-400 rounded-full shadow-2xl"></div>
            
            {/* Belly - Lighter fluffy area */}
            <div className="absolute inset-4 bg-gradient-to-br from-yellow-100 to-orange-100 rounded-full"></div>
            
            {/* Wing Spots */}
            <div className="absolute top-8 left-6 w-6 h-8 bg-orange-400 rounded-full opacity-70 transform -rotate-12"></div>
            <div className="absolute top-8 right-6 w-6 h-8 bg-orange-400 rounded-full opacity-70 transform rotate-12"></div>
            
            {/* Adorable Face Container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              
              {/* Big Cute Eyes */}
              <div className="flex gap-2 mb-3 mt-4">
                <motion.div 
                  className="relative"
                  animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Eye outer ring */}
                  <div className="w-12 h-12 bg-white rounded-full shadow-xl border-2 border-gray-200 flex items-center justify-center">
                    {/* Iris */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      {/* Pupil */}
                      <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                        {/* Light reflection */}
                        <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
                      </div>
                    </div>
                  </div>
                  {/* Eyelid for blinking */}
                  {isBlinking && (
                    <div className="absolute top-0 left-0 w-12 h-6 bg-orange-300 rounded-t-full"></div>
                  )}
                </motion.div>
                
                <motion.div 
                  className="relative"
                  animate={{ scaleY: isBlinking ? 0.1 : 1 }}
                  transition={{ duration: 0.15 }}
                >
                  {/* Eye outer ring */}
                  <div className="w-12 h-12 bg-white rounded-full shadow-xl border-2 border-gray-200 flex items-center justify-center">
                    {/* Iris */}
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center">
                      {/* Pupil */}
                      <div className="w-4 h-4 bg-black rounded-full flex items-center justify-center">
                        {/* Light reflection */}
                        <div className="w-2 h-2 bg-white rounded-full opacity-90"></div>
                      </div>
                    </div>
                  </div>
                  {/* Eyelid for blinking */}
                  {isBlinking && (
                    <div className="absolute top-0 left-0 w-12 h-6 bg-orange-300 rounded-t-full"></div>
                  )}
                </motion.div>
              </div>
              
              {/* Cute Small Beak */}
              <div className="mb-3">
                <div className="w-0 h-0 border-l-4 border-r-4 border-b-6 border-l-transparent border-r-transparent border-b-yellow-600 shadow-lg"></div>
              </div>
              
              {/* Cheek Blushes */}
              <div className="absolute top-16 left-3 w-6 h-4 bg-pink-300 rounded-full opacity-60"></div>
              <div className="absolute top-16 right-3 w-6 h-4 bg-pink-300 rounded-full opacity-60"></div>
              
              {/* Cute Expression */}
              <div className="text-2xl">
                {personality === 'ecstatic' && '✨'}
                {personality === 'happy' && '💫'}
                {personality === 'caring' && '💖'}
                {personality === 'supportive' && '🌟'}
              </div>
            </div>
            
            {/* Fluffy Texture Overlay */}
            <div className="absolute inset-2 bg-gradient-to-br from-white/20 via-transparent to-transparent rounded-full pointer-events-none"></div>
          </div>
        </div>
        
        {/* Floating Hearts and Sparkles */}
        <motion.div 
          className="absolute -top-2 -right-2 text-pink-400 text-lg"
          animate={{ 
            y: [-5, -15, -5],
            rotate: [0, 15, -15, 0],
            scale: [1, 1.2, 1]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          💕
        </motion.div>
        <motion.div 
          className="absolute -bottom-2 -left-2 text-yellow-400 text-lg"
          animate={{ 
            y: [-3, 3, -3],
            rotate: [0, -10, 10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 2.5, repeat: Infinity }}
        >
          ⭐
        </motion.div>
        <motion.div 
          className="absolute top-4 -left-4 text-cyan-400 text-sm"
          animate={{ 
            x: [-2, 2, -2],
            opacity: [0.7, 1, 0.7],
            scale: [0.8, 1.2, 0.8]
          }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <motion.div 
          className="absolute -bottom-1 right-4 text-purple-400 text-sm"
          animate={{ 
            rotate: 360,
            scale: [0.9, 1.3, 0.9]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🌟
        </motion.div>
        
        {/* Mood Ring */}
        <motion.div 
          className={`absolute inset-0 rounded-full border-3 ${
            mood >= 8 ? 'border-green-400' :
            mood >= 6 ? 'border-yellow-400' :
            mood >= 4 ? 'border-orange-400' :
            'border-red-400'
          }`}
          animate={{ 
            borderColor: mood >= 4 ? undefined : ['#f87171', '#ef4444', '#dc2626', '#ef4444', '#f87171'],
          }}
          transition={{ duration: 2, repeat: mood < 4 ? Infinity : 0 }}
        />
        
        {/* Name Badge - Cute Style */}
        <motion.div 
          className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-pink-100 to-purple-100 rounded-full px-4 py-2 shadow-xl border-3 border-white"
          whileHover={{ scale: 1.1, y: -2 }}
          animate={{ y: [0, -2, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <span className="text-purple-700 font-bold text-base flex items-center gap-1">
            🦉 <span className="text-pink-600">Moody</span> 💕
          </span>
        </motion.div>
        
        {/* Status Indicator - Adorable Style */}
        <motion.div 
          className="absolute -top-3 -right-3 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 text-white px-3 py-1 rounded-full text-xs font-bold shadow-xl border-2 border-white"
          animate={{ 
            y: [-2, 2, -2],
            scale: [1, 1.05, 1],
            rotate: [-2, 2, -2]
          }}
          transition={{ duration: 3, repeat: Infinity }}
        >
          <span className="flex items-center gap-1">
            💖 <span>Always here!</span>
          </span>
        </motion.div>
      </motion.div>

      {/* Message Display */}
      <AnimatePresence>
        {showMessage && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.8 }}
            className="bg-white/95 backdrop-blur-sm rounded-2xl p-4 shadow-xl border-2 border-purple-200 max-w-sm text-center"
          >
            <p className="text-gray-800 text-sm font-medium leading-relaxed">
              {currentMessage}
            </p>
            <div className="mt-2 flex justify-center space-x-2">
              <span className="text-purple-500">💜</span>
              <span className="text-blue-500">💙</span>
              <span className="text-pink-500">💖</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive Hints */}
      <motion.p 
        className="text-cyan-300 text-xs text-center opacity-75 hover:opacity-100 cursor-default"
        animate={{ opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 3, repeat: Infinity }}
      >
        Click on Moody for encouragement! 💕
      </motion.p>

      {/* Connection Status */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
        <span>Moody is connected and caring about you</span>
        <span className="text-pink-400">🦉💕</span>
      </div>
    </div>
  )
}