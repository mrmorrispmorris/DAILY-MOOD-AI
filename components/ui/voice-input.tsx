'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Mic, MicOff, Volume2, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

interface VoiceInputProps {
  onTranscript: (text: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function VoiceInput({ onTranscript, placeholder = "Click to start voice input", disabled = false, className = "" }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSupported, setIsSupported] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Check if Web Speech API is supported
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      setIsSupported(true)
      
      // Initialize speech recognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      // Configure recognition settings
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'
      
      // Set up event handlers
      recognitionRef.current.onstart = () => {
        setIsListening(true)
        setError(null)
        toast.success('Voice input started - speak now! 🎤')
      }
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcript
          } else {
            interimTranscript += transcript
          }
        }
        
        // Send final transcript when complete
        if (finalTranscript) {
          onTranscript(finalTranscript.trim())
          setIsListening(false)
          toast.success('Voice input captured! 🎉')
        }
      }
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        setIsListening(false)
        
        let errorMessage = 'Voice input failed'
        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected. Please try again.'
            break
          case 'audio-capture':
            errorMessage = 'Microphone access denied. Please check permissions.'
            break
          case 'not-allowed':
            errorMessage = 'Microphone access denied. Please allow microphone access.'
            break
          case 'network':
            errorMessage = 'Network error. Please check your connection.'
            break
          default:
            errorMessage = `Voice input error: ${event.error}`
        }
        
        setError(errorMessage)
        toast.error(errorMessage)
      }
      
      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    } else {
      setIsSupported(false)
      setError('Voice input is not supported in your browser')
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscript])

  const startListening = () => {
    if (!isSupported || disabled) return
    
    try {
      recognitionRef.current?.start()
    } catch (err) {
      console.error('Failed to start voice recognition:', err)
      setError('Failed to start voice recognition')
      toast.error('Failed to start voice recognition')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  if (!isSupported) {
    return (
      <div className={`flex items-center gap-2 p-3 bg-gray-100 dark:bg-gray-800 rounded-lg text-gray-600 dark:text-gray-400 ${className}`}>
        <AlertCircle className="h-4 w-4" />
        <span className="text-sm">Voice input not supported in this browser</span>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant={isListening ? "destructive" : "outline"}
          size="icon"
          onClick={isListening ? stopListening : startListening}
          disabled={disabled}
          className={`w-12 h-12 rounded-full transition-all duration-300 ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
          }`}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
        >
          {isListening ? (
            <MicOff className="h-5 w-5" />
          ) : (
            <Mic className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          )}
        </Button>
        
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {isListening ? 'Listening... Speak now!' : placeholder}
          </p>
          {isListening && (
            <div className="flex items-center gap-1 mt-1">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
        </div>
      )}
      
      {/* Voice Input Tips */}
      <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
        <p>💡 <strong>Tips:</strong> Speak clearly and at a normal pace</p>
        <p>🎯 <strong>Best for:</strong> Quick notes, mood descriptions, daily summaries</p>
        <p>🔒 <strong>Privacy:</strong> Voice is processed locally, not stored</p>
      </div>
    </div>
  )
}
