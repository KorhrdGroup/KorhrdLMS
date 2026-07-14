INSERT INTO public.notice_popups (
  title,
  content,
  is_active,
  is_notice,
  attachment_file_name,
  attachment_file_url,
  display_start_date,
  display_end_date,
  sort_order
)
VALUES
  (
    '2026년 2학기 수강 안내',
    '2026년 2학기 수강 신청 및 일정 안내 팝업입니다.',
    true,
    true,
    '2026-2nd-semester.pdf',
    '/files/popup/2026-2nd-semester.pdf',
    '2026-06-01',
    '2026-07-31',
    1
  ),
  (
    '시스템 점검 안내',
    '7월 5일 새벽 시스템 점검이 예정되어 있습니다.',
    true,
    false,
    NULL,
    NULL,
    '2026-07-01',
    '2026-07-05',
    2
  ),
  (
    '여름방학 특강 모집',
    '여름방학 특강 수강생 모집 공지입니다.',
    false,
    true,
    'summer-course.pdf',
    '/files/popup/summer-course.pdf',
    '2026-06-15',
    '2026-08-15',
    3
  );
