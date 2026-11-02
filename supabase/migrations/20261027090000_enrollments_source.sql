-- 수강신청이 어느 버튼에서 왔는지. 취업 길찾기가 신청으로 이어지는지 보려고 둔다.
--   job               취업 길찾기 상세의 '바로 수강신청'
--   job_course_detail 취업 길찾기 → '과정 상세보기' → 과정 상세의 신청 버튼
--   course_detail     과정 상세의 신청 버튼 (그 밖의 경로로 들어온 경우)
--   cart              수강신청 목록의 장바구니
-- 이 컬럼 이전의 신청과 관리자 등록은 null.
alter table enrollments
  add column if not exists source text;

comment on column enrollments.source is
  '수강신청 출처 (job · job_course_detail · course_detail · cart, 이전 신청·관리자 등록은 null)';
