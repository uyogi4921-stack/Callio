-- Add phone number column to profiles for auto-call reminders
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL;

-- Add onboarding tracking
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;

-- Create reminders table if it doesn't exist
CREATE TABLE IF NOT EXISTS reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  type text DEFAULT 'call' CHECK (type IN ('push', 'sms', 'call')),
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Index for the cron job: quickly find unsent reminders due soon
CREATE INDEX IF NOT EXISTS idx_reminders_pending
  ON reminders (remind_at)
  WHERE sent = false;

-- Enable RLS on reminders
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Users can read their own reminders
CREATE POLICY IF NOT EXISTS "Users can read own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

-- Users can create reminders for their own tasks
CREATE POLICY IF NOT EXISTS "Users can create own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Service role can update reminders (for cron job)
CREATE POLICY IF NOT EXISTS "Service can update reminders"
  ON reminders FOR UPDATE
  USING (true);
