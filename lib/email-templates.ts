// Professional email templates for DailyMood AI automation

export interface EmailTemplate {
  subject: string
  html: string
  text: string
}

export interface EmailData {
  userEmail: string
  userName?: string
  userStreak?: number
  moodAverage?: number
  lastMoodDate?: string
  unsubscribeUrl?: string
  dashboardUrl?: string
  appUrl?: string
}

// Welcome email for new users
export const welcomeEmail = (data: EmailData): EmailTemplate => ({
  subject: "Welcome to your emotional wellness journey! 🧠✨",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to DailyMood AI</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px; }
        .content { padding: 40px 30px; }
        .feature { display: flex; align-items: flex-start; margin-bottom: 30px; }
        .feature-icon { font-size: 24px; margin-right: 15px; margin-top: 5px; }
        .feature-content h3 { margin: 0 0 8px 0; color: #1a202c; font-size: 18px; }
        .feature-content p { margin: 0; color: #4a5568; line-height: 1.6; }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          border-radius: 25px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .cta-center { text-align: center; }
        .footer { background-color: #f7fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; }
        .unsubscribe { color: #a0aec0; text-decoration: underline; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧠 Welcome to DailyMood AI!</h1>
          <p>Your journey to better emotional wellness starts now</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2d3748; margin-bottom: 25px;">Hi${data.userName ? ` ${data.userName}` : ''}! 👋</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 30px;">
            Thank you for joining DailyMood AI! You've taken an important step towards understanding and improving your emotional well-being.
          </p>
          
          <div class="feature">
            <div class="feature-icon">📊</div>
            <div class="feature-content">
              <h3>Track Your Emotions</h3>
              <p>Log your daily moods with just one tap and watch patterns emerge over time.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🤖</div>
            <div class="feature-content">
              <h3>AI-Powered Insights</h3>
              <p>Get personalized recommendations and insights powered by advanced AI technology.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">📈</div>
            <div class="feature-content">
              <h3>Beautiful Visualizations</h3>
              <p>See your emotional journey through stunning charts and calendar views.</p>
            </div>
          </div>
          
          <div class="cta-center">
            <a href="${data.dashboardUrl || data.appUrl}/log-mood" class="cta-button">
              Log Your First Mood 🎯
            </a>
          </div>
          
          <p style="font-size: 14px; color: #718096; margin-top: 30px; padding: 20px; background-color: #f7fafc; border-radius: 10px;">
            💡 <strong>Pro Tip:</strong> The best results come from consistent tracking. Try to log your mood at the same time each day!
          </p>
        </div>
        
        <div class="footer">
          <p>Happy mood tracking!</p>
          <p>The DailyMood AI Team</p>
          ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}" class="unsubscribe">Unsubscribe from these emails</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
Welcome to DailyMood AI! 🧠

Hi${data.userName ? ` ${data.userName}` : ''}!

Thank you for joining DailyMood AI! You've taken an important step towards understanding and improving your emotional well-being.

What you can do with DailyMood AI:

📊 Track Your Emotions
Log your daily moods with just one tap and watch patterns emerge over time.

🤖 AI-Powered Insights
Get personalized recommendations and insights powered by advanced AI technology.

📈 Beautiful Visualizations
See your emotional journey through stunning charts and calendar views.

Ready to get started? Log your first mood: ${data.dashboardUrl || data.appUrl}/log-mood

Pro Tip: The best results come from consistent tracking. Try to log your mood at the same time each day!

Happy mood tracking!
The DailyMood AI Team

${data.unsubscribeUrl ? `Unsubscribe: ${data.unsubscribeUrl}` : ''}
  `
})

// Streak celebration email
export const streakEmail = (data: EmailData): EmailTemplate => ({
  subject: `🔥 Amazing! You're on a ${data.userStreak}-day mood tracking streak!`,
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Celebration Time!</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 32px; font-weight: bold; }
        .header p { color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 18px; }
        .content { padding: 40px 30px; text-align: center; }
        .streak-display { 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          padding: 30px;
          border-radius: 20px;
          margin: 30px 0;
        }
        .streak-number { font-size: 48px; font-weight: bold; margin: 10px 0; }
        .benefits { text-align: left; margin: 30px 0; }
        .benefit { margin-bottom: 15px; display: flex; align-items: center; }
        .benefit-icon { margin-right: 10px; font-size: 20px; }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          border-radius: 25px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .footer { background-color: #f7fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Incredible streak!</h1>
          <p>You're building an amazing habit</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2d3748;">Hey${data.userName ? ` ${data.userName}` : ''}, you're on fire! 🔥</h2>
          
          <div class="streak-display">
            <div style="font-size: 24px;">🏆 CURRENT STREAK</div>
            <div class="streak-number">${data.userStreak}</div>
            <div style="font-size: 18px;">consecutive days</div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568; margin-bottom: 25px;">
            Consistency is the key to emotional wellness, and you're absolutely crushing it! 
            ${data.moodAverage ? `Your average mood score is ${data.moodAverage}/5 - keep up the excellent work!` : ''}
          </p>
          
          <div class="benefits">
            <h3 style="color: #2d3748; text-align: center; margin-bottom: 20px;">What this streak means:</h3>
            
            <div class="benefit">
              <span class="benefit-icon">🧠</span>
              <span>You're developing better emotional self-awareness</span>
            </div>
            
            <div class="benefit">
              <span class="benefit-icon">📊</span>
              <span>Your mood data is becoming more valuable for insights</span>
            </div>
            
            <div class="benefit">
              <span class="benefit-icon">💪</span>
              <span>You're building a powerful mental health habit</span>
            </div>
            
            <div class="benefit">
              <span class="benefit-icon">🎯</span>
              <span>You're getting closer to your wellness goals</span>
            </div>
          </div>
          
          <a href="${data.dashboardUrl || data.appUrl}/dashboard" class="cta-button">
            View Your Progress 📈
          </a>
          
          ${data.userStreak && data.userStreak >= 7 ? `
            <div style="margin-top: 30px; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); border-radius: 15px; color: white;">
              <h3 style="margin-top: 0; color: white;">🚀 Ready for Premium?</h3>
              <p style="margin-bottom: 15px;">You've proven you're serious about mood tracking! Unlock AI insights, unlimited history, and advanced analytics.</p>
              <a href="${data.appUrl}/pricing" style="color: white; text-decoration: underline;">Explore Premium Features →</a>
            </div>
          ` : ''}
        </div>
        
        <div class="footer">
          <p>Keep the momentum going!</p>
          <p>The DailyMood AI Team</p>
          ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}" style="color: #a0aec0; text-decoration: underline;">Unsubscribe</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
🔥 Amazing! You're on a ${data.userStreak}-day mood tracking streak!

Hey${data.userName ? ` ${data.userName}` : ''}, you're on fire!

🏆 CURRENT STREAK: ${data.userStreak} consecutive days

Consistency is the key to emotional wellness, and you're absolutely crushing it! 
${data.moodAverage ? `Your average mood score is ${data.moodAverage}/5 - keep up the excellent work!` : ''}

What this streak means:
🧠 You're developing better emotional self-awareness
📊 Your mood data is becoming more valuable for insights  
💪 You're building a powerful mental health habit
🎯 You're getting closer to your wellness goals

View your progress: ${data.dashboardUrl || data.appUrl}/dashboard

Keep the momentum going!
The DailyMood AI Team

${data.unsubscribeUrl ? `Unsubscribe: ${data.unsubscribeUrl}` : ''}
  `
})

// Re-engagement email for inactive users
export const reEngagementEmail = (data: EmailData): EmailTemplate => ({
  subject: "We miss you! Your mood tracking journey is waiting ❤️",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>We Miss You</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; }
        .header h1 { color: white; margin: 0; font-size: 28px; font-weight: bold; }
        .content { padding: 40px 30px; }
        .highlight-box { background: #f7fafc; padding: 25px; border-radius: 15px; margin: 25px 0; border-left: 4px solid #667eea; }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          border-radius: 25px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .footer { background-color: #f7fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💙 We miss you!</h1>
          <div style="font-size: 48px; margin: 10px 0;">😊</div>
        </div>
        
        <div class="content">
          <h2 style="color: #2d3748;">Hi${data.userName ? ` ${data.userName}` : ''}!</h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            We noticed you haven't logged your mood in a while${data.lastMoodDate ? ` (last entry: ${new Date(data.lastMoodDate).toLocaleDateString()})` : ''}. 
            Your emotional wellness journey is important, and we're here to support you every step of the way.
          </p>
          
          <div class="highlight-box">
            <h3 style="color: #2d3748; margin-top: 0;">🎯 Just 30 seconds a day</h3>
            <p style="color: #4a5568; margin-bottom: 0;">
              That's all it takes to check in with yourself and build a powerful habit that can transform your emotional well-being.
            </p>
          </div>
          
          <h3 style="color: #2d3748;">What's new since you've been away:</h3>
          <ul style="color: #4a5568; line-height: 1.8;">
            <li>🎨 <strong>Beautiful new mood entry interface</strong> - faster and more intuitive than ever</li>
            <li>📅 <strong>Calendar view</strong> - see your emotional patterns at a glance</li>
            <li>🤖 <strong>Enhanced AI insights</strong> - get personalized recommendations for better moods</li>
            <li>📱 <strong>Improved mobile experience</strong> - track moods anywhere, anytime</li>
          </ul>
          
          <div style="text-align: center; margin: 35px 0;">
            <a href="${data.dashboardUrl || data.appUrl}/log-mood" class="cta-button">
              Continue Your Journey 🚀
            </a>
          </div>
          
          <div class="highlight-box">
            <h3 style="color: #2d3748; margin-top: 0;">💡 Remember:</h3>
            <p style="color: #4a5568; margin-bottom: 0;">
              Emotional wellness is a journey, not a destination. Every day is a new opportunity to check in with yourself 
              and build resilience for whatever life brings your way.
            </p>
          </div>
          
          <p style="font-size: 14px; color: #718096; margin-top: 25px;">
            If you need help getting back on track or have any questions, just reply to this email. We're here to help! 💚
          </p>
        </div>
        
        <div class="footer">
          <p>Rooting for your success!</p>
          <p>The DailyMood AI Team</p>
          ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}" style="color: #a0aec0; text-decoration: underline;">Unsubscribe</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
We miss you! Your mood tracking journey is waiting ❤️

Hi${data.userName ? ` ${data.userName}` : ''}!

We noticed you haven't logged your mood in a while${data.lastMoodDate ? ` (last entry: ${new Date(data.lastMoodDate).toLocaleDateString()})` : ''}. Your emotional wellness journey is important, and we're here to support you every step of the way.

🎯 Just 30 seconds a day
That's all it takes to check in with yourself and build a powerful habit that can transform your emotional well-being.

What's new since you've been away:
• 🎨 Beautiful new mood entry interface - faster and more intuitive than ever
• 📅 Calendar view - see your emotional patterns at a glance  
• 🤖 Enhanced AI insights - get personalized recommendations for better moods
• 📱 Improved mobile experience - track moods anywhere, anytime

Continue your journey: ${data.dashboardUrl || data.appUrl}/log-mood

💡 Remember: Emotional wellness is a journey, not a destination. Every day is a new opportunity to check in with yourself and build resilience for whatever life brings your way.

If you need help getting back on track or have any questions, just reply to this email. We're here to help! 💚

Rooting for your success!
The DailyMood AI Team

${data.unsubscribeUrl ? `Unsubscribe: ${data.unsubscribeUrl}` : ''}
  `
})

// Premium upgrade email
export const premiumUpgradeEmail = (data: EmailData): EmailTemplate => ({
  subject: "🚀 Ready to supercharge your emotional wellness?",
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Upgrade to Premium</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .feature { 
          display: flex; 
          align-items: flex-start; 
          margin-bottom: 25px; 
          padding: 20px; 
          border-radius: 12px; 
          background: linear-gradient(135deg, #667eea1a, #764ba21a);
        }
        .feature-icon { font-size: 24px; margin-right: 15px; margin-top: 5px; }
        .pricing { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 30px; 
          border-radius: 20px; 
          text-align: center; 
          margin: 30px 0; 
        }
        .cta-button { 
          display: inline-block; 
          background: white; 
          color: #667eea; 
          padding: 15px 30px; 
          border-radius: 25px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .footer { background-color: #f7fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🚀 Ready for Premium?</h1>
          <p style="font-size: 18px;">Unlock the full power of AI-driven emotional wellness</p>
        </div>
        
        <div class="content">
          <p style="font-size: 16px; line-height: 1.6; color: #4a5568;">
            Hi${data.userName ? ` ${data.userName}` : ''}! You've been doing an amazing job tracking your moods${data.userStreak ? ` with your ${data.userStreak}-day streak` : ''}. 
            Ready to take your emotional wellness to the next level?
          </p>
          
          <h2 style="color: #2d3748; text-align: center; margin: 40px 0 30px;">✨ Premium Features</h2>
          
          <div class="feature">
            <div class="feature-icon">🤖</div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a202c;">AI-Powered Insights</h3>
              <p style="margin: 0; color: #4a5568;">Get personalized recommendations and predictions based on your unique mood patterns using GPT-4 technology.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">📊</div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a202c;">Advanced Analytics</h3>
              <p style="margin: 0; color: #4a5568;">Dive deep into your emotional patterns with detailed charts, correlations, and trend analysis.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">📝</div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a202c;">Unlimited History</h3>
              <p style="margin: 0; color: #4a5568;">Access your complete mood history with no limits. Track your progress over months and years.</p>
            </div>
          </div>
          
          <div class="feature">
            <div class="feature-icon">🎯</div>
            <div>
              <h3 style="margin: 0 0 8px 0; color: #1a202c;">Goal Setting & Tracking</h3>
              <p style="margin: 0; color: #4a5568;">Set emotional wellness goals and track your progress with intelligent milestone celebrations.</p>
            </div>
          </div>
          
          <div class="pricing">
            <h2 style="margin: 0 0 10px; font-size: 24px;">Special Launch Offer</h2>
            <div style="font-size: 48px; font-weight: bold; margin: 15px 0;">$10<span style="font-size: 18px;">/month</span></div>
            <p style="margin: 10px 0 20px; opacity: 0.9;">7-day free trial • Cancel anytime</p>
            <a href="${data.appUrl}/pricing" class="cta-button">Start Free Trial →</a>
          </div>
          
          <p style="font-size: 14px; color: #718096; text-align: center; margin-top: 30px;">
            💚 Join thousands of users who have transformed their emotional wellness with Premium
          </p>
        </div>
        
        <div class="footer">
          <p>Invest in your emotional future!</p>
          <p>The DailyMood AI Team</p>
          ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}" style="color: #a0aec0; text-decoration: underline;">Unsubscribe</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
🚀 Ready to supercharge your emotional wellness?

Hi${data.userName ? ` ${data.userName}` : ''}! You've been doing an amazing job tracking your moods${data.userStreak ? ` with your ${data.userStreak}-day streak` : ''}. Ready to take your emotional wellness to the next level?

✨ Premium Features:

🤖 AI-Powered Insights
Get personalized recommendations and predictions based on your unique mood patterns using GPT-4 technology.

📊 Advanced Analytics  
Dive deep into your emotional patterns with detailed charts, correlations, and trend analysis.

📝 Unlimited History
Access your complete mood history with no limits. Track your progress over months and years.

🎯 Goal Setting & Tracking
Set emotional wellness goals and track your progress with intelligent milestone celebrations.

Special Launch Offer: $10/month
7-day free trial • Cancel anytime

Start your free trial: ${data.appUrl}/pricing

💚 Join thousands of users who have transformed their emotional wellness with Premium

Invest in your emotional future!
The DailyMood AI Team

${data.unsubscribeUrl ? `Unsubscribe: ${data.unsubscribeUrl}` : ''}
  `
})

// Weekly summary email
export const weeklySummaryEmail = (data: EmailData & { 
  weeklyAverage?: number
  weeklyEntries?: number
  topMoods?: string[]
  insights?: string[]
}): EmailTemplate => ({
  subject: `📊 Your weekly mood summary - ${data.weeklyAverage ? `${data.weeklyAverage}/5 avg` : 'Great progress'}!`,
  html: `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Weekly Summary</title>
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; }
        .container { max-width: 600px; margin: 0 auto; background-color: white; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white; }
        .content { padding: 40px 30px; }
        .stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 25px 0; }
        .stat-card { background: #f7fafc; padding: 20px; border-radius: 12px; text-align: center; }
        .stat-number { font-size: 24px; font-weight: bold; color: #2d3748; margin-bottom: 5px; }
        .stat-label { font-size: 14px; color: #718096; }
        .insight-box { background: linear-gradient(135deg, #667eea1a, #764ba21a); padding: 20px; border-radius: 12px; margin: 20px 0; }
        .cta-button { 
          display: inline-block; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          padding: 15px 30px; 
          border-radius: 25px; 
          text-decoration: none; 
          font-weight: bold; 
          margin: 20px 0;
        }
        .footer { background-color: #f7fafc; padding: 30px; text-align: center; font-size: 14px; color: #718096; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 Weekly Summary</h1>
          <p>Your emotional wellness recap</p>
        </div>
        
        <div class="content">
          <h2 style="color: #2d3748;">Great week${data.userName ? `, ${data.userName}` : ''}! 🌟</h2>
          
          <p style="color: #4a5568; line-height: 1.6;">
            Here's a summary of your emotional wellness journey over the past 7 days.
          </p>
          
          <div class="stat-grid">
            <div class="stat-card">
              <div class="stat-number">${data.weeklyAverage || '0'}</div>
              <div class="stat-label">Average Mood</div>
            </div>
            <div class="stat-card">
              <div class="stat-number">${data.weeklyEntries || '0'}</div>
              <div class="stat-label">Entries This Week</div>
            </div>
          </div>
          
          ${data.topMoods && data.topMoods.length > 0 ? `
            <div class="insight-box">
              <h3 style="color: #2d3748; margin-top: 0;">🎯 Most Common Feelings</h3>
              <p style="color: #4a5568; margin-bottom: 0;">
                ${data.topMoods.slice(0, 3).join(', ')}
              </p>
            </div>
          ` : ''}
          
          ${data.insights && data.insights.length > 0 ? `
            <div class="insight-box">
              <h3 style="color: #2d3748; margin-top: 0;">💡 Key Insights</h3>
              <ul style="color: #4a5568; margin-bottom: 0;">
                ${data.insights.map(insight => `<li>${insight}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${data.dashboardUrl || data.appUrl}/dashboard" class="cta-button">
              View Full Dashboard 📈
            </a>
          </div>
          
          <p style="font-size: 14px; color: #718096; text-align: center;">
            Keep up the amazing work! Consistent tracking is key to understanding your emotional patterns.
          </p>
        </div>
        
        <div class="footer">
          <p>Here's to another great week ahead!</p>
          <p>The DailyMood AI Team</p>
          ${data.unsubscribeUrl ? `<p><a href="${data.unsubscribeUrl}" style="color: #a0aec0; text-decoration: underline;">Unsubscribe</a></p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `,
  text: `
📊 Your weekly mood summary - ${data.weeklyAverage ? `${data.weeklyAverage}/5 avg` : 'Great progress'}!

Great week${data.userName ? `, ${data.userName}` : ''}! 🌟

Here's a summary of your emotional wellness journey over the past 7 days.

Weekly Stats:
• Average Mood: ${data.weeklyAverage || '0'}/5
• Entries This Week: ${data.weeklyEntries || '0'}

${data.topMoods && data.topMoods.length > 0 ? `
🎯 Most Common Feelings: ${data.topMoods.slice(0, 3).join(', ')}
` : ''}

${data.insights && data.insights.length > 0 ? `
💡 Key Insights:
${data.insights.map(insight => `• ${insight}`).join('\n')}
` : ''}

View your full dashboard: ${data.dashboardUrl || data.appUrl}/dashboard

Keep up the amazing work! Consistent tracking is key to understanding your emotional patterns.

Here's to another great week ahead!
The DailyMood AI Team

${data.unsubscribeUrl ? `Unsubscribe: ${data.unsubscribeUrl}` : ''}
  `
})

// Email service integration helper
export const sendEmail = async (
  type: 'welcome' | 'streak' | 'reengagement' | 'premium' | 'weekly_summary',
  recipientEmail: string,
  data: EmailData
) => {
  let template: EmailTemplate

  const emailData = {
    ...data,
    userEmail: recipientEmail,
    appUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://dailymood.ai',
    dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dailymood.ai'}/dashboard`,
    unsubscribeUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'https://dailymood.ai'}/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
  }

  switch (type) {
    case 'welcome':
      template = welcomeEmail(emailData)
      break
    case 'streak':
      template = streakEmail(emailData)
      break
    case 'reengagement':
      template = reEngagementEmail(emailData)
      break
    case 'premium':
      template = premiumUpgradeEmail(emailData)
      break
    case 'weekly_summary':
      template = weeklySummaryEmail(emailData as any)
      break
    default:
      throw new Error(`Unknown email type: ${type}`)
  }

  // Integration with email service (Resend, SendGrid, etc.)
  if (process.env.RESEND_API_KEY) {
    // Resend integration
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'DailyMood AI <hello@dailymood.ai>',
          to: recipientEmail,
          subject: template.subject,
          html: template.html,
          text: template.text
        })
      })

      if (!response.ok) {
        throw new Error(`Email service error: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('[Email] Failed to send email:', error)
      throw error
    }
  } else {
    // Mock/development mode
    console.log('[Email] MOCK SEND:', {
      to: recipientEmail,
      subject: template.subject,
      type
    })
    return { success: true, mock: true }
  }
}


