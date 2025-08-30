import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient()
    const body = await req.json()
    const subscriptionId = body.subscriptionId || body.userId // Support both new and legacy formats
    
    if (!subscriptionId) {
      return NextResponse.json(
        { error: 'Missing subscriptionId' },
        { status: 400 }
      )
    }
    
    console.log('🗑️ Canceling subscription:', subscriptionId)
    
    // If it's a userId (legacy), get the subscription ID
    let stripeSubscriptionId = subscriptionId
    if (subscriptionId.length === 36) { // UUID length, probably userId
      const { data: subscription, error } = await supabase
        .from('subscriptions')
        .select('id')
        .eq('user_id', subscriptionId)
        .eq('status', 'active')
        .single()
      
      if (error || !subscription) {
        return NextResponse.json(
          { error: 'No active subscription found' },
          { status: 404 }
        )
      }
      
      stripeSubscriptionId = subscription.id
    }
    
    // Cancel the subscription at Stripe (at period end to maintain access)
    const canceledSubscription = await stripe.subscriptions.update(
      stripeSubscriptionId,
      {
        cancel_at_period_end: true,
        metadata: {
          canceled_by_user: 'true',
          canceled_at: new Date().toISOString()
        }
      }
    )
    
    // Update local database
    await supabase
      .from('subscriptions')
      .update({
        cancel_at_period_end: true,
        canceled_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', stripeSubscriptionId)
    
    console.log('✅ Subscription marked for cancellation at period end:', canceledSubscription.id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      current_period_end: new Date(canceledSubscription.current_period_end * 1000).toISOString(),
      access_until: new Date(canceledSubscription.current_period_end * 1000).toISOString()
    })
    
  } catch (error: any) {
    console.error('❌ Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    )
  }
}

