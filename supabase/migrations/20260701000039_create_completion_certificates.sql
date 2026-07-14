-- 과정 수료증(수료증관리 `/admin/certificates`, 학습강의실 `/classroom/[slug]/certificate`) 발급 이력 테이블.
-- 민간자격증 실물 발급 신청(`certificate_applications`)과는 별개의 "과정 수료증" 전자 발급 기록입니다.
-- enrollment 1건당 최대 1개의 활성(미취소) 수료증만 존재하도록 관리하며,
-- 발급취소는 canceled_at을 채우는 소프트 삭제 방식으로 처리해 이력을 보존합니다.
CREATE TABLE IF NOT EXISTS public.completion_certificates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments (id),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  member_id UUID NOT NULL REFERENCES public.members (id),
  certificate_number TEXT NOT NULL,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  reissue_count INTEGER NOT NULL DEFAULT 0,
  canceled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS completion_certificates_enrollment_id_idx
  ON public.completion_certificates (enrollment_id);
CREATE INDEX IF NOT EXISTS completion_certificates_member_id_idx
  ON public.completion_certificates (member_id);

-- enrollment 1건당 활성(미취소) 수료증은 1개만 허용합니다. 취소된 레코드는
-- canceled_at이 채워져 있어 새 발급 시 새 행을 추가할 수 있습니다.
DROP INDEX IF EXISTS completion_certificates_active_enrollment_unique;
CREATE UNIQUE INDEX completion_certificates_active_enrollment_unique
  ON public.completion_certificates (enrollment_id)
  WHERE canceled_at IS NULL;

DROP TRIGGER IF EXISTS completion_certificates_set_updated_at ON public.completion_certificates;
CREATE TRIGGER completion_certificates_set_updated_at
  BEFORE UPDATE ON public.completion_certificates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.completion_certificates TO anon, authenticated;
GRANT ALL ON public.completion_certificates TO service_role;

ALTER TABLE public.completion_certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read completion_certificates for development" ON public.completion_certificates;
CREATE POLICY "Allow anon read completion_certificates for development"
  ON public.completion_certificates
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert completion_certificates for development" ON public.completion_certificates;
CREATE POLICY "Allow anon insert completion_certificates for development"
  ON public.completion_certificates
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update completion_certificates for development" ON public.completion_certificates;
CREATE POLICY "Allow anon update completion_certificates for development"
  ON public.completion_certificates
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
