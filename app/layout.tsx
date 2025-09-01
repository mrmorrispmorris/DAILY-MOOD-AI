import './globals.css'
import './styles/color-system.css'
import './styles/mobile.css'
import './styles/improved-colors.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { homePageStructuredData } from './structured-data'
import MobileNav from '@/components/MobileNav'
import QueryProvider from '@/app/components/QueryProvider'
import PWAInstall from '@/app/components/PWAInstall'
import AvatarWidget from '@/app/components/avatar/AvatarWidget'

const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: {
    template: '%s | DailyMood AI - Mental Wellness Tracker',
    default: 'DailyMood AI - Track Your Mood & Improve Mental Health'
  },
  description: 'AI-powered mood tracking app that helps you understand your emotions, identify patterns, and improve your mental wellbeing. Start free today.',
  keywords: [
    'mood tracker', 'mental health app', 'emotion tracking',
    'depression tracker', 'anxiety tracker', 'wellness app',
    'mood journal', 'mental wellness', 'AI therapy companion',
    'daily mood tracking', 'emotional intelligence', 'mood patterns',
    'mental health support', 'mindfulness app', 'therapy tools'
  ],
  authors: [{ name: 'DailyMood AI Team' }],
  creator: 'DailyMood AI',
  publisher: 'DailyMood AI',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://project-iota-gray.vercel.app'),
  openGraph: {
    title: 'DailyMood AI - Your Personal Mental Health Companion',
    description: 'Track moods, understand patterns, and improve your mental wellbeing with AI-powered insights.',
    url: 'https://project-iota-gray.vercel.app',
    siteName: 'DailyMood AI',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'DailyMood AI - Mental Wellness Tracking',
      }
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'DailyMood AI - Track Your Mental Wellness Journey',
    description: 'AI-powered mood tracking for better mental health',
    images: ['/twitter-image.jpg'],
    creator: '@dailymoodai',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'DailyMood AI'
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#8B5CF6',
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* PWA Meta Tags */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="DailyMood AI" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="DailyMood AI" />
        <meta name="msapplication-TileColor" content="#4A90E2" />
        <meta name="msapplication-TileImage" content="/icon-192x192.png" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        
        {/* Cache Busting - Force Fresh Load */}
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        
        {/* Icons */}
        <link rel="apple-touch-icon" href="/icon.svg" />
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="512x512" href="/icon-512x512.png" />
        
        {/* Manifest */}
        <link rel="manifest" href="/manifest.json" />
        
        {/* Theme Colors */}
        <meta name="theme-color" content="#8B5CF6" media="(prefers-color-scheme: light)" />
        <meta name="theme-color" content="#7C3AED" media="(prefers-color-scheme: dark)" />
        
        {/* Preload Critical Resources */}
        <link rel="preload" href="/icon.svg" as="image" type="image/svg+xml" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        
        {/* Structured Data for SEO */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ 
            __html: JSON.stringify(homePageStructuredData) 
          }}
        />
      </head>
      <body className="font-inter antialiased bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
        <QueryProvider>
          {children}
          <MobileNav />
          <PWAInstall />
          
          {/* Toast notifications container */}
          <div id="toast-container" />
        </QueryProvider>
        
          {/* Service Worker Cleanup - UNREGISTER ANY EXISTING SERVICE WORKERS */}
          <script dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  // Unregister all existing service workers
                  navigator.serviceWorker.getRegistrations().then(function(registrations) {
                    for(let registration of registrations) {
                      registration.unregister();
                      console.log('ServiceWorker unregistered:', registration.scope);
                    }
                  });
                  
                  // Clear all caches
                  if ('caches' in window) {
                    caches.keys().then(function(names) {
                      for (let name of names) {
                        caches.delete(name);
                        console.log('Cache deleted:', name);
                      }
                    });
                  }
                });
              }
            `
          }} />
          
          {/* Avatar Widget removed - now handled per-page to avoid conflicts */}
      </body>
    </html>
  )
}