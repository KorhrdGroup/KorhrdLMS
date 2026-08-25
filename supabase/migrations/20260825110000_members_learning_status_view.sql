-- 회원목록 "학습 상태" 필터용 뷰 — 회원마다 학습 단계를 계산합니다.
--   joined    가입학생  : 수강신청 이력이 없음
--   learning  수강중    : 수강 중(수료 전)
--   completed 과정수료  : 수료했지만 자격증 발급은 안 됨
--   issued    자격증발급: 자격증 발급까지 완료
-- 우선순위: issued > completed > learning > joined (가장 앞선 단계 하나로 분류)
CREATE OR REPLACE VIEW public.members_with_learning_status
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
      SELECT 1 FROM public.enrollments e
      WHERE e.member_id = m.id
        AND e.deleted_at IS NULL
        AND e.learning_completed_at IS NOT NULL
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
