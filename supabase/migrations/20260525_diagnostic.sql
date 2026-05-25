-- =====================================================================
-- DIAGNOSTIC — paste into Supabase SQL Editor, run, and share output.
-- Tells us exactly why signup is failing.
-- =====================================================================

-- 1. What triggers exist on auth.users? (other than ours)
SELECT
  tgname AS trigger_name,
  pg_get_triggerdef(oid) AS trigger_def
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass
  AND NOT tgisinternal
ORDER BY tgname;

-- 2. Full source of every function any trigger calls
SELECT
  n.nspname AS schema,
  p.proname AS function_name,
  pg_get_functiondef(p.oid) AS source
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE p.proname IN ('handle_new_user', 'on_auth_user_created')
   OR p.proname LIKE 'handle_%user%'
ORDER BY n.nspname, p.proname;

-- 3. Profiles table columns + constraints
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 4. Any foreign keys from profiles to other tables?
SELECT
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name,
  ccu.table_schema || '.' || ccu.table_name AS references_table,
  ccu.column_name AS references_column
FROM information_schema.table_constraints tc
LEFT JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage ccu
  ON tc.constraint_name = ccu.constraint_name
WHERE tc.table_schema = 'public' AND tc.table_name = 'profiles';

-- 5. Recent auth.users count — confirm rows are/aren't being created
SELECT
  count(*) AS user_count,
  max(created_at) AS most_recent_user
FROM auth.users;

-- 6. Test the trigger function in isolation — pretend a new user just signed up
-- (This will tell us if the trigger itself can run cleanly)
DO $$
DECLARE
  test_id uuid := gen_random_uuid();
BEGIN
  -- Manually create what an auth.users row looks like and test handle_new_user
  RAISE NOTICE 'Testing profile insert manually for id %', test_id;
  BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, onboarding_complete)
    VALUES (test_id, 'Test', 'test@example.com', '+15555550000', false);
    RAISE NOTICE 'Insert OK';
    DELETE FROM public.profiles WHERE id = test_id;
  EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Insert FAILED: % %', SQLSTATE, SQLERRM;
  END;
END $$;
