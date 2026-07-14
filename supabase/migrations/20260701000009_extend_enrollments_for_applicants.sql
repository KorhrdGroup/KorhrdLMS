-- 결제상태 enum
DO $$
BEGIN
  CREATE TYPE public.payment_status AS ENUM (
    'unpaid',
    'paid',
    'partial',
    'refunded',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 신청/확정 워크플로우용 enrollment_status enum 교체
CREATE TYPE public.enrollment_status_new AS ENUM (
  'pending',
  'confirmed',
  'canceled',
  'deleted'
);

ALTER TABLE public.enrollments
  ALTER COLUMN status DROP DEFAULT;

ALTER TABLE public.enrollments
  ALTER COLUMN status TYPE public.enrollment_status_new
  USING (
    CASE status::text
      WHEN 'pending' THEN 'pending'::enrollment_status_new
      WHEN 'in_progress' THEN 'confirmed'::enrollment_status_new
      WHEN 'completed' THEN 'confirmed'::enrollment_status_new
      WHEN 'dropped' THEN 'canceled'::enrollment_status_new
      ELSE 'pending'::enrollment_status_new
    END
  );

DROP TYPE public.enrollment_status;
ALTER TYPE public.enrollment_status_new RENAME TO enrollment_status;

ALTER TABLE public.enrollments
  ALTER COLUMN status SET DEFAULT 'pending';

-- 신청 수강생 관리 필드
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS year SMALLINT,
  ADD COLUMN IF NOT EXISTS batch TEXT,
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS application_date DATE,
  ADD COLUMN IF NOT EXISTS memo TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

UPDATE public.enrollments
SET application_date = created_at::date
WHERE application_date IS NULL;

UPDATE public.enrollments
SET year = EXTRACT(YEAR FROM start_date)::SMALLINT
WHERE year IS NULL;

CREATE INDEX IF NOT EXISTS enrollments_year_idx ON public.enrollments (year);
CREATE INDEX IF NOT EXISTS enrollments_batch_idx ON public.enrollments (batch);
CREATE INDEX IF NOT EXISTS enrollments_payment_status_idx ON public.enrollments (payment_status);
CREATE INDEX IF NOT EXISTS enrollments_application_date_idx ON public.enrollments (application_date DESC);
CREATE INDEX IF NOT EXISTS enrollments_deleted_at_idx ON public.enrollments (deleted_at);

GRANT UPDATE ON public.enrollments TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon update enrollments for development" ON public.enrollments;
CREATE POLICY "Allow anon update enrollments for development"
  ON public.enrollments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
