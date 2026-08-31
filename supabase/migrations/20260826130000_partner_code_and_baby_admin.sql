-- 파트너스 코드 + 아기관리자 역할.
-- 1) members.partner_code — 회원가입 때 입력한 파트너스 코드(대문자 정규화, 예: STAR).
--    코드가 있는 회원은 해당 파트너 소속으로 구분한다.
-- 2) admin_type enum에 baby_admin 추가 — 회원관리·자격증신청·결제관리만 보이고
--    파트너 코드가 걸린 회원만 조회/관리하는 제한 관리자.
alter table members
  add column if not exists partner_code text;

create index if not exists members_partner_code_idx on members (partner_code)
  where partner_code is not null;

comment on column members.partner_code is
  '파트너스 코드 (가입 시 입력, 대문자 정규화 — 예: STAR). null이면 일반 회원.';

alter type admin_type add value if not exists 'baby_admin';

-- members_with_learning_status 뷰는 생성 시점의 컬럼을 고정하므로
-- partner_code가 보이도록 다시 만든다 (분류 기준은 v2와 동일).
-- 컬럼 구성이 바뀌면 CREATE OR REPLACE가 실패하므로 DROP 후 재생성.
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
