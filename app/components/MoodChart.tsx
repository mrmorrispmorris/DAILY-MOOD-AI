'use client'
import { useEffect, useRef } from 'react'

export default function MoodChart({ moods }: { moods: any[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    if (!canvasRef.current || moods.length === 0) return
    
    const ctx = canvasRef.current.getContext('2d')!
    const width = canvasRef.current.width
    const height = canvasRef.current.height
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, height)
    gradient.addColorStop(0, 'rgba(139, 92, 246, 0.3)')
    gradient.addColorStop(1, 'rgba(139, 92, 246, 0)')
    
    // Draw chart
    ctx.beginPath()
    moods.forEach((mood, i) => {
      const x = (i / (moods.length - 1)) * width
      const y = height - (mood.mood_score / 10) * height
      
      if (i === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    })
    
    ctx.strokeStyle = '#8B5CF6'
    ctx.lineWidth = 3
    ctx.stroke()
    
    // Fill area
    ctx.lineTo(width, height)
    ctx.lineTo(0, height)
    ctx.fillStyle = gradient
    ctx.fill()
  }, [moods])
  
  if (moods.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4">Your Mood Trend</h3>
        <div className="text-center text-gray-500 py-8">
          Start tracking your mood to see trends here!
        </div>
      </div>
    )
  }
  
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h3 className="text-xl font-bold mb-4">Your Mood Trend</h3>
      <canvas 
        ref={canvasRef} 
        width={400} 
        height={200}
        className="w-full"
      />
    </div>
  )
}
