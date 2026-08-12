-- 시드 후기의 "도움됐어요" 기본 수치. 화면 표시는 (이 값 + 실제 클릭 수)입니다.
-- 회원 정리 시 helpfuls(FK) 가 같이 지워져도 수치를 보존하기 위한 컬럼입니다.
alter table public.course_reviews
  add column if not exists helpful_seed_count integer not null default 0;
