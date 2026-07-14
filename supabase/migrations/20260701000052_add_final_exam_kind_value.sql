-- 민간자격증 LMS는 중간고사/기말고사 구분이 없고 "최종시험" 한 종류만 사용합니다.
-- Postgres enum은 값을 삭제할 수 없으므로 기존 값(midterm/final/mock/certificate/quiz)은
-- 과거 데이터 호환을 위해 그대로 두고, 새 값만 추가합니다.
--
-- 주의: 새로 추가한 enum 값은 이 값을 추가한 트랜잭션 내에서는 사용할 수 없다는
-- Postgres 제약 때문에, 이 값을 실제로 사용하는 UPDATE/기본값 설정은 다음 마이그레이션
-- 파일(20260701000053)에서 별도 트랜잭션으로 처리합니다.
ALTER TYPE public.exam_kind ADD VALUE IF NOT EXISTS 'final_exam';
