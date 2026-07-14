-- 자격증신청관리(관리자) ↔ 자격증발급신청 조회(학생) 화면을 위한 통합 처리상태.
-- 기존 payment_status/delivery_status는 하위호환(필터/유니크 인덱스)을 위해 유지하고,
-- application_status를 관리자가 직접 조작하는 단일 처리상태 필드로 추가합니다.
-- 관리자가 application_status를 변경하면 payment_status/delivery_status도 함께
-- 파생 갱신됩니다(certificate-mutation.service.ts 참고).

DO $$
BEGIN
  CREATE TYPE public.certificate_application_status AS ENUM (
    'received',          -- 신청접수
    'payment_pending',   -- 입금대기
    'payment_completed', -- 입금완료
    'preparing',         -- 발급준비
    'issued',            -- 발급완료
    'canceled',          -- 발급취소
    'reissued'           -- 재발급
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.certificate_applications
  ADD COLUMN IF NOT EXISTS application_status public.certificate_application_status
    NOT NULL DEFAULT 'received';

CREATE INDEX IF NOT EXISTS certificate_applications_application_status_idx
  ON public.certificate_applications (application_status);

-- 기존 데이터를 delivery_status/payment_status 조합 기준으로 역산해 백필합니다.
UPDATE public.certificate_applications
SET application_status = CASE
  WHEN delivery_status = 'canceled' THEN 'canceled'
  WHEN delivery_status = 'delivered' THEN 'issued'
  WHEN delivery_status IN ('preparing', 'shipped') THEN 'preparing'
  WHEN payment_status = 'paid' THEN 'payment_completed'
  ELSE 'received'
END::public.certificate_application_status;

COMMENT ON COLUMN public.certificate_applications.application_status IS
  '관리자 자격증신청관리 화면에서 관리하는 통합 처리상태. '
  '신청접수→입금대기→입금완료→발급준비→발급완료 순으로 진행하며, 발급취소/재발급도 가능합니다. '
  '변경 시 payment_status/delivery_status가 함께 파생 갱신됩니다.';
