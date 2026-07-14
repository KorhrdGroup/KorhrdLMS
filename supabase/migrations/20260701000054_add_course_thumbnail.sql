-- 과정 카드 썸네일 이미지: 백오피스 과정등록/수정에서 업로드한 이미지의 공개 URL을
-- courses.thumbnail_url에 저장하고, 프론트 수강신청 카드에서 그대로 읽어 표시합니다.
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS thumbnail_url TEXT;

COMMENT ON COLUMN public.courses.thumbnail_url IS
  '과정 카드 썸네일 이미지 공개 URL(Supabase Storage course-thumbnails 버킷). 미설정 시 프론트 기본 이미지를 사용합니다.';

-- 과정 썸네일 업로드용 Storage 버킷. lecture-videos와 동일하게 공개 읽기로 설정해
-- 학생 화면에서 signed URL 없이 바로 표시할 수 있게 합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('course-thumbnails', 'course-thumbnails', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read course-thumbnails" ON storage.objects;
CREATE POLICY "Allow public read course-thumbnails"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow anon upload course-thumbnails for development" ON storage.objects;
CREATE POLICY "Allow anon upload course-thumbnails for development"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow anon update course-thumbnails for development" ON storage.objects;
CREATE POLICY "Allow anon update course-thumbnails for development"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'course-thumbnails')
  WITH CHECK (bucket_id = 'course-thumbnails');

DROP POLICY IF EXISTS "Allow anon delete course-thumbnails for development" ON storage.objects;
CREATE POLICY "Allow anon delete course-thumbnails for development"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'course-thumbnails');

-- PostgREST(Supabase API 계층)는 스키마를 캐싱하므로, 새 컬럼 추가 직후 API가 즉시 인식하도록
-- 스키마 캐시 리로드를 명시적으로 요청합니다("Could not find the 'thumbnail_url' column ..." 오류 방지).
NOTIFY pgrst, 'reload schema';
