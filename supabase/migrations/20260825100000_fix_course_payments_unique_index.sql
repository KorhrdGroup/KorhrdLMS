-- soft-delete된 결제가 유니크 인덱스를 차지하는 버그 수정
-- 기존: status 조건만 → deleted_at이 있어도 인덱스에 걸림
-- 수정: deleted_at IS NULL 조건 추가
DROP INDEX IF EXISTS course_payments_active_member_course_unique;
CREATE UNIQUE INDEX course_payments_active_member_course_unique
  ON public.course_payments (member_id, course_id)
  WHERE status IN ('ready', 'pending', 'paid') AND deleted_at IS NULL;
