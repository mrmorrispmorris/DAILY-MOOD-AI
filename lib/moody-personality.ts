/**
 * MOODY AI PERSONALITY SYSTEM
 * Implements the PRD-specified Duolingo-inspired empathetic AI companion
 * with crisis-aware conversation management
 */

export interface MoodyPersonality {
  coreTraits: {
    empathetic: boolean
    encouraging: boolean
    culturallySensitive: boolean
    growthOriented: boolean
    crisisAware: boolean
  }
  communicationStyle: {
    validationFirst: boolean
    nonJudgmental: boolean
    curiousExplorer: boolean
    gentleHumor: boolean
    professionalBoundaries: boolean
  }
}

export interface MoodyResponse {
  message: string
  tone: 'supportive' | 'encouraging' | 'concerned' | 'celebrating' | 'crisis'
  actionSuggested?: string
  followUpNeeded: boolean
  crisisDetected: boolean
  empathyLevel: number // 1-10 scale
}

/**
 * MOODY's core personality configuration based on PRD specifications
 */
export const MOODY_PERSONALITY: MoodyPersonality = {
  coreTraits: {
    empathetic: true,
    encouraging: true, 
    culturallySensitive: true,
    growthOriented: true,
    crisisAware: true
  },
  communicationStyle: {
    validationFirst: true,
    nonJudgmental: true,
    curiousExplorer: true,
    gentleHumor: true,
    professionalBoundaries: true
  }
}

/**
 * MOODY's empathetic responses based on mood ranges
 */
export const MOODY_RESPONSES = {
  // Crisis range (1-2) - Immediate support and validation
  crisis: [
    "I'm really concerned about how you're feeling right now. Your emotions are completely valid, and you don't have to go through this alone. 💙",
    "It sounds like things are really tough right now. I'm here with you, and I want you to know that what you're feeling matters deeply. 🫂",
    "Thank you for sharing something so difficult with me. Your strength in reaching out, even when things are hard, shows incredible courage. 💜"
  ],

  // Low range (3-4) - Gentle validation and hope
  low: [
    "I hear you, and I want you to know that having difficult days is completely normal. You're not alone in feeling this way. 🌙",
    "It takes courage to acknowledge when things are hard. That awareness itself is a step toward feeling better. 🌱",
    "Your feelings are valid, and it's okay to not be okay sometimes. Let's think about one small thing that might bring a little comfort today. ✨"
  ],

  // Neutral range (5-6) - Curious exploration and gentle encouragement  
  neutral: [
    "It sounds like you're in a pretty steady place today. I'm curious - what's one thing that's been on your mind lately? 🤔",
    "Neutral days can be really valuable for reflection. Sometimes the most growth happens in these quieter moments. 🌿",
    "You're maintaining balance, which is actually a skill! What's helping you stay centered right now? ⚖️"
  ],

  // Good range (7-8) - Celebrating and encouraging continued growth
  good: [
    "I love hearing that you're feeling good! Your positive energy is really shining through. What's been contributing to this uplifting feeling? ☀️",
    "It's wonderful to see you in such a great space! You've clearly been doing something right. Keep nurturing whatever's working! 🌟",
    "Your mood is really lifting my spirits too! I'm so glad you're experiencing this joy. How can we help this feeling last? 💫"
  ],

  // Excellent range (9-10) - Pure celebration and growth-oriented questions
  excellent: [
    "WOW! Your energy is absolutely radiant today! I'm so happy for you! This is exactly the kind of moment worth celebrating! 🎉✨",
    "You're absolutely glowing with positivity! I'm curious - what brought you to this amazing place? Let's remember this feeling! 🌈",
    "This level of joy is incredible! You deserve every bit of this happiness. How does it feel to be thriving like this? 🚀💖"
  ]
}

/**
 * Crisis detection keywords and phrases
 */
export const CRISIS_INDICATORS = {
  immediate: [
    'suicide', 'kill myself', 'end it all', 'not worth living', 
    'better off dead', 'want to die', 'harm myself', 'cut myself'
  ],
  concerning: [
    'hopeless', 'worthless', 'give up', 'nothing matters', 
    'empty inside', 'numb', 'can\'t go on', 'too much pain'
  ],
  warning: [
    'alone', 'isolated', 'nobody cares', 'waste of space',
    'burden', 'pointless', 'trapped', 'desperate'
  ]
}

/**
 * MOODY's conversation starters based on user patterns
 */
export const MOODY_CONVERSATION_STARTERS = {
  dailyCheckin: [
    "Hey there! I'm genuinely curious about your day. What's one thing that's been on your heart? 💙",
    "Good to see you again! I've been thinking about our last conversation. How are you feeling in this moment? ✨",
    "Welcome back, friend! I notice you've been consistent with checking in. How's your inner world today? 🌿"
  ],
  
  improvingTrend: [
    "I've noticed your mood has been lifting lately! That's such a beautiful thing to witness. What's been helping? 🌅",
    "Your emotional journey shows real growth! I'm so proud of the work you've been doing. What feels different now? 🌱",
    "There's something really wonderful happening in your mood patterns. You're clearly doing something that's working! 💫"
  ],

  strugglingTrend: [
    "I've noticed things have been tougher for you lately. First, I want you to know that struggling doesn't mean you're failing. 🫂",
    "Your mood has been in a difficult place recently, and I want to acknowledge how hard that must be. You're still here, and that matters. 💜",
    "I see that you're going through a challenging time. Thank you for continuing to share with me - that takes real strength. 🌙"
  ]
}

/**
 * Generate MOODY's empathetic response based on mood score and context
 */
export function generateMoodyResponse(
  moodScore: number, 
  notes?: string, 
  context?: {
    streak: number
    previousMood?: number
    timeOfDay: 'morning' | 'afternoon' | 'evening'
  }
): MoodyResponse {
  
  // Crisis detection first
  const crisisDetected = detectCrisis(notes)
  if (crisisDetected) {
    return {
      message: MOODY_RESPONSES.crisis[Math.floor(Math.random() * MOODY_RESPONSES.crisis.length)],
      tone: 'crisis',
      actionSuggested: 'crisis_support',
      followUpNeeded: true,
      crisisDetected: true,
      empathyLevel: 10
    }
  }

  // Determine response category based on mood
  let responseCategory: keyof typeof MOODY_RESPONSES
  let empathyLevel: number
  let tone: MoodyResponse['tone']
  
  if (moodScore <= 2) {
    responseCategory = 'crisis'
    empathyLevel = 9
    tone = 'concerned'
  } else if (moodScore <= 4) {
    responseCategory = 'low'
    empathyLevel = 8
    tone = 'supportive'
  } else if (moodScore <= 6) {
    responseCategory = 'neutral'
    empathyLevel = 6
    tone = 'supportive'
  } else if (moodScore <= 8) {
    responseCategory = 'good'
    empathyLevel = 5
    tone = 'encouraging'
  } else {
    responseCategory = 'excellent'
    empathyLevel = 7
    tone = 'celebrating'
  }

  // Select appropriate response
  const responses = MOODY_RESPONSES[responseCategory]
  const selectedResponse = responses[Math.floor(Math.random() * responses.length)]

  // Add personalized context if available
  let personalizedMessage = selectedResponse
  if (context?.streak && context.streak >= 7) {
    personalizedMessage += ` I'm also really proud that you've been checking in for ${context.streak} days straight - that consistency is amazing! 🏆`
  }

  return {
    message: personalizedMessage,
    tone,
    actionSuggested: moodScore <= 4 ? 'supportive_resources' : undefined,
    followUpNeeded: moodScore <= 4 || crisisDetected,
    crisisDetected: false,
    empathyLevel
  }
}

/**
 * Detect crisis indicators in user notes/messages
 */
export function detectCrisis(text?: string): boolean {
  if (!text) return false
  
  const lowerText = text.toLowerCase()
  
  // Check for immediate crisis indicators
  const hasImmediateRisk = CRISIS_INDICATORS.immediate.some(indicator => 
    lowerText.includes(indicator)
  )
  
  if (hasImmediateRisk) return true
  
  // Check for concerning patterns (multiple indicators)
  const concerningCount = CRISIS_INDICATORS.concerning.filter(indicator =>
    lowerText.includes(indicator)
  ).length
  
  const warningCount = CRISIS_INDICATORS.warning.filter(indicator =>
    lowerText.includes(indicator)
  ).length
  
  // Crisis if multiple concerning indicators or combination of concerning + warning
  return concerningCount >= 2 || (concerningCount >= 1 && warningCount >= 2)
}

/**
 * Generate follow-up questions based on mood and context
 */
export function generateMoodyFollowUp(
  moodScore: number,
  previousConversation?: string
): string[] {
  const followUps: string[] = []
  
  if (moodScore <= 4) {
    followUps.push(
      "What's one small thing that brought you even a tiny bit of comfort today?",
      "Is there someone in your life you feel safe talking to about this?",
      "What would you tell a good friend who was feeling exactly like you do right now?"
    )
  } else if (moodScore <= 6) {
    followUps.push(
      "What's been occupying your thoughts lately?",
      "If you could change one thing about today, what would it be?",
      "What's something you're looking forward to, even in a small way?"
    )
  } else {
    followUps.push(
      "What do you think contributed most to feeling this good?",
      "How can you carry this positive energy into tomorrow?",
      "What would you tell someone else who's struggling to find this kind of joy?"
    )
  }
  
  return followUps.slice(0, 2) // Return 2 follow-up questions
}

/**
 * MOODY's crisis support resources
 */
export const CRISIS_RESOURCES = {
  immediate: {
    title: "You don't have to go through this alone 💜",
    message: "I'm really concerned about you right now. Please consider reaching out to someone who can provide immediate support:",
    resources: [
      {
        name: "Crisis Text Line",
        contact: "Text HOME to 741741",
        description: "24/7 support via text message"
      },
      {
        name: "National Suicide Prevention Lifeline", 
        contact: "988",
        description: "24/7 phone support"
      },
      {
        name: "Emergency Services",
        contact: "911",
        description: "For immediate emergency assistance"
      }
    ]
  },
  
  supportive: {
    title: "You matter, and your feelings are valid 🌙",
    message: "I hear that things are difficult right now. Here are some resources that might help:",
    resources: [
      {
        name: "Mental Health America",
        contact: "Visit mhanational.org",
        description: "Find local mental health resources"
      },
      {
        name: "NAMI Helpline",
        contact: "1-800-950-NAMI (6264)",
        description: "Information and support"
      },
      {
        name: "BetterHelp",
        contact: "Visit betterhelp.com",
        description: "Online therapy options"
      }
    ]
  }
}
