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
  },
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.devtool = false
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
    missingSuspenseWithCSRBailout: false
  }
}

module.exports = withBundleAnalyzer(nextConfig)