-- 주간 수강 독려 알림톡(60% 미만) 발송 설정 — 어드민 운영관리에서 조정.
-- 단일 행 테이블. Vercel 크론은 매시간 돌고, 이 설정과 시각이 맞을 때만 발송한다.
create table if not exists alimtalk_weekly_settings (
  id boolean primary key default true check (id),   -- 행이 하나뿐임을 강제
  enabled boolean not null default true,
  weekday integer not null default 1 check (weekday between 0 and 6),  -- 0=일요일 … 6=토요일 (JS getDay와 동일)
  hour integer not null default 10 check (hour between 0 and 23),      -- KST 기준 시각
  last_sent_date date,                              -- 중복 발송 방지 마커 (KST 날짜)
  updated_at timestamptz not null default now()
);

insert into alimtalk_weekly_settings (id) values (true)
on conflict (id) do nothing;

comment on table alimtalk_weekly_settings is
  '주간 독려 알림톡 발송 설정 — 요일·시간(KST)·on/off. 크론이 매시간 확인한다.';
