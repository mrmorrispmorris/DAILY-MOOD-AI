import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
})

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const subscriptionId = searchParams.get('subscription_id')
    
    if (!subscriptionId) {
      return NextResponse.json({ error: 'Missing subscription ID' }, { status: 400 })
    }

    // Get the subscription to find the customer
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    
    if (!subscription.customer) {
      return NextResponse.json({ error: 'No customer found' }, { status: 404 })
    }

    // Create customer portal session
    const portalSession = await stripe.billingPortal.sessions.create({
      customer: subscription.customer as string,
      return_url: `${process.env.NEXT_PUBLIC_URL}/dashboard`
    })

    // Redirect to customer portal
    return NextResponse.redirect(portalSession.url)
    
  } catch (error: any) {
    console.error('Customer portal error:', error)
    return NextResponse.json(
      { error: 'Failed to create customer portal session' }, 
      { status: 500 }
    )
  }
}


