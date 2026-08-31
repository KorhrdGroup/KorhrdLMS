-- 평생교육이용권 결제 기록 (나이스페이 경유).
-- 과정 결제(course_payments)와 달리 특정 과정에 묶이지 않아 별도 테이블로 둔다.
create table if not exists voucher_payments (
  id uuid primary key default gen_random_uuid(),
  member_id uuid references members(id) on delete set null,
  buyer_name text not null,
  buyer_tel text,
  amount integer not null,
  status text not null default 'paid',          -- paid | failed | canceled
  pg_provider text not null default 'nicepay',
  moid text not null,                           -- 우리쪽 주문번호
  tid text,                                     -- 나이스페이 거래번호
  result_code text,
  result_msg text,
  paid_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists voucher_payments_created_idx on voucher_payments (created_at desc);
create unique index if not exists voucher_payments_moid_idx on voucher_payments (moid);

comment on table voucher_payments is '평생교육이용권 결제 이력 — 나이스페이 결제창 경유';
