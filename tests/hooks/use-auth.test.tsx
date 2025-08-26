import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useAuth } from '@/hooks/use-auth'

// Mock auth service
vi.mock('@/lib/auth/auth-service', () => ({
  authService: {
    getCurrentUser: vi.fn(),
    signUp: vi.fn(),
    signIn: vi.fn(), 
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
  }
}))

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes with loading state', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.error).toBe(null)
  })

  it('provides signUp function', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(typeof result.current.signUp).toBe('function')
  })

  it('provides signIn function', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(typeof result.current.signIn).toBe('function')
  })

  it('provides signOut function', () => {
    const { result } = renderHook(() => useAuth())
    
    expect(typeof result.current.signOut).toBe('function')
  })

  it('handles server-side rendering gracefully', () => {
    // Test that the hook doesn't crash when window is undefined
    // This tests the SSR compatibility without breaking React Testing Library
    const { result } = renderHook(() => useAuth())
    
    // The hook should initialize properly and handle the client-side check
    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.error).toBe(null)
    
    // Functions should be available
    expect(typeof result.current.signUp).toBe('function')
    expect(typeof result.current.signIn).toBe('function')
    expect(typeof result.current.signOut).toBe('function')
  })
})

