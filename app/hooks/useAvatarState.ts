import { useState, useEffect } from 'react'

export interface AvatarState {
  mood: 'happy' | 'sad' | 'neutral' | 'excited' | 'worried' | 'sleeping'
  energy: number // 0-100
  experience: number // XP points
  level: number
  accessories: string[]
  achievements: string[]
}

export function useAvatarState(userId: string | undefined) {
  const [avatarState, setAvatarState] = useState<AvatarState>({
    mood: 'neutral',
    energy: 100,
    experience: 0,
    level: 1,
    accessories: [],
    achievements: []
  })

  // Load avatar state from localStorage
  useEffect(() => {
    if (!userId) return
    
    const savedState = localStorage.getItem(`avatar_${userId}`)
    if (savedState) {
      setAvatarState(JSON.parse(savedState))
    }
  }, [userId])

  // Save avatar state
  const saveState = (newState: Partial<AvatarState>) => {
    const updated = { ...avatarState, ...newState }
    setAvatarState(updated)
    if (userId) {
      localStorage.setItem(`avatar_${userId}`, JSON.stringify(updated))
    }
  }

  // Avatar actions
  const feed = () => {
    saveState({ 
      energy: Math.min(100, avatarState.energy + 20),
      mood: 'happy'
    })
  }

  const play = () => {
    saveState({
      energy: Math.max(0, avatarState.energy - 10),
      mood: 'excited',
      experience: avatarState.experience + 10
    })
  }

  const rest = () => {
    saveState({
      energy: 100,
      mood: 'sleeping'
    })
  }

  const earnXP = (amount: number) => {
    const newXP = avatarState.experience + amount
    const newLevel = Math.floor(newXP / 100) + 1
    
    saveState({
      experience: newXP,
      level: newLevel
    })
    
    // Check for level up
    if (newLevel > avatarState.level) {
      return { leveledUp: true, newLevel }
    }
    
    return { leveledUp: false }
  }

  return {
    avatarState,
    feed,
    play,
    rest,
    earnXP,
    saveState
  }
}

