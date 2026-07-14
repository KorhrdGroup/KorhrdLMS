-- 자료 파일 종류 enum
DO $$
BEGIN
  CREATE TYPE public.material_file_type AS ENUM (
    'PDF', 'DOCX', 'PPT', 'ZIP', '기타'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 관리자 자료실(/admin/learning-materials) 테이블.
-- course_id가 NULL이면 "전체 공통" 자료로 간주해 모든 학생에게 노출됩니다.
CREATE TABLE IF NOT EXISTS public.learning_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID REFERENCES public.courses (id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  file_type public.material_file_type NOT NULL DEFAULT '기타',
  file_name TEXT NOT NULL,
  file_size_label TEXT,
  file_url TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT learning_materials_title_check CHECK (char_length(trim(title)) > 0)
);

CREATE INDEX IF NOT EXISTS learning_materials_course_id_idx ON public.learning_materials (course_id);
CREATE INDEX IF NOT EXISTS learning_materials_is_published_idx ON public.learning_materials (is_published);

DROP TRIGGER IF EXISTS learning_materials_set_updated_at ON public.learning_materials;
CREATE TRIGGER learning_materials_set_updated_at
  BEFORE UPDATE ON public.learning_materials
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.learning_materials TO anon, authenticated;
GRANT ALL ON public.learning_materials TO service_role;

ALTER TABLE public.learning_materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read learning_materials for development" ON public.learning_materials;
CREATE POLICY "Allow anon read learning_materials for development"
  ON public.learning_materials
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert learning_materials for development" ON public.learning_materials;
CREATE POLICY "Allow anon insert learning_materials for development"
  ON public.learning_materials
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update learning_materials for development" ON public.learning_materials;
CREATE POLICY "Allow anon update learning_materials for development"
  ON public.learning_materials
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
