-- professors / issuing_agencies RLS 정책.
-- 기존 테이블(courses, course_categories 등)과 동일하게 RLS를 켜고
-- 개발 단계 허용 정책을 둡니다. (운영 전 어드민 전용 정책으로 좁혀야 합니다)

ALTER TABLE public.professors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.issuing_agencies ENABLE ROW LEVEL SECURITY;

DO $$
DECLARE
  t text;
  c text;
BEGIN
  FOREACH t IN ARRAY ARRAY['professors', 'issuing_agencies'] LOOP
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
