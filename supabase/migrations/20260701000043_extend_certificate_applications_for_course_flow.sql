-- 학생 "자격증발급신청" 화면 연동을 위한 certificate_applications 확장.
-- 과정 수료 완료 후 학생이 직접 신청하는 흐름(course_id 연동)과 결제상태/발급일을 추가합니다.

DO $$
BEGIN
  ALTER TYPE public.certificate_kind ADD VALUE IF NOT EXISTS 'course_completion';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.certificate_applications
  ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses (id),
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS payment_status public.payment_status NOT NULL DEFAULT 'unpaid',
  ADD COLUMN IF NOT EXISTS issued_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS certificate_applications_course_id_idx
  ON public.certificate_applications (course_id);

CREATE INDEX IF NOT EXISTS certificate_applications_member_id_idx
  ON public.certificate_applications (member_id);

-- 회원 × 과정당 활성(취소되지 않은) 자격증 신청은 1건만 허용합니다(중복 신청 방지).
-- course_id가 없는 기존 샘플 데이터(자격증 종류만 있는 레거시 행)는 대상에서 제외합니다.
CREATE UNIQUE INDEX IF NOT EXISTS certificate_applications_active_member_course_unique
  ON public.certificate_applications (member_id, course_id)
  WHERE deleted_at IS NULL AND course_id IS NOT NULL AND delivery_status <> 'canceled';

COMMENT ON COLUMN public.certificate_applications.course_id IS
  '수료 완료 후 자격증을 신청한 과정(courses.id). 학생 자격증발급신청 화면(/certificate/apply)에서 사용합니다.';
COMMENT ON COLUMN public.certificate_applications.birth_date IS
  '신청 시점의 신청자 생년월일 스냅샷(members.birth_date).';
COMMENT ON COLUMN public.certificate_applications.payment_status IS
  '자격증 발급비 결제 상태. 무통장입금은 관리자가 입금 확인 후 paid로 변경합니다.';
COMMENT ON COLUMN public.certificate_applications.issued_at IS
  '실물 자격증 발급(배송상태 delivered 처리) 일시.';
