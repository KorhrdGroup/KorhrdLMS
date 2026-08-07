-- 휴대폰 문자 인증 (네이버 클라우드 SENS SMS)
--
-- 아이디 찾기 / 비밀번호 재설정에서 "본인 확인" 용도로만 씁니다.
--
-- 이 프로젝트의 RLS는 아직 개발 단계 정책(anon 전체 허용)이라 브라우저에서도
-- 이 테이블을 읽을 수 있습니다. 그래서 **인증번호와 발급 토큰은 원문을 저장하지
-- 않고 SHA-256 해시만** 남깁니다. 행을 통째로 읽어도 6자리 번호는 알 수 없습니다.
-- (6자리는 사전 대입이 가능하므로 phone을 소금처럼 함께 해싱합니다)

CREATE TABLE IF NOT EXISTS public.phone_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  -- 'find_id' | 'reset_password'. 용도가 다르면 서로 통하지 않습니다.
  purpose TEXT NOT NULL,
  -- 숫자만 저장합니다(01012345678). 저장 형식이 제각각인 members.phone과
  -- 비교할 때는 양쪽 모두 숫자만 남겨 맞춥니다.
  phone TEXT NOT NULL,
  -- sha256(phone + ':' + code). 원문 인증번호는 어디에도 남기지 않습니다.
  code_hash TEXT NOT NULL,
  -- 인증 성공 후 발급하는 1회용 토큰의 해시. 재설정 요청을 이 토큰으로만 받습니다.
  token_hash TEXT,
  -- 인증번호 입력 시도 횟수. 5회를 넘기면 그 건은 폐기합니다.
  attempts INTEGER NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  -- 실제로 아이디를 보여주거나 비밀번호를 바꾼 시각. 한 번 쓰면 끝입니다.
  consumed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT phone_verifications_purpose_check
    CHECK (purpose IN ('find_id', 'reset_password'))
);

-- 번호별 최근 발송 조회(재발송 제한·유효건 찾기)에 쓰입니다.
CREATE INDEX IF NOT EXISTS phone_verifications_phone_idx
  ON public.phone_verifications (phone, created_at DESC);

CREATE INDEX IF NOT EXISTS phone_verifications_token_idx
  ON public.phone_verifications (token_hash)
  WHERE token_hash IS NOT NULL;

COMMENT ON TABLE public.phone_verifications IS
  '휴대폰 문자 인증(SENS SMS). 아이디 찾기·비밀번호 재설정 본인확인용이며 인증번호는 해시로만 저장합니다.';

-- RLS — 기존 테이블과 동일하게 개발 단계 허용 정책을 둡니다.
-- (운영 전에는 service_role 전용으로 좁혀야 합니다. 지금은 해시 저장이 그 보호막입니다)
ALTER TABLE public.phone_verifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anon read phone_verifications for development"
  ON public.phone_verifications;
CREATE POLICY "Allow anon read phone_verifications for development"
  ON public.phone_verifications FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Allow anon insert phone_verifications for development"
  ON public.phone_verifications;
CREATE POLICY "Allow anon insert phone_verifications for development"
  ON public.phone_verifications FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update phone_verifications for development"
  ON public.phone_verifications;
CREATE POLICY "Allow anon update phone_verifications for development"
  ON public.phone_verifications FOR UPDATE TO anon, authenticated USING (true);
