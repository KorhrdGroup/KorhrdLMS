-- 메시지 채널 enum (확장 가능)
DO $$
BEGIN
  CREATE TYPE public.message_channel AS ENUM (
    'sms',
    'lms',
    'kakao_alimtalk',
    'kakao_friendtalk',
    'email'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 발송 유형 enum
DO $$
BEGIN
  CREATE TYPE public.message_dispatch_type AS ENUM (
    'single',
    'bulk',
    'scheduled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 발송 상태 enum
DO $$
BEGIN
  CREATE TYPE public.message_send_status AS ENUM (
    'draft',
    'scheduled',
    'pending',
    'sent',
    'failed',
    'canceled'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 메시지 발송 내역 테이블
CREATE TABLE IF NOT EXISTS public.message_dispatches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel public.message_channel NOT NULL,
  dispatch_type public.message_dispatch_type NOT NULL,
  status public.message_send_status NOT NULL DEFAULT 'draft',
  recipient_name TEXT,
  recipient_phone TEXT,
  bulk_summary TEXT,
  recipient_count INTEGER NOT NULL DEFAULT 0,
  title TEXT,
  content TEXT NOT NULL,
  scheduled_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  success_count INTEGER NOT NULL DEFAULT 0,
  fail_count INTEGER NOT NULL DEFAULT 0,
  sender_name TEXT NOT NULL,
  memo TEXT,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT message_dispatches_content_check CHECK (char_length(trim(content)) > 0),
  CONSTRAINT message_dispatches_sender_name_check CHECK (char_length(trim(sender_name)) > 0),
  CONSTRAINT message_dispatches_recipient_count_check CHECK (recipient_count >= 0),
  CONSTRAINT message_dispatches_success_count_check CHECK (success_count >= 0),
  CONSTRAINT message_dispatches_fail_count_check CHECK (fail_count >= 0)
);

CREATE INDEX IF NOT EXISTS message_dispatches_channel_idx ON public.message_dispatches (channel);
CREATE INDEX IF NOT EXISTS message_dispatches_dispatch_type_idx
  ON public.message_dispatches (dispatch_type);
CREATE INDEX IF NOT EXISTS message_dispatches_status_idx ON public.message_dispatches (status);
CREATE INDEX IF NOT EXISTS message_dispatches_scheduled_at_idx
  ON public.message_dispatches (scheduled_at DESC);
CREATE INDEX IF NOT EXISTS message_dispatches_sent_at_idx ON public.message_dispatches (sent_at DESC);
CREATE INDEX IF NOT EXISTS message_dispatches_deleted_at_idx ON public.message_dispatches (deleted_at);
CREATE INDEX IF NOT EXISTS message_dispatches_created_at_idx
  ON public.message_dispatches (created_at DESC);

DROP TRIGGER IF EXISTS message_dispatches_set_updated_at ON public.message_dispatches;
CREATE TRIGGER message_dispatches_set_updated_at
  BEFORE UPDATE ON public.message_dispatches
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

GRANT SELECT, INSERT, UPDATE ON public.message_dispatches TO anon, authenticated;
GRANT ALL ON public.message_dispatches TO service_role;

ALTER TABLE public.message_dispatches ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read message_dispatches for development"
  ON public.message_dispatches;
CREATE POLICY "Allow anon read message_dispatches for development"
  ON public.message_dispatches
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Allow anon insert message_dispatches for development"
  ON public.message_dispatches;
CREATE POLICY "Allow anon insert message_dispatches for development"
  ON public.message_dispatches
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update message_dispatches for development"
  ON public.message_dispatches;
CREATE POLICY "Allow anon update message_dispatches for development"
  ON public.message_dispatches
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
