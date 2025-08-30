/*
  Database Performance Optimization
  Indexes, query optimization, and performance enhancements for production
*/

-- ============================================
-- PERFORMANCE INDEXES
-- ============================================

-- Mood entries performance indexes (most frequently queried table)
CREATE INDEX CONCURRENTLY IF NOT EXISTS mood_entries_user_date_idx 
  ON mood_entries(user_id, date DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS mood_entries_created_at_idx 
  ON mood_entries(created_at DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS mood_entries_mood_score_idx 
  ON mood_entries(mood_score) 
  WHERE mood_score IS NOT NULL;

-- Analytics events performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_events_user_timestamp_idx 
  ON analytics_events(user_id, timestamp DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS analytics_events_event_name_timestamp_idx 
  ON analytics_events(event_name, timestamp DESC);

-- Users table performance indexes
CREATE INDEX CONCURRENTLY IF NOT EXISTS users_subscription_level_idx 
  ON users(subscription_level);

CREATE INDEX CONCURRENTLY IF NOT EXISTS users_email_idx 
  ON users(email);

-- ============================================
-- QUERY OPTIMIZATION VIEWS
-- ============================================

-- Fast user mood summary view
CREATE OR REPLACE VIEW user_mood_summary AS
SELECT 
  user_id,
  COUNT(*) as total_entries,
  AVG(mood_score) as average_mood,
  MAX(date) as last_entry_date,
  COUNT(*) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '7 days') as entries_last_week,
  COUNT(*) FILTER (WHERE date >= CURRENT_DATE - INTERVAL '30 days') as entries_last_month
FROM mood_entries
GROUP BY user_id;

-- Fast analytics summary view  
CREATE OR REPLACE VIEW daily_analytics_summary AS
SELECT 
  date_trunc('day', timestamp) as date,
  event_name,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users
FROM analytics_events
WHERE timestamp >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY date_trunc('day', timestamp), event_name
ORDER BY date DESC, event_name;

-- Revenue metrics view (optimized for analytics dashboard)
CREATE OR REPLACE VIEW revenue_metrics AS
SELECT 
  date_trunc('day', created_at) as date,
  COUNT(*) FILTER (WHERE status = 'active') as new_subscriptions,
  COUNT(*) FILTER (WHERE status = 'canceled') as cancellations,
  COUNT(*) as total_subscription_events,
  -- Calculate estimated MRR (Monthly Recurring Revenue)
  COUNT(*) FILTER (WHERE status = 'active') * 10 as estimated_daily_mrr_change
FROM subscriptions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;

-- ============================================
-- PERFORMANCE FUNCTIONS
-- ============================================

-- Optimized user mood streak calculation
CREATE OR REPLACE FUNCTION calculate_mood_streak(p_user_id uuid)
RETURNS integer AS $$
DECLARE
  streak_count integer := 0;
  current_date date := CURRENT_DATE;
  has_entry boolean;
BEGIN
  LOOP
    -- Check if user has mood entry for current date
    SELECT EXISTS(
      SELECT 1 FROM mood_entries 
      WHERE user_id = p_user_id AND date = current_date
    ) INTO has_entry;
    
    IF NOT has_entry THEN
      EXIT; -- Break streak
    END IF;
    
    streak_count := streak_count + 1;
    current_date := current_date - INTERVAL '1 day';
    
    -- Prevent infinite loops (max 365 days)
    IF streak_count >= 365 THEN
      EXIT;
    END IF;
  END LOOP;
  
  RETURN streak_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Fast user statistics function
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id uuid)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'total_entries', COALESCE(COUNT(*), 0),
    'average_mood', COALESCE(ROUND(AVG(mood_score)::numeric, 1), 0),
    'current_streak', calculate_mood_streak(p_user_id),
    'entries_this_month', COALESCE(COUNT(*) FILTER (
      WHERE date >= date_trunc('month', CURRENT_DATE)
    ), 0),
    'best_mood', COALESCE(MAX(mood_score), 0),
    'last_entry_date', MAX(date)
  )
  INTO result
  FROM mood_entries
  WHERE user_id = p_user_id;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================
-- CLEANUP AND MAINTENANCE
-- ============================================

-- Function to archive old analytics events (data retention)
CREATE OR REPLACE FUNCTION archive_old_analytics()
RETURNS void AS $$
BEGIN
  -- Archive events older than 1 year to separate table
  CREATE TABLE IF NOT EXISTS analytics_events_archive (LIKE analytics_events);
  
  WITH archived_events AS (
    DELETE FROM analytics_events 
    WHERE timestamp < CURRENT_DATE - INTERVAL '1 year'
    RETURNING *
  )
  INSERT INTO analytics_events_archive 
  SELECT * FROM archived_events;
  
  -- Log the archiving operation
  RAISE NOTICE 'Archived analytics events older than 1 year';
END;
$$ LANGUAGE plpgsql;

-- Function to update table statistics for query planner
CREATE OR REPLACE FUNCTION update_table_stats()
RETURNS void AS $$
BEGIN
  ANALYZE mood_entries;
  ANALYZE analytics_events;
  ANALYZE users;
  ANALYZE subscriptions;
  
  RAISE NOTICE 'Updated table statistics for query optimization';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PERFORMANCE MONITORING
-- ============================================

-- View to monitor slow queries
CREATE OR REPLACE VIEW slow_queries AS
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  rows,
  100.0 * shared_blks_hit / nullif(shared_blks_hit + shared_blks_read, 0) AS hit_percent
FROM pg_stat_statements 
WHERE mean_time > 100 -- Queries taking more than 100ms on average
ORDER BY mean_time DESC;

-- Performance monitoring function
CREATE OR REPLACE FUNCTION performance_report()
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  SELECT json_build_object(
    'database_size', pg_size_pretty(pg_database_size(current_database())),
    'active_connections', (SELECT count(*) FROM pg_stat_activity WHERE state = 'active'),
    'cache_hit_ratio', (
      SELECT round(
        100.0 * sum(blks_hit) / nullif(sum(blks_hit) + sum(blks_read), 0), 2
      ) FROM pg_stat_database WHERE datname = current_database()
    ),
    'largest_tables', (
      SELECT json_agg(json_build_object('table', tablename, 'size', pg_size_pretty(size)))
      FROM (
        SELECT tablename, pg_total_relation_size(tablename::regclass) as size
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY size DESC
        LIMIT 5
      ) t
    )
  ) INTO result;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;


