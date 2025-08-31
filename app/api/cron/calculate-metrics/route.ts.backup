import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Daily metrics calculation for business intelligence
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('[CRON] Starting daily metrics calculation...');
    
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    // Calculate key business metrics
    const [
      { data: totalUsers },
      { data: newUsers },
      { data: premiumUsers },
      { data: moodEntries },
      { data: analyticsEvents }
    ] = await Promise.all([
      supabase.from('users').select('id', { count: 'exact', head: true }),
      supabase.from('users').select('id', { count: 'exact', head: true }).gte('created_at', yesterday),
      supabase.from('users').select('id', { count: 'exact', head: true }).eq('subscription_level', 'premium'),
      supabase.from('mood_entries').select('id', { count: 'exact', head: true }).gte('created_at', yesterday),
      supabase.from('analytics_events').select('id', { count: 'exact', head: true }).gte('created_at', yesterday)
    ]);
    
    // Calculate conversion metrics
    const { data: conversionEvents } = await supabase
      .from('analytics_events')
      .select('event_type')
      .gte('created_at', yesterday)
      .in('event_type', ['premium_prompt_shown', 'premium_upgrade_clicked', 'premium_payment_completed']);
    
    const promptShown = conversionEvents?.filter(e => e.event_type === 'premium_prompt_shown').length || 0;
    const upgradeClicked = conversionEvents?.filter(e => e.event_type === 'premium_upgrade_clicked').length || 0;
    const paymentCompleted = conversionEvents?.filter(e => e.event_type === 'premium_payment_completed').length || 0;
    
    const conversionRate = promptShown > 0 ? ((upgradeClicked / promptShown) * 100).toFixed(2) : '0.00';
    const paymentRate = upgradeClicked > 0 ? ((paymentCompleted / upgradeClicked) * 100).toFixed(2) : '0.00';
    
    // Calculate estimated MRR
    const estimatedMRR = (premiumUsers?.length || 0) * 10; // $10/month per premium user
    
    const metrics = {
      date: today,
      total_users: totalUsers?.length || 0,
      new_users_24h: newUsers?.length || 0,
      premium_users: premiumUsers?.length || 0,
      mood_entries_24h: moodEntries?.length || 0,
      analytics_events_24h: analyticsEvents?.length || 0,
      conversion_rate: conversionRate,
      payment_completion_rate: paymentRate,
      estimated_mrr: estimatedMRR,
      prompt_shown_24h: promptShown,
      upgrade_clicked_24h: upgradeClicked,
      payment_completed_24h: paymentCompleted
    };
    
    // Store daily metrics
    await supabase.from('daily_metrics').insert(metrics);
    
    console.log('[CRON] Daily metrics calculated:', metrics);
    
    // Log significant achievements
    if (estimatedMRR >= 1000) {
      console.log(`[🎉 MILESTONE] Estimated MRR: $${estimatedMRR}/month!`);
    }
    if ((newUsers?.length || 0) >= 10) {
      console.log(`[🚀 GROWTH] ${newUsers?.length} new users in 24h!`);
    }
    
    return NextResponse.json({ 
      success: true, 
      metrics,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CRON] Metrics calculation error:', error);
    return NextResponse.json({ 
      error: 'Metrics calculation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


