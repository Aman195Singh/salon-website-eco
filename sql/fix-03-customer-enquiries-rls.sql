-- ============================================================================
-- FIX-03: Allow Customers to View Their Own Enquiries Securely
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. Add user_id column to enquiries table if it doesn't already exist
ALTER TABLE public.enquiries 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

-- 2. Create indexes on user_id and email for fast lookups
CREATE INDEX IF NOT EXISTS idx_enquiries_user_id ON public.enquiries(user_id);
CREATE INDEX IF NOT EXISTS idx_enquiries_email ON public.enquiries(lower(email));

-- 3. Customer SELECT policy: Logged-in users can SELECT only enquiries that
--    match their authenticated user_id. Email matching is removed because
--    "Confirm email" is OFF in Supabase (email matching would allow viewing other users' enquiries).
DROP POLICY IF EXISTS "Customers can view own enquiries" ON public.enquiries;
CREATE POLICY "Customers can view own enquiries" ON public.enquiries
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND user_id = auth.uid()
  );

-- 4. Ensure owner policies remain intact
DROP POLICY IF EXISTS "Only owners can view enquiries" ON public.enquiries;
CREATE POLICY "Only owners can view enquiries" ON public.enquiries
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Only owners can update enquiries" ON public.enquiries;
CREATE POLICY "Only owners can update enquiries" ON public.enquiries
  FOR UPDATE USING (public.is_owner());
