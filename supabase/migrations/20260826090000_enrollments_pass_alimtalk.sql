-- 시험 합격 축하 알림톡(UK_3820) 1회 발송 마커.
-- 재응시로 여러 번 합격해도 수강(enrollment)당 한 번만 보내기 위해 발송 시각을 기록한다.
alter table enrollments
  add column if not exists pass_alimtalk_sent_at timestamptz;

comment on column enrollments.pass_alimtalk_sent_at is
  '시험 합격 축하 알림톡(UK_3820) 발송 시각. null 이면 미발송.';
