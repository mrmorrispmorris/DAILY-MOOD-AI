import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      )
    }

    // Get user from Supabase
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

    // If user has no Stripe customer ID, return free status
    if (!user.stripe_customer_id) {
      return NextResponse.json({
        subscription: {
          id: null,
          status: 'free',
          currentPeriodEnd: null,
          trialEnd: null,
          plan: 'Free',
          price: 0,
          interval: 'month',
          cancelAtPeriodEnd: false
        }
      })
    }

    // Get subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: user.stripe_customer_id,
      status: 'all',
      expand: ['data.default_payment_method']
    })

    if (subscriptions.data.length === 0) {
      return NextResponse.json({
        subscription: {
          id: null,
          status: 'free',
          currentPeriodEnd: null,
          trialEnd: null,
          plan: 'Free',
          price: 0,
          interval: 'month',
          cancelAtPeriodEnd: false
        }
      })
    }

    // Get the most recent active subscription
    const subscription = subscriptions.data[0]
    const price = subscription.items.data[0]?.price

    if (!price) {
      return NextResponse.json(
        { error: 'Invalid subscription price' },
        { status: 400 }
      )
    }

    // Map Stripe status to our status
    const getStatus = (stripeStatus: string) => {
      switch (stripeStatus) {
        case 'active':
          return subscription.trial_end ? 'trialing' : 'active'
        case 'trialing':
          return 'trialing'
        case 'past_due':
          return 'past_due'
        case 'canceled':
          return 'canceled'
        case 'incomplete':
          return 'incomplete'
        default:
          return 'unknown'
      }
    }

    // Map price ID to plan name
    const getPlanName = (priceId: string) => {
      const planMap: { [key: string]: string } = {
        'price_premium_monthly': 'Premium',
        'price_premium_yearly': 'Premium',
        'price_pro_monthly': 'Pro',
        'price_pro_yearly': 'Pro'
      }
      return planMap[priceId] || 'Premium'
    }

    const subscriptionDetails = {
      id: subscription.id,
      status: getStatus(subscription.status),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
      trialEnd: subscription.trial_end ? new Date(subscription.trial_end * 1000).toISOString() : null,
      plan: getPlanName(price.id),
      price: price.unit_amount ? price.unit_amount / 100 : 0,
      interval: price.recurring?.interval || 'month',
      cancelAtPeriodEnd: subscription.cancel_at_period_end
    }

    return NextResponse.json({ subscription: subscriptionDetails })
  } catch (error) {
    console.error('Error fetching subscription details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch subscription details' },
      { status: 500 }
    )
  }
}




