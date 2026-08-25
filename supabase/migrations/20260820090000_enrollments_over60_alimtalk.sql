-- 수강률 60% 도달 알림톡(시험 안내) 1회 발송 마커.
-- 학생이 60%를 넘는 순간 한 번만 보내기 위해 발송 시각을 기록한다.
alter table enrollments
  add column if not exists over60_alimtalk_sent_at timestamptz;

comment on column enrollments.over60_alimtalk_sent_at is
  '수강률 60% 도달 시험 안내 알림톡(UK_3818) 발송 시각. null 이면 미발송.';
