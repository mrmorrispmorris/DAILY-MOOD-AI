# 🚀 Production Deployment Guide

## Overview
This guide will walk you through deploying your MoodAI application to production using Vercel.

## Prerequisites
- GitHub account
- Vercel account
- Supabase project (production database)
- Stripe account (for payments)

## Step 1: Repository Setup

### 1.1 Push to GitHub
```bash
# Create new repository on GitHub first, then:
git remote add origin https://github.com/yourusername/daily-mood-ai.git
git branch -M main
git push -u origin main
```

## Step 2: Vercel Deployment

### 2.1 Connect Repository
1. Go to [vercel.com](https://vercel.com)
2. Click "New Project"
3. Import your GitHub repository
4. Configure project settings:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 2.2 Environment Variables
Configure these environment variables in Vercel Dashboard:

#### Required Variables
```env
# Supabase (Production)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_production_supabase_anon_key

# Stripe (Production)
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_your_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_URL=https://your-app.vercel.app

# OpenAI (Optional)
OPENAI_API_KEY=your_openai_api_key
```

## Step 3: Database Setup

### 3.1 Supabase Production Database
1. Create production Supabase project
2. Run the SQL migration from `supabase/migrations/001_mood_tracking.sql`
3. Configure Row Level Security (RLS)
4. Update authentication settings

### 3.2 SQL Migration
```sql
-- Run this in your Supabase SQL Editor
CREATE TABLE moods (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  mood_label TEXT,
  notes TEXT,
  activities TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moods_user_date ON moods(user_id, created_at DESC);

ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own moods" ON moods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods" ON moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

## Step 4: Stripe Configuration

### 4.1 Production Stripe Setup
1. Create Stripe account
2. Get production API keys
3. Create subscription products:
   - **Free Plan**: $0/month
   - **Premium Plan**: $7.99/month
4. Configure webhooks (optional for future)

## Step 5: Domain Configuration

### 5.1 Custom Domain (Optional)
1. In Vercel Dashboard → Domains
2. Add your custom domain
3. Configure DNS settings
4. Update `NEXT_PUBLIC_URL` environment variable

## Step 6: Launch Checklist

- [ ] Repository pushed to GitHub
- [ ] Vercel project connected
- [ ] Environment variables configured
- [ ] Database migration completed
- [ ] Stripe products created
- [ ] Production build successful
- [ ] End-to-end testing completed

## Step 7: Post-Launch

### 7.1 Monitoring
- Monitor Vercel deployment logs
- Check Supabase database activity
- Monitor Stripe transactions

### 7.2 Testing
1. User registration flow
2. Mood logging functionality
3. Payment processing
4. AI insights generation

## Troubleshooting

### Common Issues
1. **Build Failures**: Check environment variables
2. **Database Errors**: Verify RLS policies
3. **Payment Issues**: Check Stripe configuration
4. **Authentication Problems**: Verify Supabase settings

### Support Resources
- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment Guide](https://nextjs.org/docs/deployment)
- [Supabase Production Guide](https://supabase.com/docs/guides/platform)

---

**🎉 Congratulations! Your MoodAI app is now live!** 🎉
