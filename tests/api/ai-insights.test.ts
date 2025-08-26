import { describe, it, expect, vi } from 'vitest'
import { POST } from '@/app/api/ai-insights/route'
import { NextRequest } from 'next/server'

describe('/api/ai-insights', () => {
  it('handles empty moods array', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai-insights', {
      method: 'POST',
      body: JSON.stringify({ moods: [] })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.prediction).toBe('Start tracking to see insights')
    expect(data.average).toBe('0.0')
    expect(data.nextDayPrediction).toBe(5)
  })

  it('handles valid mood data', async () => {
    const moods = [
      { mood_score: 8, created_at: '2025-01-25T12:00:00Z' },
      { mood_score: 6, created_at: '2025-01-25T11:00:00Z' },
      { mood_score: 7, created_at: '2025-01-25T10:00:00Z' }
    ]

    const request = new NextRequest('http://localhost:3000/api/ai-insights', {
      method: 'POST',
      body: JSON.stringify({ moods })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.average).toBe('7.0')
    expect(typeof data.prediction).toBe('string')
    expect(typeof data.recommendation).toBe('string')
    expect(typeof data.nextDayPrediction).toBe('number')
  })

  it('handles invalid mood data', async () => {
    const moods = [
      { invalid_field: 'test' },
      { mood_score: null },
      { mood_score: 'invalid' }
    ]

    const request = new NextRequest('http://localhost:3000/api/ai-insights', {
      method: 'POST',
      body: JSON.stringify({ moods })
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.prediction).toBe('No valid mood data found')
    expect(data.average).toBe('0.0')
  })

  it('handles missing moods parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/ai-insights', {
      method: 'POST',
      body: JSON.stringify({})
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Invalid request format')
  })
})

