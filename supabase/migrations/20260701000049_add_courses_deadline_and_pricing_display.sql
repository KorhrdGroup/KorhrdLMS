-- 민간자격증 LMS 운영 방식(선결제가 아닌 "무료수강 → 학습 → 자격증 발급비 결제")에 맞춰
-- 학생 수강신청 과정 카드의 "마감임박" 배지와 가격 표시를 과정관리에서 직접 제어할 수 있도록
-- courses 테이블에 컬럼을 추가합니다.
--
-- 주의: 기존 course_payments/결제 프로세스가 사용하는 courses.price 컬럼은 그대로 두고,
-- 아래 컬럼은 오직 "학생 수강신청 카드에 어떻게 보여줄지"를 위한 표시용 컬럼입니다.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS is_deadline_soon BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS regular_price INTEGER NOT NULL DEFAULT 400000,
  ADD COLUMN IF NOT EXISTS display_price INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_free_course BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE public.courses
  ADD CONSTRAINT courses_regular_price_non_negative CHECK (regular_price >= 0),
  ADD CONSTRAINT courses_display_price_non_negative CHECK (display_price >= 0);

COMMENT ON COLUMN public.courses.is_deadline_soon IS
  '학생 수강신청 과정 카드에 "마감임박" 배지(붉은 테두리) 노출 여부. 과정관리에서 ON/OFF.';
COMMENT ON COLUMN public.courses.regular_price IS
  '과정 카드에 취소선으로 표시되는 정가. 기본값 400,000원.';
COMMENT ON COLUMN public.courses.display_price IS
  '과정 카드에 강조 표시되는 실제 표시가. 기본값 0원(무료수강).';
COMMENT ON COLUMN public.courses.is_free_course IS
  '무료수강 과정 여부. true면 선결제 없이 학습 진행 후 자격증 발급비만 별도 결제합니다.';
