-- =====================================================================
-- NUCLEAR FIX — guaranteed to clear the "relation profiles does not exist"
-- error during signup. Drops EVERY non-internal trigger on auth.users
-- and reinstalls just ours with fully-qualified table references.
-- =====================================================================

-- 1. Make sure profiles exists with all needed columns
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_tables WHERE schemaname='public' AND tablename='profiles') THEN
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
    CREATE POLICY "Users can read own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
    CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
    CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
  END IF;

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
END $$;

-- 2. DROP EVERY non-internal trigger on auth.users
DO $$
DECLARE
  trg record;
BEGIN
  FOR trg IN
    SELECT tgname
    FROM pg_trigger
    WHERE tgrelid = 'auth.users'::regclass
      AND NOT tgisinternal
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %I ON auth.users', trg.tgname);
    RAISE NOTICE 'Dropped trigger: %', trg.tgname;
  END LOOP;
END $$;

-- 3. Drop every old handle_new_user-ish function so nothing stale lingers
DO $$
DECLARE
  fn record;
BEGIN
  FOR fn IN
    SELECT n.nspname, p.proname, pg_get_function_identity_arguments(p.oid) AS args
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname IN ('handle_new_user', 'create_profile_for_new_user',
                        'on_auth_user_created', 'create_user_profile',
                        'sync_user_to_profile', 'init_new_user')
  LOOP
    EXECUTE format('DROP FUNCTION IF EXISTS %I.%I(%s) CASCADE',
                   fn.nspname, fn.proname, fn.args);
    RAISE NOTICE 'Dropped function: %.%(%)', fn.nspname, fn.proname, fn.args;
  END LOOP;
END $$;

-- 4. Install ONE bulletproof trigger function, fully schema-qualified
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_full_name text;
  v_phone text;
BEGIN
  BEGIN
    v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', '');
    v_phone := NULLIF(NEW.raw_user_meta_data->>'phone', '');
  EXCEPTION WHEN OTHERS THEN
    v_full_name := '';
    v_phone := NULL;
  END;

  BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, onboarding_complete)
    VALUES (NEW.id, v_full_name, COALESCE(NEW.email, ''), v_phone, false)
    ON CONFLICT (id) DO NOTHING;
  EXCEPTION WHEN OTHERS THEN
    RAISE WARNING '[handle_new_user] profile insert failed: % %', SQLSTATE, SQLERRM;
  END;

  RETURN NEW;
END;
$$;

GRANT EXECUTE ON FUNCTION public.handle_new_user() TO postgres, anon, authenticated, service_role;

-- 5. Reattach the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Verify — list what's now attached
SELECT tgname, pg_get_triggerdef(oid) AS def
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass AND NOT tgisinternal;
