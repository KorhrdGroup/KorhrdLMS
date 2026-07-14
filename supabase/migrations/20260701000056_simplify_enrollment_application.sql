-- 민간자격증 LMS 방식 단순화: 반(classes) 배정/관리자 승인 없이 과정등록만 되어 있으면
-- 학생이 바로 수강신청(확정)할 수 있도록 합니다. 기존 UNIQUE(member_id, course_id)는
-- 상태와 무관하게 재신청 자체를 막았기 때문에, 유효한 수강 건(현재는 confirmed만 존재)에
-- 한해서만 중복 신청을 막는 partial unique index로 교체합니다.
ALTER TABLE public.enrollments
  DROP CONSTRAINT IF EXISTS enrollments_member_course_unique;

-- 참고: enrollment_status enum에 '진행중'/'수강완료' 같은 세부 상태가 추가되면
-- 아래 status 조건도 함께 확장해야 합니다(애플리케이션의 ACTIVE_ENROLLMENT_STATUSES와 동일하게 유지).
CREATE UNIQUE INDEX IF NOT EXISTS enrollments_member_course_active_unique
  ON public.enrollments (member_id, course_id)
  WHERE deleted_at IS NULL AND status = 'confirmed';

-- 기존에 결제까지 완료됐지만(payment_status = 'paid') 관리자 승인 대기(pending) 상태로 남아있던
-- 신청 건을 확정 처리합니다. (예: korhrd 계정의 병원동행매니저1급 — 결제는 완료됐는데 프론트에서는
-- "이미 신청함"으로 막히고 회원목록 "수강과정"에는 표시되지 않던 문제)
UPDATE public.enrollments
SET status = 'confirmed',
    confirmed_at = COALESCE(confirmed_at, now())
WHERE status = 'pending'
  AND payment_status = 'paid'
  AND deleted_at IS NULL;

NOTIFY pgrst, 'reload schema';
