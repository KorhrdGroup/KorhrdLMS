-- 관리자 접속기록을 샘플 데이터에서 "실제 기록"으로 전환합니다.
-- 1) 시드 샘플(최고관리자/김관리 등 5명 + 접속기록 12건)을 제거하고,
-- 2) 앱이 로그인/로그아웃 시점에 직접 기록할 수 있도록 anon/authenticated에
--    INSERT/UPDATE 권한과 정책을 추가합니다. (다른 테이블과 동일한 개발 단계 정책)

-- 샘플 데이터 제거 (자식 → 부모 순서)
DELETE FROM public.admin_access_logs;
DELETE FROM public.admin_users;

-- 기록에 필요한 권한
GRANT INSERT, UPDATE ON public.admin_users TO anon, authenticated;
GRANT INSERT, UPDATE ON public.admin_access_logs TO anon, authenticated;

DROP POLICY IF EXISTS "Allow anon insert admin_users for development" ON public.admin_users;
CREATE POLICY "Allow anon insert admin_users for development"
  ON public.admin_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon update admin_users for development" ON public.admin_users;
CREATE POLICY "Allow anon update admin_users for development"
  ON public.admin_users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow anon insert admin_access_logs for development" ON public.admin_access_logs;
CREATE POLICY "Allow anon insert admin_access_logs for development"
  ON public.admin_access_logs
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 로그아웃 시각(logged_out_at) 갱신용
DROP POLICY IF EXISTS "Allow anon update admin_access_logs for development" ON public.admin_access_logs;
CREATE POLICY "Allow anon update admin_access_logs for development"
  ON public.admin_access_logs
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
