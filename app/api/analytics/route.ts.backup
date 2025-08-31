import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    
    // Extract event data from request
    const event_name = body.event || body.event_name;
    const user_id = body.userId || body.user_id;
    const timestamp = body.timestamp || new Date().toISOString();
    
    // Validate required fields
    if (!event_name) {
      return NextResponse.json({ error: 'Missing event name' }, { status: 400 });
    }
    
    // Track key conversion metrics for revenue optimization
    const conversionEvents = [
      'premium_prompt_shown',
      'premium_upgrade_clicked', 
      'premium_payment_started',
      'premium_payment_completed',
      'subscription_completed',
      'page_visited',
      'signup_started',
      'first_mood_logged',
      'dashboard_visited',
      'pricing_page_viewed',
      'onboarding_started',
      'onboarding_completed',
      'referral_link_copied',
      'referral_system_viewed'
    ];
    
    // Log event to console for development
    console.log(`[ANALYTICS] ${event_name}:`, {
      trigger: body.trigger,
      userId: user_id,
      timestamp
    });
    
    // Prepare event data for storage
    const eventData = {
      user_id: user_id || null, // Allow null for anonymous tracking
      event_name,
      event_data: {
        trigger: body.trigger,
        ...body.eventData,
        user_agent: req.headers.get('user-agent'),
        referer: req.headers.get('referer'),
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip')
      },
      timestamp,
      session_id: body.sessionId || null,
      page_url: body.page_url || body.pageUrl || null
    };
    
    // Store in database using new schema
    const { error } = await supabase
      .from('analytics_events')
      .insert(eventData);
    
    if (error) {
      console.error('[ANALYTICS] Database error:', error);
      // Don't fail the request for analytics errors
    }
    
    // Track specific conversion events
    if (conversionEvents.includes(event_name)) {
      console.log(`[💰 CONVERSION] ${event_name} tracked!`, {
        trigger: body.trigger,
        userId: user_id
      });
    }
    
    return NextResponse.json({ 
      success: true, 
      tracked: true, 
      event: event_name 
    });
    
  } catch (error) {
    console.error('[ANALYTICS] Error tracking event:', error);
    return NextResponse.json({ error: 'Failed to track event' }, { status: 500 });
  }
}

// GET endpoint for analytics dashboard (admin only)
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const adminKey = searchParams.get('key');
  
  if (adminKey !== process.env.ADMIN_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    // Fetch conversion funnel metrics
    const { data: events } = await supabase
      .from('analytics_events')
      .select('event_type, created_at')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });
    
    // Calculate key metrics
    const metrics = {
      totalEvents: events?.length || 0,
      premiumPrompts: events?.filter(e => e.event_type === 'premium_prompt_shown').length || 0,
      upgradeClicks: events?.filter(e => e.event_type === 'premium_upgrade_clicked').length || 0,
      completedPayments: events?.filter(e => e.event_type === 'premium_payment_completed').length || 0,
      conversionRate: 0,
      last30Days: true
    };
    
    // Calculate conversion rate
    if (metrics.premiumPrompts > 0) {
      metrics.conversionRate = parseFloat(((metrics.upgradeClicks / metrics.premiumPrompts) * 100).toFixed(2));
    }
    
    return NextResponse.json(metrics);
    
  } catch (error) {
    console.error('[ANALYTICS] Error fetching metrics:', error);
    return NextResponse.json({ error: 'Failed to fetch metrics' }, { status: 500 });
  }
}
