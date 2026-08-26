-- 수강기간 연장 횟수. 학생이 나의 강의실에서 연장할 때마다 1씩 늘고
-- end_date 가 30일 밀린다. 최대 5회(korhrd myStatus.MAX_EXTEND)까지 허용.
alter table enrollments
  add column if not exists extend_count integer not null default 0;

comment on column enrollments.extend_count is
  '수강기간 연장 횟수 (1회당 end_date +30일, 최대 5회)';
