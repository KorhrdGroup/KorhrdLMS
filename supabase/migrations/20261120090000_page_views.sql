-- 학생 사이트 페이지 방문 기록 — 전체 방문자 대비 취업 길찾기 방문자, 방문 → 신청 전환율을 보려고 둔다.
-- 회원 정보·IP 는 남기지 않는다. visitor_id 는 브라우저 쿠키(hp_vid)에 넣은 임의 값이다.
create table if not exists page_views (
  id bigint generated always as identity primary key,
  path text not null,          -- '/jobs', '/jobs/생활지원사' (쿼리스트링 제외)
  visitor_id text not null,
  created_at timestamptz not null default now()
);

create index if not exists page_views_created_idx on page_views (created_at desc);

comment on table page_views is '학생 사이트 페이지 방문 기록 (관리자 화면 제외, 익명 방문자 ID)';
