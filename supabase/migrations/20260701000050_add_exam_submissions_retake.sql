-- 평가관리 > 성적관리 화면에서 관리자가 학생에게 재시험 기회를 부여할 수 있도록
-- exam_submissions에 재시험 허용 플래그를 추가합니다.
-- retake_allowed가 true인 동안은 학생이 이미 제출한 시험이라도 다시 응시할 수 있고,
-- 재응시가 완료되면(exam_submissions upsert 시) 자동으로 false로 초기화됩니다.
ALTER TABLE public.exam_submissions
  ADD COLUMN IF NOT EXISTS retake_allowed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS retake_allowed_at TIMESTAMPTZ;

COMMENT ON COLUMN public.exam_submissions.retake_allowed IS
  '관리자가 재시험을 허용했는지 여부. true면 학생이 해당 시험을 다시 응시할 수 있습니다.';
COMMENT ON COLUMN public.exam_submissions.retake_allowed_at IS
  '관리자가 재시험을 허용 처리한 시각.';

CREATE INDEX IF NOT EXISTS exam_submissions_retake_allowed_idx
  ON public.exam_submissions (retake_allowed);
