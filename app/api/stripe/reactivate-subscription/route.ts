import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { userId, subscriptionId } = await request.json()

    if (!userId || !subscriptionId) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Verify user owns this subscription
    const supabase = createServerClient()
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('email, stripe_customer_id')
      .eq('id', userId)
      .single()

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Get subscription from Stripe to verify ownership
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (subscription.customer !== user.stripe_customer_id) {
      return NextResponse.json(
        { error: 'Subscription not found' },
        { status: 404 }
      )
    }

    // Reactivate the subscription by removing the cancel_at_period_end flag
    const reactivatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: false
    })

    // Update user in Supabase
    const { error: updateError } = await supabase
      .from('users')
      .update({ 
        subscription_level: 'premium',
        subscription_canceled_at: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating user subscription:', updateError)
    }

    return NextResponse.json({ 
      success: true,
      subscription: {
        id: reactivatedSubscription.id,
        status: reactivatedSubscription.status,
        cancelAtPeriodEnd: reactivatedSubscription.cancel_at_period_end,
        currentPeriodEnd: new Date(reactivatedSubscription.current_period_end * 1000).toISOString()
      }
    })
  } catch (error) {
    console.error('Error reactivating subscription:', error)
    return NextResponse.json(
      { error: 'Failed to reactivate subscription' },
      { status: 500 }
    )
  }
}




