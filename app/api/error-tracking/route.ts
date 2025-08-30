import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'
import { errorTracker } from '@/lib/error-tracking'

export const dynamic = 'force-dynamic'

// GET: Retrieve error statistics and recent errors
export async function GET(request: Request) {
  try {
    // Check authorization - only admins can view error data
    const isAuthorized = await checkAuthorization(request)
    
    if (!isAuthorized) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Admin access required to view error data'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const timeRange = (searchParams.get('timeRange') || '24h') as '1h' | '24h' | '7d' | 'all'
    const userId = searchParams.get('userId') || undefined
    const format = searchParams.get('format') || 'json'

    // Get error statistics
    const errorStats = errorTracker.getErrorStats(timeRange)
    
    // Get user-specific errors if requested
    let userErrors: any[] = []
    if (userId) {
      userErrors = errorTracker.getUserErrors(userId, 100)
    }

    // Handle different export formats
    if (format === 'csv') {
      const csvData = errorTracker.exportErrors('csv')
      return new NextResponse(csvData, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="errors-${new Date().toISOString().split('T')[0]}.csv"`
        }
      })
    }

    const response = {
      timestamp: new Date().toISOString(),
      timeRange,
      stats: errorStats,
      userErrors: userId ? userErrors : undefined,
      meta: {
        totalStoredErrors: errorStats.totalErrors,
        oldestError: errorStats.recentErrors[errorStats.recentErrors.length - 1]?.timestamp,
        newestError: errorStats.recentErrors[0]?.timestamp
      }
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        'Content-Type': 'application/json'
      }
    })

  } catch (error: any) {
    console.error('Error tracking API failed:', error)
    
    // Track this error too (meta!)
    errorTracker.trackAPIError(
      error,
      {
        method: 'GET',
        url: '/api/error-tracking',
        statusCode: 500
      }
    )
    
    return NextResponse.json({
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// POST: Report a new error (for client-side error reporting)
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      message,
      level = 'error',
      context = {},
      metadata = {},
      stackTrace,
      userId
    } = body

    // Validate required fields
    if (!message) {
      return NextResponse.json({
        error: 'Bad request',
        message: 'Error message is required'
      }, { status: 400 })
    }

    // Create error object
    const error = new Error(message)
    if (stackTrace) {
      error.stack = stackTrace
    }

    // Track the error with provided context
    const errorId = errorTracker.trackError(
      error,
      level,
      {
        ...context,
        userId,
        url: context.url || request.headers.get('referer') || undefined,
        userAgent: request.headers.get('user-agent') || undefined
      },
      {
        ...metadata,
        reportedVia: 'API',
        clientReported: true
      }
    )

    return NextResponse.json({
      success: true,
      errorId,
      message: 'Error tracked successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error reporting failed:', error)
    
    return NextResponse.json({
      error: 'Failed to track error',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// DELETE: Clear error data (admin only)
export async function DELETE(request: Request) {
  try {
    const isAuthorized = await checkAuthorization(request)
    
    if (!isAuthorized) {
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Admin access required to clear error data'
      }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const confirm = searchParams.get('confirm') === 'true'
    
    if (!confirm) {
      return NextResponse.json({
        error: 'Confirmation required',
        message: 'Add ?confirm=true to confirm error data deletion'
      }, { status: 400 })
    }

    // Clear all stored errors
    errorTracker.clearErrors()
    
    return NextResponse.json({
      success: true,
      message: 'Error data cleared successfully',
      timestamp: new Date().toISOString()
    })

  } catch (error: any) {
    console.error('Error clearing failed:', error)
    
    return NextResponse.json({
      error: 'Failed to clear error data',
      message: error.message,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

// Helper: Check if user is authorized to access error data
async function checkAuthorization(request: Request): Promise<boolean> {
  try {
    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return false
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from('users')
      .select('is_admin')
      .eq('id', user.id)
      .single()
    
    return profile?.is_admin || false
  } catch {
    return false
  }
}
