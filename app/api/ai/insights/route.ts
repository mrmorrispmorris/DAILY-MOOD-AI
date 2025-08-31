import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { requirePremium } from '@/lib/subscription';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId, moodEntries } = await request.json();
    
    // Validate inputs
    if (!moodEntries || !Array.isArray(moodEntries)) {
      return NextResponse.json({ error: 'Invalid mood entries provided' }, { status: 400 });
    }
    
    // Check premium status
    await requirePremium(userId);
    
    // Simple, reliable prompt
    const prompt = `Based on these mood entries, provide a brief JSON response:
    ${JSON.stringify(moodEntries.slice(0, 7))}
    
    Return ONLY valid JSON in this exact format:
    {
      "summary": "One sentence mood summary",
      "trend": "improving OR stable OR declining",
      "suggestion": "One specific actionable suggestion"
    }`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
      max_tokens: 150,
    });

    const content = completion.choices[0].message.content || '{}';
    const insights = JSON.parse(content);
    
    return NextResponse.json(insights);
  } catch (error) {
    console.error('AI Insights error:', error);
    // Return fallback instead of error
    return NextResponse.json({
      summary: "Continue tracking to see patterns",
      trend: "stable",
      suggestion: "Log your mood daily for better insights"
    });
  }
}
