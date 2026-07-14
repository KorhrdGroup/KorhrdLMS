-- 담당교수를 과정(course) 단위로 직접 관리자 화면에서 입력/수정할 수 있도록
-- courses 테이블에 professor_name 컬럼을 추가합니다.
-- (기존에는 학생 카드가 수강반(classes.manager_name)의 담당자를 "담당교수"로 그대로
--  표시했으나, 과정관리 화면에서 직접 편집할 수 있는 지점이 없어 값을 바꿀 방법이
--  없었습니다. 이제 courses.professor_name을 과정 수정 화면에서 직접 편집합니다.)
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS professor_name TEXT;

COMMENT ON COLUMN public.courses.professor_name IS
  '담당교수명. 학생 수강신청 과정 카드의 "담당교수"에 노출됩니다. 과정관리 > 과정수정에서 직접 입력합니다.';

-- 하위호환: 지금까지 학생 카드에 노출되던 값(수강반 담당자)을 그대로 초기값으로 이관해
-- 관리자 화면 전환 후에도 기존에 보이던 담당교수명이 갑자기 "미정"으로 바뀌지 않도록 합니다.
UPDATE public.courses c
SET professor_name = sub.manager_name
FROM (
  SELECT DISTINCT ON (course_id) course_id, manager_name
  FROM public.classes
  WHERE manager_name IS NOT NULL
    AND btrim(manager_name) <> ''
    AND deleted_at IS NULL
  ORDER BY course_id, created_at ASC
) AS sub
WHERE c.id = sub.course_id
  AND c.professor_name IS NULL;
