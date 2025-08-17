/*
  # Add Sleep Tracking to Mood Entries

  1. Changes
    - Add `sleep_hours` column to mood_entries table
    - Add default value of 8 hours
    - Allow decimal values (7.5 hours, etc.)

  2. Security
    - No changes needed - existing RLS policies cover new column
*/

-- Add sleep_hours column to mood_entries
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'mood_entries' AND column_name = 'sleep_hours'
  ) THEN
    ALTER TABLE mood_entries ADD COLUMN sleep_hours decimal(3,1) DEFAULT 8.0;
  END IF;
END $$;