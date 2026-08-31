-- 회원목록 "학습 상태" 분류 v3 — 자격증발급 기준을 "발급(발송) 완료"로 좁힘.
--   joined    가입학생  : 수강신청 이력 없음
--   learning  수강중    : 수강 중
--   completed 과정수료  : 시험 합격 (자격증 신청·발송 대기 포함, 발송 완료 전까지)
--   issued    자격증발급: 발송 완료(shipped/delivered) 또는 발급 시각 기록
-- 참고: 이관 신청서 8,800여 건은 member_id가 비어 있어 회원 분류에 안 잡힌다.
--       회원 이관·연결이 끝나면 발송완료 회원이 자동으로 이 분류에 들어온다.
DROP VIEW IF EXISTS public.members_with_learning_status;
CREATE VIEW public.members_with_learning_status
WITH (security_invoker = on) AS
SELECT
  m.*,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM public.certificate_applications ca
      WHERE ca.member_id = m.id
        AND ca.deleted_at IS NULL
        AND (ca.issued_at IS NOT NULL OR ca.delivery_status IN ('shipped', 'delivered'))
    ) THEN 'issued'
    WHEN EXISTS (
      SELECT 1
      FROM public.enrollments e
      JOIN public.exam_submissions es ON es.enrollment_id = e.id
      WHERE e.member_id = m.id
        AND e.deleted_at IS NULL
        AND es.is_passed IS TRUE
    ) THEN 'completed'
    WHEN EXISTS (
      SELECT 1 FROM public.enrollments e
      WHERE e.member_id = m.id
        AND e.deleted_at IS NULL
        AND e.status IN ('pending', 'confirmed')
    ) THEN 'learning'
    ELSE 'joined'
  END AS learning_status
FROM public.members m;
