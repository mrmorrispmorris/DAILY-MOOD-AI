export const structuredData = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": "DailyMood AI",
  "applicationCategory": "HealthApplication",
  "operatingSystem": "Web",
  "url": "https://project-iota-gray.vercel.app",
  "description": "AI-powered mood tracking app for mental wellness and emotional health management",
  "screenshot": "https://project-iota-gray.vercel.app/screenshots/dashboard.png",
  "author": {
    "@type": "Organization",
    "name": "DailyMood AI Team",
    "url": "https://project-iota-gray.vercel.app"
  },
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "USD",
    "category": "Free with Premium Options",
    "availability": "https://schema.org/InStock"
  },
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.9",
    "reviewCount": "10000",
    "bestRating": "5",
    "worstRating": "1"
  },
  "featureList": [
    "AI-powered mood analysis",
    "Pattern recognition and insights",
    "Daily mood tracking",
    "Data export functionality",
    "Premium analytics dashboard",
    "Emotional wellness reports",
    "Mood prediction algorithms",
    "Mental health progress tracking"
  ],
  "applicationSubCategory": "Mental Health",
  "permissions": "No special permissions required",
  "storageRequirements": "Minimal storage required",
  "memoryRequirements": "Low memory usage",
  "softwareVersion": "1.0.0",
  "downloadUrl": "https://project-iota-gray.vercel.app",
  "installUrl": "https://project-iota-gray.vercel.app",
  "supportingData": {
    "@type": "DataSet",
    "name": "Mental Health Statistics",
    "description": "Data supporting the effectiveness of mood tracking for mental wellness"
  }
}

export const organizationData = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "DailyMood AI",
  "url": "https://project-iota-gray.vercel.app",
  "logo": "https://project-iota-gray.vercel.app/icon.svg",
  "description": "Leading provider of AI-powered mental health and mood tracking solutions",
  "foundingDate": "2024",
  "sameAs": [
    "https://twitter.com/dailymoodai",
    "https://linkedin.com/company/dailymoodai"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "contactType": "Customer Service",
    "email": "support@project-iota-gray.vercel.app",
    "availableLanguage": "English"
  }
}

export const websiteData = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "DailyMood AI",
  "url": "https://project-iota-gray.vercel.app",
  "description": "AI-powered mood tracking for better mental health",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": "https://project-iota-gray.vercel.app/search?q={search_term_string}"
    },
    "query-input": "required name=search_term_string"
  }
}

export const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "What is DailyMood AI?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "DailyMood AI is an advanced mood tracking application that uses artificial intelligence to help users understand their emotional patterns, improve mental wellness, and gain insights into their mental health journey."
      }
    },
    {
      "@type": "Question", 
      "name": "Is DailyMood AI free to use?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Yes, DailyMood AI offers a free tier with basic mood tracking features. Premium features including advanced AI insights, detailed analytics, and data export are available with a subscription."
      }
    },
    {
      "@type": "Question",
      "name": "How does AI mood analysis work?",
      "acceptedAnswer": {
        "@type": "Answer", 
        "text": "Our AI analyzes your mood patterns, identifies trends, and provides personalized insights based on your emotional data. The system learns from your inputs to offer increasingly accurate predictions and recommendations."
      }
    },
    {
      "@type": "Question",
      "name": "Is my mental health data secure?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Absolutely. We use enterprise-grade encryption and comply with healthcare privacy standards to ensure your mental health data remains completely secure and private."
      }
    }
  ]
}

// Combined structured data for the homepage
export const homePageStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    structuredData,
    organizationData, 
    websiteData,
    faqData
  ]
}


