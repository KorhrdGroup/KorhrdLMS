-- 시험 공개(학생 응시 가능) 여부 및 합격 점수(선택, 관리자 시험관리에서 입력)
ALTER TABLE public.exams
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS pass_score INTEGER;

ALTER TABLE public.exams
  DROP CONSTRAINT IF EXISTS exams_pass_score_check;
ALTER TABLE public.exams
  ADD CONSTRAINT exams_pass_score_check
  CHECK (pass_score IS NULL OR (pass_score >= 0 AND pass_score <= 100));

CREATE INDEX IF NOT EXISTS exams_is_published_idx ON public.exams (is_published);

-- 과정별 "시험 응시 가능 진도율" 기준(%). NULL이면 애플리케이션 기본값(예: 80%)을 사용합니다.
-- (courses.completion_attendance_rate/완료_exam_score와 같은 패턴의 설정값 컬럼입니다.)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS exam_eligibility_progress_rate NUMERIC(5, 2);

ALTER TABLE public.courses
  DROP CONSTRAINT IF EXISTS courses_exam_eligibility_progress_rate_check;
ALTER TABLE public.courses
  ADD CONSTRAINT courses_exam_eligibility_progress_rate_check
  CHECK (
    exam_eligibility_progress_rate IS NULL
    OR (exam_eligibility_progress_rate >= 0 AND exam_eligibility_progress_rate <= 100)
  );

-- 학생 시험 응시 이력/점수 테이블. enrollment(=학생+과정) 단위로 시험별 1건만 유지합니다
-- (재응시 시 upsert로 최신 결과를 덮어씁니다).
CREATE TABLE IF NOT EXISTS public.exam_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enrollment_id UUID NOT NULL REFERENCES public.enrollments (id),
  exam_id UUID NOT NULL REFERENCES public.exams (id),
  score INTEGER NOT NULL DEFAULT 0,
  total_score INTEGER NOT NULL DEFAULT 0,
  is_passed BOOLEAN,
  answers JSONB NOT NULL DEFAULT '{}'::jsonb,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exam_submissions_enrollment_exam_unique UNIQUE (enrollment_id, exam_id),
  CONSTRAINT exam_submissions_score_check CHECK (score >= 0),
  CONSTRAINT exam_submissions_total_score_check CHECK (total_score >= 0)
);

CREATE INDEX IF NOT EXISTS exam_submissions_enrollment_id_idx ON public.exam_submissions (enrollment_id);
CREATE INDEX IF NOT EXISTS exam_submissions_exam_id_idx ON public.exam_submissions (exam_id);

DROP TRIGGER IF EXISTS exam_submissions_set_updated_at ON public.exam_submissions;
CREATE TRIGGER exam_submissions_set_updated_at
  BEFORE UPDATE ON public.exam_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.exam_submissions TO anon, authenticated;
GRANT ALL ON public.exam_submissions TO service_role;

ALTER TABLE public.exam_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read exam_submissions for development" ON public.exam_submissions;
CREATE POLICY "Allow anon read exam_submissions for development"
  ON public.exam_submissions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert exam_submissions for development" ON public.exam_submissions;
CREATE POLICY "Allow anon insert exam_submissions for development"
  ON public.exam_submissions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update exam_submissions for development" ON public.exam_submissions;
CREATE POLICY "Allow anon update exam_submissions for development"
  ON public.exam_submissions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
