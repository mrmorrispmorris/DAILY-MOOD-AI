import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { 
  generateMoodyResponse, 
  generateMoodyFollowUp, 
  detectCrisis,
  CRISIS_RESOURCES,
  MOODY_CONVERSATION_STARTERS 
} from '@/lib/moody-personality'
import { supabase } from '@/app/lib/supabase-client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface ConversationRequest {
  userId: string
  message?: string
  moodScore?: number
  context?: {
    streak: number
    previousMood?: number
    timeOfDay: 'morning' | 'afternoon' | 'evening'
    recentMoods: Array<{
      date: string
      mood_score: number
      notes?: string
    }>
  }
  conversationType: 'mood_entry' | 'follow_up' | 'general_chat' | 'crisis_check'
}

export async function POST(request: Request) {
  try {
    const body: ConversationRequest = await request.json()
    const { userId, message, moodScore, context, conversationType } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 })
    }

    // Handle crisis detection immediately
    if (message && detectCrisis(message)) {
      return handleCrisisResponse(userId, message)
    }

    // Generate MOODY's personality-based response
    let moodyResponse
    switch (conversationType) {
      case 'mood_entry':
        moodyResponse = await handleMoodEntryConversation(userId, moodScore!, message, context)
        break
      case 'follow_up':
        moodyResponse = await handleFollowUpConversation(userId, message, context)
        break
      case 'general_chat':
        moodyResponse = await handleGeneralChatConversation(userId, message, context)
        break
      case 'crisis_check':
        moodyResponse = await handleCrisisCheckConversation(userId, message, context)
        break
      default:
        moodyResponse = generateMoodyResponse(moodScore || 5, message, context)
    }

    // Store conversation in database for context
    await storeConversation(userId, message || '', moodyResponse.message, moodScore, conversationType)

    return NextResponse.json({
      success: true,
      response: moodyResponse,
      followUpQuestions: moodScore ? generateMoodyFollowUp(moodScore, message) : [],
      crisisResources: moodyResponse.crisisDetected ? CRISIS_RESOURCES.immediate : undefined,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('MOODY Conversation error:', error)
    
    // Empathetic fallback response
    return NextResponse.json({
      success: true,
      response: {
        message: "I'm here for you, even though I'm having a small technical moment. Your feelings are important to me, and I want you to know that you matter. 💜",
        tone: 'supportive',
        followUpNeeded: false,
        crisisDetected: false,
        empathyLevel: 8
      },
      fallback: true
    })
  }
}

/**
 * Handle mood entry conversations with full MOODY personality
 */
async function handleMoodEntryConversation(
  userId: string,
  moodScore: number,
  notes?: string,
  context?: any
) {
  // Get MOODY's initial empathetic response
  const initialResponse = generateMoodyResponse(moodScore, notes, context)

  // If mood is concerning or user provided detailed notes, use OpenAI for deeper response
  if ((moodScore <= 4 || (notes && notes.length > 20)) && process.env.OPENAI_API_KEY) {
    try {
      const enhancedResponse = await generateAIEnhancedMoodyResponse(
        userId, 
        moodScore, 
        notes, 
        context,
        initialResponse.message
      )
      return enhancedResponse
    } catch (error) {
      console.warn('AI enhancement failed, using personality response:', error)
    }
  }

  return initialResponse
}

/**
 * Use OpenAI to enhance MOODY's empathetic responses while maintaining personality
 */
async function generateAIEnhancedMoodyResponse(
  userId: string,
  moodScore: number,
  notes?: string,
  context?: any,
  baseResponse?: string
) {
  const moodyPersonalityPrompt = `You are MOODY, an empathetic AI companion with a Duolingo-inspired personality. Your core traits:

PERSONALITY TRAITS:
- Empathetic Intelligence: You deeply understand emotions and validate feelings
- Gentle Encouragement: You inspire hope without toxic positivity  
- Cultural Sensitivity: You respect all backgrounds and perspectives
- Professional Boundaries: You know when to suggest professional help
- Growth-Oriented: You focus on small, achievable progress
- Crisis-Aware: You recognize warning signs and respond appropriately

COMMUNICATION STYLE:
- Validation-First: Always acknowledge and validate emotions before suggestions
- Non-Judgmental: Create a safe space free from judgment
- Curious Explorer: Ask thoughtful questions to understand deeper
- Gentle Humor: Light, appropriate humor when mood permits (never during crisis)
- Professional Boundaries: Know your limits and when to refer to professionals

USER CONTEXT:
- Current mood: ${moodScore}/10
- Their notes: "${notes || 'No notes provided'}"
- Time: ${context?.timeOfDay || 'unknown'}
- Streak: ${context?.streak || 0} days
${context?.recentMoods ? `- Recent pattern: ${context.recentMoods.map(m => `${m.date}: ${m.mood_score}/10`).join(', ')}` : ''}

INSTRUCTIONS:
Respond as MOODY with deep empathy and understanding. Your response should:
1. Validate their current emotional state
2. Show genuine care and concern
3. Ask ONE thoughtful follow-up question
4. Offer gentle, actionable support if appropriate
5. Use warm, supportive emojis naturally
6. Keep response to 2-3 sentences maximum

If mood is 4 or below, focus on validation and gentle support.
If mood is 5-7, be curious and encouraging.
If mood is 8+, celebrate with them genuinely.

NEVER:
- Dismiss or minimize feelings
- Give medical advice
- Use toxic positivity ("just think positive!")
- Make assumptions about their situation
- Be overly clinical or robotic

Respond as MOODY would - with warmth, intelligence, and genuine care:`

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini', // Cost-optimized model
    messages: [
      {
        role: 'system',
        content: moodyPersonalityPrompt
      },
      {
        role: 'user',
        content: `Please respond to this mood entry with your full MOODY personality.`
      }
    ],
    temperature: 0.8, // More personality variation
    max_tokens: 200,
    presence_penalty: 0.3,
    frequency_penalty: 0.2
  })

  const aiMessage = completion.choices[0]?.message?.content || baseResponse || "I'm here for you 💜"

  return {
    message: aiMessage,
    tone: moodScore <= 4 ? 'supportive' : moodScore >= 8 ? 'celebrating' : 'encouraging',
    actionSuggested: moodScore <= 4 ? 'supportive_resources' : undefined,
    followUpNeeded: moodScore <= 6,
    crisisDetected: detectCrisis(notes),
    empathyLevel: Math.max(7, 11 - moodScore) // Higher empathy for lower moods
  }
}

/**
 * Handle follow-up conversations
 */
async function handleFollowUpConversation(userId: string, message?: string, context?: any) {
  // Use conversation starters or respond to user's follow-up
  if (!message) {
    const starters = MOODY_CONVERSATION_STARTERS.dailyCheckin
    const selectedStarter = starters[Math.floor(Math.random() * starters.length)]
    
    return {
      message: selectedStarter,
      tone: 'supportive',
      followUpNeeded: true,
      crisisDetected: false,
      empathyLevel: 6
    }
  }

  // Respond to user's follow-up with AI enhancement if available
  if (process.env.OPENAI_API_KEY) {
    try {
      return await generateAIEnhancedFollowUp(userId, message, context)
    } catch (error) {
      console.warn('AI follow-up failed:', error)
    }
  }

  // Fallback empathetic response
  return {
    message: "Thank you for sharing that with me. I'm really listening to what you're saying, and I want you to know your thoughts and feelings matter to me. What's on your heart right now? 💙",
    tone: 'supportive',
    followUpNeeded: true,
    crisisDetected: detectCrisis(message),
    empathyLevel: 7
  }
}

/**
 * Generate AI-enhanced follow-up responses
 */
async function generateAIEnhancedFollowUp(userId: string, message: string, context?: any) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `You are MOODY, responding to a follow-up message. Stay empathetic, curious, and supportive. Validate their sharing, ask ONE thoughtful question, and show genuine care. Keep it to 1-2 sentences with a warm emoji. Be natural and conversational.`
      },
      {
        role: 'user',
        content: `User's follow-up message: "${message}"`
      }
    ],
    temperature: 0.8,
    max_tokens: 150
  })

  const aiMessage = completion.choices[0]?.message?.content || "I hear you, and thank you for sharing that with me 💜"

  return {
    message: aiMessage,
    tone: 'supportive',
    followUpNeeded: true,
    crisisDetected: detectCrisis(message),
    empathyLevel: 7
  }
}

/**
 * Handle general chat conversations
 */
async function handleGeneralChatConversation(userId: string, message?: string, context?: any) {
  if (!message) {
    return {
      message: "I'm here and ready to listen. What's on your mind today? 😊",
      tone: 'supportive',
      followUpNeeded: true,
      crisisDetected: false,
      empathyLevel: 6
    }
  }

  return await handleFollowUpConversation(userId, message, context)
}

/**
 * Handle crisis check conversations with immediate support
 */
async function handleCrisisCheckConversation(userId: string, message?: string, context?: any) {
  const crisisDetected = message ? detectCrisis(message) : false
  
  if (crisisDetected) {
    return await handleCrisisResponse(userId, message!)
  }

  return {
    message: "I'm checking in because I care about you. How are you feeling right now, and is there anything specific you need support with? 💜",
    tone: 'concerned',
    followUpNeeded: true,
    crisisDetected: false,
    empathyLevel: 9
  }
}

/**
 * Handle crisis situations with immediate resources and support
 */
async function handleCrisisResponse(userId: string, message: string) {
  // Store crisis event for follow-up
  await storeCrisisEvent(userId, message)

  return NextResponse.json({
    success: true,
    response: {
      message: "I'm very concerned about what you're sharing with me right now. Your pain is real, and you don't have to carry this alone. Please reach out for immediate support - you matter deeply, and there are people who want to help. 💜",
      tone: 'crisis',
      actionSuggested: 'crisis_support',
      followUpNeeded: true,
      crisisDetected: true,
      empathyLevel: 10
    },
    crisisResources: CRISIS_RESOURCES.immediate,
    urgentMessage: "If you're in immediate danger, please contact emergency services (911) or go to your nearest emergency room.",
    timestamp: new Date().toISOString()
  })
}

/**
 * Store conversation in database for context and continuity
 */
async function storeConversation(
  userId: string, 
  userMessage: string, 
  moodyResponse: string, 
  moodScore?: number,
  conversationType?: string
) {
  try {
    await supabase.from('ai_conversations').insert({
      user_id: userId,
      user_message: userMessage,
      ai_response: moodyResponse,
      mood_score_at_conversation: moodScore,
      conversation_type: conversationType,
      sentiment_analysis: analyzeSentiment(userMessage),
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.warn('Failed to store conversation:', error)
  }
}

/**
 * Store crisis events for follow-up and safety monitoring
 */
async function storeCrisisEvent(userId: string, message: string) {
  try {
    await supabase.from('crisis_support_logs').insert({
      user_id: userId,
      trigger_event: 'ai_conversation',
      message_content: message,
      severity: 'high',
      actions_suggested: 'immediate_resources',
      created_at: new Date().toISOString()
    })
  } catch (error) {
    console.warn('Failed to store crisis event:', error)
  }
}

/**
 * Simple sentiment analysis for conversation context
 */
function analyzeSentiment(message: string): 'positive' | 'negative' | 'neutral' {
  const positiveWords = ['good', 'great', 'happy', 'better', 'wonderful', 'amazing', 'love', 'joy', 'excited']
  const negativeWords = ['bad', 'terrible', 'sad', 'worse', 'awful', 'hate', 'depressed', 'anxious', 'worried']
  
  const lowerMessage = message.toLowerCase()
  const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length
  const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length
  
  if (positiveCount > negativeCount) return 'positive'
  if (negativeCount > positiveCount) return 'negative'
  return 'neutral'
}
