-- 과정명 중복 방지 (대소문자 구분 없음)
CREATE UNIQUE INDEX IF NOT EXISTS courses_name_unique_idx
  ON public.courses (lower(trim(name)));
