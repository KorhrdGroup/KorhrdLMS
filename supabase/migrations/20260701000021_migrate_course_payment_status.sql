-- 기존 상태값을 신규 LMS 상태로 매핑
UPDATE public.course_payments
SET status = 'approved'
WHERE status = 'completed';

UPDATE public.course_payments
SET status = 'deposit_expired'
WHERE status = 'failed';

UPDATE public.course_payments
SET status = 'canceled'
WHERE status = 'refunded';
