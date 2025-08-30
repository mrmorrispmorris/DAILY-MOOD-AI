import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://dailymood.ai'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/_next/',
          '/private/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: ['/'],
        disallow: [
          '/admin/',
          '/api/',
          '/dashboard/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}


