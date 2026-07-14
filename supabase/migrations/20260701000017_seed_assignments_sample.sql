-- 개발/검증용 샘플 과제 데이터 (과정·수강반이 있을 때만 삽입)
INSERT INTO public.assignments (
  course_id,
  class_id,
  year,
  name,
  submission_start,
  submission_end,
  submission_count,
  status,
  memo
)
SELECT
  cls.course_id,
  cls.id,
  cls.year,
  sample.name,
  sample.submission_start,
  sample.submission_end,
  sample.submission_count,
  sample.status::public.exam_status,
  sample.memo
FROM public.classes cls
INNER JOIN public.courses course ON course.id = cls.course_id
CROSS JOIN (
  VALUES
    (
      '1차 과제 — 학습 계획서',
      DATE '2026-07-01',
      DATE '2026-07-15',
      12,
      'planned',
      '1차 과제 샘플'
    ),
    (
      '2차 과제 — 실습 보고서',
      DATE '2026-07-10',
      DATE '2026-07-31',
      8,
      'confirmed',
      '2차 과제 샘플'
    ),
    (
      '3차 과제 — 종합 과제',
      DATE '2026-08-01',
      DATE '2026-08-20',
      0,
      'planned',
      NULL
    )
) AS sample (
  name,
  submission_start,
  submission_end,
  submission_count,
  status,
  memo
)
WHERE cls.deleted_at IS NULL
  AND course.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1
    FROM public.assignments existing
    WHERE existing.class_id = cls.id
      AND existing.name = sample.name
      AND existing.deleted_at IS NULL
  )
LIMIT 3;
