'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
// Using elegant symbols instead of Lucide icons for consistency

interface MoodyMessage {
  id: string
  type: 'user' | 'moody'
  content: string
  timestamp: Date
  tone?: 'supportive' | 'encouraging' | 'concerned' | 'celebrating' | 'crisis'
  empathyLevel?: number
  crisisDetected?: boolean
}

interface MoodyChatProps {
  isOpen: boolean
  onClose: () => void
  userId?: string
  currentMood?: number
  onCrisisDetected?: (resources: any) => void
}

export default function MoodyChat({ 
  isOpen, 
  onClose, 
  userId = 'anonymous', 
  currentMood,
  onCrisisDetected 
}: MoodyChatProps) {
  const [messages, setMessages] = useState<MoodyMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen])

  // Send initial greeting when chat opens
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      sendInitialGreeting()
    }
  }, [isOpen])

  const sendInitialGreeting = async () => {
    setIsLoading(true)
    setShowTyping(true)
    
    try {
      const response = await fetch('/api/moody/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          conversationType: 'general_chat',
          moodScore: currentMood,
          context: {
            timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                      new Date().getHours() < 18 ? 'afternoon' : 'evening',
            streak: 0
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Simulate typing delay for more natural feel
        setTimeout(() => {
          setShowTyping(false)
          addMoodyMessage(data.response.message, data.response)
          setIsLoading(false)
        }, 1500)
      } else {
        throw new Error('Failed to get greeting')
      }
    } catch (error) {
      console.error('Initial greeting error:', error)
      setShowTyping(false)
      addMoodyMessage("Hi there! I'm MOODY, your empathetic AI companion. I'm here to listen and support you. How are you feeling today? 😊")
      setIsLoading(false)
    }
  }

  const addMoodyMessage = (content: string, responseData?: any) => {
    const newMessage: MoodyMessage = {
      id: Date.now().toString(),
      type: 'moody',
      content,
      timestamp: new Date(),
      tone: responseData?.tone,
      empathyLevel: responseData?.empathyLevel,
      crisisDetected: responseData?.crisisDetected
    }

    setMessages(prev => [...prev, newMessage])
    
    // Handle crisis detection
    if (responseData?.crisisDetected && onCrisisDetected) {
      onCrisisDetected(responseData.crisisResources)
    }
  }

  const addUserMessage = (content: string) => {
    const newMessage: MoodyMessage = {
      id: Date.now().toString(),
      type: 'user',
      content,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newMessage])
  }

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const messageToSend = inputMessage.trim()
    setInputMessage('')
    addUserMessage(messageToSend)
    setIsLoading(true)
    setShowTyping(true)

    try {
      const response = await fetch('/api/moody/conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          message: messageToSend,
          conversationType: 'follow_up',
          moodScore: currentMood,
          context: {
            timeOfDay: new Date().getHours() < 12 ? 'morning' : 
                      new Date().getHours() < 18 ? 'afternoon' : 'evening',
            streak: 0
          }
        })
      })

      if (response.ok) {
        const data = await response.json()
        
        // Simulate natural typing delay
        const typingDelay = Math.min(2000, messageToSend.length * 50 + 800)
        setTimeout(() => {
          setShowTyping(false)
          addMoodyMessage(data.response.message, data.response)
          setIsLoading(false)
        }, typingDelay)
      } else {
        throw new Error('Failed to get response')
      }
    } catch (error) {
      console.error('Send message error:', error)
      setShowTyping(false)
      addMoodyMessage("I'm having a small technical moment, but I want you to know that I'm still here for you. Your feelings matter to me. 💜")
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const getToneColor = (tone?: string) => {
    switch (tone) {
      case 'crisis': return 'text-red-600'
      case 'concerned': return 'text-orange-600'
      case 'supportive': return 'text-blue-600'
      case 'encouraging': return 'text-green-600'
      case 'celebrating': return 'text-purple-600'
      default: return 'text-gray-700'
    }
  }

  const getToneEmoji = (tone?: string) => {
    switch (tone) {
      case 'crisis': return '🆘'
      case 'concerned': return '💙'
      case 'supportive': return '🤗'
      case 'encouraging': return '✨'
      case 'celebrating': return '🎉'
      default: return '💜'
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-sm h-[70vh] max-h-[600px] flex flex-col overflow-hidden"
        >
          {/* Chat Header */}
          <div className="p-4 text-white flex items-center justify-between"
               style={{ background: 'linear-gradient(135deg, var(--brand-primary), var(--brand-secondary))' }}>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-xl">💬</span>
              </div>
              <div>
                <h3 className="font-semibold">MOODY Chat</h3>
                <p className="text-sm text-white/90">I'm here to listen</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <span className="text-lg font-light">×</span>
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                    message.type === 'user'
                      ? 'text-white'
                      : 'bg-white border border-gray-200 shadow-sm'
                  }`}
                  style={message.type === 'user' ? { backgroundColor: 'var(--brand-secondary)' } : {}}
                >
                  {message.type === 'moody' && (
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm">{getToneEmoji(message.tone)}</span>
                      <span className="text-xs text-gray-500">MOODY</span>
                      {message.empathyLevel && message.empathyLevel >= 8 && (
                        <span className="text-sm font-light text-red-500">♥</span>
                      )}
                      {message.crisisDetected && (
                        <span className="text-sm font-light text-red-500">⚠</span>
                      )}
                    </div>
                  )}
                  <p className={`text-sm ${message.type === 'moody' ? getToneColor(message.tone) : 'text-white'}`}>
                    {message.content}
                  </p>
                  <p className={`text-xs mt-1 ${message.type === 'user' ? 'text-white/70' : 'text-gray-400'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </motion.div>
            ))}

            {/* Typing Indicator */}
            {showTyping && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-start"
              >
                <div className="bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">💜</span>
                    <span className="text-xs text-gray-500">MOODY is typing</span>
                  </div>
                  <div className="flex space-x-1 mt-2">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    />
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: 'var(--brand-primary)' }}
                    />
                  </div>
                </div>
              </motion.div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-4 bg-white">
            <div className="flex space-x-3 items-end">
              <div className="flex-1">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Share what's on your mind..."
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:border-transparent resize-none disabled:opacity-50"
                  style={{ 
                    '--tw-ring-color': 'var(--brand-primary)',
                    '--tw-ring-opacity': '0.3'
                  } as React.CSSProperties}
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="text-white p-3 rounded-full hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: 'var(--brand-primary)' }}
              >
                <span className="text-lg font-light">→</span>
              </button>
            </div>
            
            <p className="text-xs text-gray-500 mt-2 text-center">
              MOODY is here to listen and support you with empathy and care 💜
            </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
