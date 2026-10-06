-- 자격증 발급신청 결제 시각(paid_at) 채우기 — 어드민 발급신청이 결제자/미결제자 두 칸으로 나뉘고
-- 결제자 칸은 결제된 순서(paid_at 최신이 위)로 쌓이게 바뀌면서(2026-10-06), 결제완료인데 paid_at 이
-- 비어 있는 건(목록 입금완료 체크는 그동안 paid_at 을 남기지 않았다)이 맨 아래로 깔리지 않도록 채운다.
--   1순위: 결제관리(course_payments, pg_order_id = cert-<신청id>)의 승인 시각 — 입금 확인한 실제 시각
--   2순위: 신청일 정오(KST)
-- paid_at 이 이미 있는 행은 건드리지 않는다(다시 돌려도 안전).

UPDATE public.certificate_applications a
   SET paid_at = coalesce(
         (SELECT p.approved_at
            FROM public.course_payments p
           WHERE p.pg_order_id = 'cert-' || a.id
             AND p.deleted_at IS NULL
             AND p.approved_at IS NOT NULL
           ORDER BY p.approved_at DESC
           LIMIT 1),
         (a.applied_at::text || ' 12:00:00+09')::timestamptz
       )
 WHERE a.deleted_at IS NULL
   AND a.payment_status IN ('paid', 'prepaid')
   AND a.paid_at IS NULL;
