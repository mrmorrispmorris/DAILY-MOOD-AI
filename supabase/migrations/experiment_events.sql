-- Create experiment_events table for A/B testing
CREATE TABLE IF NOT EXISTS experiment_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  experiment_id VARCHAR(100) NOT NULL,
  user_id UUID NOT NULL,
  variant VARCHAR(20) NOT NULL CHECK (variant IN ('control', 'treatment')),
  event_type VARCHAR(20) NOT NULL CHECK (event_type IN ('exposure', 'conversion')),
  additional_data JSONB DEFAULT '{}',
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_experiment_events_experiment_id ON experiment_events (experiment_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_user_id ON experiment_events (user_id);
CREATE INDEX IF NOT EXISTS idx_experiment_events_variant ON experiment_events (variant);
CREATE INDEX IF NOT EXISTS idx_experiment_events_event_type ON experiment_events (event_type);
CREATE INDEX IF NOT EXISTS idx_experiment_events_timestamp ON experiment_events (timestamp);
CREATE INDEX IF NOT EXISTS idx_experiment_events_composite ON experiment_events (experiment_id, variant, event_type);

-- Enable RLS (Row Level Security)
ALTER TABLE experiment_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow authenticated users to insert experiment events" 
ON experiment_events FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow authenticated users to read their own experiment events" 
ON experiment_events FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Allow service role full access to experiment events" 
ON experiment_events FOR ALL 
TO service_role
USING (true);

-- Create view for experiment analytics
CREATE OR REPLACE VIEW experiment_analytics AS
SELECT 
  experiment_id,
  variant,
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  DATE_TRUNC('day', timestamp) as event_date
FROM experiment_events
GROUP BY experiment_id, variant, event_type, DATE_TRUNC('day', timestamp)
ORDER BY experiment_id, event_date DESC;

-- Create view for experiment conversion rates
CREATE OR REPLACE VIEW experiment_conversions AS
SELECT 
  experiment_id,
  variant,
  COUNT(CASE WHEN event_type = 'exposure' THEN 1 END) as exposures,
  COUNT(CASE WHEN event_type = 'conversion' THEN 1 END) as conversions,
  ROUND(
    (COUNT(CASE WHEN event_type = 'conversion' THEN 1 END)::DECIMAL / 
     NULLIF(COUNT(CASE WHEN event_type = 'exposure' THEN 1 END), 0)) * 100, 
    2
  ) as conversion_rate
FROM experiment_events
GROUP BY experiment_id, variant;

-- Create function to get experiment results
CREATE OR REPLACE FUNCTION get_experiment_results(exp_id TEXT)
RETURNS TABLE(
  variant TEXT,
  exposures BIGINT,
  conversions BIGINT,
  conversion_rate NUMERIC,
  unique_users BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    e.variant::TEXT,
    COUNT(CASE WHEN e.event_type = 'exposure' THEN 1 END) as exposures,
    COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END) as conversions,
    ROUND(
      (COUNT(CASE WHEN e.event_type = 'conversion' THEN 1 END)::DECIMAL / 
       NULLIF(COUNT(CASE WHEN e.event_type = 'exposure' THEN 1 END), 0)) * 100, 
      2
    ) as conversion_rate,
    COUNT(DISTINCT e.user_id) as unique_users
  FROM experiment_events e
  WHERE e.experiment_id = exp_id
  GROUP BY e.variant
  ORDER BY e.variant;
END;
$$ LANGUAGE plpgsql;

-- Grant permissions
GRANT SELECT ON experiment_analytics TO authenticated;
GRANT SELECT ON experiment_conversions TO authenticated;
GRANT EXECUTE ON FUNCTION get_experiment_results(TEXT) TO authenticated;

-- Create function to calculate statistical significance
CREATE OR REPLACE FUNCTION calculate_statistical_significance(exp_id TEXT)
RETURNS TABLE(
  control_rate NUMERIC,
  treatment_rate NUMERIC,
  lift_percentage NUMERIC,
  z_score NUMERIC,
  p_value NUMERIC,
  is_significant BOOLEAN,
  confidence_level NUMERIC
) AS $$
DECLARE
  control_conversions BIGINT;
  control_exposures BIGINT;
  treatment_conversions BIGINT;
  treatment_exposures BIGINT;
  p1 NUMERIC;
  p2 NUMERIC;
  pooled_p NUMERIC;
  se NUMERIC;
  z NUMERIC;
  p NUMERIC;
BEGIN
  -- Get control data
  SELECT 
    COUNT(CASE WHEN event_type = 'conversion' THEN 1 END),
    COUNT(CASE WHEN event_type = 'exposure' THEN 1 END)
  INTO control_conversions, control_exposures
  FROM experiment_events
  WHERE experiment_id = exp_id AND variant = 'control';
  
  -- Get treatment data
  SELECT 
    COUNT(CASE WHEN event_type = 'conversion' THEN 1 END),
    COUNT(CASE WHEN event_type = 'exposure' THEN 1 END)
  INTO treatment_conversions, treatment_exposures
  FROM experiment_events
  WHERE experiment_id = exp_id AND variant = 'treatment';
  
  -- Calculate rates
  p1 := CASE WHEN control_exposures > 0 THEN control_conversions::NUMERIC / control_exposures ELSE 0 END;
  p2 := CASE WHEN treatment_exposures > 0 THEN treatment_conversions::NUMERIC / treatment_exposures ELSE 0 END;
  
  -- Calculate pooled proportion and standard error
  IF control_exposures > 0 AND treatment_exposures > 0 AND (control_conversions + treatment_conversions) > 0 THEN
    pooled_p := (control_conversions + treatment_conversions)::NUMERIC / (control_exposures + treatment_exposures);
    se := SQRT(pooled_p * (1 - pooled_p) * (1.0/control_exposures + 1.0/treatment_exposures));
    
    -- Calculate z-score
    IF se > 0 THEN
      z := (p2 - p1) / se;
      -- Approximate p-value using normal distribution (simplified)
      p := 2 * (1 - 0.5 * (1 + SIGN(ABS(z)) * SQRT(1 - EXP(-2 * ABS(z) * ABS(z) / PI()))));
    ELSE
      z := 0;
      p := 1;
    END IF;
  ELSE
    z := 0;
    p := 1;
  END IF;
  
  RETURN QUERY SELECT 
    ROUND(p1 * 100, 2) as control_rate,
    ROUND(p2 * 100, 2) as treatment_rate,
    CASE WHEN p1 > 0 THEN ROUND(((p2 - p1) / p1) * 100, 2) ELSE 0 END as lift_percentage,
    ROUND(z, 3) as z_score,
    ROUND(p, 4) as p_value,
    (p < 0.05) as is_significant,
    ROUND((1 - p) * 100, 1) as confidence_level;
END;
$$ LANGUAGE plpgsql;

GRANT EXECUTE ON FUNCTION calculate_statistical_significance(TEXT) TO authenticated;

COMMENT ON TABLE experiment_events IS 'Stores A/B test experiment events and user interactions';
COMMENT ON VIEW experiment_analytics IS 'Analytics summary for A/B testing experiments';
COMMENT ON VIEW experiment_conversions IS 'Conversion rate analysis for experiments';
COMMENT ON FUNCTION get_experiment_results(TEXT) IS 'Returns detailed results for a specific experiment';
COMMENT ON FUNCTION calculate_statistical_significance(TEXT) IS 'Calculates statistical significance for A/B test results';


