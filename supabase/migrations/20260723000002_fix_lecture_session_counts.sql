-- 실제 강의 영상 개수에 맞춰 차시 수 보정 (R2 영상 업로드 대조 결과)
--
-- 영상 폴더와 DB 차시를 1:1 대조하면서 확인된 3건을 정리합니다.
--   1) 독서지도사(CRS-KH-0014)     : 40차시 → 24차시  (실제 영상 book01~24, 24개)
--   2) 안전관리사(CRS-KH-0072)     :  1차시 → 15차시  (실제 영상 1~15,     15개)
--   3) 클레이아트지도사(CRS-KH-0073):  0차시 → 20차시  (실제 영상 clayart01~20, 20개)
--
-- 안전장치:
--   * 독서지도사는 초과분(25~40차시)을 하드 삭제하지 않고 deleted_at 으로 소프트 삭제합니다.
--     조회 경로가 모두 deleted_at IS NULL 로 필터링하므로 화면에서는 사라지고, 필요 시
--     되돌릴 수 있습니다. 사전 확인 결과 이 과정은 수강신청 0건 / 진도기록 0건이라
--     학생 데이터에 영향이 없습니다.
--   * 안전관리사의 기존 1차시에는 진도기록이 있어 건드리지 않고 2~15차시만 추가합니다.
--   * 모두 재실행 안전(idempotent)하게 작성했습니다.

-- 1) 독서지도사: 25차시 이상 소프트 삭제 (40 → 24)
UPDATE public.lecture_sessions ls
SET deleted_at = now(), updated_at = now()
FROM public.course_lectures cl
JOIN public.courses c ON c.id = cl.course_id
WHERE ls.lecture_id = cl.id
  AND c.code = 'CRS-KH-0014'
  AND ls.session_order > 24
  AND ls.deleted_at IS NULL;

-- 2) 안전관리사: 2~15차시 추가 (기존 1차시는 진도기록 있어 보존)
INSERT INTO public.lecture_sessions (lecture_id, session_order, title)
SELECT cl.id, gs, gs || '차시'
FROM public.course_lectures cl
JOIN public.courses c ON c.id = cl.course_id
CROSS JOIN generate_series(2, 15) AS gs
WHERE c.code = 'CRS-KH-0072'
  AND cl.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.lecture_sessions x
    WHERE x.lecture_id = cl.id AND x.session_order = gs AND x.deleted_at IS NULL
  );

-- 3) 클레이아트지도사: 1~20차시 신규 생성
INSERT INTO public.lecture_sessions (lecture_id, session_order, title)
SELECT cl.id, gs, gs || '차시'
FROM public.course_lectures cl
JOIN public.courses c ON c.id = cl.course_id
CROSS JOIN generate_series(1, 20) AS gs
WHERE c.code = 'CRS-KH-0073'
  AND cl.deleted_at IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.lecture_sessions x
    WHERE x.lecture_id = cl.id AND x.session_order = gs AND x.deleted_at IS NULL
  );
