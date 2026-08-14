-- 발급신청 "사진 없이 발급합니다" 체크 (어드민 요청 2026-08-14).
-- 증명사진이 없어도 발급을 진행하기로 확정한 건을 표시한다.
ALTER TABLE public.certificate_applications
  ADD COLUMN IF NOT EXISTS issue_without_photo BOOLEAN NOT NULL DEFAULT FALSE;

COMMENT ON COLUMN public.certificate_applications.issue_without_photo IS
  '사진 없이 발급 확정 여부 — 어드민 발급신청 상세에서 체크';
