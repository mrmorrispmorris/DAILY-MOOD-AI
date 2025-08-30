-- Create system_alerts table for monitoring and alerting
CREATE TABLE IF NOT EXISTS system_alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(20) NOT NULL CHECK (type IN ('error', 'warning', 'info')),
  metric VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  threshold NUMERIC,
  current_value NUMERIC,
  environment VARCHAR(50) DEFAULT 'production',
  resolved BOOLEAN DEFAULT FALSE,
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create system_health_checks table for historical monitoring data
CREATE TABLE IF NOT EXISTS system_health_checks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  status VARCHAR(20) NOT NULL CHECK (status IN ('healthy', 'warning', 'unhealthy')),
  response_time_ms INTEGER,
  memory_usage_mb INTEGER,
  cpu_usage_percent NUMERIC,
  database_connected BOOLEAN,
  database_response_time_ms INTEGER,
  api_health JSONB DEFAULT '{}',
  environment VARCHAR(50) DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create performance_metrics table for tracking key performance indicators
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name VARCHAR(100) NOT NULL,
  metric_value NUMERIC NOT NULL,
  metric_unit VARCHAR(20),
  tags JSONB DEFAULT '{}',
  environment VARCHAR(50) DEFAULT 'production',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts (type);
CREATE INDEX IF NOT EXISTS idx_system_alerts_metric ON system_alerts (metric);
CREATE INDEX IF NOT EXISTS idx_system_alerts_created_at ON system_alerts (created_at);
CREATE INDEX IF NOT EXISTS idx_system_alerts_resolved ON system_alerts (resolved);
CREATE INDEX IF NOT EXISTS idx_system_alerts_environment ON system_alerts (environment);

CREATE INDEX IF NOT EXISTS idx_system_health_checks_status ON system_health_checks (status);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_created_at ON system_health_checks (created_at);
CREATE INDEX IF NOT EXISTS idx_system_health_checks_environment ON system_health_checks (environment);

CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON performance_metrics (metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics (created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_environment ON performance_metrics (environment);

-- Enable RLS (Row Level Security)
ALTER TABLE system_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_health_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_metrics ENABLE ROW LEVEL SECURITY;

-- Create policies (only service role can access monitoring data)
CREATE POLICY "Allow service role full access to system_alerts" 
ON system_alerts FOR ALL 
TO service_role
USING (true);

CREATE POLICY "Allow service role full access to system_health_checks" 
ON system_health_checks FOR ALL 
TO service_role
USING (true);

CREATE POLICY "Allow service role full access to performance_metrics" 
ON performance_metrics FOR ALL 
TO service_role
USING (true);

-- Create view for alert summary
CREATE OR REPLACE VIEW alert_summary AS
SELECT 
  DATE_TRUNC('day', created_at) as alert_date,
  type,
  metric,
  environment,
  COUNT(*) as alert_count,
  COUNT(CASE WHEN resolved = true THEN 1 END) as resolved_count,
  AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))/60) as avg_resolution_time_minutes
FROM system_alerts
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE_TRUNC('day', created_at), type, metric, environment
ORDER BY alert_date DESC;

-- Create view for system health trends
CREATE OR REPLACE VIEW health_trends AS
SELECT 
  DATE_TRUNC('hour', created_at) as check_hour,
  environment,
  AVG(response_time_ms) as avg_response_time,
  AVG(memory_usage_mb) as avg_memory_usage,
  AVG(database_response_time_ms) as avg_db_response_time,
  COUNT(*) as check_count,
  COUNT(CASE WHEN status = 'healthy' THEN 1 END) as healthy_count,
  COUNT(CASE WHEN status = 'warning' THEN 1 END) as warning_count,
  COUNT(CASE WHEN status = 'unhealthy' THEN 1 END) as unhealthy_count,
  ROUND((COUNT(CASE WHEN status = 'healthy' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2) as uptime_percentage
FROM system_health_checks
WHERE created_at >= NOW() - INTERVAL '7 days'
GROUP BY DATE_TRUNC('hour', created_at), environment
ORDER BY check_hour DESC;

-- Create function to get current system status
CREATE OR REPLACE FUNCTION get_current_system_status()
RETURNS TABLE(
  status TEXT,
  active_alerts_count BIGINT,
  last_health_check TIMESTAMP WITH TIME ZONE,
  uptime_24h NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    CASE 
      WHEN COUNT(CASE WHEN a.type = 'error' AND NOT a.resolved THEN 1 END) > 0 THEN 'unhealthy'
      WHEN COUNT(CASE WHEN a.type = 'warning' AND NOT a.resolved THEN 1 END) > 0 THEN 'warning'
      ELSE 'healthy'
    END as status,
    COUNT(CASE WHEN NOT a.resolved THEN 1 END) as active_alerts_count,
    MAX(h.created_at) as last_health_check,
    COALESCE(
      (SELECT ROUND((COUNT(CASE WHEN status = 'healthy' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 2)
       FROM system_health_checks 
       WHERE created_at >= NOW() - INTERVAL '24 hours'), 
      100
    ) as uptime_24h
  FROM system_alerts a
  CROSS JOIN (SELECT created_at FROM system_health_checks ORDER BY created_at DESC LIMIT 1) h
  WHERE a.created_at >= NOW() - INTERVAL '24 hours';
END;
$$ LANGUAGE plpgsql;

-- Create function to clean up old monitoring data (for maintenance)
CREATE OR REPLACE FUNCTION cleanup_monitoring_data(retention_days INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER := 0;
BEGIN
  -- Clean up old resolved alerts
  DELETE FROM system_alerts 
  WHERE created_at < NOW() - (retention_days || ' days')::INTERVAL 
  AND resolved = true;
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Clean up old health checks (keep only summary data older than 30 days)
  DELETE FROM system_health_checks 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND EXTRACT(MINUTE FROM created_at) NOT IN (0, 15, 30, 45); -- Keep only 15-minute intervals
  
  -- Clean up old performance metrics (keep daily aggregates)
  DELETE FROM performance_metrics 
  WHERE created_at < NOW() - INTERVAL '30 days'
  AND EXTRACT(HOUR FROM created_at) != 0
  AND EXTRACT(MINUTE FROM created_at) != 0;
  
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON alert_summary TO authenticated;
GRANT SELECT ON health_trends TO authenticated;
GRANT EXECUTE ON FUNCTION get_current_system_status() TO authenticated;
GRANT EXECUTE ON FUNCTION cleanup_monitoring_data(INTEGER) TO service_role;

-- Create indexes on views for performance
CREATE INDEX IF NOT EXISTS idx_alert_summary_date ON system_alerts (DATE_TRUNC('day', created_at));
CREATE INDEX IF NOT EXISTS idx_health_trends_hour ON system_health_checks (DATE_TRUNC('hour', created_at));

COMMENT ON TABLE system_alerts IS 'Stores system alerts and monitoring notifications';
COMMENT ON TABLE system_health_checks IS 'Historical system health check data';
COMMENT ON TABLE performance_metrics IS 'Application performance metrics and KPIs';
COMMENT ON VIEW alert_summary IS 'Daily alert summary for monitoring dashboard';
COMMENT ON VIEW health_trends IS 'System health trends over time';
COMMENT ON FUNCTION get_current_system_status() IS 'Returns current overall system health status';
COMMENT ON FUNCTION cleanup_monitoring_data(INTEGER) IS 'Cleans up old monitoring data to maintain performance';


