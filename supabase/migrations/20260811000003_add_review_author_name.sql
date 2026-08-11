-- 시드/홍보용 합격후기 — 회원 없이 작성자 이름만 하드코딩할 수 있게 합니다.
-- author_name 이 있으면 화면은 그 이름을(마스킹해서) 쓰고, 없으면 기존처럼 회원 이름을 씁니다.
alter table public.course_reviews
  add column if not exists author_name text;
alter table public.course_reviews
  alter column member_id drop not null;
