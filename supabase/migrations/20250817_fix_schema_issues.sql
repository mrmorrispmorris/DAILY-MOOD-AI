-- Fix Schema Issues Migration
-- This migration ensures the correct table structure exists

-- Drop and recreate mood_entries table with correct schema
DROP TABLE IF EXISTS public.mood_entries CASCADE;
DROP TABLE IF EXISTS public.mood_logs CASCADE;

-- Recreate mood_entries table with all required columns
CREATE TABLE public.mood_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, -- Remove foreign key constraint temporarily
  date date NOT NULL,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  emoji text DEFAULT '😐',
  notes text DEFAULT '',
  tags text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create mood_logs table as alternative (no foreign key constraints)
CREATE TABLE public.mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id uuid NOT NULL,
  user_email text,
  mood_score integer NOT NULL CHECK (mood_score >= 1 AND mood_score <= 10),
  emoji text DEFAULT '😐',
  notes text DEFAULT '',
  tags text[] DEFAULT '{}',
  log_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.mood_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_logs ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies for mood_entries (using auth.uid() directly)
CREATE POLICY "Users can read own mood entries"
  ON public.mood_entries
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own mood entries"
  ON public.mood_entries
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood entries"
  ON public.mood_entries
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood entries"
  ON public.mood_entries
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Simple RLS policies for mood_logs (using auth.uid() directly)
CREATE POLICY "Users can read own mood logs"
  ON public.mood_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can create own mood logs"
  ON public.mood_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update own mood logs"
  ON public.mood_logs
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can delete own mood logs"
  ON public.mood_logs
  FOR DELETE
  TO authenticated
  USING (auth.uid() = auth_user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS mood_entries_user_id_idx ON public.mood_entries(user_id);
CREATE INDEX IF NOT EXISTS mood_entries_date_idx ON public.mood_entries(date DESC);
CREATE INDEX IF NOT EXISTS mood_entries_user_date_idx ON public.mood_entries(user_id, date DESC);

CREATE INDEX IF NOT EXISTS mood_logs_auth_user_id_idx ON public.mood_logs(auth_user_id);
CREATE INDEX IF NOT EXISTS mood_logs_date_idx ON public.mood_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS mood_logs_user_date_idx ON public.mood_logs(auth_user_id, log_date DESC);
