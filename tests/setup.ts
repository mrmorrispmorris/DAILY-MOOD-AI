import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock Next.js router
vi.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: vi.fn(),
      replace: vi.fn(),
      prefetch: vi.fn(),
    }
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock Supabase client
vi.mock('@/app/lib/supabase-client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn(),
      signInWithOtp: vi.fn(),
      signOut: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      })),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(),
          order: vi.fn(() => ({
            limit: vi.fn(),
          })),
        })),
        order: vi.fn(() => ({
          limit: vi.fn(),
        })),
      })),
      insert: vi.fn(() => ({
        select: vi.fn(),
      })),
      upsert: vi.fn(),
      update: vi.fn(() => ({
        eq: vi.fn(),
      })),
    })),
  }
}))

// Mock environment variables for tests
process.env.NEXT_PUBLIC_SUPABASE_URL = 'http://localhost:54321'
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-key'
process.env.NEXT_PUBLIC_URL = 'http://localhost:3000'

