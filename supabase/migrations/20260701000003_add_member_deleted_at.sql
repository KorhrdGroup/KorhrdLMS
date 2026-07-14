-- 회원 soft delete
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS members_deleted_at_idx ON public.members (deleted_at);
