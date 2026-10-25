-- ==============================================================================
-- V2 Migration 02: Appointments, Snapshot Persistence, and Outbox
-- Authorizing PRD: PRD-V2.md §5.3, §5.4, §5.5, §5.6, §8
-- Enforces PostgreSQL exclusion constraint to prevent staff double-booking.
-- Persists immutable historical snapshots of service name, duration, and price.
-- ==============================================================================

-- 1. Customers Table
-- Represents appointment booking clients (both guest bookings and linked accounts).
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


-- 2. Appointments Table
-- Authoritative appointment records with PostgreSQL exclusion constraint.
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

-- PostgreSQL Double-Booking Prevention Exclusion Constraint
-- Ensures no two overlapping appointments can ever be committed for the same staff member
-- unless one of them is cancelled or marked no-show.
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

-- Indexes for dashboard schedule lookups and customer queries
CREATE INDEX IF NOT EXISTS idx_appointments_staff_schedule
  ON public.appointments (staff_id, starts_at, ends_at)
  WHERE status NOT IN ('cancelled', 'no_show');

CREATE INDEX IF NOT EXISTS idx_appointments_customer
  ON public.appointments (customer_id, starts_at DESC);

CREATE INDEX IF NOT EXISTS idx_appointments_status_date
  ON public.appointments (status, starts_at);


-- 3. Appointment Services Table (Historical Snapshot Persistence)
-- Freezes exact service name, duration, and price at booking creation time.
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


-- 4. Appointment Events Table (Operational Audit Trail)
-- Logs lifecycle changes (created, status_changed, rescheduled, cancelled).
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


-- 5. Notification Jobs Table (Transactional Outbox)
-- Queues async notifications without blocking appointment creation transaction.
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


-- 6. Updated_at Trigger for Customers and Appointments
DROP TRIGGER IF EXISTS trg_customers_updated_at ON public.customers;
CREATE TRIGGER trg_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_appointments_updated_at ON public.appointments;
CREATE TRIGGER trg_appointments_updated_at
  BEFORE UPDATE ON public.appointments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
