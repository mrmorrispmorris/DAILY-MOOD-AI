// SEO optimization utilities
export interface PageSEO {
  title: string
  description: string
  keywords: string[]
  canonicalUrl?: string
  ogImage?: string
  structuredData?: object
}

export class SEOOptimizer {
  // Generate optimized meta tags
  static generateMetaTags(seo: PageSEO): Record<string, string> {
    return {
      title: seo.title,
      description: seo.description,
      keywords: seo.keywords.join(', '),
      'og:title': seo.title,
      'og:description': seo.description,
      'og:image': seo.ogImage || '/og-default.jpg',
      'twitter:title': seo.title,
      'twitter:description': seo.description,
      'twitter:image': seo.ogImage || '/twitter-default.jpg',
      canonical: seo.canonicalUrl || '',
    }
  }

  // Generate structured data for mental health app
  static generateAppStructuredData(pageName: string): object {
    const baseData = {
      '@context': 'https://schema.org',
      '@type': 'MobileApplication',
      name: 'DailyMood AI',
      description: 'AI-powered mood tracking for better mental health',
      applicationCategory: 'HealthApplication',
      operatingSystem: 'iOS, Android, Web',
      offers: {
        '@type': 'Offer',
        price: '9.99',
        priceCurrency: 'USD',
        category: 'subscription'
      },
      author: {
        '@type': 'Organization',
        name: 'DailyMood AI',
        url: 'https://project-iota-gray.vercel.app'
      }
    }

    // Add page-specific structured data
    switch (pageName) {
      case 'home':
        return {
          ...baseData,
          '@type': 'SoftwareApplication',
          featureList: [
            'AI-powered mood insights',
            'Daily mood tracking',
            'Mental health analytics',
            'Personalized recommendations'
          ]
        }
      
      case 'blog':
        return {
          '@context': 'https://schema.org',
          '@type': 'Blog',
          name: 'DailyMood AI Blog',
          description: 'Mental health insights and mood tracking tips',
          publisher: {
            '@type': 'Organization',
            name: 'DailyMood AI'
          }
        }
      
      default:
        return baseData
    }
  }

  // Generate optimized meta description
  static generateMetaDescription(content: string, maxLength: number = 160): string {
    const cleaned = content.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
    
    if (cleaned.length <= maxLength) {
      return cleaned
    }
    
    const truncated = cleaned.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')
    
    return lastSpace > 0 
      ? truncated.substring(0, lastSpace) + '...'
      : truncated + '...'
  }

  // Extract keywords from content
  static extractKeywords(content: string, count: number = 10): string[] {
    const commonWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
      'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'have',
      'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should',
      'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we',
      'they', 'what', 'where', 'when', 'why', 'how', 'can', 'may', 'might'
    ])

    const words = content
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3 && !commonWords.has(word))

    const frequency = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(frequency)
      .sort(([, a], [, b]) => b - a)
      .slice(0, count)
      .map(([word]) => word)
  }

  // Validate SEO score
  static calculateSEOScore(seo: PageSEO, content: string): {
    score: number
    issues: string[]
    suggestions: string[]
  } {
    const issues: string[] = []
    const suggestions: string[] = []
    let score = 100

    // Title checks
    if (seo.title.length < 30) {
      issues.push('Title too short')
      suggestions.push('Expand title to 30-60 characters')
      score -= 10
    } else if (seo.title.length > 60) {
      issues.push('Title too long')
      suggestions.push('Shorten title to under 60 characters')
      score -= 10
    }

    // Description checks
    if (seo.description.length < 120) {
      issues.push('Meta description too short')
      suggestions.push('Expand description to 120-160 characters')
      score -= 10
    } else if (seo.description.length > 160) {
      issues.push('Meta description too long')
      suggestions.push('Shorten description to under 160 characters')
      score -= 10
    }

    // Keywords checks
    if (seo.keywords.length < 3) {
      issues.push('Not enough keywords')
      suggestions.push('Add more relevant keywords (3-10)')
      score -= 10
    }

    // Content checks
    if (content.length < 300) {
      issues.push('Content too short')
      suggestions.push('Add more content (minimum 300 words)')
      score -= 15
    }

    return { score, issues, suggestions }
  }
}

// Pre-defined SEO configurations for common pages
export const pageSEOConfigs: Record<string, PageSEO> = {
  home: {
    title: 'DailyMood AI - Track Your Mood & Improve Mental Health with AI',
    description: 'Transform your mental wellness with AI-powered mood tracking. Get personalized insights, identify patterns, and improve your emotional wellbeing. Start free today.',
    keywords: [
      'mood tracker', 'mental health app', 'AI mood tracking', 'emotional wellness',
      'depression tracker', 'anxiety tracker', 'daily mood log', 'mental health insights',
      'mood patterns', 'wellbeing app', 'mindfulness tracker', 'therapy tools'
    ]
  },
  
  pricing: {
    title: 'DailyMood AI Pricing - AI-Powered Mental Health Tracking Plans',
    description: 'Choose the perfect plan for your mental wellness journey. Free tier available. Premium AI insights from $9.99/month. Start your free trial today.',
    keywords: [
      'mood tracker pricing', 'mental health app cost', 'AI therapy pricing',
      'wellness app subscription', 'free mood tracker', 'premium mental health'
    ]
  },
  
  blog: {
    title: 'Mental Health Blog - Expert Insights & Mood Tracking Tips | DailyMood AI',
    description: 'Discover expert mental health insights, mood tracking tips, and wellness strategies. Evidence-based content to improve your emotional wellbeing.',
    keywords: [
      'mental health blog', 'mood tracking tips', 'emotional wellness',
      'mental health insights', 'wellbeing advice', 'psychology tips'
    ]
  },

  dashboard: {
    title: 'Your Mood Dashboard - DailyMood AI Analytics & Insights',
    description: 'Track your mood patterns, view AI-powered insights, and monitor your mental wellness progress with personalized analytics and recommendations.',
    keywords: [
      'mood dashboard', 'mental health analytics', 'mood insights',
      'emotional patterns', 'wellness tracking', 'mood analytics'
    ]
  }
}

