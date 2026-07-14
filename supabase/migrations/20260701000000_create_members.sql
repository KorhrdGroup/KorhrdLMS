-- 회원 상태 enum
DO $$
BEGIN
  CREATE TYPE public.member_status AS ENUM (
    'active',
    'inactive',
    'dormant',
    'withdrawn',
    'pending'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 회원 테이블
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  login_id TEXT NOT NULL,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status public.member_status NOT NULL DEFAULT 'active',
  manager_name TEXT,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT members_login_id_unique UNIQUE (login_id)
);

CREATE INDEX IF NOT EXISTS members_name_idx ON public.members (name);
CREATE INDEX IF NOT EXISTS members_email_idx ON public.members (email);
CREATE INDEX IF NOT EXISTS members_phone_idx ON public.members (phone);
CREATE INDEX IF NOT EXISTS members_status_idx ON public.members (status);
CREATE INDEX IF NOT EXISTS members_joined_at_idx ON public.members (joined_at DESC);
CREATE INDEX IF NOT EXISTS members_manager_name_idx ON public.members (manager_name);

-- updated_at 자동 갱신
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS members_set_updated_at ON public.members;
CREATE TRIGGER members_set_updated_at
  BEFORE UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- PostgREST API 노출 (Supabase cloud 기본 권한)
GRANT SELECT ON public.members TO anon, authenticated;
GRANT ALL ON public.members TO service_role;

-- RLS
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read members for development" ON public.members;
CREATE POLICY "Allow anon read members for development"
  ON public.members
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- 샘플 데이터
INSERT INTO public.members (
  login_id, name, email, phone, status, manager_name, joined_at, last_login_at
) VALUES
  ('hong001', '홍길동', 'hong@example.com', '010-1234-5678', 'active', '김담당', '2026-01-15 09:00:00+09', '2026-06-30 14:22:00+09'),
  ('kim002', '김영희', 'kim@example.com', '010-2345-6789', 'active', '이담당', '2026-02-20 10:30:00+09', '2026-06-29 11:05:00+09'),
  ('lee003', '이철수', 'lee@example.com', '010-3456-7890', 'dormant', '박담당', '2025-11-10 08:15:00+09', '2026-03-12 09:40:00+09'),
  ('park004', '박민수', 'park@example.com', '010-4567-8901', 'pending', '김담당', '2026-06-28 16:00:00+09', NULL),
  ('choi005', '최지우', 'choi@example.com', '010-5678-9012', 'active', '이담당', '2026-03-05 13:20:00+09', '2026-06-30 08:15:00+09'),
  ('jung006', '정수진', 'jung@example.com', '010-6789-0123', 'inactive', '박담당', '2025-08-22 11:45:00+09', '2026-01-05 17:30:00+09'),
  ('han007', '한서연', 'han@example.com', '010-7890-1234', 'withdrawn', '김담당', '2024-12-01 09:00:00+09', '2025-06-15 10:00:00+09'),
  ('yoon008', '윤도현', 'yoon@example.com', '010-8901-2345', 'active', '이담당', '2026-04-18 14:10:00+09', '2026-06-28 19:42:00+09'),
  ('kang009', '강미래', 'kang@example.com', '010-9012-3456', 'active', '박담당', '2026-05-02 10:00:00+09', '2026-06-27 13:18:00+09'),
  ('seo010', '서준호', 'seo@example.com', '010-0123-4567', 'pending', '김담당', '2026-06-30 09:30:00+09', NULL),
  ('lim011', '임하늘', 'lim@example.com', '010-1111-2222', 'active', '이담당', '2026-02-14 15:00:00+09', '2026-06-30 07:55:00+09'),
  ('oh012', '오민재', 'oh@example.com', '010-2222-3333', 'dormant', '박담당', '2025-09-30 12:00:00+09', '2026-02-20 16:10:00+09')
ON CONFLICT (login_id) DO NOTHING;
