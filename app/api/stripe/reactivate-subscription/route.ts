import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const { subscriptionId } = await req.json()
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 }
      )
    }
    
    console.log('🔄 Reactivating subscription:', subscriptionId)
    
    // Check if subscription exists and is marked for cancellation
    const { data: subscription, error: dbError } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('id', subscriptionId)
      .eq('status', 'active')
      .single()
    
    if (dbError || !subscription) {
      return NextResponse.json(
        { error: 'Subscription not found or not active' },
        { status: 404 }
      )
    }

    if (!subscription.cancel_at_period_end) {
      return NextResponse.json(
        { error: 'Subscription is not scheduled for cancellation' },
        { status: 400 }
      )
    }
    
    // Reactivate the subscription at Stripe
    const reactivatedSubscription = await stripe.subscriptions.update(
      subscriptionId,
      {
        cancel_at_period_end: false,
        metadata: {
          reactivated_by_user: 'true',
          reactivated_at: new Date().toISOString()
        }
      }
    )
    
    // Update local database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: false,
        canceled_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionId)
    
    console.log('✅ Subscription reactivated successfully:', reactivatedSubscription.id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription has been reactivated',
      subscription_id: reactivatedSubscription.id,
      status: reactivatedSubscription.status,
      current_period_end: new Date(reactivatedSubscription.current_period_end * 1000).toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription', details: error.message },
      { status: 500 }
    )
  }
}


