-- AI Insights cache table for performance optimization
-- Caches OpenAI-generated insights to reduce API costs and improve response times

CREATE TABLE IF NOT EXISTS ai_insights_cache (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- User this cache belongs to
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Cache key based on user data hash (to detect when insights need refresh)
    data_hash VARCHAR(64) NOT NULL, -- SHA-256 of mood entries used for insights
    mood_entries_count INTEGER NOT NULL, -- Number of entries used for these insights
    
    -- Cached AI insights data
    insights JSONB NOT NULL, -- The actual insights from OpenAI
    
    -- Insight metadata
    model_used VARCHAR(50) DEFAULT 'gpt-4o-mini' NOT NULL,
    tokens_used INTEGER DEFAULT 0 NOT NULL,
    processing_time_ms INTEGER DEFAULT 0 NOT NULL,
    confidence_score DECIMAL(3,2) DEFAULT 0.80 NOT NULL, -- 0.00 to 1.00
    
    -- Cache management
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) + INTERVAL '24 hours' NOT NULL,
    access_count INTEGER DEFAULT 0 NOT NULL,
    last_accessed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Cache invalidation flags
    is_valid BOOLEAN DEFAULT TRUE NOT NULL,
    invalidation_reason VARCHAR(100), -- 'expired', 'new_data', 'manual', 'error'
    
    -- Ensure unique cache per user
    UNIQUE(user_id, data_hash)
);

-- Table for tracking AI insights performance and costs
CREATE TABLE IF NOT EXISTS ai_insights_analytics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Request tracking
    request_type VARCHAR(50) NOT NULL, -- 'insights', 'predictions', 'correlations'
    was_cached BOOLEAN NOT NULL,
    
    -- Performance metrics
    response_time_ms INTEGER NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    api_cost_usd DECIMAL(8,4) DEFAULT 0.0000,
    
    -- Quality metrics
    user_satisfaction INTEGER, -- 1-5 rating if user provides feedback
    user_feedback TEXT,
    
    -- Timestamps
    requested_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE ai_insights_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights_analytics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ai_insights_cache
CREATE POLICY "Users can view their own cached insights" 
ON ai_insights_cache FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can manage insight cache" 
ON ai_insights_cache FOR ALL 
WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL); -- Allow system updates

-- RLS Policies for ai_insights_analytics
CREATE POLICY "Users can view their own analytics" 
ON ai_insights_analytics FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "System can insert analytics" 
ON ai_insights_analytics FOR INSERT 
WITH CHECK (true); -- System can track all requests

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_cache_user_id ON ai_insights_cache(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_cache_hash ON ai_insights_cache(user_id, data_hash);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires ON ai_insights_cache(expires_at);
CREATE INDEX IF NOT EXISTS idx_ai_cache_valid ON ai_insights_cache(user_id, is_valid) WHERE is_valid = true;

CREATE INDEX IF NOT EXISTS idx_ai_analytics_user ON ai_insights_analytics(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_type ON ai_insights_analytics(request_type);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_cached ON ai_insights_analytics(was_cached);
CREATE INDEX IF NOT EXISTS idx_ai_analytics_date ON ai_insights_analytics(requested_at);

-- Function to clean up expired cache entries
CREATE OR REPLACE FUNCTION cleanup_expired_ai_cache()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    -- Mark expired entries as invalid
    UPDATE ai_insights_cache 
    SET is_valid = false, 
        invalidation_reason = 'expired'
    WHERE expires_at < TIMEZONE('utc', NOW()) 
    AND is_valid = true;
    
    -- Delete old invalid entries (keep for 7 days for analytics)
    DELETE FROM ai_insights_cache 
    WHERE is_valid = false 
    AND generated_at < TIMEZONE('utc', NOW()) - INTERVAL '7 days';
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Function to generate data hash for cache invalidation
CREATE OR REPLACE FUNCTION generate_mood_data_hash(p_user_id UUID)
RETURNS TEXT AS $$
DECLARE
    data_string TEXT;
BEGIN
    -- Create string from recent mood data
    SELECT string_agg(
        mood_score::text || '|' || 
        COALESCE(array_to_string(activities, ','), '') || '|' || 
        COALESCE(weather, '') || '|' ||
        extract(epoch from created_at)::text, 
        '||'
        ORDER BY created_at DESC
    )
    INTO data_string
    FROM mood_entries 
    WHERE user_id = p_user_id 
    AND created_at > TIMEZONE('utc', NOW()) - INTERVAL '30 days'
    LIMIT 30;
    
    -- Return SHA-256 hash
    RETURN encode(digest(COALESCE(data_string, ''), 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to invalidate cache when new mood entries are added
CREATE OR REPLACE FUNCTION invalidate_ai_cache_on_mood_update()
RETURNS TRIGGER AS $$
BEGIN
    -- Invalidate existing cache for this user
    UPDATE ai_insights_cache 
    SET is_valid = false,
        invalidation_reason = 'new_data'
    WHERE user_id = COALESCE(NEW.user_id, OLD.user_id)
    AND is_valid = true;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger to invalidate cache when mood data changes
CREATE TRIGGER invalidate_cache_on_mood_change
    AFTER INSERT OR UPDATE OR DELETE ON mood_entries
    FOR EACH ROW EXECUTE FUNCTION invalidate_ai_cache_on_mood_update();

-- Schedule cleanup of expired cache entries (if pg_cron is available)
-- This would typically be set up separately in production
-- SELECT cron.schedule('cleanup-ai-cache', '0 2 * * *', 'SELECT cleanup_expired_ai_cache();');


