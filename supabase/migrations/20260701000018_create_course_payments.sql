-- 결제방법 enum
DO $$
BEGIN
  CREATE TYPE public.payment_method AS ENUM (
    'card',
    'bank_transfer',
    'virtual_account',
    'mobile',
    'cash'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 과목별 결제 상태 enum
DO $$
BEGIN
  CREATE TYPE public.course_payment_status AS ENUM (
    'pending',
    'completed',
    'canceled',
    'refunded',
    'failed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 과목별 결제 테이블
CREATE TABLE IF NOT EXISTS public.course_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members (id),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  payment_date DATE NOT NULL,
  coupon_number TEXT,
  assigned_instructor TEXT,
  amount INTEGER NOT NULL,
  payment_method public.payment_method NOT NULL,
  coupon_applied BOOLEAN NOT NULL DEFAULT false,
  status public.course_payment_status NOT NULL DEFAULT 'pending',
  memo TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_payments_amount_check CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS course_payments_member_id_idx ON public.course_payments (member_id);
CREATE INDEX IF NOT EXISTS course_payments_course_id_idx ON public.course_payments (course_id);
CREATE INDEX IF NOT EXISTS course_payments_payment_date_idx ON public.course_payments (payment_date DESC);
CREATE INDEX IF NOT EXISTS course_payments_payment_method_idx ON public.course_payments (payment_method);
CREATE INDEX IF NOT EXISTS course_payments_status_idx ON public.course_payments (status);
CREATE INDEX IF NOT EXISTS course_payments_deleted_at_idx ON public.course_payments (deleted_at);
CREATE INDEX IF NOT EXISTS course_payments_created_at_idx ON public.course_payments (created_at DESC);

DROP TRIGGER IF EXISTS course_payments_set_updated_at ON public.course_payments;
CREATE TRIGGER course_payments_set_updated_at
  BEFORE UPDATE ON public.course_payments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.course_payments TO anon, authenticated;
GRANT ALL ON public.course_payments TO service_role;

ALTER TABLE public.course_payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read course_payments for development" ON public.course_payments;
CREATE POLICY "Allow anon read course_payments for development"
  ON public.course_payments
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert course_payments for development" ON public.course_payments;
CREATE POLICY "Allow anon insert course_payments for development"
  ON public.course_payments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update course_payments for development" ON public.course_payments;
CREATE POLICY "Allow anon update course_payments for development"
  ON public.course_payments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
