-- PG(결제대행사) 연동 준비: 결제 상태값 확장 + course_payments/courses 컬럼 확장
--
-- 상태값 정리 (course_payments.status, public.course_payment_status enum)
--   ready    : 결제 준비 데이터 생성됨 (PG 결제창 호출 전)
--   pending  : PG 결제 진행 중 / 콜백 대기 (실제 PG 연동 시 사용)
--   paid     : 결제 완료 (기존 'approved'를 대체)
--   failed   : 결제 실패 (기존 'deposit_expired'과 동일한 enum 값을 재사용)
--   canceled : 결제 취소 (기존과 동일)
--   refunded : 환불 완료 (과거 마이그레이션에서 잠시 미사용 상태였던 enum 값을 재사용)
--
-- 'failed', 'refunded'는 과거(20260701000018) 최초 생성 시 이미 추가된 enum 값이라
-- 이번에는 'ready', 'paid'만 신규로 추가합니다.
DO $$
BEGIN
  ALTER TYPE public.course_payment_status ADD VALUE IF NOT EXISTS 'ready';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TYPE public.course_payment_status ADD VALUE IF NOT EXISTS 'paid';
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 과정 수강료 (PG 결제 금액 산정 기준). 기존 과정은 0(수강료 미정)으로 시작합니다.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS price INTEGER NOT NULL DEFAULT 0;

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_price_check;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_price_check CHECK (price >= 0);

-- PG 연동을 위한 course_payments 컬럼 확장
ALTER TABLE public.course_payments
  ADD COLUMN IF NOT EXISTS class_id UUID REFERENCES public.classes (id),
  ADD COLUMN IF NOT EXISTS enrollment_id UUID REFERENCES public.enrollments (id),
  ADD COLUMN IF NOT EXISTS pg_provider TEXT,
  ADD COLUMN IF NOT EXISTS pg_order_id TEXT,
  ADD COLUMN IF NOT EXISTS pg_transaction_id TEXT,
  ADD COLUMN IF NOT EXISTS failed_reason TEXT,
  ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS course_payments_class_id_idx ON public.course_payments (class_id);
CREATE INDEX IF NOT EXISTS course_payments_enrollment_id_idx ON public.course_payments (enrollment_id);
CREATE INDEX IF NOT EXISTS course_payments_member_course_idx ON public.course_payments (member_id, course_id);

-- 동일 주문번호 중복 저장 방지 (PG사가 채번하거나, 자체 채번한 pg_order_id 기준)
CREATE UNIQUE INDEX IF NOT EXISTS course_payments_pg_order_id_unique
  ON public.course_payments (pg_order_id)
  WHERE pg_order_id IS NOT NULL;

-- 중복 결제 방지용 부분 유니크 인덱스는 신규 enum 값('ready', 'paid')을
-- 같은 트랜잭션에서 바로 사용할 수 없어 20260701000042 마이그레이션으로 분리했습니다.

COMMENT ON COLUMN public.course_payments.pg_provider IS '결제대행사 식별자 (예: toss, iamport 등). 실제 PG 연동 전까지는 dev_test 사용';
COMMENT ON COLUMN public.course_payments.pg_order_id IS 'PG사에 전달하는 자체 채번 주문번호 (멱등키로 사용)';
COMMENT ON COLUMN public.course_payments.pg_transaction_id IS 'PG사가 발급하는 결제 승인 트랜잭션 ID (승인 콜백에서 저장)';
