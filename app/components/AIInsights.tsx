'use client'
import { useEffect, useState } from 'react'

export default function AIInsights({ moods }: { moods: any[] }) {
  const [insights, setInsights] = useState<any>(null)
  
  useEffect(() => {
    const fetchInsights = async () => {
      try {
        const res = await fetch('/api/ai-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ moods })
        })
        
        // Check if response is ok before parsing JSON
        if (!res.ok) {
          console.error(`AI Insights API error: ${res.status} ${res.statusText}`)
          setInsights({
            prediction: "Unable to analyze mood data",
            average: "0.0", 
            recommendation: "Please try again later",
            nextDayPrediction: 5
          })
          return
        }
        
        // Check if response is JSON
        const contentType = res.headers.get('content-type')
        if (!contentType || !contentType.includes('application/json')) {
          console.error('AI Insights API returned non-JSON response:', contentType)
          setInsights({
            prediction: "Service temporarily unavailable",
            average: "0.0",
            recommendation: "Please refresh the page",
            nextDayPrediction: 5
          })
          return
        }
        
        const data = await res.json()
        setInsights(data)
      } catch (error) {
        console.error('AI Insights fetch error:', error)
        setInsights({
          prediction: "Connection error",
          average: "0.0",
          recommendation: "Check your internet connection",
          nextDayPrediction: 5
        })
      }
    }

    if (moods.length > 3) {
      fetchInsights()
    }
  }, [moods])
  
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
