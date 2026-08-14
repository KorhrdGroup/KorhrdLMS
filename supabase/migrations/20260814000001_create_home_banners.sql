-- 홈 메인 배너를 어드민에서 등록·관리하기 위한 테이블과 이미지 버킷.
-- 기존 하드코딩 배너(public/banner-1~3.png)를 대체합니다. 배너가 하나도 없으면
-- 화면은 기존 하드코딩 배너로 폴백합니다.

CREATE TABLE IF NOT EXISTS public.home_banners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT NOT NULL,
  -- 스크린리더·이미지 로드 실패 시 표시되는 설명
  alt TEXT NOT NULL DEFAULT '',
  -- 클릭 시 이동할 주소(선택). /courses/... 처럼 내부 경로 권장
  link_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS home_banners_sort_idx ON public.home_banners (sort_order);

ALTER TABLE public.home_banners ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon select home_banners for development" ON public.home_banners;
CREATE POLICY "Allow anon select home_banners for development"
  ON public.home_banners FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert home_banners for development" ON public.home_banners;
CREATE POLICY "Allow anon insert home_banners for development"
  ON public.home_banners FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update home_banners for development" ON public.home_banners;
CREATE POLICY "Allow anon update home_banners for development"
  ON public.home_banners FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete home_banners for development" ON public.home_banners;
CREATE POLICY "Allow anon delete home_banners for development"
  ON public.home_banners FOR DELETE TO anon, authenticated USING (true);

-- 배너 이미지 버킷 (공개 읽기)
INSERT INTO storage.buckets (id, name, public)
VALUES ('home-banners', 'home-banners', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Allow public read home-banners" ON storage.objects;
CREATE POLICY "Allow public read home-banners"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'home-banners');

DROP POLICY IF EXISTS "Allow anon upload home-banners for development" ON storage.objects;
CREATE POLICY "Allow anon upload home-banners for development"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'home-banners');

DROP POLICY IF EXISTS "Allow anon delete home-banners for development" ON storage.objects;
CREATE POLICY "Allow anon delete home-banners for development"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'home-banners');

NOTIFY pgrst, 'reload schema';
