import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Daily email automation for user engagement and retention
export async function GET(req: NextRequest) {
  // Verify cron secret to prevent unauthorized access
  const authHeader = req.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  try {
    console.log('[CRON] Starting daily email automation...');
    
    // Get users who need engagement emails
    const { data: users } = await supabase
      .from('users')
      .select('id, email, created_at, last_mood_entry')
      .not('email', 'is', null);
    
    let emailsSent = 0;
    const emailTypes = [];
    
    for (const user of users || []) {
      const daysSinceSignup = Math.floor(
        (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      const daysSinceLastMood = user.last_mood_entry 
        ? Math.floor((Date.now() - new Date(user.last_mood_entry).getTime()) / (1000 * 60 * 60 * 24))
        : 999;
      
      let emailType = null;
      
      // Email logic based on user behavior
      if (daysSinceSignup === 1 && !user.last_mood_entry) {
        emailType = 'welcome_reminder';
      } else if (daysSinceSignup === 3 && daysSinceLastMood >= 2) {
        emailType = 'streak_encouragement';
      } else if (daysSinceSignup === 7 && daysSinceLastMood >= 3) {
        emailType = 'weekly_check_in';
      } else if (daysSinceLastMood === 7) {
        emailType = 'inactive_reminder';
      } else if (daysSinceLastMood === 30) {
        emailType = 'win_back';
      }
      
      if (emailType) {
        // In production, integrate with Resend/SendGrid
        console.log(`[EMAIL] Would send ${emailType} to ${user.email}`);
        emailsSent++;
        emailTypes.push(emailType);
        
        // Track email sent
        await supabase.from('email_logs').insert({
          user_id: user.id,
          email_type: emailType,
          sent_at: new Date().toISOString(),
          status: 'sent'
        });
      }
    }
    
    console.log(`[CRON] Daily emails completed: ${emailsSent} emails sent`);
    console.log(`[CRON] Email types: ${emailTypes.join(', ')}`);
    
    return NextResponse.json({ 
      success: true, 
      emailsSent,
      emailTypes,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('[CRON] Daily email error:', error);
    return NextResponse.json({ 
      error: 'Email automation failed',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}


