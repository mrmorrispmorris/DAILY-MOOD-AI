import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

// Price IDs for different plans (replace with your actual Stripe price IDs)
const PRICE_IDS = {
  premium: {
    monthly: process.env.STRIPE_PREMIUM_MONTHLY_PRICE_ID || 'price_premium_monthly',
    yearly: process.env.STRIPE_PREMIUM_YEARLY_PRICE_ID || 'price_premium_yearly'
  },
  pro: {
    monthly: process.env.STRIPE_PRO_MONTHLY_PRICE_ID || 'price_pro_monthly',
    yearly: process.env.STRIPE_PRO_YEARLY_PRICE_ID || 'price_pro_yearly'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { 
      userId, 
      email, 
      plan = 'premium', 
      interval = 'monthly',
      trial = true,
      upgrade = false,
      currentSubscriptionId = null
    } = await request.json()

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    // Get or create Stripe customer
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

    let customerId = user.stripe_customer_id

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: email,
        metadata: {
          userId: userId
        }
      })
      customerId = customer.id

      // Update user with Stripe customer ID
      await supabase
        .from('users')
        .update({ 
          stripe_customer_id: customerId,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
    }

    // Get the appropriate price ID
    const priceId = PRICE_IDS[plan as keyof typeof PRICE_IDS]?.[interval as keyof typeof PRICE_IDS.premium]
    
    if (!priceId) {
      return NextResponse.json(
        { error: 'Invalid plan or interval' },
        { status: 400 }
      )
    }

    // If upgrading, cancel current subscription first
    if (upgrade && currentSubscriptionId) {
      try {
        await stripe.subscriptions.update(currentSubscriptionId, {
          cancel_at_period_end: true
        })
      } catch (error) {
        console.error('Error canceling current subscription:', error)
        // Continue with new subscription creation
      }
    }

    // Create checkout session
    const sessionParams: Stripe.Checkout.SessionCreateParams = {
      customer: customerId,
      payment_method_types: ['card'],
      mode: 'subscription',
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&plan=${plan}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true&plan=${plan}`,
      metadata: {
        userId,
        plan,
        interval,
        trial: trial.toString(),
        upgrade: upgrade.toString()
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
          interval,
          trial: trial.toString()
        }
      }
    }

    // Add trial period if requested and not upgrading
    if (trial && !upgrade) {
      sessionParams.subscription_data = {
        ...sessionParams.subscription_data,
        trial_period_days: 7
      }
    }

    // Add billing address collection for better conversion
    sessionParams.billing_address_collection = 'required'

    // Add customer update for better conversion
    sessionParams.customer_update = {
      address: 'auto',
      name: 'auto'
    }

    // Add payment method collection for better conversion
    sessionParams.payment_method_collection = 'always'

    // Add allow_promotion_codes for better conversion
    sessionParams.allow_promotion_codes = true

    // Add phone number collection for better conversion
    sessionParams.phone_number_collection = {
      enabled: true
    }

    const session = await stripe.checkout.sessions.create(sessionParams)

    // Track conversion step
    console.log(`Checkout session created for user ${userId}, plan: ${plan}, trial: ${trial}`)

    return NextResponse.json({ 
      sessionId: session.id,
      url: session.url,
      customerId: customerId
    })
  } catch (error) {
    console.error('Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}