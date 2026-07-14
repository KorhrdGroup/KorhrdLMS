-- 공지팝업 테이블
CREATE TABLE IF NOT EXISTS public.notice_popups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_notice BOOLEAN NOT NULL DEFAULT false,
  attachment_file_name TEXT,
  attachment_file_url TEXT,
  display_start_date DATE,
  display_end_date DATE,
  sort_order INTEGER NOT NULL DEFAULT 0,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT notice_popups_title_check CHECK (char_length(trim(title)) > 0),
  CONSTRAINT notice_popups_content_check CHECK (char_length(trim(content)) > 0)
);

CREATE INDEX IF NOT EXISTS notice_popups_is_active_idx ON public.notice_popups (is_active);
CREATE INDEX IF NOT EXISTS notice_popups_is_notice_idx ON public.notice_popups (is_notice);
CREATE INDEX IF NOT EXISTS notice_popups_sort_order_idx ON public.notice_popups (sort_order ASC);
CREATE INDEX IF NOT EXISTS notice_popups_deleted_at_idx ON public.notice_popups (deleted_at);
CREATE INDEX IF NOT EXISTS notice_popups_created_at_idx ON public.notice_popups (created_at DESC);

DROP TRIGGER IF EXISTS notice_popups_set_updated_at ON public.notice_popups;
CREATE TRIGGER notice_popups_set_updated_at
  BEFORE UPDATE ON public.notice_popups
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.notice_popups TO anon, authenticated;
GRANT ALL ON public.notice_popups TO service_role;

ALTER TABLE public.notice_popups ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read notice_popups for development" ON public.notice_popups;
CREATE POLICY "Allow anon read notice_popups for development"
  ON public.notice_popups
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert notice_popups for development" ON public.notice_popups;
CREATE POLICY "Allow anon insert notice_popups for development"
  ON public.notice_popups
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update notice_popups for development" ON public.notice_popups;
CREATE POLICY "Allow anon update notice_popups for development"
  ON public.notice_popups
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
