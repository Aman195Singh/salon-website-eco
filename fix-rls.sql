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

-- Users can update their own profile (name, avatar)
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

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

-- 5. Ensure Aman Singh has the owner role and is confirmed
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'aman195singh3107@gmail.com';

INSERT INTO public.profiles (id, email, full_name, role)
SELECT id, email, COALESCE(raw_user_meta_data->>'full_name', 'Aman Singh'), 'owner'
FROM auth.users
WHERE email = 'aman195singh3107@gmail.com'
ON CONFLICT (id) DO UPDATE 
SET role = 'owner';
