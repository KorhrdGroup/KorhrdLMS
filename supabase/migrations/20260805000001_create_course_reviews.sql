-- 합격후기 (korhrd 디자인 /reviews)
--
-- 기획 규칙(전달본 CLAUDE.md 3절):
--  · 후기는 "과정별 1건" — 같은 기간에 여러 과정을 들었으면 대표 과정 1건 +
--    함께 수강한 과정은 태그로만 남깁니다(also_course_ids).
--  · 진입점은 탭이 아니라 상태 기준 — 합격한 과정이면 어디에 있든 작성 대상입니다.
--
-- 작성 자격(수료·합격 여부)은 서비스 계층에서 기존 수료 판정을 재사용해 확인합니다.

CREATE TABLE IF NOT EXISTS public.course_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  member_id UUID NOT NULL REFERENCES public.members (id),
  -- 대표 과정. 목록 필터·과정 상세 노출의 기준입니다.
  course_id UUID NOT NULL REFERENCES public.courses (id),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  -- 함께 수강한 과정(태그 전용). 필터에는 잡히지 않습니다.
  also_course_ids UUID[] NOT NULL DEFAULT '{}',
  -- 자격증 실물 사진(1:1). 없으면 목록에서 자리표시가 숨겨집니다.
  photo_url TEXT,
  -- 운영자가 숨김 처리할 수 있도록 둡니다. 기본은 공개입니다.
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT course_reviews_title_check CHECK (char_length(trim(title)) > 0),
  CONSTRAINT course_reviews_body_check CHECK (char_length(trim(body)) > 0)
);

-- 과정별 1건 규칙. 삭제된 건은 제외하므로 지운 뒤 다시 쓸 수 있습니다.
CREATE UNIQUE INDEX IF NOT EXISTS course_reviews_member_course_uidx
  ON public.course_reviews (member_id, course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS course_reviews_course_idx
  ON public.course_reviews (course_id)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS course_reviews_created_idx
  ON public.course_reviews (created_at DESC);

-- "도움됐어요" — 한 사람이 한 후기에 한 번만.
CREATE TABLE IF NOT EXISTS public.course_review_helpfuls (
  review_id UUID NOT NULL REFERENCES public.course_reviews (id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES public.members (id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (review_id, member_id)
);

-- updated_at 자동 갱신 — 다른 테이블과 같은 함수를 씁니다.
DROP TRIGGER IF EXISTS set_course_reviews_updated_at ON public.course_reviews;
CREATE TRIGGER set_course_reviews_updated_at
  BEFORE UPDATE ON public.course_reviews
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

COMMENT ON TABLE public.course_reviews IS
  '합격후기. 회원·과정당 1건(대표 과정 기준)이며 함께 수강한 과정은 also_course_ids에 태그로 남깁니다.';
COMMENT ON COLUMN public.course_reviews.also_course_ids IS
  '함께 수강한 과정 id 목록. 카드에 태그로만 표시되고 목록 필터에는 잡히지 않습니다.';

-- RLS — 기존 테이블과 동일하게 개발 단계 허용 정책을 둡니다.
-- (운영 전에는 본인 글만 수정/삭제하도록 좁혀야 합니다)
ALTER TABLE public.course_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_review_helpfuls ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  c text;
BEGIN
  FOREACH t IN ARRAY ARRAY['course_reviews', 'course_review_helpfuls'] LOOP
    FOREACH c IN ARRAY ARRAY['read:SELECT', 'insert:INSERT', 'update:UPDATE', 'delete:DELETE'] LOOP
      EXECUTE format(
        'DROP POLICY IF EXISTS "Allow anon %s %s for development" ON public.%I',
        split_part(c, ':', 1), t, t
      );
      IF split_part(c, ':', 2) = 'INSERT' THEN
        EXECUTE format(
          'CREATE POLICY "Allow anon %s %s for development" ON public.%I FOR %s TO anon, authenticated WITH CHECK (true)',
          split_part(c, ':', 1), t, t, split_part(c, ':', 2)
        );
      ELSE
        EXECUTE format(
          'CREATE POLICY "Allow anon %s %s for development" ON public.%I FOR %s TO anon, authenticated USING (true)',
          split_part(c, ':', 1), t, t, split_part(c, ':', 2)
        );
      END IF;
    END LOOP;
  END LOOP;
END $$;
