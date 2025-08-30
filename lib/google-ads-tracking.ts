// Google Ads conversion tracking and campaign management
declare global {
  interface Window {
    gtag: (...args: any[]) => void
    dataLayer: any[]
  }
}

export class GoogleAdsManager {
  private isInitialized = false
  private conversionId: string
  private conversionLabels: Record<string, string>

  constructor() {
    this.conversionId = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || 'AW-XXXXXXXXXX'
    this.conversionLabels = {
      trial_signup: 'xxxxxxxxxxxx',
      subscription_purchase: 'xxxxxxxxxxxx', 
      first_mood_logged: 'xxxxxxxxxxxx'
    }
    
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  private async initialize() {
    if (this.isInitialized) return

    try {
      // Load Google Ads tracking script
      const script = document.createElement('script')
      script.async = true
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.conversionId}`
      document.head.appendChild(script)

      // Initialize gtag
      window.dataLayer = window.dataLayer || []
      window.gtag = function gtag() {
        window.dataLayer.push(arguments)
      }
      
      window.gtag('js', new Date())
      window.gtag('config', this.conversionId, {
        send_page_view: true,
        allow_enhanced_conversions: true
      })

      // Enhanced conversions setup
      window.gtag('config', this.conversionId, {
        allow_enhanced_conversions: true
      })

      this.isInitialized = true
      console.log('🎯 Google Ads tracking initialized')
    } catch (error) {
      console.error('Google Ads initialization failed:', error)
    }
  }

  // Track conversions
  trackConversion(conversionName: string, value?: number, transactionId?: string) {
    if (!this.isInitialized || !window.gtag) {
      console.warn('Google Ads not initialized, queuing conversion')
      setTimeout(() => this.trackConversion(conversionName, value, transactionId), 1000)
      return
    }

    const conversionLabel = this.conversionLabels[conversionName]
    if (!conversionLabel) {
      console.error('Unknown conversion:', conversionName)
      return
    }

    const conversionData: any = {
      send_to: `${this.conversionId}/${conversionLabel}`,
      value: value || 1.0,
      currency: 'USD'
    }

    if (transactionId) {
      conversionData.transaction_id = transactionId
    }

    window.gtag('event', 'conversion', conversionData)
    
    console.log('🎯 Google Ads conversion tracked:', conversionName, conversionData)
  }

  // Track page views for specific landing pages
  trackPageView(pagePath: string, pageTitle?: string) {
    if (!this.isInitialized || !window.gtag) return

    window.gtag('config', this.conversionId, {
      page_path: pagePath,
      page_title: pageTitle || document.title
    })

    // Also send as event for better tracking
    window.gtag('event', 'page_view', {
      page_path: pagePath,
      page_title: pageTitle || document.title,
      send_to: this.conversionId
    })
  }

  // Track custom events for optimization
  trackCustomEvent(eventName: string, parameters: Record<string, any> = {}) {
    if (!this.isInitialized || !window.gtag) return

    window.gtag('event', eventName, {
      ...parameters,
      send_to: this.conversionId
    })
  }

  // Enhanced conversions with user data
  setUserData(userData: {
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    address?: {
      street?: string
      city?: string
      region?: string
      postalCode?: string
      country?: string
    }
  }) {
    if (!this.isInitialized || !window.gtag) return

    const enhancedConversionData: any = {}
    
    if (userData.email) enhancedConversionData.email = userData.email
    if (userData.phone) enhancedConversionData.phone_number = userData.phone
    if (userData.firstName) enhancedConversionData.first_name = userData.firstName
    if (userData.lastName) enhancedConversionData.last_name = userData.lastName
    
    if (userData.address) {
      if (userData.address.street) enhancedConversionData.street = userData.address.street
      if (userData.address.city) enhancedConversionData.city = userData.address.city
      if (userData.address.region) enhancedConversionData.region = userData.address.region
      if (userData.address.postalCode) enhancedConversionData.postal_code = userData.address.postalCode
      if (userData.address.country) enhancedConversionData.country = userData.address.country
    }

    window.gtag('set', enhancedConversionData)
  }
}

// Singleton instance
export const googleAdsManager = new GoogleAdsManager()

// Convenience functions
export const trackGoogleAdsConversion = (conversionName: string, value?: number, transactionId?: string) => {
  googleAdsManager.trackConversion(conversionName, value, transactionId)
}

export const trackAdPageView = (pagePath: string, pageTitle?: string) => {
  googleAdsManager.trackPageView(pagePath, pageTitle)
}

// Campaign performance tracking utilities
export class CampaignTracker {
  static getAdParams() {
    if (typeof window === 'undefined') return {}
    
    const urlParams = new URLSearchParams(window.location.search)
    return {
      gclid: urlParams.get('gclid'),
      utm_source: urlParams.get('utm_source'),
      utm_medium: urlParams.get('utm_medium'),
      utm_campaign: urlParams.get('utm_campaign'),
      utm_term: urlParams.get('utm_term'),
      utm_content: urlParams.get('utm_content'),
      ad_position: urlParams.get('adposition'),
      match_type: urlParams.get('matchtype'),
      network: urlParams.get('network'),
      device: urlParams.get('device'),
      placement: urlParams.get('placement')
    }
  }

  static isGoogleAdsTraffic() {
    const params = this.getAdParams()
    return !!(params.gclid || params.utm_source === 'google')
  }

  static getCampaignInfo() {
    const params = this.getAdParams()
    if (!this.isGoogleAdsTraffic()) return null

    return {
      source: 'google_ads',
      campaign: params.utm_campaign || 'unknown',
      adGroup: params.utm_content || 'unknown',
      keyword: params.utm_term || 'unknown',
      matchType: params.match_type || 'unknown',
      device: params.device || 'unknown',
      network: params.network || 'search'
    }
  }
}

// Quality Score optimization helpers
export const qualityScoreHelpers = {
  // Track bounce rate for landing page optimization
  trackEngagement(startTime: number = Date.now()) {
    const timeOnPage = Date.now() - startTime
    const scrollDepth = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100)
    
    // Track as custom event for Google Ads optimization
    googleAdsManager.trackCustomEvent('engagement_metrics', {
      time_on_page: Math.round(timeOnPage / 1000), // seconds
      scroll_depth: scrollDepth,
      page_path: window.location.pathname
    })
  },

  // Track form interactions
  trackFormStart(formName: string) {
    googleAdsManager.trackCustomEvent('form_start', {
      form_name: formName
    })
  },

  trackFormSubmit(formName: string, success: boolean) {
    googleAdsManager.trackCustomEvent('form_submit', {
      form_name: formName,
      success
    })
  },

  // Track CTA clicks for optimization
  trackCTAClick(ctaName: string, location: string) {
    googleAdsManager.trackCustomEvent('cta_click', {
      cta_name: ctaName,
      cta_location: location
    })
  }
}

// Auto-track page engagement
if (typeof window !== 'undefined') {
  let startTime = Date.now()
  
  // Track when user leaves page
  window.addEventListener('beforeunload', () => {
    qualityScoreHelpers.trackEngagement(startTime)
  })
  
  // Track scroll events
  let scrollTracked = false
  window.addEventListener('scroll', () => {
    if (!scrollTracked && window.scrollY > 100) {
      scrollTracked = true
      qualityScoreHelpers.trackEngagement(startTime)
    }
  })
}


