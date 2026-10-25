-- ==============================================================================
-- V2 Migration 03: Row Level Security (RLS) Policies for Booking Tables
-- Authorizing PRD: PRD-V2.md §6, §10
-- Protects customer privacy, locks down staff scheduling, ensures owner operational authority.
-- ==============================================================================

-- 1. Enable RLS on all V2 booking tables
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_working_hours ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_breaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_time_off ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_jobs ENABLE ROW LEVEL SECURITY;


-- 2. STAFF & SCHEDULING POLICIES

-- Public can read active staff for booking display
DROP POLICY IF EXISTS "Public can view active staff" ON public.staff;
CREATE POLICY "Public can view active staff" ON public.staff
  FOR SELECT USING (is_active = TRUE);

-- Owners have full CRUD over staff
DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
CREATE POLICY "Owners manage staff" ON public.staff
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- Public can view active staff-service mappings
DROP POLICY IF EXISTS "Public can view active staff services" ON public.staff_services;
CREATE POLICY "Public can view active staff services" ON public.staff_services
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners manage staff services" ON public.staff_services;
CREATE POLICY "Owners manage staff services" ON public.staff_services
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- Public can view active working hours for slot calculation
DROP POLICY IF EXISTS "Public can view active working hours" ON public.staff_working_hours;
CREATE POLICY "Public can view active working hours" ON public.staff_working_hours
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners manage working hours" ON public.staff_working_hours;
CREATE POLICY "Owners manage working hours" ON public.staff_working_hours
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- Public can view breaks for slot calculation
DROP POLICY IF EXISTS "Public can view staff breaks" ON public.staff_breaks;
CREATE POLICY "Public can view staff breaks" ON public.staff_breaks
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Owners manage staff breaks" ON public.staff_breaks;
CREATE POLICY "Owners manage staff breaks" ON public.staff_breaks
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- Public can view time-off for slot calculation
DROP POLICY IF EXISTS "Public can view staff time off" ON public.staff_time_off;
CREATE POLICY "Public can view staff time off" ON public.staff_time_off
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Owners manage staff time off" ON public.staff_time_off;
CREATE POLICY "Owners manage staff time off" ON public.staff_time_off
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());


-- 3. CUSTOMER POLICIES

-- Customers can view their own profile linked via auth.uid()
DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
CREATE POLICY "Customers can view own profile" ON public.customers
  FOR SELECT USING (auth_user_id = auth.uid());

-- Customers can update their own profile
DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile" ON public.customers
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

-- Owners have full CRUD over customers
DROP POLICY IF EXISTS "Owners manage customers" ON public.customers;
CREATE POLICY "Owners manage customers" ON public.customers
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());


-- 4. APPOINTMENT POLICIES

-- Owners have full access to view, update, and manage all appointments
DROP POLICY IF EXISTS "Owners manage appointments" ON public.appointments;
CREATE POLICY "Owners manage appointments" ON public.appointments
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

-- Authenticated customers can view only their own appointments
DROP POLICY IF EXISTS "Customers view own appointments" ON public.appointments;
CREATE POLICY "Customers view own appointments" ON public.appointments
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
    )
  );


-- 5. APPOINTMENT SERVICES (SNAPSHOTS) POLICIES

DROP POLICY IF EXISTS "Owners manage appointment services" ON public.appointment_services;
CREATE POLICY "Owners manage appointment services" ON public.appointment_services
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Customers view own appointment services" ON public.appointment_services;
CREATE POLICY "Customers view own appointment services" ON public.appointment_services
  FOR SELECT USING (
    appointment_id IN (
      SELECT a.id FROM public.appointments a
      JOIN public.customers c ON a.customer_id = c.id
      WHERE c.auth_user_id = auth.uid()
    )
  );


-- 6. APPOINTMENT EVENTS (AUDIT TRAIL) POLICIES

DROP POLICY IF EXISTS "Owners view appointment events" ON public.appointment_events;
CREATE POLICY "Owners view appointment events" ON public.appointment_events
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Owners insert appointment events" ON public.appointment_events;
CREATE POLICY "Owners insert appointment events" ON public.appointment_events
  FOR INSERT WITH CHECK (public.is_owner());


-- 7. NOTIFICATION JOBS (OUTBOX) POLICIES

-- Strictly owner/service role access; zero public exposure
DROP POLICY IF EXISTS "Owners view notification jobs" ON public.notification_jobs;
CREATE POLICY "Owners view notification jobs" ON public.notification_jobs
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Owners manage notification jobs" ON public.notification_jobs;
CREATE POLICY "Owners manage notification jobs" ON public.notification_jobs
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());
