-- 차시관리 영상 업로드 기능: Supabase Storage 업로드 / 외부 CDN URL을 모두 지원하는 구조.
-- video_url은 이미 존재하며(20260701000034), 재생에 사용할 실제 URL(내부 Storage 공개 URL
-- 또는 외부 URL)을 그대로 담습니다. video_source로 두 방식을 구분하고, Storage 업로드본을
-- 교체/삭제할 때 필요한 오브젝트 경로(video_storage_path)를 별도로 저장합니다.

DO $$
BEGIN
  CREATE TYPE public.video_source AS ENUM ('storage', 'external');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

ALTER TABLE public.lecture_sessions
  ADD COLUMN IF NOT EXISTS video_source public.video_source NOT NULL DEFAULT 'external',
  ADD COLUMN IF NOT EXISTS video_storage_path TEXT,
  ADD COLUMN IF NOT EXISTS video_file_name TEXT,
  ADD COLUMN IF NOT EXISTS video_duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS video_uploaded_at TIMESTAMPTZ;

DO $$
BEGIN
  ALTER TABLE public.lecture_sessions
    ADD CONSTRAINT lecture_sessions_video_duration_check
    CHECK (video_duration_seconds IS NULL OR video_duration_seconds > 0);
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON COLUMN public.lecture_sessions.video_source IS
  '영상 저장 방식: storage(Supabase Storage 업로드) 또는 external(외부 CDN URL 직접 입력).';
COMMENT ON COLUMN public.lecture_sessions.video_storage_path IS
  'video_source가 storage일 때의 Storage 오브젝트 경로(교체/삭제 시 정리용). external URL이면 NULL.';
COMMENT ON COLUMN public.lecture_sessions.video_file_name IS
  '업로드/등록된 영상의 원본 파일명(표시용).';
COMMENT ON COLUMN public.lecture_sessions.video_duration_seconds IS
  '영상 실제 재생 길이(초). 파일 업로드 시 브라우저에서 자동 추출하며, 학생 플레이어의 진도율(%) 계산 기준입니다.';
COMMENT ON COLUMN public.lecture_sessions.video_uploaded_at IS
  '영상 등록/교체 완료 시각.';

-- 학생 플레이어 "이어보기"를 위한 마지막 재생 위치(초).
ALTER TABLE public.lecture_progress
  ADD COLUMN IF NOT EXISTS last_position_seconds INTEGER NOT NULL DEFAULT 0;

COMMENT ON COLUMN public.lecture_progress.last_position_seconds IS
  '학생이 마지막으로 시청을 멈춘 영상 재생 위치(초). 재진입 시 이 위치부터 이어봅니다.';

-- 차시 영상 업로드용 Storage 버킷. 학생 플레이어가 signed URL 없이 바로 재생할 수 있도록
-- 공개 읽기(public read)로 설정하고, 업로드/교체/삭제는 관리자 화면에서만 수행합니다.
-- (본 프로젝트의 다른 테이블과 동일하게 개발 단계에서는 anon/authenticated 모두 허용합니다.)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lecture-videos', 'lecture-videos', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read lecture-videos" ON storage.objects;
CREATE POLICY "Allow public read lecture-videos"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'lecture-videos');

DROP POLICY IF EXISTS "Allow anon upload lecture-videos for development" ON storage.objects;
CREATE POLICY "Allow anon upload lecture-videos for development"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'lecture-videos');

DROP POLICY IF EXISTS "Allow anon update lecture-videos for development" ON storage.objects;
CREATE POLICY "Allow anon update lecture-videos for development"
  ON storage.objects
  FOR UPDATE
  TO anon, authenticated
  USING (bucket_id = 'lecture-videos')
  WITH CHECK (bucket_id = 'lecture-videos');

DROP POLICY IF EXISTS "Allow anon delete lecture-videos for development" ON storage.objects;
CREATE POLICY "Allow anon delete lecture-videos for development"
  ON storage.objects
  FOR DELETE
  TO anon, authenticated
  USING (bucket_id = 'lecture-videos');
