-- 공지사항(notices) 테이블.
-- 기존에는 관리자 공지사항(/admin/notices)이 서버 메모리 Mock 배열로 동작해
-- 서버 재시작 시 사라졌고, 학생 화면(/notice)은 하드코딩된 파일을 읽어
-- 관리자가 등록한 공지가 학생에게 노출되지 않았습니다.
--
-- 컬럼 구성은 기존 Notice 타입(features/notice-management/types/notice.types.ts)과
-- 1:1로 맞춰, repository 구현만 교체하면 되도록 설계했습니다.

CREATE TABLE IF NOT EXISTS public.notices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL DEFAULT '관리자',
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_published BOOLEAN NOT NULL DEFAULT true,
  view_count INTEGER NOT NULL DEFAULT 0,
  attachment_file_name TEXT,
  attachment_file_size_label TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notices_title_check CHECK (char_length(trim(title)) > 0),
  CONSTRAINT notices_view_count_check CHECK (view_count >= 0)
);

CREATE INDEX IF NOT EXISTS notices_published_idx ON public.notices (is_published, is_pinned, created_at DESC);
CREATE INDEX IF NOT EXISTS notices_created_at_idx ON public.notices (created_at DESC);

DROP TRIGGER IF EXISTS notices_set_updated_at ON public.notices;
CREATE TRIGGER notices_set_updated_at
  BEFORE UPDATE ON public.notices
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.notices TO anon, authenticated;
GRANT ALL ON public.notices TO service_role;

ALTER TABLE public.notices ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read notices for development" ON public.notices;
CREATE POLICY "Allow anon read notices for development"
  ON public.notices FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert notices for development" ON public.notices;
CREATE POLICY "Allow anon insert notices for development"
  ON public.notices FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update notices for development" ON public.notices;
CREATE POLICY "Allow anon update notices for development"
  ON public.notices FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete notices for development" ON public.notices;
CREATE POLICY "Allow anon delete notices for development"
  ON public.notices FOR DELETE TO anon, authenticated USING (true);

-- 기존 학생 화면(하드코딩)에 있던 공지를 초기 데이터로 이관합니다.
INSERT INTO public.notices (title, content, is_pinned, is_published, view_count, created_at)
SELECT * FROM (
  VALUES
    ('2026학년도 2학기 수강신청 안내', '2026학년도 2학기 수강신청 일정을 안내드립니다. 자세한 내용은 학사일정을 확인해주시기 바랍니다.', true, true, 128, NOW() - INTERVAL '2 days'),
    ('한평생직업훈련 홈페이지 리뉴얼 안내', '보다 편리한 학습 환경 제공을 위해 홈페이지를 리뉴얼하였습니다. 많은 이용 바랍니다.', true, true, 96, NOW() - INTERVAL '5 days'),
    ('학습지원센터 운영시간 변경 안내', '학습지원센터 운영시간이 평일 10:00~18:00으로 변경되었습니다.', false, true, 54, NOW() - INTERVAL '10 days')
) AS seed(title, content, is_pinned, is_published, view_count, created_at)
WHERE NOT EXISTS (SELECT 1 FROM public.notices);
