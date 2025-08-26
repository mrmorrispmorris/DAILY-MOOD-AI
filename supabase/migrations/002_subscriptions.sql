-- Add subscription columns to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'active', 'canceled', 'past_due', 'incomplete'));
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS price_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMPTZ;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ DEFAULT NOW();

-- Create index for efficient subscription queries
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);

-- Create subscriptions table for detailed tracking
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_customer_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'canceled', 'incomplete', 'incomplete_expired', 'past_due', 'trialing', 'unpaid')),
  price_id TEXT NOT NULL,
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on subscriptions table
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (auth.role() = 'service_role');

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- Function to update subscription updated_at timestamp
CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION update_subscription_updated_at();

-- Function to sync users table with subscription status
CREATE OR REPLACE FUNCTION sync_user_subscription_status()
RETURNS TRIGGER AS $$
BEGIN
    -- Update users table with subscription info
    UPDATE users 
    SET 
        stripe_customer_id = NEW.stripe_customer_id,
        subscription_status = CASE 
            WHEN NEW.status = 'active' THEN 'active'
            WHEN NEW.status IN ('canceled', 'incomplete_expired', 'unpaid') THEN 'canceled'
            WHEN NEW.status = 'past_due' THEN 'past_due'
            ELSE 'free'
        END,
        subscription_id = NEW.stripe_subscription_id,
        price_id = NEW.price_id,
        current_period_start = NEW.current_period_start,
        current_period_end = NEW.current_period_end,
        subscription_updated_at = NOW()
    WHERE auth_user_id = NEW.user_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to sync users table when subscriptions change
CREATE TRIGGER sync_user_subscription_on_change
    AFTER INSERT OR UPDATE ON subscriptions
    FOR EACH ROW
    EXECUTE FUNCTION sync_user_subscription_status();

