/*
  Analytics Events Table for Conversion Tracking
  Stores user behavior events for revenue optimization analytics
*/

-- Create analytics_events table
CREATE TABLE IF NOT EXISTS analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_name text NOT NULL,
  event_data jsonb DEFAULT '{}',
  timestamp timestamptz DEFAULT now(),
  session_id text,
  page_url text,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS analytics_events_user_id_idx ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS analytics_events_event_name_idx ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS analytics_events_timestamp_idx ON analytics_events(timestamp);
CREATE INDEX IF NOT EXISTS analytics_events_session_id_idx ON analytics_events(session_id);

-- RLS Policies - Only authenticated users can read their own analytics
CREATE POLICY "Users can read own analytics events"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analytics events"
  ON analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow anonymous users to insert events (for tracking before signup)
CREATE POLICY "Allow anonymous event tracking"
  ON analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (true);

-- Admin policy for reading all analytics (for dashboard)
CREATE POLICY "Admin can read all analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'admin@dailymood.ai'
    )
  );

-- Create materialized view for performance analytics
CREATE MATERIALIZED VIEW IF NOT EXISTS analytics_summary AS
SELECT 
  date_trunc('day', timestamp) as date,
  event_name,
  count(*) as event_count,
  count(DISTINCT user_id) as unique_users,
  count(DISTINCT session_id) as unique_sessions
FROM analytics_events
WHERE timestamp >= current_date - interval '30 days'
GROUP BY date_trunc('day', timestamp), event_name
ORDER BY date DESC;

-- Create indexes on materialized view
CREATE INDEX IF NOT EXISTS analytics_summary_date_idx ON analytics_summary(date);
CREATE INDEX IF NOT EXISTS analytics_summary_event_name_idx ON analytics_summary(event_name);

-- Function to refresh analytics summary
CREATE OR REPLACE FUNCTION refresh_analytics_summary()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW analytics_summary;
END;
$$ LANGUAGE plpgsql;

-- Schedule to refresh every hour (would be set up in production)
-- SELECT cron.schedule('refresh-analytics', '0 * * * *', 'SELECT refresh_analytics_summary();');


