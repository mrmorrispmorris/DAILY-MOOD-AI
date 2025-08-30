import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createSupabaseServerClient } from '@/lib/supabase/server-client';
import { analyticsService } from '@/lib/analytics/analytics-service';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

export async function POST(request: Request) {
  console.log('🔔 Webhook received');
  
  const supabase = createSupabaseServerClient();
  const body = await request.text();
  const signature = request.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    console.error('❌ Webhook signature verification failed:', err.message);
    return NextResponse.json(
      { error: 'Webhook signature verification failed' },
      { status: 400 }
    );
  }

  console.log('✅ Webhook verified, processing event:', event.type);

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      default:
        console.log(`🤷 Unhandled event type: ${event.type}`);
    }
  } catch (error: any) {
    console.error('❌ Error processing webhook:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }

  return NextResponse.json({ received: true });
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  console.log('💳 Processing checkout completion for session:', session.id);
  
  const userId = session.metadata?.userId;
  if (!userId) {
    console.error('❌ No userId in session metadata');
    return;
  }

  // Update user to premium status
  const { error: userError } = await supabase
    .from('users')
    .update({ 
      subscription_level: 'premium',
      updated_at: new Date().toISOString()
    })
    .eq('id', userId);

  if (userError) {
    console.error('❌ Error updating user:', userError);
    return;
  }

  // Create subscription record
  if (session.subscription) {
    const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
    
    const { error: subError } = await supabase
      .from('subscriptions')
      .upsert({
        id: subscription.id,
        user_id: userId,
        status: subscription.status,
        current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
        current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
        cancel_at_period_end: subscription.cancel_at_period_end,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });

    if (subError) {
      console.error('❌ Error creating subscription record:', subError);
    }
  }

  // Track conversion analytics
  await analyticsService.trackEvent('subscription_completed', userId, {
    subscription_id: session.subscription,
    session_id: session.id
  });

  console.log('✅ Checkout completion processed successfully');
}

async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  console.log('🆕 Processing subscription created:', subscription.id);
  
  const { error } = await supabase
    .from('subscriptions')
    .upsert({
      id: subscription.id,
      user_id: subscription.metadata?.userId || null,
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

  if (error) {
    console.error('❌ Error creating subscription:', error);
  } else {
    console.log('✅ Subscription created successfully');
  }
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  console.log('🔄 Processing subscription updated:', subscription.id);
  
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);

  if (error) {
    console.error('❌ Error updating subscription:', error);
  } else {
    console.log('✅ Subscription updated successfully');
  }
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  console.log('🗑️ Processing subscription deleted:', subscription.id);
  
  // Update subscription status
  const { error: subError } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      updated_at: new Date().toISOString()
    })
    .eq('id', subscription.id);

  if (subError) {
    console.error('❌ Error updating subscription:', subError);
  }

  // Downgrade user to free
  const { data: subscriptionData } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('id', subscription.id)
    .single();

  if (subscriptionData?.user_id) {
    const { error: userError } = await supabase
      .from('users')
      .update({ 
        subscription_level: 'free',
        updated_at: new Date().toISOString()
      })
      .eq('id', subscriptionData.user_id);

    if (userError) {
      console.error('❌ Error downgrading user:', userError);
    } else {
      console.log('✅ User downgraded to free tier');
    }
  }
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  console.log('💰 Processing successful payment for invoice:', invoice.id);
  
  // Track successful payment for analytics
  const subscriptionId = invoice.subscription as string;
  if (subscriptionId) {
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    if (subscriptionData?.user_id) {
      await analyticsService.trackEvent('payment_succeeded', subscriptionData.user_id, {
        invoice_id: invoice.id,
        amount: invoice.amount_paid,
        subscription_id: subscriptionId
      });
    }
  }

  console.log('✅ Payment success processed');
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  console.log('❌ Processing failed payment for invoice:', invoice.id);
  
  // Track failed payment for analytics
  const subscriptionId = invoice.subscription as string;
  if (subscriptionId) {
    const { data: subscriptionData } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('id', subscriptionId)
      .single();

    if (subscriptionData?.user_id) {
      await analyticsService.trackEvent('payment_failed', subscriptionData.user_id, {
        invoice_id: invoice.id,
        amount: invoice.amount_due,
        subscription_id: subscriptionId
      });
    }
  }

  console.log('✅ Payment failure processed');
}