-- 수강반 테이블
CREATE TABLE IF NOT EXISTS public.classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  manager_name TEXT,
  application_start DATE,
  application_end DATE,
  enrollment_start DATE NOT NULL,
  enrollment_end DATE NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT classes_year_check CHECK (year >= 1900 AND year <= 9999),
  CONSTRAINT classes_application_date_range_check CHECK (
    application_start IS NULL
    OR application_end IS NULL
    OR application_end >= application_start
  ),
  CONSTRAINT classes_enrollment_date_range_check CHECK (enrollment_end >= enrollment_start)
);

CREATE INDEX IF NOT EXISTS classes_course_id_idx ON public.classes (course_id);
CREATE INDEX IF NOT EXISTS classes_year_idx ON public.classes (year DESC);
CREATE INDEX IF NOT EXISTS classes_deleted_at_idx ON public.classes (deleted_at);
CREATE INDEX IF NOT EXISTS classes_created_at_idx ON public.classes (created_at DESC);

DROP TRIGGER IF EXISTS classes_set_updated_at ON public.classes;
CREATE TRIGGER classes_set_updated_at
  BEFORE UPDATE ON public.classes
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- PostgREST API 노출 (개발용)
GRANT SELECT, INSERT, UPDATE ON public.classes TO anon, authenticated;
GRANT ALL ON public.classes TO service_role;

ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read classes for development" ON public.classes;
CREATE POLICY "Allow anon read classes for development"
  ON public.classes
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert classes for development" ON public.classes;
CREATE POLICY "Allow anon insert classes for development"
  ON public.classes
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update classes for development" ON public.classes;
CREATE POLICY "Allow anon update classes for development"
  ON public.classes
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
