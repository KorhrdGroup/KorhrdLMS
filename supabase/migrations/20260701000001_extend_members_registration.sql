-- 양력/음력 enum
DO $$
BEGIN
  CREATE TYPE public.calendar_type AS ENUM ('solar', 'lunar');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 회원등록 확장 컬럼
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS resident_registration_number TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS calendar_type public.calendar_type,
  ADD COLUMN IF NOT EXISTS password_hash TEXT,
  ADD COLUMN IF NOT EXISTS tel TEXT,
  ADD COLUMN IF NOT EXISTS postal_code TEXT,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS address_detail TEXT,
  ADD COLUMN IF NOT EXISTS graduated_school TEXT,
  ADD COLUMN IF NOT EXISTS school_name TEXT,
  ADD COLUMN IF NOT EXISTS major_name TEXT,
  ADD COLUMN IF NOT EXISTS desired_degree TEXT,
  ADD COLUMN IF NOT EXISTS desired_major_name TEXT,
  ADD COLUMN IF NOT EXISTS join_path TEXT,
  ADD COLUMN IF NOT EXISTS occupation TEXT,
  ADD COLUMN IF NOT EXISTS degree_purpose TEXT,
  ADD COLUMN IF NOT EXISTS referrer_login_id TEXT;

CREATE INDEX IF NOT EXISTS members_login_id_idx ON public.members (login_id);
CREATE INDEX IF NOT EXISTS members_referrer_login_id_idx ON public.members (referrer_login_id);

-- PostgREST INSERT 권한 (개발용)
GRANT INSERT ON public.members TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon insert members for development" ON public.members;
CREATE POLICY "Allow anon insert members for development"
  ON public.members
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);
