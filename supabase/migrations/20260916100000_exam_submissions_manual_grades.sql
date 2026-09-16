-- 수료시험 관리자 채점(문제별 정답 처리) 기록.
--
-- 학생이 실제로 고른 답(answers)은 손대지 않고, 관리자가 "정답 처리"한 문제만
-- manual_grades 에 {문제ID: true} 로 따로 남깁니다. 점수는
-- (자동 채점으로 맞은 문제 + 관리자가 정답 처리한 문제)의 배점 합으로 다시 계산합니다.
-- 학점연계 외부 학생처럼 진도·시험을 실제로 치른 뒤 담당자가 시험지를 열어
-- 한 문제씩 정답 처리하던 옛 한직훈 운영 방식을 그대로 재현하기 위한 컬럼입니다.

ALTER TABLE public.exam_submissions
  ADD COLUMN IF NOT EXISTS manual_grades JSONB NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS manual_graded_by TEXT,
  ADD COLUMN IF NOT EXISTS manual_graded_at TIMESTAMPTZ;

COMMENT ON COLUMN public.exam_submissions.manual_grades IS
  '관리자가 정답 처리한 문제 {exam_question_id: true}. 학생 원본 답안(answers)은 유지.';
COMMENT ON COLUMN public.exam_submissions.manual_graded_by IS
  '마지막으로 채점을 저장한 관리자 로그인ID(이메일)';
COMMENT ON COLUMN public.exam_submissions.manual_graded_at IS
  '마지막 채점 저장 시각';
