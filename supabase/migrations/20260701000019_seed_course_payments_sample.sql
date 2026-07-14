-- 개발/검증용 샘플 과목별 결제 데이터 (회원·과정이 있을 때만 삽입)
INSERT INTO public.course_payments (
  member_id,
  course_id,
  payment_date,
  coupon_number,
  assigned_instructor,
  amount,
  payment_method,
  coupon_applied,
  status,
  memo
)
SELECT
  member.id,
  course.id,
  sample.payment_date,
  sample.coupon_number,
  sample.assigned_instructor,
  sample.amount,
  sample.payment_method::public.payment_method,
  sample.coupon_applied,
  sample.status::public.course_payment_status,
  sample.memo
FROM public.members member
CROSS JOIN public.courses course
CROSS JOIN (
  VALUES
    (
      DATE '2026-06-28',
      'CPN-2026-001',
      '김강사',
      350000,
      'card',
      true,
      'completed',
      '1차 과목 결제'
    ),
    (
      DATE '2026-06-20',
      NULL,
      '이강사',
      280000,
      'bank_transfer',
      false,
      'completed',
      NULL
    ),
    (
      DATE '2026-07-01',
      'CPN-2026-002',
      '박강사',
      150000,
      'virtual_account',
      true,
      'pending',
      '입금 대기'
    )
) AS sample (
  payment_date,
  coupon_number,
  assigned_instructor,
  amount,
  payment_method,
  coupon_applied,
  status,
  memo
)
WHERE member.deleted_at IS NULL
  AND course.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.course_payments existing
    WHERE existing.member_id = member.id
      AND existing.course_id = course.id
      AND existing.payment_date = sample.payment_date
      AND existing.deleted_at IS NULL
  )
LIMIT 3;
