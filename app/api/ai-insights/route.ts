import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  const { moods } = await req.json()
  
  // Simple prediction algorithm (replace with OpenAI later)
  const avgMood = moods.reduce((sum: number, m: any) => sum + m.mood_score, 0) / moods.length
  const trend = moods[0].mood_score > avgMood ? 'improving' : 'declining'
  
  const insights = {
    prediction: `Your mood is ${trend}`,
    average: avgMood.toFixed(1),
    recommendation: avgMood < 5 
      ? "Consider taking a short walk or calling a friend"
      : "Keep up the positive momentum!",
    nextDayPrediction: Math.min(10, Math.max(1, avgMood + (trend === 'improving' ? 1 : -1)))
  }
  
  return NextResponse.json(insights)
}
