-- 게시판 종류 enum
DO $$
BEGIN
  CREATE TYPE public.board_type AS ENUM (
    'consultation',
    'notice',
    'free',
    'resource',
    'faq'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 게시글 테이블 (원글 + 답글)
CREATE TABLE IF NOT EXISTS public.board_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  board_type public.board_type NOT NULL,
  parent_id UUID REFERENCES public.board_posts (id),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  is_notice BOOLEAN NOT NULL DEFAULT false,
  attachment_file_name TEXT,
  attachment_file_url TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT board_posts_title_check CHECK (char_length(trim(title)) > 0),
  CONSTRAINT board_posts_content_check CHECK (char_length(trim(content)) > 0),
  CONSTRAINT board_posts_author_name_check CHECK (char_length(trim(author_name)) > 0)
);

CREATE INDEX IF NOT EXISTS board_posts_board_type_idx ON public.board_posts (board_type);
CREATE INDEX IF NOT EXISTS board_posts_parent_id_idx ON public.board_posts (parent_id);
CREATE INDEX IF NOT EXISTS board_posts_is_notice_idx ON public.board_posts (is_notice DESC);
CREATE INDEX IF NOT EXISTS board_posts_deleted_at_idx ON public.board_posts (deleted_at);
CREATE INDEX IF NOT EXISTS board_posts_created_at_idx ON public.board_posts (created_at DESC);

-- 댓글 테이블
CREATE TABLE IF NOT EXISTS public.board_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES public.board_posts (id),
  content TEXT NOT NULL,
  author_name TEXT NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT board_comments_content_check CHECK (char_length(trim(content)) > 0),
  CONSTRAINT board_comments_author_name_check CHECK (char_length(trim(author_name)) > 0)
);

CREATE INDEX IF NOT EXISTS board_comments_post_id_idx ON public.board_comments (post_id);
CREATE INDEX IF NOT EXISTS board_comments_deleted_at_idx ON public.board_comments (deleted_at);
CREATE INDEX IF NOT EXISTS board_comments_created_at_idx ON public.board_comments (created_at ASC);

DROP TRIGGER IF EXISTS board_posts_set_updated_at ON public.board_posts;
CREATE TRIGGER board_posts_set_updated_at
  BEFORE UPDATE ON public.board_posts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS board_comments_set_updated_at ON public.board_comments;
CREATE TRIGGER board_comments_set_updated_at
  BEFORE UPDATE ON public.board_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.board_posts TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON public.board_comments TO anon, authenticated;
GRANT ALL ON public.board_posts TO service_role;
GRANT ALL ON public.board_comments TO service_role;

ALTER TABLE public.board_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.board_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read board_posts for development" ON public.board_posts;
CREATE POLICY "Allow anon read board_posts for development"
  ON public.board_posts
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert board_posts for development" ON public.board_posts;
CREATE POLICY "Allow anon insert board_posts for development"
  ON public.board_posts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update board_posts for development" ON public.board_posts;
CREATE POLICY "Allow anon update board_posts for development"
  ON public.board_posts
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon read board_comments for development" ON public.board_comments;
CREATE POLICY "Allow anon read board_comments for development"
  ON public.board_comments
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert board_comments for development" ON public.board_comments;
CREATE POLICY "Allow anon insert board_comments for development"
  ON public.board_comments
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update board_comments for development" ON public.board_comments;
CREATE POLICY "Allow anon update board_comments for development"
  ON public.board_comments
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
