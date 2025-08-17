import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createServerClient } from '@/lib/supabase/server'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
})

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const signature = request.headers.get('stripe-signature')!

    let event: Stripe.Event

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err) {
      console.error('Webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const supabase = createServerClient()

    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId

        if (userId && session.payment_status === 'paid') {
          // DISABLED: Users table causing 406 errors
          console.log('⚠️ Stripe webhook: Users table disabled - cannot update subscription')
          console.log('💰 Payment successful for user:', userId, 'but subscription not updated')
          
          // TODO: Re-enable once users table is working
          // const { error } = await supabase
          //   .from('users')
          //   .upsert({
          //     id: userId,
          //     email: session.customer_email!,
          //     subscription_level: 'premium',
          //     updated_at: new Date().toISOString(),
          //   })
          //
          // if (error) {
          //   console.error('Error updating user subscription:', error)
          // } else {
          //   console.log('User upgraded to premium:', userId)
          // }
        }
        break

      case 'customer.subscription.deleted':
        const subscription = event.data.object as Stripe.Subscription
        const customerId = subscription.customer as string

        // DISABLED: Users table causing 406 errors
        console.log('⚠️ Stripe webhook: Users table disabled - cannot downgrade subscription')
        console.log('📉 Subscription cancelled for customer:', customerId, 'but not updated in database')
        
        // TODO: Re-enable once users table is working
        // const customer = await stripe.customers.retrieve(customerId)
        // if (customer && !customer.deleted && 'email' in customer && customer.email) {
        //   const { error } = await supabase
        //     .from('users')
        //     .update({ subscription_level: 'free' })
        //     .eq('email', customer.email)
        //
        //   if (error) {
        //     console.error('Error downgrading user:', error)
        //   }
        // }
        break

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    )
  }
}