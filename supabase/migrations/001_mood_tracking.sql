-- FILE: supabase/migrations/001_mood_tracking.sql
-- INSTRUCTION: Run this in Supabase SQL editor

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

-- Enable RLS
ALTER TABLE moods ENABLE ROW LEVEL SECURITY;

-- Users can only see their own moods
CREATE POLICY "Users can view own moods" ON moods
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own moods" ON moods
  FOR INSERT WITH CHECK (auth.uid() = user_id);
