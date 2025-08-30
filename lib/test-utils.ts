// Comprehensive testing utilities for DailyMood AI
// Includes mocks, factories, and test helpers

import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Mock data factories
export class MockDataFactory {
  static user(overrides = {}) {
    return {
      id: this.uuid(),
      email: this.email(),
      subscription_level: 'free',
      subscription_status: 'inactive',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      timezone: 'UTC',
      language: 'en',
      total_mood_entries: 0,
      current_streak: 0,
      longest_streak: 0,
      onboarding_completed: false,
      referral_code: this.randomString(8),
      ...overrides
    }
  }

  static premiumUser(overrides = {}) {
    return this.user({
      subscription_level: 'premium',
      subscription_status: 'active',
      subscription_start_date: new Date().toISOString(),
      onboarding_completed: true,
      total_mood_entries: 15,
      current_streak: 5,
      longest_streak: 12,
      ...overrides
    })
  }

  static moodEntry(overrides = {}) {
    const mood_score = Math.floor(Math.random() * 5) + 1
    const emojis = ['😢', '😞', '😐', '🙂', '😁']
    const labels = ['Awful', 'Bad', 'Meh', 'Good', 'Rad']

    return {
      id: this.uuid(),
      user_id: this.uuid(),
      date: new Date().toISOString().split('T')[0],
      mood_score,
      emoji: emojis[mood_score - 1],
      mood_label: labels[mood_score - 1],
      notes: `Test mood entry ${this.randomString(5)}`,
      tags: this.randomTags(),
      activities: this.randomActivities(),
      entry_mode: 'detailed',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...overrides
    }
  }

  static aiInsight(overrides = {}) {
    return {
      id: this.uuid(),
      user_id: this.uuid(),
      insights: {
        summary: "You've been maintaining a positive mood trend this week!",
        patterns: [
          "Higher moods on weekends",
          "Exercise correlates with better moods",
          "Morning entries tend to be more positive"
        ],
        recommendations: [
          "Continue your weekend activities during weekdays",
          "Maintain your exercise routine",
          "Consider morning mood logging"
        ],
        prediction: {
          tomorrow: 4,
          confidence: 0.75
        },
        correlations: [
          { factor: "Exercise", impact: "High positive correlation" },
          { factor: "Sleep", impact: "Moderate positive correlation" }
        ]
      },
      insight_type: 'weekly',
      ai_model: 'gpt-4',
      processing_time_ms: 1500,
      token_count: 450,
      cost_cents: 12,
      created_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      ...overrides
    }
  }

  static paymentAttempt(overrides = {}) {
    return {
      id: this.uuid(),
      user_id: this.uuid(),
      session_id: `cs_test_${this.randomString(20)}`,
      status: 'completed',
      amount_cents: 1000,
      currency: 'USD',
      created_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      ...overrides
    }
  }

  static revenueEvent(overrides = {}) {
    return {
      id: this.uuid(),
      type: 'new_subscription',
      amount_cents: 1000,
      currency: 'USD',
      user_id: this.uuid(),
      stripe_customer_id: `cus_${this.randomString(14)}`,
      created_at: new Date().toISOString(),
      ...overrides
    }
  }

  static analyticsEvent(overrides = {}) {
    return {
      id: this.uuid(),
      event_name: 'mood_entry_created',
      user_id: this.uuid(),
      session_id: this.randomString(10),
      properties: {
        mood_score: 4,
        has_notes: true,
        entry_mode: 'detailed'
      },
      user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15',
      created_at: new Date().toISOString(),
      ...overrides
    }
  }

  // Utility functions
  static uuid() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0
      const v = c == 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  static email() {
    return `test-${this.randomString(8)}@example.com`
  }

  static randomString(length = 10) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    return Array.from({ length }, () => chars.charAt(Math.floor(Math.random() * chars.length))).join('')
  }

  static randomTags() {
    const tags = ['work', 'exercise', 'social', 'family', 'stress', 'relax', 'achievement', 'tired']
    const count = Math.floor(Math.random() * 3) + 1
    return Array.from({ length: count }, () => tags[Math.floor(Math.random() * tags.length)])
  }

  static randomActivities() {
    const activities = ['meeting', 'gym', 'friends', 'cooking', 'reading', 'music', 'walk', 'work']
    const count = Math.floor(Math.random() * 3) + 1
    return Array.from({ length: count }, () => activities[Math.floor(Math.random() * activities.length)])
  }

  // Generate realistic mood data for a user
  static userMoodHistory(userId: string, days = 30) {
    const entries = []
    const today = new Date()

    for (let i = 0; i < days; i++) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Create some realistic patterns
      let baseMood = 3 // neutral baseline
      
      // Weekend boost
      if (date.getDay() === 0 || date.getDay() === 6) {
        baseMood += 1
      }
      
      // Random variation
      baseMood += (Math.random() - 0.5) * 2
      
      // Ensure within bounds
      const mood_score = Math.max(1, Math.min(5, Math.round(baseMood)))
      
      entries.push(this.moodEntry({
        user_id: userId,
        date: date.toISOString().split('T')[0],
        mood_score,
        created_at: date.toISOString()
      }))
    }

    return entries.reverse() // chronological order
  }
}

// Supabase mocking utilities
export class MockSupabase {
  private data: { [table: string]: any[] } = {}

  constructor() {
    this.resetData()
  }

  resetData() {
    this.data = {
      users: [],
      mood_entries: [],
      ai_insights: [],
      payment_attempts: [],
      revenue_events: [],
      analytics_events: []
    }
  }

  seedData(table: string, records: any[]) {
    this.data[table] = [...(this.data[table] || []), ...records]
  }

  from(table: string) {
    return new MockQueryBuilder(this.data[table] || [])
  }

  auth = {
    getUser: (() => Promise.resolve({
      data: { user: MockDataFactory.user() },
      error: null
    }))
  }

  rpc = () => Promise.resolve({ data: null, error: null })
}

class MockQueryBuilder {
  private data: any[]
  private filters: any[] = []
  private selectedFields: string = '*'
  private orderBy: { column: string; ascending: boolean } | null = null
  private limitCount: number | null = null
  private rangeStart: number | null = null
  private rangeEnd: number | null = null

  constructor(data: any[]) {
    this.data = [...data]
  }

  select(fields: string = '*') {
    this.selectedFields = fields
    return this
  }

  eq(column: string, value: any) {
    this.filters.push({ type: 'eq', column, value })
    return this
  }

  neq(column: string, value: any) {
    this.filters.push({ type: 'neq', column, value })
    return this
  }

  gt(column: string, value: any) {
    this.filters.push({ type: 'gt', column, value })
    return this
  }

  gte(column: string, value: any) {
    this.filters.push({ type: 'gte', column, value })
    return this
  }

  lt(column: string, value: any) {
    this.filters.push({ type: 'lt', column, value })
    return this
  }

  lte(column: string, value: any) {
    this.filters.push({ type: 'lte', column, value })
    return this
  }

  order(column: string, { ascending = true } = {}) {
    this.orderBy = { column, ascending }
    return this
  }

  limit(count: number) {
    this.limitCount = count
    return this
  }

  range(start: number, end: number) {
    this.rangeStart = start
    this.rangeEnd = end
    return this
  }

  async single() {
    const result = await this.execute()
    return {
      data: result.data?.[0] || null,
      error: result.error
    }
  }

  insert(records: any | any[]) {
    const recordsArray = Array.isArray(records) ? records : [records]
    const inserted = recordsArray.map(record => ({
      id: MockDataFactory.uuid(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ...record
    }))
    
    this.data.push(...inserted)
    
    return Promise.resolve({
      data: inserted,
      error: null
    })
  }

  update(updates: any) {
    const filtered = this.applyFilters()
    const updated = filtered.map(record => ({
      ...record,
      ...updates,
      updated_at: new Date().toISOString()
    }))
    
    return Promise.resolve({
      data: updated,
      error: null
    })
  }

  delete() {
    const filtered = this.applyFilters()
    // Remove from original data array
    filtered.forEach(record => {
      const index = this.data.findIndex(item => item.id === record.id)
      if (index > -1) {
        this.data.splice(index, 1)
      }
    })
    
    return Promise.resolve({
      data: filtered,
      error: null
    })
  }

  upsert(records: any | any[], options: any = {}) {
    const recordsArray = Array.isArray(records) ? records : [records]
    const upserted = recordsArray.map(record => {
      const existing = this.data.find(item => {
        if (options.onConflict) {
          const conflictFields = Array.isArray(options.onConflict) 
            ? options.onConflict 
            : [options.onConflict]
          return conflictFields.every(field => item[field] === record[field])
        }
        return item.id === record.id
      })

      if (existing) {
        Object.assign(existing, record, { updated_at: new Date().toISOString() })
        return existing
      } else {
        const newRecord = {
          id: MockDataFactory.uuid(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          ...record
        }
        this.data.push(newRecord)
        return newRecord
      }
    })
    
    return Promise.resolve({
      data: upserted,
      error: null
    })
  }

  private execute() {
    let result = this.applyFilters()
    
    if (this.orderBy) {
      result.sort((a, b) => {
        const aVal = a[this.orderBy!.column]
        const bVal = b[this.orderBy!.column]
        const comparison = aVal < bVal ? -1 : aVal > bVal ? 1 : 0
        return this.orderBy!.ascending ? comparison : -comparison
      })
    }
    
    if (this.rangeStart !== null && this.rangeEnd !== null) {
      result = result.slice(this.rangeStart, this.rangeEnd + 1)
    } else if (this.limitCount) {
      result = result.slice(0, this.limitCount)
    }
    
    return Promise.resolve({
      data: result,
      error: null,
      count: result.length
    })
  }

  private applyFilters() {
    return this.data.filter(record => {
      return this.filters.every(filter => {
        const value = record[filter.column]
        
        switch (filter.type) {
          case 'eq': return value === filter.value
          case 'neq': return value !== filter.value
          case 'gt': return value > filter.value
          case 'gte': return value >= filter.value
          case 'lt': return value < filter.value
          case 'lte': return value <= filter.value
          default: return true
        }
      })
    })
  }
}

// API route testing utilities
export class MockAPIRequest {
  static get(url: string, options: any = {}) {
    return new NextRequest(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }

  static post(url: string, body: any = {}, options: any = {}) {
    return new NextRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(body)
    })
  }

  static put(url: string, body: any = {}, options: any = {}) {
    return new NextRequest(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      body: JSON.stringify(body)
    })
  }

  static delete(url: string, options: any = {}) {
    return new NextRequest(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      }
    })
  }
}

// Test environment setup
export function setupTestEnvironment() {
  // Set test environment variables (skip NODE_ENV as it may be read-only)
  // process.env.NODE_ENV = 'test'
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'test-service-role-key'
  process.env.OPENAI_API_KEY = 'test-openai-key'
  process.env.STRIPE_SECRET_KEY = 'sk_test_test-key'
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = 'pk_test_test-key'
  process.env.STRIPE_PRICE_ID = 'price_test_premium'
  process.env.ADMIN_KEY = 'test-admin-key'

  // Mock console methods in tests - commented out for build compatibility
  const originalConsole = { ...console }
  // beforeEach(() => {
  //   console.log = () => {}
  //   console.error = () => {}
  //   console.warn = () => {}
  // })

  // afterEach(() => {
  //   Object.assign(console, originalConsole)
  //   // jest.clearAllMocks() - not available in build context
  // })

  return {
    mockSupabase: new MockSupabase(),
    resetMocks: () => {
      // jest.clearAllMocks() - not available in build context
    }
  }
}

// Component testing helpers
export function renderWithProviders(component: React.ReactElement, options: any = {}) {
  // This would be used with React Testing Library
  // For now, just return the component
  return component
}

// Custom matchers for Jest - commented out for build compatibility
// expect.extend({
//   toBeValidUUID(received: string) {
//     const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
//     const pass = uuidRegex.test(received)
//     
//     if (pass) {
//       return {
//         message: () => `expected ${received} not to be a valid UUID`,
//         pass: true,
//       }
//     } else {
//       return {
//         message: () => `expected ${received} to be a valid UUID`,
//         pass: false,
//       }
//     }
//   },

//   toHaveValidMoodScore(received: any) {
//     const score = received?.mood_score
//     const pass = typeof score === 'number' && score >= 1 && score <= 5
//     
//     if (pass) {
//       return {
//         message: () => `expected mood_score ${score} not to be valid (1-5)`,
//         pass: true,
//       }
//     } else {
//       return {
//         message: () => `expected mood_score to be between 1-5, received ${score}`,
//         pass: false,
//       }
//     }
//   }
// })

// Performance testing utilities
export class PerformanceMonitor {
  private marks: { [key: string]: number } = {}

  start(label: string) {
    this.marks[label] = Date.now()
  }

  end(label: string): number {
    const startTime = this.marks[label]
    if (!startTime) {
      throw new Error(`No start mark found for ${label}`)
    }
    
    const duration = Date.now() - startTime
    delete this.marks[label]
    return duration
  }

  async measureAsync<T>(label: string, fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
    this.start(label)
    const result = await fn()
    const duration = this.end(label)
    
    return { result, duration }
  }
}

// Export everything for easy importing
export {
  MockQueryBuilder
}


