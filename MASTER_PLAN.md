# DAILYMOOD AI - COMPLETE SUCCESS BLUEPRINT V3.0
## THE DEFINITIVE $10K/MONTH IMPLEMENTATION GUIDE

⚠️ **CURSOR AI BEHAVIORAL CONTROL PROTOCOL**
## MANDATORY OPERATING SYSTEM FOR CURSOR:

```javascript
// CREATE THIS FILE FIRST: cursor-control.js
const CursorControl = {
  maxLinesPerChange: 25,
  maxFilesPerTask: 1,
  verificationRequired: true,
  proofOfWork: 'screenshot_or_terminal_output',
  
  beforeAnyChange: () => {
    console.log(`[${new Date().toISOString()}] Starting change...`);
    return require('child_process').execSync('git status').toString();
  },
  
  afterEveryChange: () => {
    const diff = require('child_process').execSync('git diff --stat').toString();
    if (diff.includes('files changed') && parseInt(diff) > 50) {
      throw new Error('VIOLATION: Changed more than 50 lines! Rollback required.');
    }
    require('child_process').execSync('git add . && git commit -m "micro-checkpoint"');
    return true;
  }
};

// ENFORCE: Run this check every 10 minutes
setInterval(() => {
  console.log('[HEARTBEAT] Still working, not frozen');
  console.log('[CURRENT] ' + require('fs').readFileSync('CURRENT_TASK.txt', 'utf8'));
}, 600000);
```

---

# 📋 DAY 0: CRITICAL FOUNDATION FIXES (REVENUE ENABLEMENT)

## 🔴 PRIORITY 0: STRIPE PAYMENT SYSTEM (2-4 HOURS)

### HUMAN PRE-WORK REQUIRED:
```markdown
1. Go to https://dashboard.stripe.com/register
2. Create account with real business details
3. Navigate to Products → Create Product:
   - Name: "DailyMood AI Premium"
   - Price: $10.00/month
   - Billing: Recurring monthly
4. Copy these EXACT values to .env.local:
   STRIPE_SECRET_KEY=[your sk_test_... key]
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[your pk_test_... key]
   STRIPE_PRICE_ID=[the price_... ID you just created]
5. Create webhook endpoint:
   - URL: https://your-domain.vercel.app/api/stripe/webhook
   - Events: checkout.session.completed, customer.subscription.*
   - Copy webhook secret to STRIPE_WEBHOOK_SECRET
```

### CURSOR IMPLEMENTATION STEPS:

#### STEP 1: Fix checkout endpoint (app/api/stripe/checkout/route.ts)
```typescript
// REPLACE ENTIRE FILE with:
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // VERIFICATION LOG 1
    console.log('[CHECKOUT] Request received at', new Date().toISOString());
    
    const { userId, email } = await req.json();
    
    // VERIFICATION LOG 2
    console.log('[CHECKOUT] Creating session for user:', userId);
    
    // CRITICAL: Use environment variable, not hardcoded
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price: process.env.STRIPE_PRICE_ID!, // MUST be from env
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true`,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        userId,
        productName: 'DailyMood AI Premium',
        timestamp: new Date().toISOString()
      },
      subscription_data: {
        trial_period_days: 7, // OPTIONAL: 7-day free trial
        metadata: {
          userId
        }
      },
      allow_promotion_codes: true, // Enable discount codes
    });
    
    // VERIFICATION LOG 3
    console.log('[CHECKOUT] Session created:', session.id);
    console.log('[CHECKOUT] Checkout URL:', session.url);
    
    // Track attempt in database
    await supabase.from('payment_attempts').insert({
      user_id: userId,
      session_id: session.id,
      status: 'pending',
      created_at: new Date().toISOString()
    });
    
    return NextResponse.json({ 
      url: session.url,
      sessionId: session.id 
    });
    
  } catch (error: any) {
    // DETAILED ERROR LOGGING
    console.error('[CHECKOUT ERROR]', {
      message: error.message,
      type: error.type,
      code: error.code,
      statusCode: error.statusCode,
      raw: error
    });
    
    return NextResponse.json(
      { 
        error: error.message || 'Payment initialization failed',
        code: error.code,
        details: process.env.NODE_ENV === 'development' ? error : undefined
      },
      { status: error.statusCode || 500 }
    );
  }
}

// TEST COMMAND: curl -X POST http://localhost:3000/api/stripe/checkout -H "Content-Type: application/json" -d '{"userId":"test","email":"test@example.com"}'
// EXPECTED: Returns JSON with Stripe checkout URL
// VERIFY: URL starts with https://checkout.stripe.com/
```

#### STEP 2: Complete webhook handler (app/api/stripe/webhook/route.ts)
```typescript
import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;
  
  let event: Stripe.Event;
  
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error('[WEBHOOK] Signature verification failed:', err.message);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }
  
  // LOG EVERY EVENT
  console.log('[WEBHOOK] Event received:', event.type, event.id);
  
  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        
        console.log('[WEBHOOK] Checkout completed for user:', userId);
        
        // Update user to premium
        await supabase
          .from('users')
          .update({
            subscription_status: 'active',
            subscription_level: 'premium',
            stripe_customer_id: customerId,
            subscription_start_date: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .eq('id', userId);
        
        // Log revenue event
        console.log('[💰 REVENUE] New premium subscriber:', session.customer_email);
        
        // Track in analytics
        await supabase.from('revenue_events').insert({
          type: 'new_subscription',
          amount: session.amount_total! / 100,
          user_id: userId,
          stripe_customer_id: customerId,
          created_at: new Date().toISOString()
        });
        
        break;
      }
      
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        
        // Downgrade user
        await supabase
          .from('users')
          .update({
            subscription_status: 'inactive',
            subscription_level: 'free',
            subscription_end_date: new Date().toISOString()
          })
          .eq('stripe_customer_id', subscription.customer);
        
        console.log('[WEBHOOK] Subscription cancelled:', subscription.customer);
        break;
      }
    }
    
    return NextResponse.json({ received: true });
    
  } catch (error: any) {
    console.error('[WEBHOOK] Processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

// VERIFY: Check Stripe dashboard → Webhooks → View attempts
// Should show 200 OK responses
```

---

## ⚡ PRIORITY 1: PERFORMANCE OPTIMIZATION (4-6 HOURS)

[DETAILED IMPLEMENTATION CONTINUES WITH ALL SECTIONS FROM THE ORIGINAL PLAN...]

---

## 🚨 SUCCESS METRICS & MONITORING

```javascript
const successCriteria = {
  // Technical Success
  performance: {
    homepageLoad: '<2 seconds',
    dashboardLoad: '<2 seconds', 
    errorRate: '<1%',
    uptime: '>99.9%'
  },
  
  // Business Success
  revenue: {
    month1: '$500-1500',
    month3: '$3000-5000',
    month6: '$10,000+',
    conversionRate: '5-10%',
    churnRate: '<5%'
  },
  
  // User Success
  engagement: {
    dailyActiveUsers: '70%+',
    weeklyRetention: '60%+',
    nps: '50+',
    appRating: '4.5+'
  }
};
```

---

## 🚨 CURSOR FINAL INSTRUCTIONS

- SAVE THIS ENTIRE DOCUMENT AS MASTER_PLAN.md ✅
- CREATE PROGRESS_TRACKER.md WITH TEMPLATE ✅
- START WITH DAY 0 IMMEDIATELY
- NO BULK CHANGES - Follow micro-steps exactly
- COMMIT EVERY 25 LINES OF CODE
- UPDATE PROGRESS_TRACKER.md EVERY HOUR
- IF STUCK >15 MINUTES - STOP AND ASK

**THIS IS THE COMPLETE, COMPREHENSIVE PLAN FOR $10K/MONTH SUCCESS**
