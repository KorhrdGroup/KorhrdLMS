-- 백오피스 과정관리 > 카테고리관리, 프론트 수강신청 왼쪽 카테고리 목록 연동용
-- 과정 분류(카테고리) 테이블입니다. 기존 courses.category(자유 텍스트) 컬럼은
-- 하위호환을 위해 그대로 두고, 새 category_id(FK)를 기준으로 카테고리를 관리합니다.
CREATE TABLE IF NOT EXISTS public.course_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  description TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS course_categories_sort_order_idx ON public.course_categories (sort_order);
CREATE INDEX IF NOT EXISTS course_categories_is_active_idx ON public.course_categories (is_active);

DROP TRIGGER IF EXISTS course_categories_set_updated_at ON public.course_categories;
CREATE TRIGGER course_categories_set_updated_at
  BEFORE UPDATE ON public.course_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.course_categories TO anon, authenticated;
GRANT ALL ON public.course_categories TO service_role;

ALTER TABLE public.course_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read course_categories for development" ON public.course_categories;
CREATE POLICY "Allow anon read course_categories for development"
  ON public.course_categories
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert course_categories for development" ON public.course_categories;
CREATE POLICY "Allow anon insert course_categories for development"
  ON public.course_categories
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update course_categories for development" ON public.course_categories;
CREATE POLICY "Allow anon update course_categories for development"
  ON public.course_categories
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon delete course_categories for development" ON public.course_categories;
CREATE POLICY "Allow anon delete course_categories for development"
  ON public.course_categories
  FOR DELETE
  TO anon, authenticated
  USING (true);

-- courses.category(자유 텍스트)는 그대로 남겨두고, 카테고리관리와 연동되는
-- 새 FK 컬럼만 추가합니다. 카테고리가 삭제되면 해당 과정은 미분류로 남습니다
-- (실제 삭제는 서비스 레이어에서 사용 중인 과정이 있으면 비활성화를 안내합니다).
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.course_categories (id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS courses_category_id_idx ON public.courses (category_id);

INSERT INTO public.course_categories (name, slug, sort_order, is_active)
VALUES
  ('실버/돌봄 과정', 'silver-care', 10, true),
  ('심리상담과정', 'psychology-counseling', 20, true),
  ('아동/진로 과정', 'child-career', 30, true),
  ('강사과정', 'instructor', 40, true),
  ('병원/건강 과정', 'hospital-health', 50, true),
  ('안전 전문가', 'safety-expert', 60, true),
  ('뷰티/강사 과정', 'beauty-instructor', 70, true),
  ('진로/사회복지', 'career-welfare', 80, true),
  ('커피과정', 'coffee', 90, true),
  ('환경전문가', 'environment-expert', 100, true),
  ('마케팅과정', 'marketing', 110, true)
ON CONFLICT (slug) DO NOTHING;
