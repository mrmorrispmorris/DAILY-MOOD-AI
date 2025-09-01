import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { actionType, moodHistory, previousRecommendations } = await request.json()

    if (!moodHistory || !Array.isArray(moodHistory)) {
      return NextResponse.json({ error: 'Invalid mood history provided' }, { status: 400 })
    }

    console.log('🤖 AI Follow-up request:', { actionType, moodCount: moodHistory.length })

    // Create context-aware prompt based on action type
    let systemPrompt = ''
    let userPrompt = ''

    switch (actionType) {
      case 'check_progress':
        systemPrompt = `You are a compassionate AI mental health assistant following up on previous recommendations. 
        Review the user's progress and provide supportive feedback with specific next steps.`
        
        userPrompt = `Check my progress based on these recent mood entries:
        ${JSON.stringify(moodHistory)}
        
        Previous recommendations I gave: ${previousRecommendations}
        
        Provide 3-4 follow-up insights about progress and next steps.`
        break

      case 'get_tips':
        systemPrompt = `You are an expert AI wellness coach providing personalized tips based on mood patterns.
        Focus on actionable, specific recommendations tailored to the user's unique patterns.`
        
        userPrompt = `Analyze these mood patterns and give me personalized tips:
        ${JSON.stringify(moodHistory)}
        
        Provide 3-4 specific, actionable tips based on what you observe in the data.`
        break

      case 'emergency_support':
        systemPrompt = `You are a crisis-aware AI assistant providing immediate support and actionable steps.
        Be empathetic, validate feelings, and provide concrete coping strategies. Always include professional help resources.`
        
        userPrompt = `I need immediate support. Here's my recent mood data:
        ${JSON.stringify(moodHistory)}
        
        Provide immediate coping strategies and a clear action plan for right now.`
        break

      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 })
    }

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 400,
    })

    const response = completion.choices[0].message.content || ''
    
    // Parse response into actionable insights
    const followUpActions = response.split('\n')
      .filter(line => line.trim().length > 0)
      .map(line => line.replace(/^\d+\.\s*/, '').trim()) // Remove numbering
      .filter(line => line.length > 10) // Filter out very short lines
      .slice(0, 4) // Limit to 4 insights

    return NextResponse.json({
      followUpActions,
      actionType,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('AI Follow-up error:', error)
    
    // Fallback responses based on action type
    const fallbackResponses = {
      check_progress: [
        "I'm reviewing your recent mood patterns to assess your progress.",
        "Based on what I can see, let's adjust our approach moving forward.",
        "Your consistency with tracking is already a positive step.",
        "Let's build on what's working and modify what isn't."
      ],
      get_tips: [
        "Here are some personalized strategies based on your patterns:",
        "Try incorporating small, consistent wellness activities into your routine.",
        "Focus on activities that have previously improved your mood.",
        "Remember that progress isn't always linear - be patient with yourself."
      ],
      emergency_support: [
        "I'm here to support you through this difficult moment.",
        "First, take 3 deep breaths. You are safe and this feeling will pass.",
        "Reach out to a trusted friend or family member right now.",
        "If you're having thoughts of self-harm, please contact a crisis helpline immediately: 988 (US) or your local emergency services."
      ]
    }

    const requestBody = await request.json()
    return NextResponse.json({
      followUpActions: fallbackResponses[requestBody.actionType as keyof typeof fallbackResponses] || fallbackResponses.get_tips,
      actionType: requestBody.actionType,
      timestamp: new Date().toISOString(),
      fallback: true
    })
  }
}
