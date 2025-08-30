// Google Ads campaign configuration and tracking
export const googleAdsConfig = {
  // Campaign Structure
  campaigns: [
    {
      id: 'mood_tracking_search',
      name: 'DailyMood AI - Search Campaign',
      type: 'SEARCH',
      budget: {
        dailyBudget: 50,
        currency: 'USD'
      },
      targeting: {
        locations: ['United States', 'Canada', 'United Kingdom', 'Australia'],
        languages: ['English'],
        demographics: {
          ages: ['25-34', '35-44', '45-54'],
          genders: ['All']
        }
      },
      bidStrategy: 'TARGET_CPA',
      targetCPA: 35.00, // Expected CAC $25-40
      adGroups: [
        {
          id: 'mood_tracker_exact',
          name: 'Mood Tracker - Exact Match',
          keywords: [
            { text: '[mood tracker]', matchType: 'EXACT', bid: 2.50 },
            { text: '[mood tracker app]', matchType: 'EXACT', bid: 3.00 },
            { text: '[daily mood tracker]', matchType: 'EXACT', bid: 2.25 },
            { text: '[mood tracking app]', matchType: 'EXACT', bid: 2.75 },
            { text: '[mental health tracker]', matchType: 'EXACT', bid: 2.00 }
          ],
          ads: [
            {
              headline1: 'AI-Powered Mood Tracker',
              headline2: 'Track & Improve Mental Health',
              description: 'Get personalized insights with our smart mood tracking app. Free 14-day trial, no credit card required.',
              landingPage: '/ads/mood-tracker'
            },
            {
              headline1: 'Best Mood Tracking App 2025',
              headline2: 'Understand Your Emotions',
              description: 'Join 10,000+ users improving mental wellness. AI insights, beautiful charts, complete privacy.',
              landingPage: '/ads/mood-tracker'
            }
          ]
        },
        {
          id: 'mental_health_broad',
          name: 'Mental Health - Broad Match',
          keywords: [
            { text: 'mental health app', matchType: 'BROAD_MODIFIED', bid: 1.75 },
            { text: 'depression tracker', matchType: 'BROAD_MODIFIED', bid: 2.25 },
            { text: 'anxiety tracker', matchType: 'BROAD_MODIFIED', bid: 2.00 },
            { text: 'emotional wellness app', matchType: 'BROAD_MODIFIED', bid: 1.50 },
            { text: 'mood journal app', matchType: 'BROAD_MODIFIED', bid: 1.90 }
          ],
          ads: [
            {
              headline1: 'Mental Wellness Made Simple',
              headline2: 'Track Moods, Find Patterns',
              description: 'AI-powered insights help you understand your mental health journey. Start your free trial today.',
              landingPage: '/ads/mental-health'
            },
            {
              headline1: 'Take Control of Your Mental Health',
              headline2: 'Smart Mood Tracking with AI',
              description: 'Better than Daylio. Smarter insights, beautiful design, complete privacy. Try free for 14 days.',
              landingPage: '/ads/mental-health'
            }
          ]
        },
        {
          id: 'competitor_targeting',
          name: 'Competitor Keywords',
          keywords: [
            { text: 'daylio alternative', matchType: 'PHRASE', bid: 3.50 },
            { text: 'mood meter alternative', matchType: 'PHRASE', bid: 2.75 },
            { text: 'mood tools alternative', matchType: 'PHRASE', bid: 2.25 },
            { text: 'better than daylio', matchType: 'PHRASE', bid: 4.00 }
          ],
          ads: [
            {
              headline1: 'Better Than Daylio - Try DailyMood AI',
              headline2: 'AI Insights Daylio Cant Provide',
              description: 'Get the mood tracking power of Daylio plus AI-powered insights. Switch today and see the difference.',
              landingPage: '/ads/daylio-alternative'
            }
          ]
        }
      ]
    }
  ],
  
  // Conversion Tracking
  conversions: [
    {
      name: 'Trial_Signup',
      action: 'SIGN_UP',
      value: 1.0,
      category: 'LEAD'
    },
    {
      name: 'Subscription_Purchase',
      action: 'PURCHASE', 
      value: 10.0,
      category: 'SALE'
    },
    {
      name: 'First_Mood_Logged',
      action: 'OTHER',
      value: 2.0,
      category: 'ENGAGEMENT'
    }
  ],

  // Negative Keywords
  negativeKeywords: [
    'free mood tracker',
    'mood tracker download',
    'mood disorder', 
    'bipolar',
    'depression medication',
    'therapy',
    'counseling',
    'crisis'
  ],

  // Ad Extensions
  extensions: {
    sitelinks: [
      { text: 'Free Trial', url: '/login', description: 'Start tracking today' },
      { text: 'Features', url: '/features', description: 'See what makes us different' },
      { text: 'Pricing', url: '/pricing', description: 'Affordable plans starting $10/mo' },
      { text: 'Blog', url: '/blog', description: 'Mental health tips & insights' }
    ],
    callouts: [
      'Free 14-Day Trial',
      'No Credit Card Required', 
      'AI-Powered Insights',
      'HIPAA Compliant',
      '4.9/5 Rating',
      '10,000+ Users'
    ],
    structuredSnippets: [
      { header: 'Features', values: ['AI Insights', 'Pattern Recognition', 'Data Export', 'Privacy Protection'] },
      { header: 'Platforms', values: ['Web App', 'Mobile Responsive', 'Offline Access'] }
    ]
  }
}

// Google Ads tracking utilities
export function trackGoogleAdsConversion(conversionName: string, value?: number) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', 'conversion', {
      send_to: `${process.env.NEXT_PUBLIC_GOOGLE_ADS_ID}/${conversionName}`,
      value: value || 1.0,
      currency: 'USD'
    })
  }
  
  // Also track in our analytics
  if (typeof window !== 'undefined' && (window as any).mixpanel) {
    (window as any).mixpanel.track('Google Ads Conversion', {
      conversion_name: conversionName,
      conversion_value: value || 1.0,
      source: 'google_ads'
    })
  }
}

// UTM parameter handling for ad traffic
export function getUTMParameters() {
  if (typeof window === 'undefined') return {}
  
  const urlParams = new URLSearchParams(window.location.search)
  return {
    utm_source: urlParams.get('utm_source'),
    utm_medium: urlParams.get('utm_medium'), 
    utm_campaign: urlParams.get('utm_campaign'),
    utm_term: urlParams.get('utm_term'),
    utm_content: urlParams.get('utm_content'),
    gclid: urlParams.get('gclid') // Google Click ID
  }
}

// Quality Score optimization keywords
export const qualityScoreOptimization = {
  landingPageRequirements: {
    loadTime: '< 3 seconds',
    mobileOptimized: true,
    relevantContent: true,
    clearCTA: true,
    trustSignals: ['testimonials', 'security_badges', 'privacy_policy']
  },
  
  adRelevance: {
    keywordInHeadline: true,
    keywordInDescription: true,
    keywordInLandingPage: true,
    adGroupThemeConsistency: true
  },
  
  expectedCTR: {
    target: '> 2%',
    optimizations: [
      'emotional_headlines',
      'benefit_focused_descriptions', 
      'social_proof_numbers',
      'urgency_elements'
    ]
  }
}


