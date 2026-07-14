-- 시험관리를 민간자격증 LMS 운영 방식에 맞게 단순화합니다.
--
-- 1) 시험 종류는 이제 "최종시험"(final_exam) 하나만 사용합니다. 신규 컬럼 기본값을
--    맞추고, 기존에 등록된 시험도 최종시험으로 일괄 정리합니다.
ALTER TABLE public.exams ALTER COLUMN exam_kind SET DEFAULT 'final_exam';

UPDATE public.exams SET exam_kind = 'final_exam' WHERE exam_kind <> 'final_exam';

-- 2) 시험 응시기간을 별도로 관리하지 않고, 학생의 수강기간(enrollments.start_date ~
--    end_date) 안에서 응시 가능 여부를 판단합니다. 응시 시작/종료일 입력을 화면에서
--    제거하므로 더 이상 필수값이 아니도록 완화합니다(과거 데이터 보존을 위해 컬럼
--    자체는 삭제하지 않습니다).
ALTER TABLE public.exams ALTER COLUMN exam_start DROP NOT NULL;
ALTER TABLE public.exams ALTER COLUMN exam_end DROP NOT NULL;
