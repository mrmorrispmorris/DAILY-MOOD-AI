# 🚀 Deployment Guide

## Overview
Production deployment guide for DailyMood AI platform.

## Deployment Architecture

### Web Application (Next.js)
- **Platform**: Vercel
- **URL**: https://project-iota-gray.vercel.app
- **Build**: Automatic on Git push
- **Environment**: Production

### Backend Services
- **Database**: Supabase PostgreSQL
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage
- **Edge Functions**: Supabase Edge Functions

### External Services
- **AI Processing**: OpenAI GPT-4 Mini API
- **Payments**: Stripe subscriptions
- **Analytics**: Custom analytics service
- **Monitoring**: Health check endpoints

## Production Deployment

### 1. Vercel Setup

#### Initial Deployment
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel

# Set up custom domain (if needed)
vercel domains add your-domain.com
```

#### Environment Variables
Configure in Vercel Dashboard → Project → Settings → Environment Variables:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID=price_your_premium_price_id

# Application
NEXT_PUBLIC_URL=https://your-domain.com
NODE_ENV=production
```

#### Build Configuration
```javascript
// next.config.js
const nextConfig = {
  // Production optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  
  // Image optimization
  images: {
    domains: ['your-supabase-url.supabase.co'],
  },
  
  // Bundle analysis
  webpack: (config, { dev }) => {
    if (!dev) {
      config.optimization.splitChunks.cacheGroups.vendor = {
        test: /[\\/]node_modules[\\/]/,
        name: 'vendors',
        chunks: 'all',
      }
    }
    return config
  }
}
```

### 2. Supabase Configuration

#### Database Migration
```bash
# Apply all migrations
npx supabase db push

# Or run individual migrations:
# 001_mood_tracking.sql
# 002_subscriptions.sql
# ... (all migration files)
```

#### Row Level Security
Verify RLS policies are active:
```sql
-- Check RLS is enabled
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND rowsecurity = true;

-- Verify policies exist
SELECT * FROM pg_policies 
WHERE schemaname = 'public';
```

#### Authentication Settings
In Supabase Dashboard → Authentication → Settings:
- **Site URL**: `https://your-domain.com`
- **Redirect URLs**: 
  - `https://your-domain.com/**`
  - `https://your-domain.com/auth/callback`

### 3. Stripe Configuration

#### Webhook Setup
1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/stripe/webhook`
3. Select events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`

#### Product Setup
```bash
# Create product in Stripe Dashboard
Product: "DailyMood AI Premium"
Price: $9.99/month (recurring)
Price ID: price_1234567890abcdef
```

### 4. Domain Configuration

#### Custom Domain
```bash
# Add custom domain in Vercel
vercel domains add dailymood.ai

# Configure DNS
CNAME: www.dailymood.ai → cname.vercel-dns.com
A: dailymood.ai → 76.76.19.61
```

#### SSL Certificate
- Automatic via Vercel/Let's Encrypt
- Verify HTTPS redirect is working
- Check SSL Labs rating

### 5. Performance Optimization

#### CDN Configuration
- Automatic via Vercel Edge Network
- Global distribution
- Automatic image optimization

#### Caching Strategy
```javascript
// Headers for caching
const headers = {
  'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
  'CDN-Cache-Control': 'public, max-age=86400',
  'Vercel-CDN-Cache-Control': 'public, max-age=3600'
}
```

## Environment Management

### Development
```bash
# Local development
npm run dev
```

### Staging  
```bash
# Preview deployment
vercel --prod=false

# Environment: Preview
# URL: unique-preview-url.vercel.app
```

### Production
```bash
# Production deployment
vercel --prod

# Environment: Production  
# URL: your-domain.com
```

## Monitoring & Health Checks

### Health Endpoint
**GET** `/api/health`
```json
{
  "status": "healthy",
  "timestamp": "2025-01-25T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0",
  "database": "connected",
  "supabase": "healthy",
  "stripe": "operational"
}
```

### Uptime Monitoring
- **Service**: Vercel Analytics + Custom monitoring
- **Alerts**: Email/SMS on downtime
- **SLA**: 99.9% uptime target

### Error Tracking
- **Errors**: Captured via custom error tracking
- **Alerts**: Critical errors trigger notifications
- **Dashboard**: Real-time error monitoring

## Security

### HTTPS
- **Certificate**: Automatic SSL via Vercel
- **Redirect**: HTTP → HTTPS automatic
- **HSTS**: Strict Transport Security enabled

### Security Headers
```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains; preload'
  },
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
  }
]
```

### Data Protection
- **Encryption**: All data encrypted at rest
- **GDPR**: Compliance for EU users
- **Privacy**: Data anonymization options
- **Backup**: Automated daily backups

## Deployment Checklist

### Pre-deployment
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] Stripe webhooks configured
- [ ] Domain DNS configured
- [ ] SSL certificate active

### Post-deployment  
- [ ] Health checks passing
- [ ] Authentication flow working
- [ ] Payment processing functional
- [ ] Blog posts loading correctly
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable
- [ ] Error tracking operational
- [ ] Monitoring alerts configured

## Rollback Strategy

### Automatic Rollback
```bash
# Vercel automatic rollback on build failure
# Previous deployment remains active
```

### Manual Rollback
```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Database Rollback
```sql
-- Create backup before major changes
pg_dump dailymood_production > backup_$(date +%Y%m%d_%H%M%S).sql

-- Restore from backup if needed
psql dailymood_production < backup_20250125_103000.sql
```

## Scaling Considerations

### Traffic Scaling
- **Vercel**: Automatic scaling to handle traffic spikes
- **Database**: Supabase handles connection pooling
- **CDN**: Global edge caching reduces load

### Database Scaling
- **Read Replicas**: For analytics queries
- **Connection Pooling**: Supabase built-in
- **Indexing**: Optimized for mood_entries queries

### Cost Optimization
- **Vercel**: Pay per execution
- **Supabase**: Scale based on usage
- **OpenAI**: Token-based pricing
- **Stripe**: Transaction-based fees

## Troubleshooting

### Common Issues

#### Build Failures
```bash
# Clear cache and rebuild
vercel --force

# Check build logs
vercel logs <deployment-url>
```

#### Database Connection Issues
```bash
# Test connection
npx supabase status

# Check environment variables
echo $NEXT_PUBLIC_SUPABASE_URL
```

#### Stripe Webhook Failures
- Verify webhook URL is accessible
- Check webhook secret matches environment
- Review Stripe Dashboard logs

### Support
- **Vercel Support**: Enterprise support available
- **Supabase Support**: Community + Pro support
- **Custom Support**: Internal team monitoring

## Maintenance

### Regular Updates
- **Dependencies**: Monthly security updates
- **Node.js**: LTS version updates
- **Supabase**: Automatic updates
- **Vercel**: Platform updates automatic

### Backup Strategy
- **Database**: Daily automated backups (Supabase)
- **Code**: Git repository (GitHub)
- **Assets**: Supabase Storage backup
- **Configuration**: Environment variables documented

### Monitoring Schedule
- **Daily**: Health checks, error rates
- **Weekly**: Performance metrics, user analytics  
- **Monthly**: Security audit, dependency updates
- **Quarterly**: Business metrics review
