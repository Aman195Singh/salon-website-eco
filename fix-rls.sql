-- =========================================================
-- FIX RLS INFINITE RECURSION IN SUPABASE
-- Run this in Supabase SQL Editor to instantly fix admin access
-- =========================================================

-- 1. Create a SECURITY DEFINER helper function that bypasses RLS safely
CREATE OR REPLACE FUNCTION public.is_owner()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'owner'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 2. Drop the recursive policies on profiles
DROP POLICY IF EXISTS "Owners can read all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- 3. Re-create clean non-recursive policies on profiles
-- Users can always read their own profile (NO RECURSION)
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Owners can read all profiles via the security definer function
CREATE POLICY "Owners can read all profiles" ON profiles
  FOR SELECT USING (public.is_owner());

-- Prevent normal users from escalating their own role to 'owner'
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

DROP TRIGGER IF EXISTS profiles_prevent_role_change ON public.profiles;
CREATE TRIGGER profiles_prevent_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_change();

-- Users can update their own profile (name, avatar) but cannot escalate role
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- 4. Update policies on other tables to use is_owner() cleanly
DROP POLICY IF EXISTS "Owners can manage published content" ON site_content;
CREATE POLICY "Owners can manage published content" ON site_content
  FOR ALL USING (public.is_owner());

DROP POLICY IF EXISTS "Only owners can access drafts" ON site_content_draft;
CREATE POLICY "Only owners can access drafts" ON site_content_draft
  FOR ALL USING (public.is_owner());

DROP POLICY IF EXISTS "Owners can manage services" ON services;
CREATE POLICY "Owners can manage services" ON services
  FOR ALL USING (public.is_owner());

DROP POLICY IF EXISTS "Only owners can access service drafts" ON services_draft;
CREATE POLICY "Only owners can access service drafts" ON services_draft
  FOR ALL USING (public.is_owner());

DROP POLICY IF EXISTS "Only owners can view enquiries" ON enquiries;
CREATE POLICY "Only owners can view enquiries" ON enquiries
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Only owners can update enquiries" ON enquiries;
CREATE POLICY "Only owners can update enquiries" ON enquiries
  FOR UPDATE USING (public.is_owner());

DROP POLICY IF EXISTS "Only owners can view analytics" ON analytics_events;
CREATE POLICY "Only owners can view analytics" ON analytics_events
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Owners can view all support requests" ON support_requests;
CREATE POLICY "Owners can view all support requests" ON support_requests
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Owners can manage FAQs" ON faq_items;
CREATE POLICY "Owners can manage FAQs" ON faq_items
  FOR ALL USING (public.is_owner());

-- 5. Helper to ensure owner profile exists and is confirmed.
-- IMPORTANT: Replace 'YOUR_OWNER_EMAIL_HERE' with your real salon owner email before executing this block.
-- UPDATE auth.users 
-- SET email_confirmed_at = NOW() 
-- WHERE email = 'YOUR_OWNER_EMAIL_HERE';

-- INSERT INTO public.profiles (id, email, full_name, role)
-- SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Salon Owner'), 'owner'
-- FROM auth.users
-- WHERE email = 'YOUR_OWNER_EMAIL_HERE'
-- ON CONFLICT (id) DO UPDATE 
-- SET role = 'owner';
