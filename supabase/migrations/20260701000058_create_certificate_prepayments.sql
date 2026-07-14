-- 자격증 발급비 선납결제 관리 (백오피스 자격증관리 > 선납결제).
-- 학생이 자격증발급신청을 하기 전, 관리자가 미리 확인한 입금(선납결제) 내역을
-- 기록해두면 이후 학생이 실제 자격증발급신청을 할 때 자동으로 연결되어
-- 최종결제금액에서 선납금만큼 차감됩니다(certificate-application.service.ts 참고).
-- 프론트에는 아직 선납결제 "신청" 화면이 없고, 이 테이블은 관리자가 직접
-- 등록/관리하는 용도로만 사용합니다.

-- 선납으로 이미 전액/일부 대금이 들어온 신청 건을 다른 결제 상태와 구분해
-- 표시하기 위해 payment_status enum에 'prepaid'(선납완료) 값을 추가합니다.
-- 기존 unpaid/paid/partial/refunded/canceled 값과 의미가 겹치지 않도록 신규 값만
-- 추가하며, 이 파일 안에서는 새 값을 사용하지 않습니다(같은 트랜잭션 내 enum
-- 신규 값 사용 제한 회피 — courses_kind/exam_kind 확장 마이그레이션과 동일한 패턴).
DO $$
BEGIN
  ALTER TYPE public.payment_status ADD VALUE IF NOT EXISTS 'prepaid';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.certificate_prepayments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members (id),
  course_id UUID REFERENCES public.courses (id),
  certificate_name TEXT NOT NULL,
  amount INTEGER NOT NULL DEFAULT 100000,
  payment_method public.payment_method,
  payment_status public.payment_status NOT NULL DEFAULT 'paid',
  paid_at TIMESTAMPTZ,
  used_at TIMESTAMPTZ,
  certificate_application_id UUID REFERENCES public.certificate_applications (id),
  memo TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT certificate_prepayments_certificate_name_check
    CHECK (char_length(trim(certificate_name)) > 0),
  CONSTRAINT certificate_prepayments_amount_check
    CHECK (amount >= 0)
);

CREATE INDEX IF NOT EXISTS certificate_prepayments_member_id_idx
  ON public.certificate_prepayments (member_id);
CREATE INDEX IF NOT EXISTS certificate_prepayments_course_id_idx
  ON public.certificate_prepayments (course_id);
CREATE INDEX IF NOT EXISTS certificate_prepayments_used_at_idx
  ON public.certificate_prepayments (used_at);
CREATE INDEX IF NOT EXISTS certificate_prepayments_certificate_application_id_idx
  ON public.certificate_prepayments (certificate_application_id);
CREATE INDEX IF NOT EXISTS certificate_prepayments_deleted_at_idx
  ON public.certificate_prepayments (deleted_at);

-- 회원당 "사용 가능한(미사용, 미삭제)" 선납결제를 빠르게 찾기 위한 부분 인덱스.
-- 자격증발급신청 제출 시 자동 연결 대상 조회에 사용합니다.
CREATE INDEX IF NOT EXISTS certificate_prepayments_available_idx
  ON public.certificate_prepayments (member_id, course_id)
  WHERE deleted_at IS NULL AND used_at IS NULL;

DROP TRIGGER IF EXISTS certificate_prepayments_set_updated_at
  ON public.certificate_prepayments;
CREATE TRIGGER certificate_prepayments_set_updated_at
  BEFORE UPDATE ON public.certificate_prepayments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.certificate_prepayments TO anon, authenticated;
GRANT ALL ON public.certificate_prepayments TO service_role;

ALTER TABLE public.certificate_prepayments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read certificate_prepayments for development"
  ON public.certificate_prepayments;
CREATE POLICY "Allow anon read certificate_prepayments for development"
  ON public.certificate_prepayments
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert certificate_prepayments for development"
  ON public.certificate_prepayments;
CREATE POLICY "Allow anon insert certificate_prepayments for development"
  ON public.certificate_prepayments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update certificate_prepayments for development"
  ON public.certificate_prepayments;
CREATE POLICY "Allow anon update certificate_prepayments for development"
  ON public.certificate_prepayments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON COLUMN public.certificate_prepayments.course_id IS
  '선납이 특정 과정/자격증에 한정되면 courses.id를 지정합니다. NULL이면 과정 무관 범용 선납입니다.';
COMMENT ON COLUMN public.certificate_prepayments.used_at IS
  '이 선납결제가 특정 자격증발급신청에 자동 연결되어 사용 처리된 시각. NULL이면 아직 미사용(사용 가능).';
COMMENT ON COLUMN public.certificate_prepayments.certificate_application_id IS
  '이 선납결제가 사용된 자격증발급신청(certificate_applications.id). 학생이 자격증발급신청을 제출할 때 자동으로 연결됩니다.';

NOTIFY pgrst, 'reload schema';
