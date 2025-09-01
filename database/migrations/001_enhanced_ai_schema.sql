-- Enhanced Database Schema for Daily Mood AI - Phase 2 Preparation
-- Following PRD specifications for AI conversations, goals, and enhanced mood tracking

-- =============================================================================
-- ENHANCED MOOD ENTRIES TABLE
-- =============================================================================

-- Add new columns to existing mood_entries for AI integration
ALTER TABLE mood_entries 
ADD COLUMN IF NOT EXISTS emotional_tags jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS context_note text,
ADD COLUMN IF NOT EXISTS activities jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS triggers jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS ai_insights jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS weather_context jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS energy_level integer CHECK (energy_level >= 1 AND energy_level <= 10),
ADD COLUMN IF NOT EXISTS stress_level integer CHECK (stress_level >= 1 AND stress_level <= 10),
ADD COLUMN IF NOT EXISTS sleep_quality integer CHECK (sleep_quality >= 1 AND sleep_level <= 10),
ADD COLUMN IF NOT EXISTS social_interactions jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS photos jsonb DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS location_context text;

-- Create index for faster AI query performance
CREATE INDEX IF NOT EXISTS idx_mood_entries_ai_insights ON mood_entries USING GIN (ai_insights);
CREATE INDEX IF NOT EXISTS idx_mood_entries_activities ON mood_entries USING GIN (activities);
CREATE INDEX IF NOT EXISTS idx_mood_entries_triggers ON mood_entries USING GIN (triggers);

-- =============================================================================
-- AI CONVERSATIONS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS ai_conversations (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    conversation_thread_id text NOT NULL DEFAULT gen_random_uuid(),
    messages jsonb[] DEFAULT '{}',
    context_summary text,
    personality_profile jsonb DEFAULT '{}'::jsonb,
    mood_context jsonb DEFAULT '{}'::jsonb,
    conversation_type text DEFAULT 'general' CHECK (conversation_type IN ('general', 'crisis', 'support', 'celebration', 'check-in')),
    last_message_at timestamptz DEFAULT now(),
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS policies for ai_conversations
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own conversations" ON ai_conversations
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own conversations" ON ai_conversations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own conversations" ON ai_conversations
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own conversations" ON ai_conversations
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_ai_conversations_user_id ON ai_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_thread_id ON ai_conversations(conversation_thread_id);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_active ON ai_conversations(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_ai_conversations_type ON ai_conversations(user_id, conversation_type);

-- =============================================================================
-- USER GOALS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_goals (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    goal_type text NOT NULL CHECK (goal_type IN ('mood', 'activity', 'habit', 'wellness', 'social', 'sleep', 'exercise', 'mindfulness')),
    title text NOT NULL,
    description text,
    target_frequency jsonb DEFAULT '{"times": 1, "period": "day"}'::jsonb,
    target_value numeric,
    current_progress numeric DEFAULT 0,
    ai_suggestions jsonb DEFAULT '[]'::jsonb,
    status text DEFAULT 'active' CHECK (status IN ('active', 'completed', 'paused', 'cancelled')),
    difficulty_level integer DEFAULT 1 CHECK (difficulty_level >= 1 AND difficulty_level <= 5),
    category text,
    start_date date DEFAULT CURRENT_DATE,
    target_date date,
    reminder_settings jsonb DEFAULT '{}'::jsonb,
    completion_criteria jsonb DEFAULT '{}'::jsonb,
    streak_count integer DEFAULT 0,
    best_streak integer DEFAULT 0,
    last_completed_at timestamptz,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS policies for user_goals
ALTER TABLE user_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goals" ON user_goals
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goals" ON user_goals
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own goals" ON user_goals
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own goals" ON user_goals
    FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_goals_user_id ON user_goals(user_id);
CREATE INDEX IF NOT EXISTS idx_user_goals_type ON user_goals(user_id, goal_type);
CREATE INDEX IF NOT EXISTS idx_user_goals_status ON user_goals(user_id, status);
CREATE INDEX IF NOT EXISTS idx_user_goals_active ON user_goals(user_id) WHERE status = 'active';

-- =============================================================================
-- GOAL PROGRESS TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS goal_progress (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    goal_id bigint REFERENCES user_goals(id) ON DELETE CASCADE NOT NULL,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    progress_value numeric NOT NULL,
    notes text,
    mood_entry_id bigint REFERENCES mood_entries(id) ON DELETE SET NULL,
    ai_encouragement text,
    completed_at timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- RLS policies for goal_progress
ALTER TABLE goal_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own goal progress" ON goal_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own goal progress" ON goal_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_goal_progress_goal_id ON goal_progress(goal_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_user_id ON goal_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_goal_progress_date ON goal_progress(user_id, completed_at);

-- =============================================================================
-- USER PERSONALITY PROFILES TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_personality_profiles (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    big_five_scores jsonb DEFAULT '{}'::jsonb, -- Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
    communication_preferences jsonb DEFAULT '{}'::jsonb, -- Tone, frequency, interaction style
    trigger_patterns jsonb DEFAULT '[]'::jsonb, -- Common mood triggers
    support_preferences jsonb DEFAULT '[]'::jsonb, -- Preferred types of support/encouragement
    crisis_indicators jsonb DEFAULT '[]'::jsonb, -- Patterns that indicate crisis risk
    preferred_activities jsonb DEFAULT '[]'::jsonb, -- Activities that improve mood
    timezone text DEFAULT 'UTC',
    active_hours jsonb DEFAULT '{"start": "09:00", "end": "21:00"}'::jsonb,
    notification_preferences jsonb DEFAULT '{}'::jsonb,
    ai_coaching_style text DEFAULT 'supportive' CHECK (ai_coaching_style IN ('gentle', 'supportive', 'motivational', 'analytical', 'playful')),
    privacy_level text DEFAULT 'standard' CHECK (privacy_level IN ('minimal', 'standard', 'detailed', 'full')),
    last_updated timestamptz DEFAULT now(),
    created_at timestamptz DEFAULT now()
);

-- RLS policies for user_personality_profiles
ALTER TABLE user_personality_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own personality profile" ON user_personality_profiles
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own personality profile" ON user_personality_profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own personality profile" ON user_personality_profiles
    FOR UPDATE USING (auth.uid() = user_id);

-- =============================================================================
-- CRISIS SUPPORT LOGS TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS crisis_support_logs (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    trigger_event text NOT NULL, -- What triggered the crisis detection
    mood_score integer,
    risk_level text NOT NULL CHECK (risk_level IN ('low', 'moderate', 'high', 'critical')),
    ai_response text,
    resources_provided jsonb DEFAULT '[]'::jsonb,
    professional_referral boolean DEFAULT false,
    follow_up_scheduled boolean DEFAULT false,
    follow_up_completed boolean DEFAULT false,
    user_feedback text,
    resolution_status text DEFAULT 'open' CHECK (resolution_status IN ('open', 'in_progress', 'resolved', 'escalated')),
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- RLS policies for crisis_support_logs
ALTER TABLE crisis_support_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own crisis logs" ON crisis_support_logs
    FOR SELECT USING (auth.uid() = user_id);

-- Only system/admin can insert crisis logs (for safety)
-- Users cannot directly insert crisis logs

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_crisis_logs_user_id ON crisis_support_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_risk_level ON crisis_support_logs(user_id, risk_level);
CREATE INDEX IF NOT EXISTS idx_crisis_logs_status ON crisis_support_logs(resolution_status);

-- =============================================================================
-- ACHIEVEMENT TRACKING TABLE
-- =============================================================================

CREATE TABLE IF NOT EXISTS user_achievements (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    achievement_id text NOT NULL, -- References achievement definitions
    achievement_name text NOT NULL,
    achievement_description text,
    category text DEFAULT 'general' CHECK (category IN ('general', 'mood', 'goals', 'social', 'wellness', 'consistency')),
    xp_awarded integer DEFAULT 0,
    badge_icon text, -- Emoji or icon name
    unlocked_at timestamptz DEFAULT now(),
    is_milestone boolean DEFAULT false,
    progress_data jsonb DEFAULT '{}'::jsonb,
    created_at timestamptz DEFAULT now()
);

-- RLS policies for user_achievements
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own achievements" ON user_achievements
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own achievements" ON user_achievements
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_category ON user_achievements(user_id, category);

-- =============================================================================
-- UPDATE FUNCTIONS FOR AUTOMATIC TIMESTAMPS
-- =============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for automatic timestamp updates
DROP TRIGGER IF EXISTS update_ai_conversations_updated_at ON ai_conversations;
CREATE TRIGGER update_ai_conversations_updated_at 
    BEFORE UPDATE ON ai_conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_goals_updated_at ON user_goals;
CREATE TRIGGER update_user_goals_updated_at 
    BEFORE UPDATE ON user_goals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_crisis_support_logs_updated_at ON crisis_support_logs;
CREATE TRIGGER update_crisis_support_logs_updated_at 
    BEFORE UPDATE ON crisis_support_logs 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- VIEWS FOR COMMON QUERIES
-- =============================================================================

-- View for active goals with progress
CREATE OR REPLACE VIEW active_goals_with_progress AS
SELECT 
    g.*,
    COALESCE(latest_progress.progress_value, 0) as latest_progress,
    latest_progress.completed_at as last_progress_date,
    CASE 
        WHEN g.target_date < CURRENT_DATE THEN 'overdue'
        WHEN g.target_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due_soon'
        ELSE 'on_track'
    END as status_category
FROM user_goals g
LEFT JOIN LATERAL (
    SELECT progress_value, completed_at
    FROM goal_progress gp 
    WHERE gp.goal_id = g.id 
    ORDER BY completed_at DESC 
    LIMIT 1
) latest_progress ON true
WHERE g.status = 'active';

-- View for mood trends with AI insights
CREATE OR REPLACE VIEW mood_trends_with_ai AS
SELECT 
    me.*,
    EXTRACT(DOW FROM me.created_at) as day_of_week,
    EXTRACT(HOUR FROM me.created_at) as hour_of_day,
    LAG(me.mood_score) OVER (PARTITION BY me.user_id ORDER BY me.created_at) as previous_mood,
    AVG(me.mood_score) OVER (
        PARTITION BY me.user_id 
        ORDER BY me.created_at 
        ROWS BETWEEN 6 PRECEDING AND CURRENT ROW
    ) as rolling_7day_avg
FROM mood_entries me
ORDER BY me.user_id, me.created_at;

-- =============================================================================
-- INITIAL DATA AND DEFAULTS
-- =============================================================================

-- Insert default personality profile for existing users (if any)
INSERT INTO user_personality_profiles (user_id)
SELECT id FROM auth.users 
WHERE id NOT IN (SELECT user_id FROM user_personality_profiles)
ON CONFLICT (user_id) DO NOTHING;

-- =============================================================================
-- COMMENTS AND DOCUMENTATION
-- =============================================================================

COMMENT ON TABLE ai_conversations IS 'Stores AI conversation context and chat history for MOODY AI interactions';
COMMENT ON TABLE user_goals IS 'User-defined goals for mood, habits, and wellness tracking with AI support';
COMMENT ON TABLE goal_progress IS 'Progress tracking for user goals with AI encouragement';
COMMENT ON TABLE user_personality_profiles IS 'Personality and preference profiles for personalized AI interactions';
COMMENT ON TABLE crisis_support_logs IS 'Logs crisis detection events and support interventions for safety';
COMMENT ON TABLE user_achievements IS 'Achievement and gamification system for user engagement';

-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

-- Verify all tables exist
DO $$
DECLARE
    tables_to_check text[] := ARRAY[
        'mood_entries', 'ai_conversations', 'user_goals', 'goal_progress', 
        'user_personality_profiles', 'crisis_support_logs', 'user_achievements'
    ];
    table_name text;
    table_count integer;
BEGIN
    FOREACH table_name IN ARRAY tables_to_check
    LOOP
        SELECT COUNT(*) INTO table_count 
        FROM information_schema.tables 
        WHERE table_name = table_name AND table_schema = 'public';
        
        IF table_count = 0 THEN
            RAISE EXCEPTION 'Table % was not created successfully', table_name;
        END IF;
        
        RAISE NOTICE 'Table % verified successfully', table_name;
    END LOOP;
    
    RAISE NOTICE 'Enhanced AI database schema migration completed successfully!';
END $$;
