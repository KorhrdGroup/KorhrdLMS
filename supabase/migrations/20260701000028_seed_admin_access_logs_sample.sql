INSERT INTO public.admin_users (admin_type, login_id, name)
VALUES
  ('super_admin', 'superadmin', '최고관리자'),
  ('admin', 'admin01', '김관리'),
  ('admin', 'admin02', '이운영'),
  ('instructor', 'teacher01', '박강사'),
  ('counselor', 'counsel01', '정상담')
ON CONFLICT (login_id) DO NOTHING;

INSERT INTO public.admin_access_logs (admin_user_id, access_ip, logged_in_at, logged_out_at)
SELECT
  u.id,
  v.access_ip,
  v.logged_in_at::timestamptz,
  v.logged_out_at::timestamptz
FROM (
  VALUES
    ('superadmin', '203.0.113.10', '2026-06-28 09:00:00+09', '2026-06-28 12:30:00+09'),
    ('superadmin', '203.0.113.10', '2026-06-30 08:45:00+09', '2026-06-30 18:00:00+09'),
    ('superadmin', '203.0.113.22', '2026-07-01 09:10:00+09', NULL),
    ('admin01', '198.51.100.5', '2026-06-25 10:00:00+09', '2026-06-25 17:30:00+09'),
    ('admin01', '198.51.100.5', '2026-06-29 09:30:00+09', '2026-06-29 18:15:00+09'),
    ('admin01', '198.51.100.12', '2026-07-01 08:50:00+09', NULL),
    ('admin02', '198.51.100.8', '2026-06-27 11:00:00+09', '2026-06-27 16:00:00+09'),
    ('admin02', '198.51.100.8', '2026-07-01 10:20:00+09', '2026-07-01 12:00:00+09'),
    ('teacher01', '192.0.2.15', '2026-06-26 13:00:00+09', '2026-06-26 15:45:00+09'),
    ('teacher01', '192.0.2.15', '2026-06-30 14:00:00+09', '2026-06-30 17:00:00+09'),
    ('counsel01', '192.0.2.30', '2026-06-24 09:00:00+09', '2026-06-24 18:00:00+09'),
    ('counsel01', '192.0.2.30', '2026-06-28 09:30:00+09', '2026-06-28 17:30:00+09')
) AS v (login_id, access_ip, logged_in_at, logged_out_at)
INNER JOIN public.admin_users u ON u.login_id = v.login_id;
