import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function POST(req: Request) {
  try {
    const { userId, email, priceId } = await req.json()
    
    console.log('💳 Creating checkout session for:', { userId, email, priceId })
    
    if (!userId || !email || !priceId) {
      return NextResponse.json(
        { error: 'Missing required parameters: userId, email, priceId' },
        { status: 400 }
      )
    }
    
    // Ensure proper URL formatting for Stripe
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const successUrl = baseUrl.startsWith('http') ? `${baseUrl}/dashboard?success=true` : `https://${baseUrl}/dashboard?success=true`
    const cancelUrl = baseUrl.startsWith('http') ? `${baseUrl}/pricing?canceled=true` : `https://${baseUrl}/pricing?canceled=true`
    
    console.log('🔗 Stripe URLs:', { successUrl, cancelUrl })
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: priceId,
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
    
    console.log('✅ Checkout session created:', session.id)
    return NextResponse.json({ sessionId: session.id })
    
  } catch (error: any) {
    console.error('❌ Error creating checkout session:', error)
    return NextResponse.json(
      { error: 'Failed to create checkout session', details: error.message },
      { status: 500 }
    )
  }
}
