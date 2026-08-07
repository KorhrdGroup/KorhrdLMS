-- 소셜 로그인 연동 (네이버 · 카카오)
--
-- 학생 로그인은 Supabase Auth가 아니라 `members` + httpOnly 쿠키라, 소셜도
-- 직접 붙입니다. 소셜 계정 고유번호를 회원에 저장해 두 번째 로그인부터는
-- 휴대폰 번호 대조 없이 바로 잇습니다.
--
-- 로그인 흐름
--   1) naver_id/kakao_id 가 있으면 그 회원으로 로그인
--   2) 없으면 소셜이 준 휴대폰 번호로 기존 회원을 찾아 연결(있으면)
--   3) 그래도 없으면 새 회원을 만들고 연결
--
-- 소셜로 가입한 회원은 login_id·password_hash 가 비어 있을 수 있습니다.
-- (마이페이지에서 나중에 아이디·비밀번호를 정할 수 있게 둡니다)

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS naver_id TEXT,
  ADD COLUMN IF NOT EXISTS kakao_id TEXT;

-- 한 소셜 계정이 여러 회원에 붙지 않도록. 지운 회원은 제외해 재가입이 됩니다.
CREATE UNIQUE INDEX IF NOT EXISTS members_naver_id_uidx
  ON public.members (naver_id)
  WHERE naver_id IS NOT NULL AND deleted_at IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS members_kakao_id_uidx
  ON public.members (kakao_id)
  WHERE kakao_id IS NOT NULL AND deleted_at IS NULL;

COMMENT ON COLUMN public.members.naver_id IS
  '네이버 로그인 계정 고유번호(response.id). 연동한 회원만 값이 있습니다.';
COMMENT ON COLUMN public.members.kakao_id IS
  '카카오 로그인 계정 고유번호(id). 연동한 회원만 값이 있습니다.';
