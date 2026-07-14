-- 이전 마이그레이션에서 삽입된 샘플 과정 제거 (과정관리 연동 전)
DELETE FROM public.enrollments
WHERE course_id IN (
  SELECT id
  FROM public.courses
  WHERE code IN ('CRS-001', 'CRS-002', 'CRS-003', 'CRS-004', 'CRS-005')
);

DELETE FROM public.courses
WHERE code IN ('CRS-001', 'CRS-002', 'CRS-003', 'CRS-004', 'CRS-005');
