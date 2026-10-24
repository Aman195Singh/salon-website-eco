-- ============================================================================
-- FIX-01: Prevent Normal Users from Changing Their Own Role to 'owner'
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Trigger function: Block any update that attempts to change the 'role' column
--    when called by an authenticated user session (auth.uid() IS NOT NULL).
--    Updates executed from the Supabase SQL Editor or Service Role (auth.uid() IS NULL)
--    remain allowed, allowing the owner to manually promote users if needed.
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND auth.uid() IS NOT NULL THEN
    RAISE EXCEPTION 'Changing role is not allowed';
  END IF;
  RETURN NEW;
END;
$$;

-- 2. Attach trigger to profiles table
DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- 3. Update the profiles UPDATE policy to include WITH CHECK
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Verification query: Run this query to inspect current owners and confirm
--    no unauthorized user has elevated themselves:
-- SELECT id, email, role, created_at FROM public.profiles WHERE role = 'owner';
