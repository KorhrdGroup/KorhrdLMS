-- 회원수정용 메모 컬럼
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS memo TEXT;

-- PostgREST UPDATE 권한 (개발용)
GRANT UPDATE ON public.members TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon update members for development" ON public.members;
CREATE POLICY "Allow anon update members for development"
  ON public.members
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
