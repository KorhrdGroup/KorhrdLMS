-- 결제 상세조회용 상태값 추가
DO $$
BEGIN
  ALTER TYPE public.course_payment_status ADD VALUE IF NOT EXISTS 'approved';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE public.course_payment_status ADD VALUE IF NOT EXISTS 'deposit_expired';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.course_payments
  ADD COLUMN IF NOT EXISTS payment_number TEXT,
  ADD COLUMN IF NOT EXISTS product_name TEXT,
  ADD COLUMN IF NOT EXISTS deposit_bank TEXT,
  ADD COLUMN IF NOT EXISTS depositor_name TEXT,
  ADD COLUMN IF NOT EXISTS virtual_account_number TEXT,
  ADD COLUMN IF NOT EXISTS class_start_date DATE,
  ADD COLUMN IF NOT EXISTS class_end_date DATE,
  ADD COLUMN IF NOT EXISTS shipping_address TEXT,
  ADD COLUMN IF NOT EXISTS approved_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS course_payments_payment_number_idx
  ON public.course_payments (payment_number);

CREATE INDEX IF NOT EXISTS course_payments_approved_at_idx
  ON public.course_payments (approved_at DESC);

ALTER TABLE public.course_payments
  DROP CONSTRAINT IF EXISTS course_payments_class_date_range_check;

ALTER TABLE public.course_payments
  ADD CONSTRAINT course_payments_class_date_range_check
  CHECK (
    class_start_date IS NULL
    OR class_end_date IS NULL
    OR class_end_date >= class_start_date
  );
