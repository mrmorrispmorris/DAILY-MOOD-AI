-- Referrals table for viral growth and user acquisition
-- Tracks referral codes, relationships, and rewards

CREATE TABLE IF NOT EXISTS referrals (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- The user who is referring others
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Unique referral code for sharing
    referral_code VARCHAR(12) UNIQUE NOT NULL,
    
    -- Tracking metrics
    total_referrals INTEGER DEFAULT 0 NOT NULL,
    successful_referrals INTEGER DEFAULT 0 NOT NULL, -- Users who signed up AND used app for 7+ days
    active_referrals INTEGER DEFAULT 0 NOT NULL,     -- Currently active referred users
    
    -- Rewards tracking
    total_earnings DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    pending_rewards DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    paid_rewards DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    
    -- Referral source tracking
    campaign_source VARCHAR(50), -- 'social', 'email', 'direct_link', etc.
    
    -- Status and metadata
    is_active BOOLEAN DEFAULT TRUE NOT NULL,
    referral_tier VARCHAR(20) DEFAULT 'basic' NOT NULL, -- 'basic', 'silver', 'gold', 'platinum'
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Performance tracking
    last_referral_at TIMESTAMP WITH TIME ZONE,
    
    UNIQUE(referrer_id, referral_code)
);

-- Table for tracking individual referral relationships
CREATE TABLE IF NOT EXISTS referral_signups (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Referral relationship
    referrer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referred_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    referral_code VARCHAR(12) NOT NULL,
    
    -- Signup tracking
    signup_completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    first_mood_logged_at TIMESTAMP WITH TIME ZONE,
    became_active_at TIMESTAMP WITH TIME ZONE, -- After 7 days of usage
    
    -- Reward tracking
    referrer_reward DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    referred_reward DECIMAL(10,2) DEFAULT 0.00 NOT NULL,
    reward_paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Status
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'active', 'qualified', 'rewarded'
    
    -- Prevent duplicate referrals
    UNIQUE(referred_user_id)
);

-- Enable Row Level Security
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_signups ENABLE ROW LEVEL SECURITY;

-- RLS Policies for referrals table
CREATE POLICY "Users can view their own referral data" 
ON referrals FOR SELECT 
USING (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referral data" 
ON referrals FOR UPDATE 
USING (auth.uid() = referrer_id);

CREATE POLICY "System can insert referral records" 
ON referrals FOR INSERT 
WITH CHECK (true); -- Handled by application logic

-- RLS Policies for referral_signups table  
CREATE POLICY "Users can view referrals they made or received" 
ON referral_signups FOR SELECT 
USING (auth.uid() = referrer_id OR auth.uid() = referred_user_id);

CREATE POLICY "System can manage referral signups" 
ON referral_signups FOR ALL 
WITH CHECK (true); -- Handled by application logic

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_active ON referrals(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_referral_signups_referrer ON referral_signups(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_referred ON referral_signups(referred_user_id);
CREATE INDEX IF NOT EXISTS idx_referral_signups_status ON referral_signups(status);
CREATE INDEX IF NOT EXISTS idx_referral_signups_code ON referral_signups(referral_code);

-- Add trigger to update updated_at timestamp
CREATE TRIGGER update_referrals_updated_at 
    BEFORE UPDATE ON referrals 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- Avoid confusing chars
    result TEXT := '';
    i INTEGER := 0;
BEGIN
    -- Generate 8-character code
    FOR i IN 1..8 LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
    END LOOP;
    
    -- Check if code already exists, regenerate if needed
    WHILE EXISTS(SELECT 1 FROM referrals WHERE referral_code = result) LOOP
        result := '';
        FOR i IN 1..8 LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::integer, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to automatically create referral code for new users
CREATE OR REPLACE FUNCTION create_user_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    -- Create referral record for new user
    INSERT INTO referrals (referrer_id, referral_code)
    VALUES (NEW.id, generate_referral_code());
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create referral code when user signs up
CREATE TRIGGER create_referral_code_for_new_user
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION create_user_referral_code();


