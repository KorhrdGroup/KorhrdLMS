-- 공지 분류(학생 공지사항 필터 탭: 수강 안내 · 신규 과정 · 이벤트). null 이면 분류 없음.
alter table public.notices
  add column if not exists category text;
