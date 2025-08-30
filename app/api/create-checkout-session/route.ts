import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { supabase } from '@/app/lib/supabase-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

export async function POST(request: NextRequest) {
  try {
    // Get user from request
    const { userId, email, priceId } = await request.json()
    
    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      )
    }

    // Use default premium price if none provided
    const selectedPriceId = priceId || process.env.STRIPE_PREMIUM_PRICE_ID

    if (!selectedPriceId) {
      return NextResponse.json(
        { error: 'No price ID configured' },
        { status: 500 }
      )
    }

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      customer_email: email,
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/dashboard?payment=cancelled`,
      metadata: {
        userId: userId,
      },
      subscription_data: {
        metadata: {
          userId: userId,
        },
      },
    })

    // Log checkout attempt
    await supabase
      .from('checkout_sessions')
      .insert({
        user_id: userId,
        session_id: session.id,
        status: 'pending',
        price_id: selectedPriceId,
      })
      .select()

    return NextResponse.json({ url: session.url })
    
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}

