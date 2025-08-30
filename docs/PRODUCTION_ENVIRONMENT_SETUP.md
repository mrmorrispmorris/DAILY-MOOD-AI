# Production Environment Setup Guide

## Critical Environment Variables Required

### Supabase Configuration
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Stripe Configuration
```bash
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Application Configuration
```bash
NEXT_PUBLIC_URL=https://your-production-domain.com
NODE_ENV=production
```

### OpenAI (Optional - for AI features)
```bash
OPENAI_API_KEY=sk-...
```

## Vercel Deployment Setup

1. **Environment Variables in Vercel Dashboard**
   - Go to your Vercel project settings
   - Add all environment variables from above
   - Set Environment to "Production"

2. **Domain Configuration**
   - Configure custom domain in Vercel
   - Update NEXT_PUBLIC_URL to match your domain
   - Configure DNS settings

3. **Database Setup**
   - Ensure Supabase project is in production mode
   - Run database migrations
   - Configure Row Level Security (RLS) policies

## Pre-Deployment Checklist

### ✅ Required
- [ ] All environment variables configured
- [ ] Supabase project configured with production database
- [ ] Stripe account configured with live keys
- [ ] Domain configured and SSL enabled
- [ ] Database migrations executed
- [ ] RLS policies configured

### ✅ Recommended
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics configured (Google Analytics, Vercel Analytics)
- [ ] Monitoring alerts configured
- [ ] Backup strategy implemented
- [ ] Performance monitoring enabled

## Security Considerations

### Database Security
- Enable Row Level Security on all tables
- Configure proper authentication policies
- Use service role key only for server-side operations
- Never expose service role key to client-side

### API Security
- Validate all API requests
- Implement rate limiting
- Use HTTPS only
- Configure CORS properly

### Stripe Security
- Use webhook secrets to verify requests
- Never expose secret keys to client-side
- Implement proper error handling
- Log all payment events

## Performance Optimization

### Build Optimization
```bash
# Production build with optimizations
npm run build

# Analyze bundle size
npm run analyze
```

### Image Optimization
- Use Next.js Image component
- Configure image domains in next.config.js
- Optimize images for different screen sizes

### Caching Strategy
- Configure proper cache headers
- Use SWR for data fetching
- Implement service worker for offline support

## Monitoring and Maintenance

### Health Checks
- Monitor API endpoints
- Check database connectivity
- Verify payment processing
- Monitor error rates

### Performance Monitoring
- Track Core Web Vitals
- Monitor API response times
- Check memory usage
- Monitor database performance

### User Monitoring
- Track user engagement
- Monitor conversion rates
- Analyze user feedback
- Track feature usage

## Deployment Commands

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Run production tests
npm run test:e2e
```

## Rollback Strategy

1. **Immediate Rollback**
   ```bash
   vercel rollback
   ```

2. **Database Rollback**
   - Have migration rollback scripts ready
   - Backup database before major updates
   - Test rollback procedures

3. **Monitoring After Deployment**
   - Monitor error rates for first hour
   - Check key user flows
   - Verify payment processing
   - Monitor performance metrics

## Support and Maintenance

### Daily Checks
- Review error logs
- Check payment processing
- Monitor user registrations
- Verify key features working

### Weekly Checks
- Review performance metrics
- Check conversion rates
- Update dependencies
- Review security logs

### Monthly Checks
- Database performance review
- Cost optimization review
- Security audit
- Feature usage analysis
