-- 과정상태 enum
DO $$
BEGIN
  CREATE TYPE public.course_status AS ENUM ('active', 'hidden', 'closed');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 과정관리 확장 컬럼
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category TEXT,
  ADD COLUMN IF NOT EXISTS default_duration_days INTEGER,
  ADD COLUMN IF NOT EXISTS completion_attendance_rate NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS completion_exam_score NUMERIC(5, 2),
  ADD COLUMN IF NOT EXISTS status public.course_status NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS description TEXT;

CREATE INDEX IF NOT EXISTS courses_status_idx ON public.courses (status);
CREATE INDEX IF NOT EXISTS courses_category_idx ON public.courses (category);
CREATE INDEX IF NOT EXISTS courses_code_idx ON public.courses (code);

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_default_duration_days_check;
ALTER TABLE public.courses
  ADD CONSTRAINT courses_default_duration_days_check
  CHECK (default_duration_days IS NULL OR default_duration_days > 0);

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_completion_attendance_rate_check;
ALTER TABLE public.courses
  ADD CONSTRAINT courses_completion_attendance_rate_check
  CHECK (
    completion_attendance_rate IS NULL
    OR (completion_attendance_rate >= 0 AND completion_attendance_rate <= 100)
  );

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_completion_exam_score_check;
ALTER TABLE public.courses
  ADD CONSTRAINT courses_completion_exam_score_check
  CHECK (
    completion_exam_score IS NULL
    OR (completion_exam_score >= 0 AND completion_exam_score <= 100)
  );

-- PostgREST INSERT 권한 (개발용)
GRANT INSERT ON public.courses TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon insert courses for development" ON public.courses;
CREATE POLICY "Allow anon insert courses for development"
  ON public.courses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
