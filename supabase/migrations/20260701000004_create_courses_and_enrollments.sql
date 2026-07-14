-- 과정 테이블 (과정관리에서 등록 — 샘플 데이터 없음)
CREATE TABLE IF NOT EXISTS public.courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT courses_code_unique UNIQUE (code)
);

CREATE INDEX IF NOT EXISTS courses_name_idx ON public.courses (name);

-- 학습상태 enum
DO $$
BEGIN
  CREATE TYPE public.enrollment_status AS ENUM (
    'in_progress',
    'completed',
    'dropped',
    'pending'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 수강 테이블
CREATE TABLE IF NOT EXISTS public.enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members (id),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status public.enrollment_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT enrollments_member_course_unique UNIQUE (member_id, course_id),
  CONSTRAINT enrollments_date_range_check CHECK (end_date >= start_date)
);

CREATE INDEX IF NOT EXISTS enrollments_member_id_idx ON public.enrollments (member_id);
CREATE INDEX IF NOT EXISTS enrollments_course_id_idx ON public.enrollments (course_id);
CREATE INDEX IF NOT EXISTS enrollments_status_idx ON public.enrollments (status);
CREATE INDEX IF NOT EXISTS enrollments_start_date_idx ON public.enrollments (start_date DESC);

DROP TRIGGER IF EXISTS courses_set_updated_at ON public.courses;
CREATE TRIGGER courses_set_updated_at
  BEFORE UPDATE ON public.courses
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS enrollments_set_updated_at ON public.enrollments;
CREATE TRIGGER enrollments_set_updated_at
  BEFORE UPDATE ON public.enrollments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- PostgREST API 노출 (개발용)
GRANT SELECT ON public.courses TO anon, authenticated;
GRANT SELECT, INSERT ON public.enrollments TO anon, authenticated;
GRANT ALL ON public.courses TO service_role;
GRANT ALL ON public.enrollments TO service_role;

ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read courses for development" ON public.courses;
CREATE POLICY "Allow anon read courses for development"
  ON public.courses
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon read enrollments for development" ON public.enrollments;
CREATE POLICY "Allow anon read enrollments for development"
  ON public.enrollments
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert enrollments for development" ON public.enrollments;
CREATE POLICY "Allow anon insert enrollments for development"
  ON public.enrollments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
