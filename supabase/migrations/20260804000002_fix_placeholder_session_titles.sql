-- 신규·접수반 과정의 차시 제목 보정 + 인트로/중복 차시 정리
--
-- 배경: 20260723000001로 등록된 신규 과정들의 lecture_sessions.title이
--       'N차시' 플레이스홀더로 생성됐습니다(13개 과정 276차시). 상세페이지
--       커리큘럼이 이 값을 그대로 노출하므로, 확보한 실제 강의명으로 바꿉니다.
--       제목 출처: 과정 폴더 정보 txt + kllo.kr 원본 페이지 (통합본 엑셀 강의계획서 컬럼)
--
-- 인트로/중복 차시 정리(사용자 승인: 인트로 없이 1강부터 시작):
--   0078/0080/0083: 마지막 21차시가 인트로 영상 → 소프트 삭제 (수강생 0명)
--   0075: 18차시가 '프롬프트17완성.mp4'(17강의 최종 재작업본) →
--         17차시 영상을 완성본으로 교체 후 18차시 소프트 삭제
--
-- 플레이스홀더('N차시'/'N강')인 행만 갱신하므로 관리자가 이미 고친 제목은 건드리지 않습니다.

-- ── 인트로/중복 차시 정리 ──
UPDATE public.lecture_sessions ls SET deleted_at = now(), updated_at = now()
FROM public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0078' AND ls.session_order = 21 AND ls.deleted_at IS NULL;

UPDATE public.lecture_sessions ls SET deleted_at = now(), updated_at = now()
FROM public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0080' AND ls.session_order = 21 AND ls.deleted_at IS NULL;

UPDATE public.lecture_sessions ls SET deleted_at = now(), updated_at = now()
FROM public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0083' AND ls.session_order = 21 AND ls.deleted_at IS NULL;

-- 0075 17차시 영상을 최종본(프롬프트17완성)으로 교체
UPDATE public.lecture_sessions ls SET
  video_url = src.video_url,
  video_file_name = src.video_file_name,
  video_storage_path = src.video_storage_path,
  video_duration_seconds = src.video_duration_seconds,
  updated_at = now()
FROM (
  SELECT ls2.video_url, ls2.video_file_name, ls2.video_storage_path, ls2.video_duration_seconds
  FROM public.lecture_sessions ls2
  JOIN public.course_lectures cl2 ON cl2.id = ls2.lecture_id
  JOIN public.courses c2 ON c2.id = cl2.course_id
  WHERE c2.code = 'CRS-KH-0075' AND ls2.session_order = 18 AND ls2.deleted_at IS NULL
) src, public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0075' AND ls.session_order = 17 AND ls.deleted_at IS NULL;

UPDATE public.lecture_sessions ls SET deleted_at = now(), updated_at = now()
FROM public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0075' AND ls.session_order = 18 AND ls.deleted_at IS NULL;

-- ── 차시 제목 갱신 (플레이스홀더인 행만) ──
-- CRS-KH-0072 (15강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '안전관리의 이해 및 법규 기초'),
  (2, '안전보건경영시스템 및 위험성 평가'),
  (3, '산업재해 예방, 조사 및 안전 문화'),
  (4, '기계 안전'),
  (5, '전기 안전'),
  (6, '화학 안전'),
  (7, '건설 안전'),
  (8, '화재 안전 및 소방'),
  (9, '보건 관리 및 직업병 예방'),
  (10, '인간 공학 및 시스템 안전 공학'),
  (11, '자연재난 안전 관리'),
  (12, '사회재난 안전 관리'),
  (13, '일상생활 안전 관리'),
  (14, '안전관리 법규 및 정책 심화 및 미래 안전 기술'),
  (15, '안전 교육 전문가 양성 과정')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0072'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0073 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '클레이의 특징과 장점'),
  (2, '기본 모양 만들기'),
  (3, '레인보우 연필꽂이'),
  (4, '뽀로로와 친구들'),
  (5, '광섬유 고래'),
  (6, '성 모양 액자 만들기'),
  (7, '수국 모빌'),
  (8, '메모꽂이'),
  (9, 'Sweet home 시계'),
  (10, '선인장'),
  (11, '선물 바구니와 과일'),
  (12, '케릭터 방문걸이'),
  (13, '할로윈 호박과 사탕 바구니'),
  (14, '크리스마스 트리'),
  (15, '카네이션'),
  (16, '나만의 볼펜'),
  (17, '케익상자'),
  (18, '원숭이 도어벨'),
  (19, '결혼하는 곰돌이'),
  (20, '앵그리버드')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0073'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0075 (16강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '미래의 언어를 마스터하다'),
  (2, 'AI 모델의 특징 이해와 RCSO 심화 설계'),
  (3, 'AI 의 뇌를 깨우는 기술 : 단계별 생각하기'),
  (4, 'AI 를 내 분신으로 만드는 기술 : Few Shot 기법'),
  (5, '완벽을 만드는 최후의 한 수 : 셀프 크리틱 (Self Critic)'),
  (6, '멀티 페르소나 (Multi Persona) 기법'),
  (7, '마크다운 (Markdown) 구조화 기법'),
  (8, '변수와 템플릿 설계'),
  (9, '할루시네이션 방어 전략'),
  (10, '데이터가 전략이 되는 순간 : 데이터 분석 프롬프팅'),
  (11, '비주얼 프롬프팅'),
  (12, '멀티모달 (Multimodal) 프롬프팅'),
  (13, '긴 문서 요약 및 지식 추출'),
  (14, '창의적 글쓰기와 스토리텔링'),
  (15, '업무자동화(Automation) 연동'),
  (16, 'GPTs 제작 실습')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0075'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0076 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '강아지 산책의 기본 이해'),
  (2, '강아지의 몸과 산책'),
  (3, '강아지의 마음과 산책'),
  (4, '산책 준비의 모든 것'),
  (5, '산책 시작 단계 관리'),
  (6, '리드줄 사용 이해'),
  (7, '산책 중 행동 이해'),
  (8, '다른 강아지와 마주칠 때'),
  (9, '사람과 환경 반응 관리'),
  (10, '배변과 산책'),
  (11, '문제 행동의 초기 대응'),
  (12, '계절별 산책 관리'),
  (13, '연령별 산책 관리'),
  (14, '건강과 안전 중심 산책'),
  (15, '애견산책전문가 공공장소 산책 예절'),
  (16, '보호자와의 소통 산책'),
  (17, '산책 루틴 만들기'),
  (18, 'AI 시대의 강아지 산책지도사 이해'),
  (19, '산책 지도자의 역할'),
  (20, '강아지 산책 전문가 종합 정리')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0076'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0077 (15강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '도로교통법 핵심정리I'),
  (2, '도로교통법 핵심정리II'),
  (3, '도로교통법 핵심정리III'),
  (4, '등.하교시 보행안전'),
  (5, '어린이의 행동특성과 교통안전'),
  (6, '어린이 통학버스 운영 및 사고예방'),
  (7, '어린이 통학버스 교통사고 발생시 행동요령'),
  (8, '자전거 안전운전'),
  (9, '교통안전법 핵심정리'),
  (10, '개인형 이동장치의 이해'),
  (11, '졸음운전의 위험성과 예방대책'),
  (12, '음주운전의 위험성과 예방대책'),
  (13, '자동차 운전자의 안전 수칙'),
  (14, '교통사고 위험 예방과 방어 운전'),
  (15, '차량화재시 대응방법')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0077'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0078 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '동물병원 산업 변화와 코디네이터 직무 개론'),
  (2, '동물병원 코디네이터 정의와 역할'),
  (3, '동물병원 코디네이터 서비스마인드 & 이미지'),
  (4, '동물병원 조직과 팀워크 이해'),
  (5, '고객 응대 커뮤니케이션 기초'),
  (6, '전화 및 비대면 응대'),
  (7, '고객 불만 및 컴플레인 대응 전략'),
  (8, '고객 상담기술과 만족도 향상 기법'),
  (9, '서비스 기대 관리와 보호자 경험 향상'),
  (10, '반려견 행동과 건강 이해'),
  (11, '반려묘 행동과 건강 이해'),
  (12, '반려동물 질병 기초와 응급'),
  (13, '반려동물 영양 및 질환별 영양관리'),
  (14, '동물 등록과 법규 이해'),
  (15, '동물의료기록관리와 기본 의료용어'),
  (16, '예방접종과 건강관리'),
  (17, '원무행정 서비스 (접수·예약·수납 등)'),
  (18, '병원 환경 및 위생관리'),
  (19, '동물병원 마케팅 및 SNS 관리'),
  (20, '코디네이터 취업 준비 & 종합 정리')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0078'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0079 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '등하원돌봄지원사의 이해'),
  (2, '영유아 이동 관리'),
  (3, '초등학생 이동 관리'),
  (4, '장애 아동 동행 관리'),
  (5, '도로 보행 안전'),
  (6, '횡단 및 신호 체계 이해'),
  (7, '차량 탑승 안전'),
  (8, '등·하원 대중교통 이용 관리'),
  (9, '등·하원 기관 인계 절차'),
  (10, '귀가 후 관리: 등하원돌봄지원사 필수 체크리스트'),
  (11, '계절별 이동 관리'),
  (12, '위생 관리: 안전한 돌봄을 위한 필수 지침'),
  (13, '등·하원 낯선 사람 대응'),
  (14, '실종 예방 관리'),
  (15, '등·하원 응급 기본 대응'),
  (16, '감정 관리 지도'),
  (17, '가정 유형 이해'),
  (18, '기록 체계 관리'),
  (19, '등·하원 현장 집중 관리'),
  (20, '종합 정리 및 현장 준비')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0079'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0080 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '디지털 튜터 과정 소개 및 역할이해'),
  (2, '디지털 기초 & 디지털 리터러시'),
  (3, '스마트폰 활용-1'),
  (4, '스마트폰 활용-2'),
  (5, '어플 사용법'),
  (6, 'ZOOM 활용법'),
  (7, '키오스크 및 QR체크인'),
  (8, '1인 미디어와 크리에이터'),
  (9, '숏폼 콘텐츠 이해'),
  (10, '캔바 활용 로고 카드뉴스 제작'),
  (11, '디지털 콘텐츠 제작'),
  (12, '유튜브 채널 및 영상 제작'),
  (13, '인스타그램 개념과 특징'),
  (14, '인스타그램 디지털 소통'),
  (15, '유튜브 저작권'),
  (16, '생성형 AI 활용 PPT 제작(Gamma 활용)'),
  (17, 'VREW 활용 영상제작'),
  (18, '디지털 튜터 채용공고 및 채용절차'),
  (19, '디지털 교재·교구 연구 및 지도법'),
  (20, '4차 산업혁명과 디지털 튜터 전망')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0080'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0081 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '보험심사관리사의 역할과 필요역량'),
  (2, '보험심사의 기본 개념 및 원칙'),
  (3, '보험상품의 이해'),
  (4, '보험계약 쳬결 과정과 심사 절차'),
  (5, '보험계약 심사 기준(위험 평가 방법)'),
  (6, '고위험군 심사 및 특수 계약관리'),
  (7, '보험금 청구 및 지급 심사 개요'),
  (8, '손해사정 및 지급 기준'),
  (9, '부정 청구 방지 및 보험사기 대응'),
  (10, '보험법 및 관련 규정'),
  (11, '개인정보 보호 및 윤리적 책임'),
  (12, '실무에서 자주 발생하는 보험심사 사례'),
  (13, '보험심사와 리스크 관리 전략'),
  (14, '보험심사 보고서 작성 방법'),
  (15, '디지털 보험심사 및 AI활용 사례'),
  (16, '헬스케어와 보험심사의 연계'),
  (17, '해외 보험심사 사례 및 비교'),
  (18, '보험심사의 디지털 전환과 실무적용 사례'),
  (19, '보험심사 관리자의 리더십과 커뮤니케이션'),
  (20, '보험심사관리사 실무자 역량 강화')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0081'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0082 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '세차관리사란? - 왜 배워야 하나요'),
  (2, '내 차 알기 - 외장/내장 재질의 종류'),
  (3, '세차 도구 준비하기 - 무엇이 필요할까'),
  (4, '세차장 찾아보기 - 셀프/자동/손세차의 차이'),
  (5, '안전하게 세차하기 - 주의사항과 기본 원칙'),
  (6, '외장 세차 순서 - 전체 흐름 이해하기'),
  (7, '물로 헹구기 - 먼지 제거의 시작'),
  (8, '폼 세차하기 - 거품으로 씻어내기'),
  (9, '휠과 타이어 관리 - 바퀴도 깨끗하게'),
  (10, '물기 제거하기 - 워터스팟 없이 말리기'),
  (11, '광택내기 기초 - 왁스와 코팅의 차이'),
  (12, '간단한 광택 작업 - 손으로 쉽게 하기'),
  (13, '내장 청소 준비 - 청소기와 도구들'),
  (14, '시트 관리하기 - 천시트와 가죽시트'),
  (15, '대시보드와 유리창 - 깨끗하게 닦기'),
  (16, '냄새 제거하기 - 탈취와 방향제'),
  (17, '여름철 세차 - 더위와 비 대비하기'),
  (18, '겨울철 세차 - 염화칼슘과 동결 관리'),
  (19, '세차 부업 시작하기 - 이웃과 지인부터'),
  (20, '작은 세차장 운영 - 준비물과 시작 방법')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0082'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0083 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '유품정리사의 이해와 직업 윤리'),
  (2, '다문화 사회와 유품정리의 기본 이해'),
  (3, '종교별 유품정리 기본 원칙'),
  (4, '사고 유형 분류와 유품정리 접근 개요'),
  (5, '자연사 유품정리 이론'),
  (6, '질병사 유품정리 이론'),
  (7, '사고사 유품정리 이론'),
  (8, '재난·재해 사망 시 유품정리'),
  (9, '범죄 관련 사망 시 유품정리'),
  (10, '고독사 유품정리 이론'),
  (11, '노인 사망 시 유품정리'),
  (12, '청·장년 사망 시 유품정리'),
  (13, '아동·청소년 사망 시 유품정리'),
  (14, '외국인·이주민 사망 시 유품정리'),
  (15, '다문화 갈등 예방과 유품정리'),
  (16, '유품 분류·보관·폐기 이론'),
  (17, '법·제도와 유품정리'),
  (18, '유가족 심리 이해 이론'),
  (19, '유품정리사의 전문 커뮤니케이션'),
  (20, '유품정리사의 지속 가능한 전문성')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0083'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0084 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '음악상담의 이해'),
  (2, '유아 음악상담 (0–6세)'),
  (3, '아동 음악상담 (7–12세)'),
  (4, '청소년 음악상담 (13–18세)'),
  (5, '청년기 음악상담 (19–34세)'),
  (6, '성인기 음악상담 (35–49세)'),
  (7, '중년기 음악상담 (40–59세)'),
  (8, '장년층 음악상담 (50–64세)'),
  (9, '노년기 음악상담 (65세 이상)'),
  (10, '우울증 음악상담 (전연령)'),
  (11, '불안 장애 음악상담'),
  (12, 'ADHD·충동조절 음악상담'),
  (13, '자존감 회복 음악상담'),
  (14, '스트레스·분노 조절 음악상담'),
  (15, 'PTSD·트라우마 음악상담'),
  (16, '치매 예방·관리 음악상담'),
  (17, '중독 상담 음악심리 이론'),
  (18, '장애(발달·지적·정서·자폐) 음악상담'),
  (19, '말기·호스피스 음악상담'),
  (20, '음악상담 종합 이론')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0084'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- CRS-KH-0085 (20강)
UPDATE public.lecture_sessions ls SET title = v.title, updated_at = now()
FROM (VALUES
  (1, '치과병원코디네이터 하나로 병원이 바뀐다'),
  (2, '환자는 진료보다 응대로 병원을 선택한다'),
  (3, '“치과 구조를 모르면 상담은 불가능하다”'),
  (4, '“이 용어 모르면 환자 앞에서 막힌다”'),
  (5, '“접수는 단순 업무가 아니라 첫 설득이다”'),
  (6, '“예약 관리가 곧 병원 운영이다”'),
  (7, '“상담은 설명이 아니라 ‘이해시키는 기술’이다”'),
  (8, '“환자 유형을 알면 상담이 쉬워진다”'),
  (9, '“치과 진료를 알아야 설득이 된다”'),
  (10, '“치료 설명이 곧 병원의 신뢰다”'),
  (11, '“말 한마디가 결과를 바꾼다”'),
  (12, '“코디네이터는 병원의 이미지다”'),
  (13, '“환자는 관리하면 다시 온다”'),
  (14, '“마케팅을 모르면 환자가 끊긴다”'),
  (15, '“비용 설명은 신뢰를 좌우한다”'),
  (16, '“팀워크가 안 되면 병원은 무너진다”'),
  (17, '“위생과 감염관리는 기본이 아니라 필수다”'),
  (18, '“모르면 위험한 법과 개인정보”'),
  (19, '“잘하는 코디네이터는 따로 있다”'),
  (20, '“치과 병원코디네이터의 완성 구조”')
) AS v(session_order, title), public.course_lectures cl, public.courses c
WHERE ls.lecture_id = cl.id AND cl.course_id = c.id
  AND c.code = 'CRS-KH-0085'
  AND ls.session_order = v.session_order AND ls.deleted_at IS NULL
  AND ls.title ~ '^[0-9]+\s*(차시|강)$';

-- ── 교수 이력 데이터 정리 ──
-- 이민태 교수 bio에 파싱 잔재('>') 한 줄이 들어가 있어 정상 이력으로 교체합니다.
UPDATE public.professors SET bio = ARRAY[
  '[ 소속 ] 現 한국직업능력검정협회 기획본부장 現 사단법인 경기해양문화연맹 비서실장',
  '[ 학력 및 전공 ] 한양대학교 Hanyang University, 2003'
]::text[], updated_at = now()
WHERE name = '이민태 교수' AND deleted_at IS NULL;
