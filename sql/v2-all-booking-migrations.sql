-- ==============================================================================
-- V2 ALL-IN-ONE BOOKING MIGRATION (Single Copy-Paste Script)
-- Product: Salon Website (Glow & Elegance)
-- Instructions: Copy this ENTIRE file, paste into Supabase SQL Editor, and click "Run".
-- ==============================================================================

-- STEP 1: Enable required extension for double-booking prevention
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- STEP 2: Add additive columns to existing services tables
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30 CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS price_paise INT DEFAULT 0 CHECK (price_paise >= 0);

ALTER TABLE public.services_draft
  ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30 CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS price_paise INT DEFAULT 0 CHECK (price_paise >= 0);

UPDATE public.services
SET
  duration_minutes = COALESCE(
    NULLIF(regexp_replace(duration, '[^0-9]', '', 'g'), '')::INT,
    30
  ),
  price_paise = COALESCE(
    NULLIF(regexp_replace(price, '[^0-9]', '', 'g'), '')::INT * 100,
    0
  )
WHERE duration_minutes IS NULL OR duration_minutes = 30;

UPDATE public.services_draft
SET
  duration_minutes = COALESCE(
    NULLIF(regexp_replace(duration, '[^0-9]', '', 'g'), '')::INT,
    30
  ),
  price_paise = COALESCE(
    NULLIF(regexp_replace(price, '[^0-9]', '', 'g'), '')::INT * 100,
    0
  )
WHERE duration_minutes IS NULL OR duration_minutes = 30;

-- STEP 3: Staff and Working Hours Tables
CREATE TABLE IF NOT EXISTS public.staff (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 150),
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 30),
  role TEXT NOT NULL DEFAULT 'stylist' CHECK (role IN ('owner', 'senior_stylist', 'stylist', 'assistant')),
  bio TEXT DEFAULT '' CHECK (char_length(bio) <= 1000),
  avatar_url TEXT DEFAULT '',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_active_order ON public.staff (is_active, display_order);

CREATE TABLE IF NOT EXISTS public.staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_staff_service UNIQUE (staff_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_services_lookup ON public.staff_services (service_id, staff_id) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.staff_working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_staff_working_hours_order CHECK (start_time < end_time),
  CONSTRAINT uq_staff_day UNIQUE (staff_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_staff_working_hours ON public.staff_working_hours (staff_id, day_of_week) WHERE is_active = TRUE;

CREATE TABLE IF NOT EXISTS public.staff_breaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  label TEXT DEFAULT 'Break' CHECK (char_length(label) <= 50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_staff_breaks_order CHECK (start_time < end_time)
);

CREATE INDEX IF NOT EXISTS idx_staff_breaks ON public.staff_breaks (staff_id, day_of_week);

CREATE TABLE IF NOT EXISTS public.staff_time_off (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  reason TEXT DEFAULT '' CHECK (char_length(reason) <= 250),
  approved_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_staff_time_off_order CHECK (starts_at < ends_at)
);

CREATE INDEX IF NOT EXISTS idx_staff_time_off ON public.staff_time_off (staff_id, starts_at, ends_at);

-- STEP 4: Customers, Appointments, Snapshots, and Outbox Tables
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 150),
  phone TEXT NOT NULL CHECK (char_length(phone) BETWEEN 7 AND 30),
  email TEXT CHECK (email IS NULL OR email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  notes TEXT DEFAULT '' CHECK (char_length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers (phone);
CREATE INDEX IF NOT EXISTS idx_customers_auth_user ON public.customers (auth_user_id) WHERE auth_user_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_reference TEXT NOT NULL UNIQUE CHECK (booking_reference ~* '^[A-Z0-9-]{6,25}$'),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE RESTRICT,
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE RESTRICT,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (
    status IN ('confirmed', 'arrived', 'in_service', 'completed', 'cancelled', 'no_show')
  ),
  customer_notes TEXT DEFAULT '' CHECK (char_length(customer_notes) <= 1000),
  internal_notes TEXT DEFAULT '' CHECK (char_length(internal_notes) <= 1000),
  cancellation_reason TEXT DEFAULT '' CHECK (char_length(cancellation_reason) <= 500),
  cancelled_at TIMESTAMPTZ,
  cancelled_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  idempotency_key TEXT UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT chk_appointment_time_order CHECK (starts_at < ends_at)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'no_staff_double_booking'
  ) THEN
    ALTER TABLE public.appointments
    ADD CONSTRAINT no_staff_double_booking
    EXCLUDE USING gist (
      staff_id WITH =,
      tstzrange(starts_at, ends_at, '[)') WITH &&
    )
    WHERE (status NOT IN ('cancelled', 'no_show'));
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_appointments_staff_schedule
  ON public.appointments (staff_id, starts_at, ends_at)
  WHERE status NOT IN ('cancelled', 'no_show');

CREATE INDEX IF NOT EXISTS idx_appointments_customer
  ON public.appointments (customer_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status_date
  ON public.appointments (status, starts_at);

CREATE TABLE IF NOT EXISTS public.appointment_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
  service_name_snapshot TEXT NOT NULL CHECK (char_length(service_name_snapshot) BETWEEN 1 AND 200),
  duration_minutes_snapshot INT NOT NULL CHECK (duration_minutes_snapshot > 0),
  price_paise_snapshot INT NOT NULL CHECK (price_paise_snapshot >= 0),
  sequence_order INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_services_appointment
  ON public.appointment_services (appointment_id, sequence_order);

CREATE TABLE IF NOT EXISTS public.appointment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (
    event_type IN ('created', 'status_changed', 'rescheduled', 'cancelled', 'note_added')
  ),
  from_status TEXT,
  to_status TEXT,
  actor_type TEXT NOT NULL CHECK (actor_type IN ('customer', 'staff', 'owner', 'system')),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_appointment_events_appointment
  ON public.appointment_events (appointment_id, created_at DESC);

CREATE TABLE IF NOT EXISTS public.notification_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES public.appointments(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email')),
  template_key TEXT NOT NULL CHECK (char_length(template_key) <= 100),
  recipient TEXT NOT NULL CHECK (char_length(recipient) <= 200),
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'processing', 'sent', 'failed', 'dead_letter')
  ),
  attempts INT NOT NULL DEFAULT 0 CHECK (attempts >= 0),
  error_message TEXT,
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notification_jobs_pending
  ON public.notification_jobs (status, scheduled_for)
  WHERE status IN ('pending', 'failed');

-- STEP 5: Row Level Security (RLS) Policies
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

DROP POLICY IF EXISTS "Public can view active staff" ON public.staff;
CREATE POLICY "Public can view active staff" ON public.staff
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners manage staff" ON public.staff;
CREATE POLICY "Owners manage staff" ON public.staff
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Public can view active staff services" ON public.staff_services;
CREATE POLICY "Public can view active staff services" ON public.staff_services
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners manage staff services" ON public.staff_services;
CREATE POLICY "Owners manage staff services" ON public.staff_services
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Public can view active working hours" ON public.staff_working_hours;
CREATE POLICY "Public can view active working hours" ON public.staff_working_hours
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Owners manage working hours" ON public.staff_working_hours;
CREATE POLICY "Owners manage working hours" ON public.staff_working_hours
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Public can view staff breaks" ON public.staff_breaks;
CREATE POLICY "Public can view staff breaks" ON public.staff_breaks
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Owners manage staff breaks" ON public.staff_breaks;
CREATE POLICY "Owners manage staff breaks" ON public.staff_breaks
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Public can view staff time off" ON public.staff_time_off;
CREATE POLICY "Public can view staff time off" ON public.staff_time_off
  FOR SELECT USING (TRUE);

DROP POLICY IF EXISTS "Owners manage staff time off" ON public.staff_time_off;
CREATE POLICY "Owners manage staff time off" ON public.staff_time_off
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Customers can view own profile" ON public.customers;
CREATE POLICY "Customers can view own profile" ON public.customers
  FOR SELECT USING (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Customers can update own profile" ON public.customers;
CREATE POLICY "Customers can update own profile" ON public.customers
  FOR UPDATE USING (auth_user_id = auth.uid())
  WITH CHECK (auth_user_id = auth.uid());

DROP POLICY IF EXISTS "Owners manage customers" ON public.customers;
CREATE POLICY "Owners manage customers" ON public.customers
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owners manage appointments" ON public.appointments;
CREATE POLICY "Owners manage appointments" ON public.appointments
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Customers view own appointments" ON public.appointments;
CREATE POLICY "Customers view own appointments" ON public.appointments
  FOR SELECT USING (
    customer_id IN (
      SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
    )
  );

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

DROP POLICY IF EXISTS "Owners view appointment events" ON public.appointment_events;
CREATE POLICY "Owners view appointment events" ON public.appointment_events
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Owners insert appointment events" ON public.appointment_events;
CREATE POLICY "Owners insert appointment events" ON public.appointment_events
  FOR INSERT WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owners view notification jobs" ON public.notification_jobs;
CREATE POLICY "Owners view notification jobs" ON public.notification_jobs
  FOR SELECT USING (public.is_owner());

DROP POLICY IF EXISTS "Owners manage notification jobs" ON public.notification_jobs;
CREATE POLICY "Owners manage notification jobs" ON public.notification_jobs
  FOR ALL USING (public.is_owner())
  WITH CHECK (public.is_owner());
