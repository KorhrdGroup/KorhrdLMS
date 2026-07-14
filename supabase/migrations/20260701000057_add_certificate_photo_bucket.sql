-- 자격증발급신청 화면(/certificate/apply)의 증명사진 첨부(선택사항)를 위한 Storage 버킷.
-- 사진을 첨부하지 않아도 신청이 가능하므로 certificate_applications.photo_url은 nullable로 이미
-- 존재하며(20260701000025_create_certificate_applications.sql), 이 마이그레이션은 업로드용
-- 버킷만 추가합니다. course-thumbnails/lecture-videos와 동일하게 공개 읽기로 설정합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('certificate-photos', 'certificate-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read certificate-photos" ON storage.objects;
CREATE POLICY "Allow public read certificate-photos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'certificate-photos');

DROP POLICY IF EXISTS "Allow anon upload certificate-photos for development" ON storage.objects;
CREATE POLICY "Allow anon upload certificate-photos for development"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'certificate-photos');

DROP POLICY IF EXISTS "Allow anon update certificate-photos for development" ON storage.objects;
CREATE POLICY "Allow anon update certificate-photos for development"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'certificate-photos')
  WITH CHECK (bucket_id = 'certificate-photos');

DROP POLICY IF EXISTS "Allow anon delete certificate-photos for development" ON storage.objects;
CREATE POLICY "Allow anon delete certificate-photos for development"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'certificate-photos');

NOTIFY pgrst, 'reload schema';
