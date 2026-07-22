-- 공지사항 첨부파일 실제 업로드 지원.
-- 기존에는 파일 이름/용량만 저장하고 실제 파일은 업로드되지 않아, 학생이 첨부파일을
-- 내려받을 수 없었습니다. Supabase Storage에 올린 파일의 공개 URL과 경로를 저장합니다.

ALTER TABLE public.notices
  ADD COLUMN IF NOT EXISTS attachment_file_url TEXT,
  ADD COLUMN IF NOT EXISTS attachment_storage_path TEXT;

COMMENT ON COLUMN public.notices.attachment_file_url IS
  '첨부파일 공개 URL(Supabase Storage notice-attachments 버킷). 학생 화면에서 다운로드에 사용합니다.';
COMMENT ON COLUMN public.notices.attachment_storage_path IS
  '첨부파일 Storage 오브젝트 경로. 교체/삭제 시 정리용입니다.';

-- 공지 첨부파일 버킷. 학생이 로그인 없이도 받을 수 있도록 공개 읽기로 설정합니다.
INSERT INTO storage.buckets (id, name, public)
VALUES ('notice-attachments', 'notice-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read notice-attachments" ON storage.objects;
CREATE POLICY "Allow public read notice-attachments"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'notice-attachments');

DROP POLICY IF EXISTS "Allow anon upload notice-attachments for development" ON storage.objects;
CREATE POLICY "Allow anon upload notice-attachments for development"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'notice-attachments');

DROP POLICY IF EXISTS "Allow anon update notice-attachments for development" ON storage.objects;
CREATE POLICY "Allow anon update notice-attachments for development"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'notice-attachments')
  WITH CHECK (bucket_id = 'notice-attachments');

DROP POLICY IF EXISTS "Allow anon delete notice-attachments for development" ON storage.objects;
CREATE POLICY "Allow anon delete notice-attachments for development"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'notice-attachments');
