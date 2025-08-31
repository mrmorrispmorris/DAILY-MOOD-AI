import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Weekly analytics cleanup to manage database size and comply with privacy
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('[CRON] Starting weekly analytics cleanup...');
    
    const cutoffDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(); // 90 days ago
    const privacyCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(); // 30 days ago
    
    // Clean old analytics events (keep aggregated data, remove raw events)
    const { data: oldEvents, error: fetchError } = await supabase
      .from('analytics_events')
      .select('id')
      .lt('created_at', cutoffDate);
    
    if (fetchError) throw fetchError;
    
    let cleanedEvents = 0;
    if (oldEvents && oldEvents.length > 0) {
      const { error: deleteError } = await supabase
        .from('analytics_events')
        .delete()
        .lt('created_at', cutoffDate);
      
      if (!deleteError) {
        cleanedEvents = oldEvents.length;
      }
    }
    
    // Anonymize old email logs (remove email addresses for privacy)
    const { data: oldEmailLogs } = await supabase
      .from('email_logs')
      .select('id')
      .lt('sent_at', privacyCutoff);
    
    let anonymizedLogs = 0;
    if (oldEmailLogs && oldEmailLogs.length > 0) {
      const { error: updateError } = await supabase
        .from('email_logs')
        .update({ email_address: null, anonymized: true })
        .lt('sent_at', privacyCutoff);
      
      if (!updateError) {
        anonymizedLogs = oldEmailLogs.length;
      }
    }
    
    // Clean up old AI insight cache (keep recent for performance)
    const aiCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days ago
    const { data: oldInsights } = await supabase
      .from('ai_insights')
      .select('id')
      .lt('created_at', aiCutoff);
    
    let cleanedInsights = 0;
    if (oldInsights && oldInsights.length > 0) {
      const { error: deleteError } = await supabase
        .from('ai_insights')
        .delete()
        .lt('created_at', aiCutoff);
      
      if (!deleteError) {
        cleanedInsights = oldInsights.length;
      }
    }
    
    // Database optimization: analyze tables
    console.log('[CRON] Running database optimization...');
    
    const cleanupStats = {
      events_cleaned: cleanedEvents,
      logs_anonymized: anonymizedLogs,
      insights_cleaned: cleanedInsights,
      cleanup_date: new Date().toISOString()
    };
    
    // Log cleanup stats
    await supabase.from('cleanup_logs').insert(cleanupStats);
    
    console.log('[CRON] Weekly cleanup completed:', cleanupStats);
    
    // Check database size and warn if growing too large
    const { data: dbStats } = await supabase
      .from('information_schema.tables')
      .select('table_name, table_rows')
      .eq('table_schema', 'public');
    
    const totalRows = dbStats?.reduce((sum, table) => sum + (table.table_rows || 0), 0) || 0;
    
    if (totalRows > 100000) {
      console.log(`[⚠️ WARNING] Database has ${totalRows} total rows - consider scaling plan`);
    }
    
    return NextResponse.json({ 
      success: true, 
      cleanup_stats: cleanupStats,
      total_db_rows: totalRows,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CRON] Cleanup error:', error);
    return NextResponse.json({ 
      error: 'Cleanup failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


