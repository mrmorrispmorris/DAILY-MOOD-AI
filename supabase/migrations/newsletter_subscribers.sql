-- Create newsletter_subscribers table for email marketing
CREATE TABLE IF NOT EXISTS newsletter_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  source VARCHAR(100) DEFAULT 'unknown', -- landing, blog, popup, footer, etc.
  status VARCHAR(20) DEFAULT 'active', -- active, unsubscribed, bounced
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  unsubscribed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers (email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_status ON newsletter_subscribers (status);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_source ON newsletter_subscribers (source);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_subscribed_at ON newsletter_subscribers (subscribed_at);

-- Enable RLS (Row Level Security)
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public inserts for newsletter signup" 
ON newsletter_subscribers FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow service role to read all newsletter subscribers" 
ON newsletter_subscribers FOR SELECT 
TO service_role
USING (true);

CREATE POLICY "Allow service role to update newsletter subscribers" 
ON newsletter_subscribers FOR UPDATE 
TO service_role
USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_newsletter_subscribers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_newsletter_subscribers_updated_at
    BEFORE UPDATE ON newsletter_subscribers
    FOR EACH ROW
    EXECUTE PROCEDURE update_newsletter_subscribers_updated_at();

-- Create view for newsletter analytics
CREATE OR REPLACE VIEW newsletter_analytics AS
SELECT 
  source,
  status,
  COUNT(*) as subscriber_count,
  DATE_TRUNC('day', subscribed_at) as signup_date
FROM newsletter_subscribers
GROUP BY source, status, DATE_TRUNC('day', subscribed_at)
ORDER BY signup_date DESC;

-- Grant permissions to authenticated users for the view
GRANT SELECT ON newsletter_analytics TO authenticated;

COMMENT ON TABLE newsletter_subscribers IS 'Stores newsletter subscriber information for email marketing campaigns';
COMMENT ON COLUMN newsletter_subscribers.source IS 'Source of the newsletter signup (landing, blog, popup, footer, etc.)';
COMMENT ON COLUMN newsletter_subscribers.status IS 'Subscription status (active, unsubscribed, bounced)';
COMMENT ON VIEW newsletter_analytics IS 'Analytics view for newsletter subscription data';


