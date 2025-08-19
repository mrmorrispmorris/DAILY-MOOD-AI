# MoodAI - Daily Mood Tracking App

AI-powered mood tracking application built with Next.js 14, Supabase, and Stripe.

## 🎯 Features

- **Authentication**: Magic link login via Supabase
- **Mood Tracking**: Log daily moods with notes and activities
- **AI Insights**: Predictive analytics for mood patterns
- **Data Visualization**: Interactive charts and trends
- **Premium Features**: Stripe-powered subscription system
- **Responsive Design**: Modern UI with Tailwind CSS

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Supabase account
- Stripe account (for payments)

### Environment Variables
```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# Stripe Configuration  
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# App Configuration
NEXT_PUBLIC_URL=https://your-domain.com
```

### Development
```bash
npm install
npm run dev
```

### Production
```bash
npm run build
npm start
```

## 📊 Architecture

- **Frontend**: Next.js 14 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: Stripe Subscriptions
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## 🔐 Database Setup

Run the SQL migration in your Supabase dashboard:

```sql
-- See supabase/migrations/001_mood_tracking.sql
```

## 🎨 Key Components

- `MoodEntry`: Mood logging interface
- `MoodChart`: Data visualization
- `AIInsights`: Prediction algorithms
- `PremiumGate`: Subscription features

Built with ❤️ for better mental health tracking.