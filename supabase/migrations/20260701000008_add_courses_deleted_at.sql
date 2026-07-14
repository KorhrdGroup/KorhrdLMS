-- 과정 soft delete
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS courses_deleted_at_idx ON public.courses (deleted_at);

-- PostgREST UPDATE 권한 (개발용)
GRANT UPDATE ON public.courses TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon update courses for development" ON public.courses;
CREATE POLICY "Allow anon update courses for development"
  ON public.courses
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
