-- 과정 전체 학습완료 시각. 해당 enrollment에 연결된 모든 게시 차시가
-- lecture_progress에서 'completed' 상태가 되면 자동으로 채워집니다.
-- (수료증 발급 등 후속 처리는 다음 단계에서 이 컬럼을 기준으로 구현 예정입니다.)
ALTER TABLE public.enrollments
  ADD COLUMN IF NOT EXISTS learning_completed_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS enrollments_learning_completed_at_idx
  ON public.enrollments (learning_completed_at);
