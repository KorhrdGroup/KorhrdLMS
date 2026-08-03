-- 과정 상세페이지(course-detail) 데이터를 DB로 옮기기 위한 스키마입니다.
--
-- 배경: 상세페이지 20개 블록 중 과정마다 달라지는 것은 6개 블록뿐입니다.
--       (히어로 · 스펙카드 일부 · 자격등록번호 · 추천대상 · 진로 · 커리큘럼 · 교수 · 자격관리기관)
--       나머지는 템플릿 고정 문구이므로 DB에 넣지 않습니다.
--       자세한 분리 기준은 docs/course-detail-template-spec.md 참고.
--
-- 설계 메모:
--  * courses 확장 방식을 택했습니다. study_method/lecture_time/supervising_agency 등
--    기존 표시용 필드가 이미 courses에 들어가 있어 같은 패턴을 잇습니다.
--    상세페이지 필드는 과정당 정확히 1개씩이라 1:1 테이블 분리의 실익이 없습니다.
--  * 교수는 1명이 최대 11개 과정을 담당하므로(김시혜 11 · 이민태 8) 정규화합니다.
--    사진·이력을 한 번만 고치면 담당 과정 전체에 반영됩니다.
--  * 자격관리기관은 현재 2종(한국직업능력검정협회 81 · 한국엔씨에스자격개발원 4)이라
--    연락처 변경 시 한 곳만 고치도록 분리합니다.
--  * courses.professor_name은 이 마이그레이션에서 제거하지 않습니다. 다른 화면이
--    참조 중일 수 있어, professor_id 이관이 끝난 뒤 별도 마이그레이션으로 정리합니다.

-- ────────────────────────────── 자격관리기관 ──────────────────────────────
CREATE TABLE IF NOT EXISTS public.issuing_agencies (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL UNIQUE,
  ceo        text,
  phone      text,
  address    text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.issuing_agencies IS
  '자격관리(발급)기관. 상세페이지 하단 "자격관리기관 정보" 표에 노출됩니다.';

INSERT INTO public.issuing_agencies (name, ceo, phone, address) VALUES
  ('한국직업능력검정협회', '강희수', '02)465-9568', '서울시 강서구 초록마을로2길26, 2층'),
  ('한국엔씨에스자격개발원', '최낙조', '1644-9236', '서울특별시 성북구 지봉로24길 11, 302호(보문동2가)')
ON CONFLICT (name) DO NOTHING;

-- ──────────────────────────────── 교수 ────────────────────────────────
CREATE TABLE IF NOT EXISTS public.professors (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text NOT NULL,
  bio        text[] NOT NULL DEFAULT '{}',
  photo_url  text,
  deleted_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.professors IS
  '담당 교수. 한 교수가 여러 과정을 담당하므로 courses에서 참조합니다.';
COMMENT ON COLUMN public.professors.bio IS
  '교수 이력. 상세페이지 "교수 소개"에서 한 줄씩 <li>로 렌더링합니다.';
COMMENT ON COLUMN public.professors.photo_url IS
  '교수 사진(권장 150x150). 없으면 상세페이지에서 플레이스홀더를 표시합니다.';

-- 이름 중복 등록 방지 (소프트 삭제된 행은 제외)
CREATE UNIQUE INDEX IF NOT EXISTS professors_name_unique_idx
  ON public.professors (name) WHERE deleted_at IS NULL;

-- ──────────────────────────── courses 확장 ────────────────────────────
ALTER TABLE public.courses
  ADD COLUMN IF NOT EXISTS hero_description  text,
  ADD COLUMN IF NOT EXISTS hero_image_url    text,
  ADD COLUMN IF NOT EXISTS license_number    text,
  ADD COLUMN IF NOT EXISTS lecture_format    text    NOT NULL DEFAULT '이론 중심, 사례 안내',
  ADD COLUMN IF NOT EXISTS certificate_fee   integer NOT NULL DEFAULT 100000,
  ADD COLUMN IF NOT EXISTS target_audience   text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS career_paths      text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS professor_id      uuid REFERENCES public.professors(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS issuing_agency_id uuid REFERENCES public.issuing_agencies(id) ON DELETE SET NULL;

COMMENT ON COLUMN public.courses.hero_description IS
  '자격증 소개("~란?"). 상세페이지 히어로 본문. 목록 카드용 description(짧은 한 줄)과 다릅니다.';
COMMENT ON COLUMN public.courses.hero_image_url IS
  '히어로 배경 이미지(권장 1920x1280, 인물 중앙). 없으면 공용 샘플 이미지를 사용합니다.';
COMMENT ON COLUMN public.courses.license_number IS
  '민간자격등록번호(예: 2024-005425). 상세페이지 자격등록번호 카드에 노출됩니다.';
COMMENT ON COLUMN public.courses.lecture_format IS
  '강의형태(예: 이론 중심, 사례 안내). 현재 전 과정 동일하지만 과정별 변경 가능성이 있어 컬럼으로 둡니다.';
COMMENT ON COLUMN public.courses.certificate_fee IS
  '자격증 발급비(원). 수강료(price)와 별개입니다.';
COMMENT ON COLUMN public.courses.target_audience IS
  '"이런 분들에게 유용해요" 항목. 상세페이지 추천 대상 캐러셀 카드로 렌더링합니다.';
COMMENT ON COLUMN public.courses.career_paths IS
  '"진로 및 전망" 항목. 상세페이지 과정 상세 소개에서 <li>로 렌더링합니다.';
COMMENT ON COLUMN public.courses.professor_id IS
  '담당 교수. 이관 완료 전까지는 기존 professor_name도 함께 유지됩니다.';

CREATE INDEX IF NOT EXISTS courses_professor_id_idx      ON public.courses (professor_id);
CREATE INDEX IF NOT EXISTS courses_issuing_agency_id_idx ON public.courses (issuing_agency_id);

-- ─────────────────────────────── updated_at ───────────────────────────────
-- 기존 테이블과 동일한 방식으로 updated_at을 자동 갱신합니다.
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_issuing_agencies_updated_at ON public.issuing_agencies;
CREATE TRIGGER set_issuing_agencies_updated_at
  BEFORE UPDATE ON public.issuing_agencies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS set_professors_updated_at ON public.professors;
CREATE TRIGGER set_professors_updated_at
  BEFORE UPDATE ON public.professors
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
