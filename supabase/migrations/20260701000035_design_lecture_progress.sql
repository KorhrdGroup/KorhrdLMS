-- 학생별 차시 진도/출석 기록 테이블 (구조 설계 단계)
--
-- 이번 단계(강의실 ↔ 실제 차시 연동)에서는 어떤 서비스도 이 테이블에 저장하지 않습니다.
-- "학습 시작하기" 클릭 시 실제 진도 기록을 남기는 기능은 다음 단계(영상 재생 연동)에서
-- 이 테이블을 사용해 구현할 예정입니다. 지금은 학생이 신청한 enrollment + 차시(lecture_sessions)
-- 단위로 진도율/출석상태/완료시각을 기록할 수 있도록 구조만 미리 만들어 둡니다.
CREATE TABLE IF NOT EXISTS public.lecture_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments (id),
  lecture_session_id UUID NOT NULL REFERENCES public.lecture_sessions (id),
  video_progress_percent INTEGER NOT NULL DEFAULT 0,
  attendance_status TEXT NOT NULL DEFAULT 'not_started',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lecture_progress_enrollment_session_unique UNIQUE (enrollment_id, lecture_session_id),
  CONSTRAINT lecture_progress_percent_check CHECK (video_progress_percent BETWEEN 0 AND 100),
  CONSTRAINT lecture_progress_attendance_status_check CHECK (
    attendance_status IN ('not_started', 'in_progress', 'completed')
  )
);

CREATE INDEX IF NOT EXISTS lecture_progress_enrollment_id_idx ON public.lecture_progress (enrollment_id);
CREATE INDEX IF NOT EXISTS lecture_progress_lecture_session_id_idx
  ON public.lecture_progress (lecture_session_id);

DROP TRIGGER IF EXISTS lecture_progress_set_updated_at ON public.lecture_progress;
CREATE TRIGGER lecture_progress_set_updated_at
  BEFORE UPDATE ON public.lecture_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.lecture_progress TO anon, authenticated;
GRANT ALL ON public.lecture_progress TO service_role;

ALTER TABLE public.lecture_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read lecture_progress for development" ON public.lecture_progress;
CREATE POLICY "Allow anon read lecture_progress for development"
  ON public.lecture_progress
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert lecture_progress for development" ON public.lecture_progress;
CREATE POLICY "Allow anon insert lecture_progress for development"
  ON public.lecture_progress
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update lecture_progress for development" ON public.lecture_progress;
CREATE POLICY "Allow anon update lecture_progress for development"
  ON public.lecture_progress
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
