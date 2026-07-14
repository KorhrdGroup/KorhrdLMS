-- 민간자격증 LMS 운영 방식 변경: 과정 삭제를 Soft Delete(deleted_at)에서 Hard Delete(실제 행 삭제)로
-- 전환합니다. 삭제된 과정을 복구하는 경우가 거의 없고, 동일한 이름으로 과정을 다시 등록하는
-- 경우가 많기 때문입니다.

-- 과정명 중복 방지 유니크 인덱스를 "삭제되지 않은 과정" 범위로 한정합니다.
-- 기존 인덱스는 deleted_at 여부와 무관하게 전체 행을 대상으로 했기 때문에, 과거에
-- 소프트 삭제된 과정이 남아있으면 동일한 이름으로 재등록할 수 없는 문제가 있었습니다.
-- (Hard Delete로 전환하면 삭제된 과정은 테이블에서 완전히 사라지므로 이 조건은 주로
-- 과거에 소프트 삭제되어 남아있는 레코드에 대한 안전장치 역할을 합니다.)
DROP INDEX IF EXISTS public.courses_name_unique_idx;
CREATE UNIQUE INDEX IF NOT EXISTS courses_name_unique_idx
  ON public.courses (lower(trim(name)))
  WHERE deleted_at IS NULL;

-- PostgREST DELETE 권한 (개발용). 참조 데이터(enrollments/classes/exams 등)가 있으면
-- FK 제약(NO ACTION)에 의해 DB 차원에서도 삭제가 차단되며, 애플리케이션에서는 삭제 전에
-- 먼저 참조 데이터 존재 여부를 확인해 사용자에게 안내 메시지를 표시합니다.
GRANT DELETE ON public.courses TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon delete courses for development" ON public.courses;
CREATE POLICY "Allow anon delete courses for development"
  ON public.courses
  FOR DELETE
  TO anon, authenticated
  USING (true);

NOTIFY pgrst, 'reload schema';
