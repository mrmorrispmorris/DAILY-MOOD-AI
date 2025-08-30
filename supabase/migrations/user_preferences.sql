-- User preferences table for settings and customization
-- This stores user-specific settings like notifications, themes, privacy preferences

CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    
    -- Notification settings stored as JSONB for flexibility
    notification_settings JSONB DEFAULT '{
        "dailyReminder": true,
        "reminderTime": "20:00",
        "pushEnabled": false,
        "emailEnabled": true,
        "weeklyReport": true,
        "achievementNotifications": true,
        "moodStreakReminders": true,
        "lowMoodSupport": true
    }'::jsonb,
    
    -- Theme and UI preferences
    theme_settings JSONB DEFAULT '{
        "theme": "light",
        "primaryColor": "purple",
        "compactMode": false,
        "animationsEnabled": true
    }'::jsonb,
    
    -- Privacy and data preferences  
    privacy_settings JSONB DEFAULT '{
        "dataSharing": false,
        "analyticsEnabled": true,
        "emailMarketing": false,
        "showInLeaderboards": true
    }'::jsonb,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()) NOT NULL,
    
    -- Ensure one preference record per user
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can manage their own preferences" 
ON user_preferences FOR ALL 
USING (auth.uid() = user_id);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON user_preferences(user_id);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_preferences_updated_at 
    BEFORE UPDATE ON user_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


