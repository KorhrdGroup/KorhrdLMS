-- 마케팅 유입경로 자동 추적.
-- 마케팅 링크(?utm_source=… 등)로 들어온 방문자가 회원가입하면, 첫 방문 때
-- 쿠키에 담아 둔 유입경로를 회원 행에 남긴다. 어드민 회원관리에서 본다.
-- join_path(가입 폼에서 본인이 고른 값)와 별개다.
alter table members
  add column if not exists referral_source text;

comment on column members.referral_source is
  '마케팅 유입경로 자동 기록 (예: 맘카페_율하맘). 첫 방문 쿠키 기준, 없으면 null.';
