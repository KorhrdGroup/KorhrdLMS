-- 영상은 확보됐으나 courses에 없던 신규 과정 11개 추가 (CRS-KH-0075 ~ 0085)
--
-- 배경: Cloudflare R2에 강의 영상을 업로드하면서 로컬 영상 폴더 74개와 DB 과정을
-- 대조한 결과, 영상은 있는데 DB에 과정이 없는 11개를 발견해 등록합니다.
--
-- 중요:
--  * status = 'hidden' 으로 넣습니다. 학생 수강신청 카탈로그는 status='active'만
--    노출하므로(enrollment-catalog.service.ts), 영상 URL 연결과 검수가 끝난 뒤
--    어드민에서 '공개'로 바꾸기 전까지 학생에게 보이지 않습니다.
--  * course_lectures.is_published = false 로 두어 이중으로 막습니다.
--  * lecture_sessions 는 실제 영상 파일 개수만큼 생성하고 제목은 'N차시' 플레이스홀더로
--    둡니다. video_url 은 R2 업로드/커스텀 도메인 확정 후 별도 스크립트로 채웁니다.
--  * 가격/카테고리/교수명은 기존 과정과 동일하게 기본값(무료, 미지정)으로 두고
--    어드민에서 개별 편집합니다.
--
-- 재실행 안전: code 기준 ON CONFLICT DO NOTHING + 이미 차시가 있으면 건너뜁니다.

DO $$
DECLARE
  v_course  RECORD;
  v_course_id uuid;
  v_lecture_id uuid;
  i int;
  -- (과정코드, 과정명, 영상 개수) — 영상 개수는 로컬 폴더의 mp4/mov 실제 개수
  v_rows CONSTANT text[][] := ARRAY[
    ['CRS-KH-0075', 'AI프롬프트엔지니어',   '35'],
    ['CRS-KH-0076', '강아지산책전문가',     '20'],
    ['CRS-KH-0077', '교통안전지도사',       '20'],
    ['CRS-KH-0078', '동물병원코디네이터',   '21'],
    ['CRS-KH-0079', '등하원보호사',         '20'],
    ['CRS-KH-0080', '디지털튜터',           '21'],
    ['CRS-KH-0081', '보험심사관리사',       '20'],
    ['CRS-KH-0082', '세차관리사',           '20'],
    ['CRS-KH-0083', '유품정리사',           '41'],
    ['CRS-KH-0084', '음악심리상담사',       '26'],
    ['CRS-KH-0085', '치과병원코디네이터',   '20']
  ];
BEGIN
  FOR v_course IN
    SELECT v_rows[idx][1] AS code,
           v_rows[idx][2] AS name,
           v_rows[idx][3]::int AS session_count
    FROM generate_subscripts(v_rows, 1) AS idx
  LOOP
    -- 1) 과정 (비노출 상태로 생성)
    INSERT INTO public.courses (code, name, status)
    VALUES (v_course.code, v_course.name, 'hidden')
    ON CONFLICT (code) DO NOTHING;

    SELECT id INTO v_course_id FROM public.courses WHERE code = v_course.code;

    -- 2) 강의(과정당 1개) — 기존 임포트 규칙과 동일하게 title = 과정명
    SELECT id INTO v_lecture_id
    FROM public.course_lectures
    WHERE course_id = v_course_id AND deleted_at IS NULL
    LIMIT 1;

    IF v_lecture_id IS NULL THEN
      INSERT INTO public.course_lectures (course_id, title, is_published)
      VALUES (v_course_id, v_course.name, false)
      RETURNING id INTO v_lecture_id;
    END IF;

    -- 3) 차시 — 영상 개수만큼, 이미 있으면 생성하지 않음
    IF NOT EXISTS (
      SELECT 1 FROM public.lecture_sessions
      WHERE lecture_id = v_lecture_id AND deleted_at IS NULL
    ) THEN
      FOR i IN 1..v_course.session_count LOOP
        INSERT INTO public.lecture_sessions (lecture_id, session_order, title)
        VALUES (v_lecture_id, i, i || '차시');
      END LOOP;
    END IF;
  END LOOP;
END $$;
