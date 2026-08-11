-- 공지 본문 이미지(렌더링용) — 첨부파일(다운로드용)과 별도 필드
alter table public.notices
  add column if not exists image_file_name text,
  add column if not exists image_file_url text,
  add column if not exists image_storage_path text;
