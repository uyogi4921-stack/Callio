-- =====================================================================
-- Callio: complete schema + trigger fix
-- Run this entire script in the Supabase SQL Editor.
-- Idempotent — safe to re-run.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. PROFILES TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text DEFAULT '',
  email text DEFAULT '',
  phone text DEFAULT NULL,
  avatar_url text DEFAULT NULL,
  plan text DEFAULT 'free' CHECK (plan IN ('free', 'pro')),
  accountability_score integer DEFAULT 0,
  streak_days integer DEFAULT 0,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Make sure all newer columns exist if the table was already created
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS accountability_score integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS streak_days integer DEFAULT 0;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT NULL;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- ---------------------------------------------------------------------
-- 2. TASKS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title text NOT NULL,
  description text DEFAULT '',
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'done', 'overdue')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  category text DEFAULT 'Quick Action',
  due_date date NOT NULL,
  due_time text NOT NULL DEFAULT '12:00 PM',
  completed_at timestamptz DEFAULT NULL,
  source text DEFAULT 'text' CHECK (source IN ('voice', 'text', 'ai_extracted')),
  created_at timestamptz DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own tasks" ON tasks;
CREATE POLICY "Users can read own tasks" ON tasks
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON tasks;
CREATE POLICY "Users can insert own tasks" ON tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON tasks;
CREATE POLICY "Users can update own tasks" ON tasks
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own tasks" ON tasks;
CREATE POLICY "Users can delete own tasks" ON tasks
  FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------
-- 3. REMINDERS TABLE
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reminders (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  task_id uuid REFERENCES tasks(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  remind_at timestamptz NOT NULL,
  type text DEFAULT 'call' CHECK (type IN ('push', 'sms', 'call')),
  sent boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_reminders_pending
  ON reminders (remind_at)
  WHERE sent = false;

ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can read own reminders" ON reminders;
CREATE POLICY "Users can read own reminders" ON reminders
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create own reminders" ON reminders;
CREATE POLICY "Users can create own reminders" ON reminders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service can update reminders" ON reminders;
CREATE POLICY "Service can update reminders" ON reminders
  FOR UPDATE USING (true);

-- ---------------------------------------------------------------------
-- 4. AUTO-CREATE PROFILE ON SIGNUP (this is what's failing)
-- ---------------------------------------------------------------------
-- Drop the old trigger and function first so we can recreate cleanly
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    full_name,
    email,
    phone,
    onboarding_complete
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.email, ''),
    NULLIF(NEW.raw_user_meta_data->>'phone', ''),
    false
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't block signup if profile insert fails; log it
  RAISE WARNING 'handle_new_user failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------
-- 5. BACKFILL: create profiles for any existing auth users that don't have one
-- ---------------------------------------------------------------------
INSERT INTO public.profiles (id, full_name, email, phone, onboarding_complete)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.email, ''),
  NULLIF(u.raw_user_meta_data->>'phone', ''),
  false
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;
