-- ==============================================================================
-- V2 Migration 04: Salon Staff HR Lifecycle, Attendance, Payroll & Recruitment
-- Authorizing Scope: Salon Staff HR & Workforce Management
-- Safe, additive migration. Preserves all existing staff records and V1/V2 tables.
-- ==============================================================================

-- 1. Additive columns to existing public.staff table
ALTER TABLE public.staff
  ADD COLUMN IF NOT EXISTS employment_status TEXT NOT NULL DEFAULT 'active' 
    CHECK (employment_status IN ('active', 'probation', 'on_leave', 'resigned', 'terminated')),
  ADD COLUMN IF NOT EXISTS joining_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS exit_date DATE DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS exit_reason TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS exit_notes TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS base_salary_paise INT NOT NULL DEFAULT 0 CHECK (base_salary_paise >= 0),
  ADD COLUMN IF NOT EXISTS commission_percentage NUMERIC(5,2) NOT NULL DEFAULT 0.0 
    CHECK (commission_percentage >= 0.0 AND commission_percentage <= 100.0),
  ADD COLUMN IF NOT EXISTS salary_type TEXT NOT NULL DEFAULT 'monthly' 
    CHECK (salary_type IN ('monthly', 'hourly', 'commission_only', 'base_plus_commission')),
  ADD COLUMN IF NOT EXISTS emergency_contact_name TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS id_proof_type TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS id_proof_number TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS specializations TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN IF NOT EXISTS notes TEXT DEFAULT '';

-- Index for filtering staff by employment status (active vs exited)
CREATE INDEX IF NOT EXISTS idx_staff_employment_status ON public.staff (employment_status);


-- 2. Staff Attendance Table (Daily Operations & In/Out tracking)
CREATE TABLE IF NOT EXISTS public.staff_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  work_date DATE NOT NULL DEFAULT CURRENT_DATE,
  check_in_time TIME DEFAULT NULL,
  check_out_time TIME DEFAULT NULL,
  status TEXT NOT NULL DEFAULT 'present' 
    CHECK (status IN ('present', 'absent', 'half_day', 'late', 'on_leave')),
  notes TEXT DEFAULT '' CHECK (char_length(notes) <= 500),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_staff_attendance_date UNIQUE (staff_id, work_date)
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_lookup 
  ON public.staff_attendance (work_date, staff_id);


-- 3. Staff Payroll Table (Monthly Base Pay + Service Commission + Bonus)
CREATE TABLE IF NOT EXISTS public.staff_payroll (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES public.staff(id) ON DELETE CASCADE,
  pay_period TEXT NOT NULL CHECK (pay_period ~ '^[0-9]{4}-(0[1-9]|1[0-2])$'),
  base_salary_paise INT NOT NULL DEFAULT 0 CHECK (base_salary_paise >= 0),
  commission_paise INT NOT NULL DEFAULT 0 CHECK (commission_paise >= 0),
  bonus_paise INT NOT NULL DEFAULT 0 CHECK (bonus_paise >= 0),
  deductions_paise INT NOT NULL DEFAULT 0 CHECK (deductions_paise >= 0),
  net_payout_paise INT NOT NULL DEFAULT 0 CHECK (net_payout_paise >= 0),
  services_count INT NOT NULL DEFAULT 0 CHECK (services_count >= 0),
  payment_status TEXT NOT NULL DEFAULT 'pending' 
    CHECK (payment_status IN ('pending', 'paid', 'cancelled')),
  payment_date TIMESTAMPTZ DEFAULT NULL,
  payment_method TEXT DEFAULT 'bank_transfer' 
    CHECK (payment_method IN ('bank_transfer', 'upi', 'cash', 'cheque')),
  notes TEXT DEFAULT '' CHECK (char_length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_staff_payroll_period UNIQUE (staff_id, pay_period)
);

CREATE INDEX IF NOT EXISTS idx_staff_payroll_period 
  ON public.staff_payroll (pay_period, staff_id);


-- 4. Staff Recruitment & Hiring Pipeline Table
CREATE TABLE IF NOT EXISTS public.staff_recruitment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL CHECK (char_length(full_name) BETWEEN 1 AND 150),
  phone TEXT NOT NULL CHECK (char_length(phone) <= 30),
  email TEXT DEFAULT '',
  role_applied TEXT NOT NULL DEFAULT 'stylist',
  experience_years NUMERIC(3,1) NOT NULL DEFAULT 0.0 CHECK (experience_years >= 0.0),
  expected_salary_paise INT DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'applied' 
    CHECK (status IN ('applied', 'screening', 'interviewing', 'offered', 'hired', 'rejected')),
  interview_date TIMESTAMPTZ DEFAULT NULL,
  portfolio_link TEXT DEFAULT '',
  notes TEXT DEFAULT '' CHECK (char_length(notes) <= 1000),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_staff_recruitment_status 
  ON public.staff_recruitment (status, created_at DESC);


-- 5. Updated_at Trigger for all HR tables
DROP TRIGGER IF EXISTS trg_staff_attendance_updated_at ON public.staff_attendance;
CREATE TRIGGER trg_staff_attendance_updated_at
  BEFORE UPDATE ON public.staff_attendance
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_staff_payroll_updated_at ON public.staff_payroll;
CREATE TRIGGER trg_staff_payroll_updated_at
  BEFORE UPDATE ON public.staff_payroll
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS trg_staff_recruitment_updated_at ON public.staff_recruitment;
CREATE TRIGGER trg_staff_recruitment_updated_at
  BEFORE UPDATE ON public.staff_recruitment
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 6. Row-Level Security (RLS) Policies
-- Ensure staff HR data, salary, and recruitment are strictly owner-controlled!

ALTER TABLE public.staff_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff_recruitment ENABLE ROW LEVEL SECURITY;

-- Owner Full Control (Select, Insert, Update, Delete)
DROP POLICY IF EXISTS "Owners full access on staff_attendance" ON public.staff_attendance;
CREATE POLICY "Owners full access on staff_attendance" ON public.staff_attendance
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owners full access on staff_payroll" ON public.staff_payroll;
CREATE POLICY "Owners full access on staff_payroll" ON public.staff_payroll
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());

DROP POLICY IF EXISTS "Owners full access on staff_recruitment" ON public.staff_recruitment;
CREATE POLICY "Owners full access on staff_recruitment" ON public.staff_recruitment
  FOR ALL USING (public.is_owner()) WITH CHECK (public.is_owner());
