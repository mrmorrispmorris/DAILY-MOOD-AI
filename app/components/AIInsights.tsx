'use client'
import { useEffect, useState } from 'react'

export default function AIInsights({ moods }: { moods: any[] }) {
  const [insights, setInsights] = useState<any>(null)
  
  const fetchInsights = async () => {
    const res = await fetch('/api/ai-insights', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ moods })
    })
    const data = await res.json()
    setInsights(data)
  }
  
  useEffect(() => {
    if (moods.length > 3) {
      fetchInsights()
    }
  }, [moods, fetchInsights])
  
  if (!insights) return null
  
  return (
    <div className="bg-gradient-to-r from-mood-purple to-mood-blue text-white rounded-2xl p-6">
      <h3 className="text-2xl font-bold mb-4">AI Insights</h3>
      <div className="space-y-3">
        <p>🎯 Prediction: {insights.prediction}</p>
        <p>📊 Average Mood: {insights.average}/10</p>
        <p>🔮 Tomorrow: {insights.nextDayPrediction}/10</p>
        <p className="text-sm opacity-90">💡 {insights.recommendation}</p>
      </div>
    </div>
  )
}
