-- DailyMood AI - Initial Database Schema
-- Migration 001: Core tables and functions
-- Created: 2025-01-26

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table (enhanced with subscription tracking)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Subscription Management
    subscription_level VARCHAR(20) DEFAULT 'free' CHECK (subscription_level IN ('free', 'premium', 'enterprise')),
    subscription_status VARCHAR(20) DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'inactive', 'cancelled', 'past_due')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    stripe_customer_id VARCHAR(255),
    
    -- User Preferences
    timezone VARCHAR(50) DEFAULT 'UTC',
    language VARCHAR(10) DEFAULT 'en',
    notification_preferences JSONB DEFAULT '{
        "daily_reminder": true,
        "weekly_summary": true,
        "streak_celebrations": true,
        "insights_ready": true
    }'::jsonb,
    
    -- Engagement Tracking
    last_login_at TIMESTAMPTZ,
    last_mood_entry TIMESTAMPTZ,
    total_mood_entries INTEGER DEFAULT 0,
    current_streak INTEGER DEFAULT 0,
    longest_streak INTEGER DEFAULT 0,
    
    -- Analytics
    onboarding_completed BOOLEAN DEFAULT false,
    referral_code VARCHAR(20) UNIQUE,
    referred_by UUID REFERENCES public.users(id),
    
    CONSTRAINT users_email_check CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Mood entries table (enhanced with activities and tags)
CREATE TABLE IF NOT EXISTS public.mood_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Core mood data
    date DATE NOT NULL,
    mood_score INTEGER NOT NULL CHECK (mood_score >= 1 AND mood_score <= 5),
    emoji VARCHAR(10),
    mood_label VARCHAR(20), -- 'Awful', 'Bad', 'Meh', 'Good', 'Rad'
    
    -- Enhanced tracking
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    activities TEXT[] DEFAULT '{}',
    
    -- Context data
    entry_mode VARCHAR(20) DEFAULT 'detailed' CHECK (entry_mode IN ('quick', 'detailed')),
    location_context JSONB, -- Optional: city, weather, etc.
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, date),
    INDEX idx_mood_entries_user_date (user_id, date DESC),
    INDEX idx_mood_entries_mood_score (mood_score),
    INDEX idx_mood_entries_tags USING GIN (tags),
    INDEX idx_mood_entries_activities USING GIN (activities)
);

-- AI insights table
CREATE TABLE IF NOT EXISTS public.ai_insights (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Insight content
    insights JSONB NOT NULL,
    insight_type VARCHAR(50) DEFAULT 'weekly' CHECK (insight_type IN ('daily', 'weekly', 'monthly', 'custom')),
    
    -- AI metadata
    ai_model VARCHAR(50) DEFAULT 'gpt-4',
    processing_time_ms INTEGER,
    token_count INTEGER,
    cost_cents INTEGER,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days'),
    
    INDEX idx_ai_insights_user_created (user_id, created_at DESC),
    INDEX idx_ai_insights_type (insight_type)
);

-- Payment attempts table (for Stripe integration tracking)
CREATE TABLE IF NOT EXISTS public.payment_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Stripe data
    session_id VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    amount_cents INTEGER,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    error_message TEXT,
    
    INDEX idx_payment_attempts_user (user_id),
    INDEX idx_payment_attempts_session (session_id),
    INDEX idx_payment_attempts_status (status)
);

-- Revenue events table (for business analytics)
CREATE TABLE IF NOT EXISTS public.revenue_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event details
    type VARCHAR(50) NOT NULL CHECK (type IN ('new_subscription', 'subscription_renewal', 'subscription_upgrade', 'subscription_cancellation')),
    amount_cents INTEGER NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    
    -- User association
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    stripe_customer_id VARCHAR(255),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_revenue_events_type (type),
    INDEX idx_revenue_events_date (created_at),
    INDEX idx_revenue_events_user (user_id)
);

-- Analytics events table (for user behavior tracking)
CREATE TABLE IF NOT EXISTS public.analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Event data
    event_name VARCHAR(100) NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    session_id VARCHAR(100),
    
    -- Event properties
    properties JSONB DEFAULT '{}',
    
    -- Context
    user_agent TEXT,
    ip_address INET,
    referrer TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    INDEX idx_analytics_events_name (event_name),
    INDEX idx_analytics_events_user (user_id),
    INDEX idx_analytics_events_date (created_at),
    INDEX idx_analytics_events_properties USING GIN (properties)
);

-- User goals table (premium feature)
CREATE TABLE IF NOT EXISTS public.user_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Goal details
    title VARCHAR(255) NOT NULL,
    description TEXT,
    goal_type VARCHAR(50) NOT NULL CHECK (goal_type IN ('mood_average', 'streak', 'consistency', 'custom')),
    target_value NUMERIC NOT NULL,
    current_value NUMERIC DEFAULT 0,
    
    -- Status
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    target_date DATE,
    completed_at TIMESTAMPTZ,
    
    INDEX idx_user_goals_user (user_id),
    INDEX idx_user_goals_status (status),
    INDEX idx_user_goals_type (goal_type)
);

-- Notification queue table
CREATE TABLE IF NOT EXISTS public.notification_queue (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Notification details
    type VARCHAR(50) NOT NULL CHECK (type IN ('daily_reminder', 'streak_celebration', 'weekly_summary', 'premium_upgrade', 'reengagement')),
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    
    -- Delivery
    scheduled_for TIMESTAMPTZ NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'cancelled')),
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    
    -- Channels
    send_email BOOLEAN DEFAULT true,
    send_push BOOLEAN DEFAULT true,
    
    INDEX idx_notification_queue_user (user_id),
    INDEX idx_notification_queue_scheduled (scheduled_for),
    INDEX idx_notification_queue_status (status)
);

-- Functions and triggers for automation

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply update trigger to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_mood_entries_updated_at BEFORE UPDATE ON public.mood_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update user stats when mood entries change
CREATE OR REPLACE FUNCTION update_user_mood_stats()
RETURNS TRIGGER AS $$
DECLARE
    streak_count INTEGER := 0;
    total_entries INTEGER := 0;
BEGIN
    -- Count total entries for this user
    SELECT COUNT(*) INTO total_entries
    FROM public.mood_entries 
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id);
    
    -- Calculate current streak
    WITH daily_entries AS (
        SELECT date, ROW_NUMBER() OVER (ORDER BY date DESC) as row_num
        FROM public.mood_entries 
        WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
        ORDER BY date DESC
    ),
    streak_calc AS (
        SELECT COUNT(*) as streak
        FROM daily_entries
        WHERE date = CURRENT_DATE - (row_num - 1)
    )
    SELECT COALESCE(streak, 0) INTO streak_count FROM streak_calc;
    
    -- Update user stats
    UPDATE public.users 
    SET 
        total_mood_entries = total_entries,
        current_streak = streak_count,
        longest_streak = GREATEST(longest_streak, streak_count),
        last_mood_entry = CASE 
            WHEN TG_OP = 'DELETE' THEN last_mood_entry
            ELSE NOW()
        END
    WHERE id = COALESCE(NEW.user_id, OLD.user_id);
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Apply mood stats trigger
CREATE TRIGGER update_user_mood_stats_trigger
    AFTER INSERT OR UPDATE OR DELETE ON public.mood_entries
    FOR EACH ROW EXECUTE FUNCTION update_user_mood_stats();

-- Function to generate referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL THEN
        NEW.referral_code := UPPER(SUBSTRING(encode(gen_random_bytes(6), 'base64') FROM 1 FOR 8));
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply referral code trigger
CREATE TRIGGER generate_referral_code_trigger
    BEFORE INSERT ON public.users
    FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- Row Level Security (RLS) policies

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.revenue_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_queue ENABLE ROW LEVEL SECURITY;

-- Users can only see/edit their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);
    
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Mood entries policies
CREATE POLICY "Users can manage own mood entries" ON public.mood_entries
    FOR ALL USING (auth.uid() = user_id);

-- AI insights policies  
CREATE POLICY "Users can view own insights" ON public.ai_insights
    FOR SELECT USING (auth.uid() = user_id);

-- Payment attempts policies
CREATE POLICY "Users can view own payments" ON public.payment_attempts
    FOR SELECT USING (auth.uid() = user_id);

-- User goals policies
CREATE POLICY "Users can manage own goals" ON public.user_goals
    FOR ALL USING (auth.uid() = user_id);

-- Notification queue policies
CREATE POLICY "Users can view own notifications" ON public.notification_queue
    FOR SELECT USING (auth.uid() = user_id);

-- Analytics and revenue are admin-only (no user policies)

-- Create indexes for performance
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_subscription ON public.users(subscription_level, subscription_status);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_users_referral ON public.users(referral_code) WHERE referral_code IS NOT NULL;

-- Materialized view for user analytics (refreshed daily)
CREATE MATERIALIZED VIEW IF NOT EXISTS public.user_analytics AS
SELECT 
    DATE_TRUNC('day', created_at) as signup_date,
    COUNT(*) as new_signups,
    COUNT(CASE WHEN subscription_level = 'premium' THEN 1 END) as premium_signups,
    AVG(total_mood_entries) as avg_mood_entries,
    AVG(current_streak) as avg_current_streak
FROM public.users
GROUP BY DATE_TRUNC('day', created_at)
ORDER BY signup_date DESC;

CREATE UNIQUE INDEX ON public.user_analytics (signup_date);

-- Initial data seeding
INSERT INTO public.users (id, email, subscription_level, created_at) 
VALUES ('00000000-0000-0000-0000-000000000000', 'admin@dailymood.ai', 'enterprise', NOW())
ON CONFLICT (email) DO NOTHING;

-- Migration completion
INSERT INTO public.schema_migrations (version, applied_at) 
VALUES ('001', NOW())
ON CONFLICT (version) DO NOTHING;


