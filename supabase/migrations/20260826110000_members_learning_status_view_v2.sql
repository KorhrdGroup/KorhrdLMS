-- 회원목록 "학습 상태" 분류 기준 보정 (v2).
--   completed 과정수료  : 시험 합격(exam_submissions.is_passed) — 어드민 점수 입력 포함.
--                         기존의 '전 차시 100% 수강' 기준은 시험에 합격한 회원을 놓쳤다.
--   issued    자격증발급: 자격증 신청이 있으면(취소 제외) 발급 단계로 본다.
--                         기존의 '배송 완료' 기준은 신청·결제 단계 회원을 놓쳤다.
-- 우선순위: issued > completed > learning > joined
CREATE OR REPLACE VIEW public.members_with_learning_status
WITH (security_invoker = on) AS
SELECT
  m.*,
  CASE
    WHEN EXISTS (
      SELECT 1 FROM public.certificate_applications ca
      WHERE ca.member_id = m.id
        AND ca.deleted_at IS NULL
        AND ca.delivery_status <> 'canceled'
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
