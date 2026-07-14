-- 개발/테스트용 회원 로그인 비밀번호 설정 (test1234)
UPDATE public.members
SET password_hash = 'hanpyeongtestseed001:33e918b29d247bf16a80cd22bb5823ffe858ff99390ea8f0b5dc5cb6fcf3ec1fe706f7fff61aa429959d80ee507548035bb4349744c0a13296a6c7f3d780ecb4'
WHERE deleted_at IS NULL
  AND status = 'active'
  AND password_hash IS NULL;
