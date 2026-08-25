-- 알림톡 발송 이력.
-- 자동(가입·수강신청·60% 도달)·주간 크론·어드민 일괄/테스트 등 모든 발송을
-- 성공/실패와 함께 남긴다. 어드민 운영관리 > 알림톡 발송 이력에서 본다.
create table if not exists alimtalk_logs (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete set null,
  receiver_phone text not null,
  receiver_name text,
  template_key text not null,          -- SIGNUP · ENROLLMENT_DONE · PROGRESS_UNDER_60 · PROGRESS_OVER_60 …
  trigger_source text not null,        -- auto_signup · auto_enrollment · auto_over60 · cron_under60 · admin_bulk · admin_test
  success boolean not null,
  fail_reason text,
  created_at timestamptz not null default now()
);

create index if not exists alimtalk_logs_created_idx on alimtalk_logs (created_at desc);
create index if not exists alimtalk_logs_member_idx on alimtalk_logs (member_id);

comment on table alimtalk_logs is '알림톡 발송 이력 — 모든 발송 경로에서 기록';
