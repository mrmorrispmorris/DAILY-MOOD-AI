import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://project-iota-gray.vercel.app'
  
  const routes = [
    '',
    '/pricing',
    '/features',
    '/about',
    '/blog',
    '/blog/understanding-mood-patterns',
    '/blog/ai-mental-health',
    '/blog/daily-mood-tracking-benefits',
    '/blog/mood-tracking-vs-therapy',
    '/blog/mental-health-statistics-2025',
    '/privacy',
    '/terms',
    '/support',
    '/login',
    '/dashboard',
    '/log-mood',
    '/help',
    '/launch'
  ]
  
  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/blog' ? 'daily' : 
                    route.startsWith('/blog/') ? 'monthly' :
                    route === '/dashboard' || route === '/log-mood' ? 'daily' :
                    route === '/pricing' || route === '/features' ? 'weekly' : 
                    'monthly',
    priority: route === '' ? 1.0 : 
             route === '/pricing' ? 0.9 :
             route === '/features' ? 0.8 :
             route === '/blog' ? 0.7 :
             route.startsWith('/blog/') ? 0.6 :
             route === '/dashboard' || route === '/log-mood' ? 0.5 :
             0.4,
  }))
}

// Generate blog post sitemaps dynamically
export async function generateBlogSitemap() {
  const baseUrl = 'https://project-iota-gray.vercel.app'
  
  // In a real implementation, this would fetch from your CMS/database
  const blogPosts = [
    {
      slug: 'understanding-mood-patterns',
      lastModified: '2025-01-15',
      priority: 0.7
    },
    {
      slug: 'ai-mental-health', 
      lastModified: '2025-01-10',
      priority: 0.7
    },
    {
      slug: 'daily-mood-tracking-benefits',
      lastModified: '2025-01-05', 
      priority: 0.7
    },
    {
      slug: 'mood-tracking-vs-therapy',
      lastModified: '2025-01-20',
      priority: 0.6
    },
    {
      slug: 'mental-health-statistics-2025',
      lastModified: '2025-01-18',
      priority: 0.6
    }
  ]
  
  return blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.lastModified),
    changeFrequency: 'monthly' as const,
    priority: post.priority,
  }))
}