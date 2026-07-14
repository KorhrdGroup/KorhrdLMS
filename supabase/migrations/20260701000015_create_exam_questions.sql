-- 문제유형 enum
DO $$
BEGIN
  CREATE TYPE public.exam_question_type AS ENUM (
    'multiple_choice',
    'ox',
    'short_answer'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 시험 문제 테이블
CREATE TABLE IF NOT EXISTS public.exam_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id UUID NOT NULL REFERENCES public.exams (id),
  question_type public.exam_question_type NOT NULL,
  question TEXT NOT NULL,
  choice1 TEXT,
  choice2 TEXT,
  choice3 TEXT,
  choice4 TEXT,
  choice5 TEXT,
  answer TEXT NOT NULL,
  score INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT exam_questions_score_check CHECK (score >= 0)
);

CREATE INDEX IF NOT EXISTS exam_questions_exam_id_idx ON public.exam_questions (exam_id);
CREATE INDEX IF NOT EXISTS exam_questions_deleted_at_idx ON public.exam_questions (deleted_at);
CREATE INDEX IF NOT EXISTS exam_questions_sort_order_idx ON public.exam_questions (exam_id, sort_order);
CREATE INDEX IF NOT EXISTS exam_questions_created_at_idx ON public.exam_questions (created_at DESC);

DROP TRIGGER IF EXISTS exam_questions_set_updated_at ON public.exam_questions;
CREATE TRIGGER exam_questions_set_updated_at
  BEFORE UPDATE ON public.exam_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- PostgREST API 노출 (개발용)
GRANT SELECT, INSERT, UPDATE ON public.exam_questions TO anon, authenticated;
GRANT ALL ON public.exam_questions TO service_role;

ALTER TABLE public.exam_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read exam_questions for development" ON public.exam_questions;
CREATE POLICY "Allow anon read exam_questions for development"
  ON public.exam_questions
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert exam_questions for development" ON public.exam_questions;
CREATE POLICY "Allow anon insert exam_questions for development"
  ON public.exam_questions
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update exam_questions for development" ON public.exam_questions;
CREATE POLICY "Allow anon update exam_questions for development"
  ON public.exam_questions
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
