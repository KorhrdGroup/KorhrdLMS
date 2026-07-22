-- 학생 1:1 상담(support QnA)을 게시판(board_posts, board_type='consultation')과 연동합니다.
-- 기존에는 학생 글이 브라우저 localStorage에만 저장돼 어드민 게시판관리에서 볼 수 없었습니다.
--
-- board_posts에는 작성자를 식별할 컬럼이 author_name(텍스트)뿐이라, 학생이 "내 상담글만"
-- 조회하려면 회원 식별자가 필요합니다. member_id를 추가합니다(관리자 작성 글/기존 글은 NULL).

ALTER TABLE public.board_posts
  ADD COLUMN IF NOT EXISTS member_id UUID REFERENCES public.members (id);

COMMENT ON COLUMN public.board_posts.member_id IS
  '작성한 회원(members.id). 학생이 프론트에서 작성한 글에만 채워지며, 관리자 작성 글은 NULL입니다. 1:1 상담에서 본인 글만 조회하는 데 사용합니다.';

CREATE INDEX IF NOT EXISTS board_posts_member_id_idx
  ON public.board_posts (member_id);

-- 학생이 1:1 상담 글을 작성할 수 있도록 INSERT 권한/정책을 추가합니다.
-- (다른 테이블과 동일한 개발 단계 정책)
GRANT INSERT ON public.board_posts TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon insert board_posts for development" ON public.board_posts;
CREATE POLICY "Allow anon insert board_posts for development"
  ON public.board_posts
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
