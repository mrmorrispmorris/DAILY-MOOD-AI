const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  eslint: {
    ignoreDuringBuilds: false,
  },
  images: {
    domains: ['ctmgjkwctnndlpkpxvqv.supabase.co'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 86400, // 24 hours
  },
  headers: async () => [
    {
      source: '/(.*)',
      headers: [
        {
          key: 'X-Frame-Options',
          value: 'DENY'
        },
        {
          key: 'X-Content-Type-Options',
          value: 'nosniff'
        },
        {
          key: 'Referrer-Policy',
          value: 'origin-when-cross-origin'
        },
        {
          key: 'Permissions-Policy',
          value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
        }
      ]
    },
    {
      source: '/sw.js',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=0, must-revalidate'
        },
        {
          key: 'Service-Worker-Allowed',
          value: '/'
        }
      ]
    }
  ],
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false
    }
    
    // CRITICAL SSR FIX: Handle browser-only globals with global shim
    if (isServer) {
      // Create global shims for browser-only variables
      const webpack = require('webpack')
      config.plugins = config.plugins || []
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'undefined',
          'window': 'undefined', 
          'document': 'undefined',
          'navigator': 'undefined',
        })
      )
      
      // Add global shim as module prefix
      config.plugins.push(
        new webpack.BannerPlugin({
          banner: `
if (typeof self === 'undefined') { global.self = {}; }
if (typeof window === 'undefined') { global.window = {}; }
if (typeof document === 'undefined') { global.document = {}; }
if (typeof navigator === 'undefined') { global.navigator = {}; }
          `.trim(),
          raw: true,
          include: /\.js$/,
        })
      )
    }
    
    if (!dev) {
      config.optimization = {
        ...config.optimization,
        splitChunks: {
          chunks: 'all',
          cacheGroups: {
            vendor: {
              test: /[\\/]node_modules[\\/]/,
              name: 'vendors',
              chunks: 'all',
            },
          },
        },
      }
    } else {
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }
    }
    
    return config
  },
  experimental: {
    missingSuspenseWithCSRBailout: false,
    optimizePackageImports: ['lucide-react', 'framer-motion'],
    serverComponentsExternalPackages: ['@supabase/supabase-js']
  },
  // CRITICAL: Disable static generation to avoid "Collecting page data" SSR errors
  trailingSlash: false,
  output: 'export' !== process.env.VERCEL_OUTPUT ? undefined : 'export',
  distDir: '.next',
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn']
    } : false,
  }
}

module.exports = withBundleAnalyzer(nextConfig)