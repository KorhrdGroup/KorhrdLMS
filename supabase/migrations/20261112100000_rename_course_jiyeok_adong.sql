-- 과정명 변경: 지역아동교육지도사1급 → (지역)아동교육지도사 (CRS-KH-0061, 2026-11-12)
-- 발급처에서 '지역아동교육지도사' 명칭으로 발급이 어려워 '아동교육지도사'로 발급되어 표기를 맞춥니다.
--
-- 순서: 코드(카탈로그·옛 이름 URL 폴백·오피스 별칭·이관 기록 매칭) 배포가 운영에 반영된 뒤 적용.
-- 바꾸지 않는 것 (의도):
--   · 기존 발급신청 certificate_applications.certificate_name 812건 — 당시 이름 기록으로 둠(사용자 결정)
--   · 결제 상품명 course_payments.product_name — 결제 당시 기록
--   · 차시 제목 "지역아동교육 지도의 이해" 등, 과정 소개 문구, 시험 문제 — 과목 내용 용어라 그대로
--   · 교안 file_name — 저장 파일 이름

begin;

do $$
declare n int;
begin
  update public.courses
     set name = '(지역)아동교육지도사'
   where code = 'CRS-KH-0061' and name = '지역아동교육지도사1급';
  get diagnostics n = row_count;
  if n <> 1 then raise exception '과정 1건이어야 하는데 %건', n; end if;
end $$;

update public.exams
   set name = replace(name, '지역아동교육지도사1급', '(지역)아동교육지도사')
 where course_id = (select id from public.courses where code = 'CRS-KH-0061')
   and name like '지역아동교육지도사1급%';

update public.course_lectures
   set title = '(지역)아동교육지도사'
 where course_id = (select id from public.courses where code = 'CRS-KH-0061')
   and title = '지역아동교육지도사1급';

update public.learning_materials
   set title = '(지역)아동교육지도사 교안'
 where title = '지역아동교육지도사1급 교안';

update public.lecture_sessions
   set title = replace(title, '자격시험 지역아동교육지도사', '자격시험 (지역)아동교육지도사')
 where title like '%자격시험 지역아동교육지도사';

commit;
