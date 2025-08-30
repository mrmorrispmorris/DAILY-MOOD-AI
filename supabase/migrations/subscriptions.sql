/*
  Subscriptions Table for Stripe Integration
  Stores subscription data and manages premium user lifecycle
*/

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS subscriptions (
  id text PRIMARY KEY, -- Stripe subscription ID
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  canceled_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS subscriptions_user_id_idx ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS subscriptions_status_idx ON subscriptions(status);
CREATE INDEX IF NOT EXISTS subscriptions_period_idx ON subscriptions(current_period_end);

-- RLS Policies - Users can only see their own subscriptions
CREATE POLICY "Users can read own subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Service role can manage all subscriptions (for webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON subscriptions
  FOR ALL
  TO service_role
  USING (true);

-- Admin policy for reading all subscriptions
CREATE POLICY "Admin can read all subscriptions"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users 
      WHERE users.id = auth.uid() 
      AND users.email = 'benm@cecontractors.com.au'
    )
  );

-- Function to update user subscription level based on subscription status
CREATE OR REPLACE FUNCTION update_user_subscription_level()
RETURNS trigger AS $$
BEGIN
  -- Update user's subscription level based on subscription status
  IF NEW.status = 'active' THEN
    UPDATE users SET subscription_level = 'premium' WHERE id = NEW.user_id;
  ELSE
    UPDATE users SET subscription_level = 'free' WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update user subscription level
CREATE TRIGGER update_user_subscription_level_trigger
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_user_subscription_level();

-- Function to get active subscription for a user
CREATE OR REPLACE FUNCTION get_active_subscription(user_uuid uuid)
RETURNS subscriptions AS $$
DECLARE
  result subscriptions;
BEGIN
  SELECT * INTO result
  FROM subscriptions
  WHERE user_id = user_uuid
    AND status = 'active'
    AND current_period_end > now()
  ORDER BY current_period_end DESC
  LIMIT 1;
  
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- View for subscription analytics
CREATE OR REPLACE VIEW subscription_metrics AS
SELECT 
  date_trunc('day', created_at) as date,
  count(*) as new_subscriptions,
  count(*) FILTER (WHERE status = 'active') as active_subscriptions,
  count(*) FILTER (WHERE status = 'canceled') as canceled_subscriptions,
  avg(EXTRACT(epoch FROM (current_period_end - current_period_start)) / 86400) as avg_period_days
FROM subscriptions
WHERE created_at >= current_date - interval '30 days'
GROUP BY date_trunc('day', created_at)
ORDER BY date DESC;


