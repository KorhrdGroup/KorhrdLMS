-- 강의(Lecture) 테이블 — 관리자 강의관리(/admin/lectures)에서 등록, courses.id 연결
CREATE TABLE IF NOT EXISTS public.course_lectures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES public.courses (id),
  title TEXT NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  thumbnail_file_name TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_lectures_title_check CHECK (char_length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS course_lectures_course_id_idx ON public.course_lectures (course_id);
CREATE INDEX IF NOT EXISTS course_lectures_deleted_at_idx ON public.course_lectures (deleted_at);
CREATE INDEX IF NOT EXISTS course_lectures_created_at_idx ON public.course_lectures (created_at DESC);

DROP TRIGGER IF EXISTS course_lectures_set_updated_at ON public.course_lectures;
CREATE TRIGGER course_lectures_set_updated_at
  BEFORE UPDATE ON public.course_lectures
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- 차시(Session) 테이블 — 강의(course_lectures) 하위 학습 단위
CREATE TABLE IF NOT EXISTS public.lecture_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lecture_id UUID NOT NULL REFERENCES public.course_lectures (id),
  session_order INTEGER NOT NULL,
  title TEXT NOT NULL,
  -- 학습시간(분). 관리자가 차시 등록 시 입력하며, 값이 없으면 학생 화면에 "안내 예정"으로 표시됩니다.
  duration_minutes INTEGER,
  -- 영상 연동 전까지는 항상 NULL이며, 화면에는 Placeholder만 표시합니다.
  video_url TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lecture_sessions_title_check CHECK (char_length(trim(title)) > 0),
  CONSTRAINT lecture_sessions_order_check CHECK (session_order > 0),
  CONSTRAINT lecture_sessions_duration_check CHECK (duration_minutes IS NULL OR duration_minutes > 0)
);

CREATE INDEX IF NOT EXISTS lecture_sessions_lecture_id_idx ON public.lecture_sessions (lecture_id);
CREATE INDEX IF NOT EXISTS lecture_sessions_order_idx ON public.lecture_sessions (lecture_id, session_order);
CREATE INDEX IF NOT EXISTS lecture_sessions_deleted_at_idx ON public.lecture_sessions (deleted_at);

DROP TRIGGER IF EXISTS lecture_sessions_set_updated_at ON public.lecture_sessions;
CREATE TRIGGER lecture_sessions_set_updated_at
  BEFORE UPDATE ON public.lecture_sessions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- PostgREST API 노출 (개발용)
GRANT SELECT, INSERT, UPDATE ON public.course_lectures TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.lecture_sessions TO anon, authenticated;
GRANT ALL ON public.course_lectures TO service_role;
GRANT ALL ON public.lecture_sessions TO service_role;

ALTER TABLE public.course_lectures ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lecture_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read course_lectures for development" ON public.course_lectures;
CREATE POLICY "Allow anon read course_lectures for development"
  ON public.course_lectures
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert course_lectures for development" ON public.course_lectures;
CREATE POLICY "Allow anon insert course_lectures for development"
  ON public.course_lectures
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update course_lectures for development" ON public.course_lectures;
CREATE POLICY "Allow anon update course_lectures for development"
  ON public.course_lectures
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read lecture_sessions for development" ON public.lecture_sessions;
CREATE POLICY "Allow anon read lecture_sessions for development"
  ON public.lecture_sessions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert lecture_sessions for development" ON public.lecture_sessions;
CREATE POLICY "Allow anon insert lecture_sessions for development"
  ON public.lecture_sessions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update lecture_sessions for development" ON public.lecture_sessions;
CREATE POLICY "Allow anon update lecture_sessions for development"
  ON public.lecture_sessions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
