-- 자격증 발급신청 상단 고정.
-- 신청만 하고 입금을 미룬 건이 새 신청에 밀려 누락되는 것을 막기 위해,
-- 관리자가 짚어 둔 건을 목록 맨 위로 끌어올린다. 고정 시각을 그대로 정렬키로 쓴다
-- (나중에 고정한 것이 더 위).
alter table certificate_applications
  add column if not exists pinned_at timestamptz;

comment on column certificate_applications.pinned_at is
  '관리자 상단 고정 시각. null 이면 고정 안 됨. 목록에서 고정 건이 먼저, 최근 고정이 더 위.';
