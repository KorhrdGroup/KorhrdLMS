-- 공지 본문 이미지 클릭 시 이동할 링크(선택). null 이면 이미지는 링크 없이 표시만.
alter table public.notices
  add column if not exists image_link_url text;
