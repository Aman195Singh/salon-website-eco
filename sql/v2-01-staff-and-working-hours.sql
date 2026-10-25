-- ==============================================================================
-- V2 Migration 01: Staff and Working Hours Foundation
-- Authorizing PRD: PRD-V2.md §5.1, §5.2
-- Safe, additive migration. Does not drop or modify existing tables destructively.
-- ==============================================================================

-- 1. Enable btree_gist extension (prerequisite for PostgreSQL range exclusion)
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- 2. Add additive columns to existing services and services_draft tables
-- (duration_minutes and price_paise for canonical calculations in IST)
ALTER TABLE public.services
  ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30 CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS price_paise INT DEFAULT 0 CHECK (price_paise >= 0);

ALTER TABLE public.services_draft
  ADD COLUMN IF NOT EXISTS duration_minutes INT DEFAULT 30 CHECK (duration_minutes > 0),
  ADD COLUMN IF NOT EXISTS price_paise INT DEFAULT 0 CHECK (price_paise >= 0);

-- Backfill duration_minutes and price_paise from existing text fields where applicable
-- (e.g. if duration is "45 mins" or price is "₹499")
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


-- 3. Staff Table
-- Represents salon specialists and team members.
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

-- Index for active staff display ordering
CREATE INDEX IF NOT EXISTS idx_staff_active_order ON public.staff (is_active, display_order);


-- 4. Staff Services Junction Table
-- Maps which services each staff specialist is qualified to perform.
CREATE TABLE IF NOT EXISTS public.staff_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_staff_service UNIQUE (staff_id, service_id)
);

CREATE INDEX IF NOT EXISTS idx_staff_services_lookup ON public.staff_services (service_id, staff_id) WHERE is_active = TRUE;


-- 5. Staff Working Hours
-- Defines recurring weekly working hours (0 = Sunday, 1 = Monday, ..., 6 = Saturday).
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


-- 6. Staff Breaks
-- Recurring daily break windows (e.g. Lunch 13:00 to 14:00).
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


-- 7. Staff Time Off (Leaves & Absences)
-- Specific dates and times when staff is unavailable.
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


-- 8. Updated_at Trigger for Staff & Working Hours
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_staff_updated_at ON public.staff;
CREATE TRIGGER trg_staff_updated_at
  BEFORE UPDATE ON public.staff
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_staff_working_hours_updated_at ON public.staff_working_hours;
CREATE TRIGGER trg_staff_working_hours_updated_at
  BEFORE UPDATE ON public.staff_working_hours
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
