'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState } from 'react'
import ToastProvider from './ToastProvider'

export default function QueryProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        gcTime: 5 * 60 * 1000, // 5 minutes
        refetchOnWindowFocus: false,
        retry: (failureCount, error: any) => {
          // Don't retry 4xx errors
          if (error?.status >= 400 && error?.status < 500) {
            return false
          }
          return failureCount < 3
        }
      },
    },
  }))

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ToastProvider />
      {/* TanStack Query DevTools - Disabled to reduce UI clutter */}
      {/* The "palm tree" widget was this DevTools component! */}
      {false && process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools initialIsOpen={false} />
      )}
    </QueryClientProvider>
  )
}
