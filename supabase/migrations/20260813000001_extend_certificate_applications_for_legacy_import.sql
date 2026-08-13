-- 옛 시스템(자격증신청 8,849건) 이관을 위한 확장.
--
-- 1) member_id를 nullable로 — 옛 신청 건은 회원 이관 전이라 매칭할 member가
--    아직 없다. member_login_id(text)로 연결 고리를 남겨두고, 회원 이관 후
--    login_id 매칭으로 채운다.
-- 2) 옛 시스템에만 있던 필드 보존: 담당자/입금자/교육기간.
-- 3) legacy_no: 옛 시스템의 신청 번호. 재실행해도 중복 삽입되지 않도록
--    UNIQUE (NULL은 충돌하지 않으므로 신규 신청 건에는 영향 없음).

ALTER TABLE public.certificate_applications
  ALTER COLUMN member_id DROP NOT NULL;

ALTER TABLE public.certificate_applications
  ADD COLUMN IF NOT EXISTS manager_name TEXT,
  ADD COLUMN IF NOT EXISTS depositor_name TEXT,
  ADD COLUMN IF NOT EXISTS education_start_date DATE,
  ADD COLUMN IF NOT EXISTS education_end_date DATE,
  ADD COLUMN IF NOT EXISTS legacy_no INTEGER;

CREATE UNIQUE INDEX IF NOT EXISTS certificate_applications_legacy_no_key
  ON public.certificate_applications (legacy_no);

COMMENT ON COLUMN public.certificate_applications.manager_name IS '담당자 (옛 시스템 이관 필드)';
COMMENT ON COLUMN public.certificate_applications.depositor_name IS '입금자 (옛 시스템 이관 필드)';
COMMENT ON COLUMN public.certificate_applications.legacy_no IS '옛 시스템 신청번호 — 이관 멱등성 키';
