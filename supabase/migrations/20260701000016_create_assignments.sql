-- 과제 테이블
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  class_id UUID NOT NULL REFERENCES public.classes (id),
  year INTEGER NOT NULL,
  name TEXT NOT NULL,
  submission_start DATE NOT NULL,
  submission_end DATE NOT NULL,
  submission_count INTEGER NOT NULL DEFAULT 0,
  status public.exam_status NOT NULL DEFAULT 'planned',
  memo TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT assignments_year_check CHECK (year >= 1900 AND year <= 9999),
  CONSTRAINT assignments_submission_date_range_check CHECK (submission_end >= submission_start),
  CONSTRAINT assignments_submission_count_check CHECK (submission_count >= 0)
);

CREATE INDEX IF NOT EXISTS assignments_course_id_idx ON public.assignments (course_id);
CREATE INDEX IF NOT EXISTS assignments_class_id_idx ON public.assignments (class_id);
CREATE INDEX IF NOT EXISTS assignments_year_idx ON public.assignments (year DESC);
CREATE INDEX IF NOT EXISTS assignments_status_idx ON public.assignments (status);
CREATE INDEX IF NOT EXISTS assignments_deleted_at_idx ON public.assignments (deleted_at);
CREATE INDEX IF NOT EXISTS assignments_created_at_idx ON public.assignments (created_at DESC);

DROP TRIGGER IF EXISTS assignments_set_updated_at ON public.assignments;
CREATE TRIGGER assignments_set_updated_at
  BEFORE UPDATE ON public.assignments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.assignments TO anon, authenticated;
GRANT ALL ON public.assignments TO service_role;

ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read assignments for development" ON public.assignments;
CREATE POLICY "Allow anon read assignments for development"
  ON public.assignments
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert assignments for development" ON public.assignments;
CREATE POLICY "Allow anon insert assignments for development"
  ON public.assignments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update assignments for development" ON public.assignments;
CREATE POLICY "Allow anon update assignments for development"
  ON public.assignments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
