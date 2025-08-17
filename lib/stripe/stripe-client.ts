import { loadStripe } from '@stripe/stripe-js'
import { ErrorService } from '@/lib/error-handling/error-service'

let stripePromise: Promise<any> | null = null

// Initialize Stripe only if key is available
if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY && 
    !process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.includes('your-stripe') &&
    process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY !== 'pk_test_your-stripe-public-key') {
  console.log('✅ Stripe publishable key found, initializing Stripe')
  stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
} else {
  console.log('⚠️ Stripe not configured, payment features will be disabled')
}

export { stripePromise }

export const STRIPE_PRICE_ID = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID || 'price_1234567890'

export const createCheckoutSession = async (userId: string, email: string) => {
  if (!stripePromise) {
    throw new Error('Stripe not configured. Please set up your Stripe keys.')
  }
  
  try {
    console.log(`💳 Creating checkout session for user ${userId}`)
    const response = await fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        email,
        priceId: STRIPE_PRICE_ID,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('Checkout session creation failed:', errorText)
      throw new Error('Failed to create checkout session')
    }

    const { sessionId } = await response.json()
    console.log('✅ Checkout session created successfully')
    return sessionId
  } catch (error) {
    console.error('Error creating checkout session:', error)
    ErrorService.handleError(error, 'Stripe Checkout')
    throw error
  }
}