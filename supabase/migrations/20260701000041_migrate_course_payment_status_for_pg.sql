-- 기존(관리자 수기입력 방식) 상태값을 PG 연동 표준 상태값으로 통일합니다.
-- 새 enum 값('ready', 'paid')은 이전 마이그레이션에서 이미 추가되었으므로
-- 별도 트랜잭션(파일)에서 안전하게 사용할 수 있습니다.
UPDATE public.course_payments
SET status = 'paid'
WHERE status = 'approved';

UPDATE public.course_payments
SET status = 'failed'
WHERE status = 'deposit_expired';

-- 다음 마이그레이션(000042)에서 "회원×과정당 활성 결제 1건" 유니크 인덱스를 추가하기 전에,
-- 과거 샘플 시드 데이터(20260701000019) 중 동일 회원×과정에 활성 상태(ready/pending/paid)가
-- 여러 건 남아있는 경우를 정리합니다. 가장 최근 건만 유지하고 나머지는 취소 처리(soft)합니다.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY member_id, course_id
           ORDER BY created_at DESC, id DESC
         ) AS rn
  FROM public.course_payments
  WHERE status IN ('ready', 'pending', 'paid')
)
UPDATE public.course_payments cp
SET status = 'canceled',
    canceled_at = NOW(),
    memo = trim(both ' / ' FROM COALESCE(cp.memo, '') || ' / [PG 연동] 회원×과정당 결제 1건 정책 적용으로 중복 샘플 데이터 자동 취소 처리')
FROM ranked
WHERE cp.id = ranked.id
  AND ranked.rn > 1;
