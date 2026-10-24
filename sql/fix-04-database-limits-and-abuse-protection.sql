-- ============================================================================
-- FIX-04: Database Constraints and Abuse Protection
-- Run this in your Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ============================================================================

-- 1. ENQUIRIES Table Constraints (prevent oversized direct inserts bypassing API)
ALTER TABLE public.enquiries 
DROP CONSTRAINT IF EXISTS enquiries_name_len,
ADD CONSTRAINT enquiries_name_len CHECK (char_length(name) BETWEEN 1 AND 200);

ALTER TABLE public.enquiries 
DROP CONSTRAINT IF EXISTS enquiries_message_len,
ADD CONSTRAINT enquiries_message_len CHECK (char_length(message) BETWEEN 1 AND 5000);

ALTER TABLE public.enquiries 
DROP CONSTRAINT IF EXISTS enquiries_phone_len,
ADD CONSTRAINT enquiries_phone_len CHECK (phone IS NULL OR char_length(phone) <= 30);

ALTER TABLE public.enquiries 
DROP CONSTRAINT IF EXISTS enquiries_email_len,
ADD CONSTRAINT enquiries_email_len CHECK (email IS NULL OR char_length(email) <= 200);

-- 2. ANALYTICS_EVENTS Table Constraints (prevent spamming arbitrary event types or huge paths)
ALTER TABLE public.analytics_events 
DROP CONSTRAINT IF EXISTS analytics_event_type_check,
ADD CONSTRAINT analytics_event_type_check CHECK (event_type IN ('page_view', 'cta_click', 'enquiry_submit'));

ALTER TABLE public.analytics_events 
DROP CONSTRAINT IF EXISTS analytics_page_path_len,
ADD CONSTRAINT analytics_page_path_len CHECK (page_path IS NULL OR char_length(page_path) <= 500);

-- 3. SUPPORT_REQUESTS Table Tightening (must be submitted by the authenticated caller)
DROP POLICY IF EXISTS "Authenticated can submit support" ON public.support_requests;
CREATE POLICY "Authenticated can submit support" ON public.support_requests
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL AND submitted_by = auth.uid());
