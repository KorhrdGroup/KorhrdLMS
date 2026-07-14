-- 자격증 종류 enum
DO $$
BEGIN
  CREATE TYPE public.certificate_kind AS ENUM (
    'social_worker',
    'child_care',
    'lifelong_educator',
    'youth_instructor',
    'health_educator'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 배송상태 enum
DO $$
BEGIN
  CREATE TYPE public.certificate_delivery_status AS ENUM (
    'pending',
    'preparing',
    'shipped',
    'delivered',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 자격증 신청 테이블
CREATE TABLE IF NOT EXISTS public.certificate_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members (id),
  certificate_kind public.certificate_kind NOT NULL,
  certificate_name TEXT NOT NULL,
  member_login_id TEXT NOT NULL,
  applicant_name TEXT NOT NULL,
  phone TEXT,
  postal_code TEXT,
  address TEXT,
  address_detail TEXT,
  photo_url TEXT,
  issuance_cost INTEGER NOT NULL DEFAULT 0,
  actual_payment_amount INTEGER NOT NULL DEFAULT 0,
  payment_method public.payment_method,
  payment_info TEXT,
  delivery_status public.certificate_delivery_status NOT NULL DEFAULT 'pending',
  memo TEXT,
  applied_at DATE NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT certificate_applications_certificate_name_check
    CHECK (char_length(trim(certificate_name)) > 0),
  CONSTRAINT certificate_applications_member_login_id_check
    CHECK (char_length(trim(member_login_id)) > 0),
  CONSTRAINT certificate_applications_applicant_name_check
    CHECK (char_length(trim(applicant_name)) > 0),
  CONSTRAINT certificate_applications_issuance_cost_check
    CHECK (issuance_cost >= 0),
  CONSTRAINT certificate_applications_actual_payment_amount_check
    CHECK (actual_payment_amount >= 0)
);

CREATE INDEX IF NOT EXISTS certificate_applications_member_id_idx
  ON public.certificate_applications (member_id);
CREATE INDEX IF NOT EXISTS certificate_applications_certificate_kind_idx
  ON public.certificate_applications (certificate_kind);
CREATE INDEX IF NOT EXISTS certificate_applications_delivery_status_idx
  ON public.certificate_applications (delivery_status);
CREATE INDEX IF NOT EXISTS certificate_applications_applied_at_idx
  ON public.certificate_applications (applied_at DESC);
CREATE INDEX IF NOT EXISTS certificate_applications_deleted_at_idx
  ON public.certificate_applications (deleted_at);
CREATE INDEX IF NOT EXISTS certificate_applications_member_login_id_idx
  ON public.certificate_applications (member_login_id);
CREATE INDEX IF NOT EXISTS certificate_applications_applicant_name_idx
  ON public.certificate_applications (applicant_name);
CREATE INDEX IF NOT EXISTS certificate_applications_phone_idx
  ON public.certificate_applications (phone);

DROP TRIGGER IF EXISTS certificate_applications_set_updated_at
  ON public.certificate_applications;
CREATE TRIGGER certificate_applications_set_updated_at
  BEFORE UPDATE ON public.certificate_applications
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.certificate_applications TO anon, authenticated;
GRANT ALL ON public.certificate_applications TO service_role;

ALTER TABLE public.certificate_applications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read certificate_applications for development"
  ON public.certificate_applications;
CREATE POLICY "Allow anon read certificate_applications for development"
  ON public.certificate_applications
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert certificate_applications for development"
  ON public.certificate_applications;
CREATE POLICY "Allow anon insert certificate_applications for development"
  ON public.certificate_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update certificate_applications for development"
  ON public.certificate_applications;
CREATE POLICY "Allow anon update certificate_applications for development"
  ON public.certificate_applications
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
