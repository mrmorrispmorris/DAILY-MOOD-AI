import { NextResponse } from 'next/server'
import OpenAI from 'openai'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

// Initialize OpenAI client inside function to avoid build-time errors
function createOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey || apiKey === 'sk-proj-placeholder' || apiKey.startsWith('sk-proj-placeholder')) {
    return null // Return null for invalid/missing keys
  }
  return new OpenAI({ apiKey })
}

export async function POST(req: Request) {
  try {
    // Check OpenAI availability first
    const openai = createOpenAIClient()
    if (!openai) {
      return NextResponse.json({ 
        error: 'AI insights temporarily unavailable - OpenAI API key not configured' 
      }, { status: 503 })
    }

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { moods } = await req.json()
    
    if (!moods || moods.length === 0) {
      return NextResponse.json({ 
        insight: 'Start tracking your moods to receive AI insights!' 
      })
    }

    const prompt = `Analyze these mood entries and provide helpful insights:
    ${JSON.stringify(moods.slice(0, 7))}
    
    Provide:
    1. Pattern recognition
    2. Triggers identified
    3. Actionable recommendations
    Keep it concise and supportive.`

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: "You are a supportive mental health companion." },
        { role: "user", content: prompt }
      ],
      max_tokens: 300,
    })

    return NextResponse.json({ 
      insight: completion.choices[0].message.content 
    })

  } catch (error: any) {
    console.error('AI error:', error)
    return NextResponse.json(
      { error: 'Failed to generate insights' },
      { status: 500 }
    )
  }
}