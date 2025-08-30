import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createSupabaseServerClient } from '@/lib/supabase/server-client'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    // PRD Requirement: Verify Stripe configuration
    console.log('Stripe Config Check:', {
      hasSecretKey: !!process.env.STRIPE_SECRET_KEY,
      hasPriceId: !!process.env.STRIPE_PRICE_ID,
      hasPublicKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      baseUrl: process.env.NEXT_PUBLIC_URL
    })

    const supabase = createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { priceId } = await req.json()
    
    console.log('💳 Creating checkout session for user:', user.id)
    
    // Use authenticated user data
    const userId = user.id
    const email = user.email!
    const defaultPriceId = priceId || process.env.STRIPE_PRICE_ID
    
    // Ensure proper URL formatting for Stripe
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3009'
    const successUrl = baseUrl.startsWith('http') ? `${baseUrl}/dashboard?success=true` : `https://${baseUrl}/dashboard?success=true`
    const cancelUrl = baseUrl.startsWith('http') ? `${baseUrl}/pricing?canceled=true` : `https://${baseUrl}/pricing?canceled=true`
    
    console.log('🔗 Stripe URLs:', { successUrl, cancelUrl })
    
    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: defaultPriceId,
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: { 
        userId,
        userEmail: email 
      }
    })
    
    console.log('✅ Checkout session created:', checkoutSession.id)
    return NextResponse.json({ sessionId: checkoutSession.id })
    
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}
