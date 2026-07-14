-- 개발/검증용 샘플 게시글
INSERT INTO public.board_posts (
  board_type,
  title,
  content,
  author_name,
  is_notice,
  attachment_file_name,
  attachment_file_url
)
SELECT
  sample.board_type::public.board_type,
  sample.title,
  sample.content,
  sample.author_name,
  sample.is_notice,
  sample.attachment_file_name,
  sample.attachment_file_url
FROM (
  VALUES
    (
      'consultation',
      '수강 일정 문의드립니다.',
      '다음 달 수강 일정 변경이 가능한지 문의드립니다.',
      '홍길동',
      false,
      NULL,
      NULL
    ),
    (
      'notice',
      '2026년 2학기 수강 안내',
      '2026년 2학기 수강 신청 일정을 안내드립니다.',
      '관리자',
      true,
      '수강안내.pdf',
      '/files/notice/2026-2.pdf'
    ),
    (
      'free',
      '학습 후기 공유합니다.',
      '지난 학기 수강 후기를 공유합니다.',
      '김수강',
      false,
      NULL,
      NULL
    ),
    (
      'resource',
      '1차 학습 자료',
      '1차 학습에 필요한 참고 자료입니다.',
      '관리자',
      false,
      'study-guide.pdf',
      '/files/resource/study-guide.pdf'
    ),
    (
      'faq',
      '수강 신청은 어떻게 하나요?',
      '홈페이지에서 회원가입 후 수강신청 메뉴를 이용해주세요.',
      '관리자',
      false,
      NULL,
      NULL
    )
) AS sample (
  board_type,
  title,
  content,
  author_name,
  is_notice,
  attachment_file_name,
  attachment_file_url
)
WHERE NOT EXISTS (
  SELECT 1
  FROM public.board_posts existing
  WHERE existing.board_type = sample.board_type::public.board_type
    AND existing.title = sample.title
    AND existing.deleted_at IS NULL
);

-- 샘플 댓글 (공지사항 첫 글)
INSERT INTO public.board_comments (post_id, content, author_name)
SELECT post.id, '확인했습니다.', '관리자'
FROM public.board_posts post
WHERE post.board_type = 'notice'
  AND post.title = '2026년 2학기 수강 안내'
  AND post.deleted_at IS NULL
  AND post.parent_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.board_comments existing
    WHERE existing.post_id = post.id
      AND existing.content = '확인했습니다.'
      AND existing.deleted_at IS NULL
  )
LIMIT 1;

-- 샘플 답글 (1:1 상담 첫 글)
INSERT INTO public.board_posts (
  board_type,
  parent_id,
  title,
  content,
  author_name,
  is_notice
)
SELECT
  post.board_type,
  post.id,
  'Re: ' || post.title,
  '안녕하세요. 일정 변경 가능합니다. 담당자가 연락드리겠습니다.',
  '관리자',
  false
FROM public.board_posts post
WHERE post.board_type = 'consultation'
  AND post.title = '수강 일정 문의드립니다.'
  AND post.deleted_at IS NULL
  AND post.parent_id IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.board_posts existing
    WHERE existing.parent_id = post.id
      AND existing.deleted_at IS NULL
  )
LIMIT 1;
