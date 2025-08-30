# 🚀 Getting Started with DailyMood AI

## Prerequisites
- Node.js 18+ 
- Git
- Supabase account
- Stripe account (for payments)
- OpenAI API key (for AI features)

## Quick Setup

### 1. Clone Repository
```bash
git clone https://github.com/your-org/dailymood-ai
cd dailymood-ai
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Configuration
Create `.env.local` in the project root:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# OpenAI for AI Insights
OPENAI_API_KEY=your_openai_api_key

# Stripe Configuration  
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_WEBHOOK_SECRET=your_webhook_secret
STRIPE_PRICE_ID=your_premium_price_id

# Application URLs
NEXT_PUBLIC_URL=http://localhost:3009
```

### 4. Database Setup

#### Option A: Use Existing Schema
```bash
# Import the database schema
npx supabase db push
```

#### Option B: Run Migrations
```sql
-- Run each migration file in order:
-- supabase/migrations/001_mood_tracking.sql
-- supabase/migrations/002_subscriptions.sql
-- ... (all migration files)
```

### 5. Start Development Server
```bash
npm run dev
```

The app will be available at `http://localhost:3009`

## First Steps

### 1. Create Your First User
1. Navigate to `http://localhost:3009/signup`
2. Use magic link authentication 
3. Check your email and click the verification link
4. You'll be redirected to the dashboard

### 2. Log Your First Mood
1. Go to the dashboard
2. Use the mood entry component
3. Set a mood score (1-10)
4. Add optional notes and activities
5. Save your entry

### 3. Explore Features
- **Dashboard**: Overview of recent moods and stats
- **Analytics**: Charts and trends (premium feature)
- **Blog**: 23+ mental health articles
- **Settings**: Account and notification preferences

## Development Workflow

### Running Tests
```bash
# All tests
npm test

# E2E tests
npm run test:e2e

# API tests  
npm run test:api

# Performance tests
npm run test:performance
```

### Code Quality
```bash
# Linting
npm run lint

# Type checking
npm run type-check

# Bundle analysis
npm run analyze
```

### Database Management
```bash
# Reset database
npx supabase db reset

# Generate types
npx supabase gen types typescript > types/supabase.ts

# View logs
npx supabase logs
```

## Key Features Overview

### Mood Tracking
- 1-10 scale with emoji visualization
- Activity and weather context
- Voice notes and text entries
- Offline support with sync

### AI Insights  
- GPT-4 powered mood analysis
- Pattern recognition
- Personalized recommendations
- Mood predictions

### Premium Features
- Advanced analytics
- Data export
- AI insights
- Priority support

### Blog System
- 23+ SEO-optimized articles
- Historical content (2023-2025)
- Structured data for search engines
- Newsletter integration

## Common Tasks

### Adding New Blog Posts
1. Edit `lib/blog-content.ts`
2. Add new `BlogPost` object to array
3. Include SEO metadata
4. Test with `npm run dev`

### Updating Pricing
1. Update Stripe price IDs in `.env.local`
2. Modify pricing plans in `app/pricing/page.tsx`
3. Test checkout flow

### Customizing UI
1. Modify Tailwind classes in components
2. Update design system in `app/globals.css`
3. Test responsive design

### Adding New Features
1. Create new components in `app/components/`
2. Add API routes in `app/api/`
3. Write tests in `tests/`
4. Update documentation

## Troubleshooting

### Common Issues

#### "Invalid API key" Error
- Check Supabase environment variables
- Verify project URL and keys
- Ensure service role key is correct

#### Authentication Not Working
- Check Supabase URL configuration
- Verify redirect URLs in Supabase dashboard
- Check email confirmation settings

#### Stripe Webhooks Failing
- Verify webhook secret in environment
- Check webhook endpoint URL in Stripe
- Ensure proper request signing

#### Build Errors
- Clear Next.js cache: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check TypeScript errors: `npm run type-check`

### Getting Help
- Check [FAQ](./FAQ.md)
- Review [Troubleshooting Guide](./troubleshooting.md)
- Open issue on GitHub
- Contact support team

## Next Steps
- [API Documentation](./api/README.md)
- [Deployment Guide](./deployment/README.md)
- [Mobile App Setup](./mobile/README.md)
- [Testing Strategy](./testing/README.md)
