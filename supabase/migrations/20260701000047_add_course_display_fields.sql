-- 민간자격증 LMS 과정 카드 표시 기준(담당교수/수업방식/강의시간/주무관청)에 맞춰
-- courses 테이블에 신규 필드를 추가합니다.
-- 담당교수는 기존 classes.manager_name(수강반 담당자)을 그대로 재사용하므로
-- courses에는 별도 컬럼을 추가하지 않습니다.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS study_method TEXT NOT NULL DEFAULT '온라인 강의',
  ADD COLUMN IF NOT EXISTS lecture_time TEXT NOT NULL DEFAULT '전체 약 20시간',
  ADD COLUMN IF NOT EXISTS supervising_agency TEXT NOT NULL DEFAULT '보건복지부';

COMMENT ON COLUMN public.courses.study_method IS
  '수업방식(예: 온라인 강의). 학생 수강신청 과정 카드에 노출됩니다.';
COMMENT ON COLUMN public.courses.lecture_time IS
  '강의시간 안내 문구(예: 전체 약 20시간). 학생 수강신청 과정 카드에 노출됩니다.';
COMMENT ON COLUMN public.courses.supervising_agency IS
  '주무관청(예: 보건복지부). 학생 수강신청 과정 카드에 노출됩니다.';
