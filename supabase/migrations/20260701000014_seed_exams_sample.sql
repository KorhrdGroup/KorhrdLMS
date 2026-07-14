-- 개발/검증용 샘플 시험 데이터 (과정이 있을 때만 삽입)
INSERT INTO public.exams (
  course_id,
  year,
  name,
  exam_kind,
  exam_type,
  exam_start,
  exam_end,
  question_count,
  exam_duration_minutes,
  status,
  memo,
  print_enabled
)
SELECT
  course.id,
  2026,
  sample.name,
  sample.exam_kind::public.exam_kind,
  sample.exam_type::public.exam_type,
  sample.exam_start,
  sample.exam_end,
  sample.question_count,
  sample.exam_duration_minutes,
  sample.status::public.exam_status,
  sample.memo,
  sample.print_enabled
FROM public.courses course
CROSS JOIN (
  VALUES
    (
      '2026-1학기 중간고사',
      'midterm',
      'regular',
      DATE '2026-07-01',
      DATE '2026-07-15',
      20,
      60,
      'planned',
      '중간고사 샘플',
      false
    ),
    (
      '2026-1학기 기말고사',
      'final',
      'regular',
      DATE '2026-08-01',
      DATE '2026-08-20',
      30,
      90,
      'confirmed',
      '기말고사 샘플',
      true
    ),
    (
      '자격증 모의고사',
      'mock',
      'practice',
      DATE '2026-07-05',
      DATE '2026-07-10',
      50,
      120,
      'planned',
      NULL,
      false
    )
) AS sample (
  name,
  exam_kind,
  exam_type,
  exam_start,
  exam_end,
  question_count,
  exam_duration_minutes,
  status,
  memo,
  print_enabled
)
WHERE course.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.exams existing
    WHERE existing.course_id = course.id
      AND existing.name = sample.name
      AND existing.deleted_at IS NULL
  )
LIMIT 3;
