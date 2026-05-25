-- =====================================================================
-- BULLETPROOF SIGNUP FIX — copy/paste this entire block into Supabase
-- SQL Editor and click "Run". This replaces the broken trigger with one
-- that wraps every operation in EXCEPTION handlers, so signup will
-- ALWAYS succeed even if the profile insert hits a column mismatch.
-- =====================================================================

-- 1. Make sure all expected columns exist on profiles (no-ops if present)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='profiles') THEN
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name text DEFAULT '';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email text DEFAULT '';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone text DEFAULT NULL;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url text DEFAULT NULL;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS plan text DEFAULT 'free';
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS accountability_score integer DEFAULT 0;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS streak_days integer DEFAULT 0;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS onboarding_complete boolean DEFAULT false;
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();
    ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
  ELSE
    CREATE TABLE public.profiles (
      id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
      full_name text DEFAULT '',
      email text DEFAULT '',
      phone text DEFAULT NULL,
      avatar_url text DEFAULT NULL,
      plan text DEFAULT 'free',
      accountability_score integer DEFAULT 0,
      streak_days integer DEFAULT 0,
      onboarding_complete boolean DEFAULT false,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Users can read own profile" ON public.profiles
      FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles
      FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Users can insert own profile" ON public.profiles
      FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;
END $$;

-- 2. Drop the old broken trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 3. Replace with a bulletproof version — every operation wrapped
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_full_name text;
  v_phone text;
BEGIN
  -- Extract metadata safely
  BEGIN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  EXCEPTION WHEN OTHERS THEN
    v_full_name := '';
    v_phone := NULL;
  END;

  -- Try to insert profile; swallow any error so signup always succeeds
  BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, onboarding_complete)
    VALUES (NEW.id, v_full_name, COALESCE(NEW.email, ''), v_phone, false)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    -- Log but never block signup
    RAISE WARNING '[handle_new_user] profile insert failed: % %', SQLSTATE, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

-- 4. Reattach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Backfill any auth.users that have no profile row
INSERT INTO public.profiles (id, full_name, email, phone, onboarding_complete)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'full_name', ''),
  COALESCE(u.email, ''),
  NULLIF(u.raw_user_meta_data->>'phone', ''),
  false
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
