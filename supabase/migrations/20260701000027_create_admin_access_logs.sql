-- 관리자 유형 enum
DO $$
BEGIN
  CREATE TYPE public.admin_type AS ENUM (
    'super_admin',
    'admin',
    'instructor',
    'counselor'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 관리자 계정 테이블
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_type public.admin_type NOT NULL,
  login_id TEXT NOT NULL,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_users_login_id_key UNIQUE (login_id),
  CONSTRAINT admin_users_login_id_check CHECK (char_length(trim(login_id)) > 0),
  CONSTRAINT admin_users_name_check CHECK (char_length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS admin_users_admin_type_idx ON public.admin_users (admin_type);
CREATE INDEX IF NOT EXISTS admin_users_name_idx ON public.admin_users (name);
CREATE INDEX IF NOT EXISTS admin_users_login_id_idx ON public.admin_users (login_id);

-- 관리자 접속 기록 테이블
CREATE TABLE IF NOT EXISTS public.admin_access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id UUID NOT NULL REFERENCES public.admin_users (id),
  access_ip TEXT NOT NULL,
  logged_in_at TIMESTAMPTZ NOT NULL,
  logged_out_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT admin_access_logs_access_ip_check CHECK (char_length(trim(access_ip)) > 0)
);

CREATE INDEX IF NOT EXISTS admin_access_logs_admin_user_id_idx
  ON public.admin_access_logs (admin_user_id);
CREATE INDEX IF NOT EXISTS admin_access_logs_logged_in_at_idx
  ON public.admin_access_logs (logged_in_at DESC);
CREATE INDEX IF NOT EXISTS admin_access_logs_access_ip_idx
  ON public.admin_access_logs (access_ip);

DROP TRIGGER IF EXISTS admin_users_set_updated_at ON public.admin_users;
CREATE TRIGGER admin_users_set_updated_at
  BEFORE UPDATE ON public.admin_users
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT ON public.admin_users TO anon, authenticated;
GRANT SELECT ON public.admin_access_logs TO anon, authenticated;
GRANT ALL ON public.admin_users TO service_role;
GRANT ALL ON public.admin_access_logs TO service_role;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_access_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read admin_users for development" ON public.admin_users;
CREATE POLICY "Allow anon read admin_users for development"
  ON public.admin_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon read admin_access_logs for development" ON public.admin_access_logs;
CREATE POLICY "Allow anon read admin_access_logs for development"
  ON public.admin_access_logs
  FOR SELECT
  TO anon, authenticated
  USING (true);
