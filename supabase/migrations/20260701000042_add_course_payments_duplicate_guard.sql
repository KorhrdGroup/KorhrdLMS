-- 회원 1명당 과정 1개에 대해 "진행 중"(ready/pending) 또는 "완료"(paid) 결제는 1건만 허용합니다.
-- (중복 결제 방지: 이미 활성 결제가 있으면 새로 만들지 않고 기존 건을 재사용/갱신합니다.)
-- 신규 enum 값('ready', 'paid')을 추가한 트랜잭션(20260701000040)과 분리해야
-- "unsafe use of new value of enum type" 오류 없이 안전하게 사용할 수 있습니다.
CREATE UNIQUE INDEX IF NOT EXISTS course_payments_active_member_course_unique
  ON public.course_payments (member_id, course_id)
  WHERE status IN ('ready', 'pending', 'paid');
