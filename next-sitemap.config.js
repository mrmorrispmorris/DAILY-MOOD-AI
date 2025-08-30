/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_URL || 'https://your-domain.com',
  generateRobotsTxt: false, // We have custom robots.txt
  exclude: [
    '/dashboard/*',
    '/admin/*',
    '/api/*',
    '/test/*',
    '/debug/*'
  ],
  additionalPaths: async (config) => [
    await config.transform(config, '/pricing'),
    await config.transform(config, '/features'),
    await config.transform(config, '/blog'),
    await config.transform(config, '/help'),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api', '/_next']
      }
    ]
  }
}