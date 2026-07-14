-- 시험종류 enum
DO $$
BEGIN
  CREATE TYPE public.exam_kind AS ENUM (
    'midterm',
    'final',
    'mock',
    'certificate',
    'quiz'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 시험유형 enum
DO $$
BEGIN
  CREATE TYPE public.exam_type AS ENUM (
    'regular',
    'makeup',
    'retake',
    'practice'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 시험 상태 enum
DO $$
BEGIN
  CREATE TYPE public.exam_status AS ENUM (
    'planned',
    'confirmed'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 시험 테이블
CREATE TABLE IF NOT EXISTS public.exams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  exam_kind public.exam_kind NOT NULL,
  exam_type public.exam_type NOT NULL,
  exam_start DATE NOT NULL,
  exam_end DATE NOT NULL,
  question_count INTEGER NOT NULL DEFAULT 0,
  exam_duration_minutes INTEGER NOT NULL DEFAULT 0,
  status public.exam_status NOT NULL DEFAULT 'planned',
  memo TEXT,
  print_enabled BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exams_year_check CHECK (year >= 1900 AND year <= 9999),
  CONSTRAINT exams_exam_date_range_check CHECK (exam_end >= exam_start),
  CONSTRAINT exams_question_count_check CHECK (question_count >= 0),
  CONSTRAINT exams_exam_duration_minutes_check CHECK (exam_duration_minutes >= 0)
);

CREATE INDEX IF NOT EXISTS exams_course_id_idx ON public.exams (course_id);
CREATE INDEX IF NOT EXISTS exams_year_idx ON public.exams (year DESC);
CREATE INDEX IF NOT EXISTS exams_exam_kind_idx ON public.exams (exam_kind);
CREATE INDEX IF NOT EXISTS exams_exam_type_idx ON public.exams (exam_type);
CREATE INDEX IF NOT EXISTS exams_deleted_at_idx ON public.exams (deleted_at);
CREATE INDEX IF NOT EXISTS exams_created_at_idx ON public.exams (created_at DESC);

DROP TRIGGER IF EXISTS exams_set_updated_at ON public.exams;
CREATE TRIGGER exams_set_updated_at
  BEFORE UPDATE ON public.exams
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- PostgREST API 노출 (개발용)
GRANT SELECT, INSERT, UPDATE ON public.exams TO anon, authenticated;
GRANT ALL ON public.exams TO service_role;

ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read exams for development" ON public.exams;
CREATE POLICY "Allow anon read exams for development"
  ON public.exams
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert exams for development" ON public.exams;
CREATE POLICY "Allow anon insert exams for development"
  ON public.exams
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update exams for development" ON public.exams;
CREATE POLICY "Allow anon update exams for development"
  ON public.exams
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
