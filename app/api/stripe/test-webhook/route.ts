import { NextRequest, NextResponse } from 'next/server'

/**
 * Test webhook endpoint for development
 * Simulates Stripe webhook events without requiring actual Stripe webhooks
 */
export async function POST(req: NextRequest) {
  try {
    const { eventType, subscriptionId, userId } = await req.json()
    
    // Admin check for security
    const adminKey = req.headers.get('x-admin-key')
    if (adminKey !== 'test-webhook-key') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    console.log('🧪 Testing webhook event:', eventType)
    
    // Create mock Stripe event data
    const mockEvents = {
      'checkout.session.completed': {
        id: `evt_test_${Date.now()}`,
        type: 'checkout.session.completed',
        data: {
          object: {
            id: `cs_test_${Date.now()}`,
            subscription: subscriptionId || `sub_test_${Date.now()}`,
            metadata: {
              userId: userId || 'test-user-id'
            }
          }
        }
      },
      'customer.subscription.created': {
        id: `evt_test_${Date.now()}`,
        type: 'customer.subscription.created',
        data: {
          object: {
            id: subscriptionId || `sub_test_${Date.now()}`,
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            cancel_at_period_end: false,
            metadata: {
              userId: userId || 'test-user-id'
            }
          }
        }
      },
      'customer.subscription.updated': {
        id: `evt_test_${Date.now()}`,
        type: 'customer.subscription.updated',
        data: {
          object: {
            id: subscriptionId || `sub_test_${Date.now()}`,
            status: 'active',
            current_period_start: Math.floor(Date.now() / 1000),
            current_period_end: Math.floor((Date.now() + 30 * 24 * 60 * 60 * 1000) / 1000),
            cancel_at_period_end: true,
            metadata: {
              userId: userId || 'test-user-id'
            }
          }
        }
      },
      'customer.subscription.deleted': {
        id: `evt_test_${Date.now()}`,
        type: 'customer.subscription.deleted',
        data: {
          object: {
            id: subscriptionId || `sub_test_${Date.now()}`,
            status: 'canceled',
            current_period_start: Math.floor((Date.now() - 30 * 24 * 60 * 60 * 1000) / 1000),
            current_period_end: Math.floor(Date.now() / 1000),
            cancel_at_period_end: false,
            metadata: {
              userId: userId || 'test-user-id'
            }
          }
        }
      }
    }
    
    const mockEvent = mockEvents[eventType as keyof typeof mockEvents]
    
    if (!mockEvent) {
      return NextResponse.json(
        { error: `Unsupported test event type: ${eventType}` },
        { status: 400 }
      )
    }
    
    // Call the actual webhook handler
    const webhookResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/stripe/webhook`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'stripe-signature': 'test-signature' // This will fail signature verification, but we can modify for testing
      },
      body: JSON.stringify(mockEvent)
    })
    
    const webhookResult = await webhookResponse.text()
    
    return NextResponse.json({
      success: true,
      message: `Test webhook event ${eventType} processed`,
      mockEvent,
      webhookResponse: {
        status: webhookResponse.status,
        body: webhookResult
      }
    })
    
  } catch (error: any) {
    console.error('❌ Test webhook error:', error)
    return NextResponse.json(
      { error: 'Test webhook failed', details: error.message },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint to list available test events
 */
export async function GET() {
  return NextResponse.json({
    message: 'Stripe Webhook Test Endpoint',
    usage: 'POST with { eventType, subscriptionId?, userId? }',
    availableEvents: [
      'checkout.session.completed',
      'customer.subscription.created', 
      'customer.subscription.updated',
      'customer.subscription.deleted'
    ],
    headers: {
      'x-admin-key': 'test-webhook-key (required)'
    },
    example: {
      eventType: 'checkout.session.completed',
      userId: 'user-uuid-here',
      subscriptionId: 'sub_1234567890'
    }
  })
}


