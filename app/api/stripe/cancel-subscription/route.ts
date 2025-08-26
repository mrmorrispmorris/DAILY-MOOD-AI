import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/app/lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    const { userId } = await req.json()
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId' },
        { status: 400 }
      )
    }
    
    console.log('🗑️ Canceling subscription for user:', userId)
    
    // Get user's active subscription
    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('stripe_subscription_id, status')
      .eq('user_id', userId)
      .eq('status', 'active')
      .single()
    
    if (error || !subscription) {
      return NextResponse.json(
        { error: 'No active subscription found' },
        { status: 404 }
      )
    }
    
    // Cancel the subscription at Stripe (at period end)
    const canceledSubscription = await stripe.subscriptions.update(
      subscription.stripe_subscription_id,
      {
        cancel_at_period_end: true,
        metadata: {
          canceled_by_user: 'true',
          canceled_at: new Date().toISOString()
        }
      }
    )
    
    console.log('✅ Subscription marked for cancellation at period end:', canceledSubscription.id)
    
    return NextResponse.json({ 
      success: true,
      message: 'Subscription will be canceled at the end of the current billing period',
      cancel_at_period_end: canceledSubscription.cancel_at_period_end,
      current_period_end: new Date(canceledSubscription.current_period_end * 1000)
    })
    
  } catch (error: any) {
    console.error('❌ Error canceling subscription:', error)
    return NextResponse.json(
      { error: 'Failed to cancel subscription', details: error.message },
      { status: 500 }
    )
  }
}

