-- 과정 상세페이지 데이터 임포트 (85개 과정 · 교수 57명)
--
-- 원본: 한평생직업훈련_강의정보_통합본.xlsx
--   · 기존 74개 — 구 사이트(kllo.kr) 크롤링분 + 오배정 4건 원본 재확보
--   · 신규 11개 — 로컬 강의 폴더의 과정 정보 txt에서 추출
-- 매칭 키는 courses.code 입니다. 재실행 안전(멱등)합니다.
--
-- 알려진 한계:
--   · professors.bio 는 원본이 한 덩어리로 평문화돼 있어 줄 단위 복원이 불가능합니다.
--     대괄호 라벨([ 소속 ] 등) 기준으로만 잘랐습니다.
--   · hero_image_url 은 과정별 이미지가 아직 없어 채우지 않습니다.
--   · 영어동화구연지도사(CRS-KH-0074)는 원본 자료가 없어 값이 비어 있습니다.

-- ─────────────────────────── 자격관리기관 ───────────────────────────
-- 대한자격개발원·한국평생학습개발원은 대표/연락처/주소가 한국직업능력검정협회와
-- 동일합니다. 같은 곳의 다른 표기로 보이지만 임의 통합하지 않고 원본대로 둡니다.
INSERT INTO public.issuing_agencies (name, ceo, phone, address)
VALUES ('대한자격개발원', '강희수', '02)465-9568', '서울시 강서구 초록마을로2길26,2층')
  ON CONFLICT (name) DO UPDATE SET
    ceo = EXCLUDED.ceo, phone = EXCLUDED.phone, address = EXCLUDED.address, updated_at = now();
INSERT INTO public.issuing_agencies (name, ceo, phone, address)
VALUES ('한국엔씨에스자격개발원', '최낙조', '1644-9236', '서울특별시 성북구 지봉로24길 11, 302호(보문동2가)')
  ON CONFLICT (name) DO UPDATE SET
    ceo = EXCLUDED.ceo, phone = EXCLUDED.phone, address = EXCLUDED.address, updated_at = now();
INSERT INTO public.issuing_agencies (name, ceo, phone, address)
VALUES ('한국직업능력검정협회', '강희수', '02)465-9568', '서울시 강서구 초록마을로2길26,2층')
  ON CONFLICT (name) DO UPDATE SET
    ceo = EXCLUDED.ceo, phone = EXCLUDED.phone, address = EXCLUDED.address, updated_at = now();
INSERT INTO public.issuing_agencies (name, ceo, phone, address)
VALUES ('한국평생학습개발원', '강희수', '02)465-9568', '서울시 강서구 초록마을로2길26,2층')
  ON CONFLICT (name) DO UPDATE SET
    ceo = EXCLUDED.ceo, phone = EXCLUDED.phone, address = EXCLUDED.address, updated_at = now();

-- ───────────────────────────── 교수 ─────────────────────────────
INSERT INTO public.professors (name, bio) VALUES ('강민석 교수', ARRAY['[ 경력 ] 현 행복노후연구소 대표 현 한국은퇴설계협회 부회장 전 미래에셋 은퇴설계부문 담당 전 삼성생명 자산관리 컨설턴트 전 국민은행 PB센터 팀장', '[ 강연 및 교육활동 ] 대형 금융사 및 기업체 은퇴 준비 교육 강사 (연 100회 이상) 50플러스 자문위원 및 정기 강사 2019 금융감독원 금융소비자 교육 공로상 2017 대한민국 은퇴설계 컨퍼런스 대상', '[ 자격 ] 국제공인재무설계사 경은퇴설계전문가 투자자산운용사', '[ 수상 내역 ] 2023 금융위원회 금융교육 우수강사상 2021 한국FPSB 올해의 재무설계사상 2019 금융감독원 금융소비자 교육 공로상 2017 대한민국 은퇴설계 컨퍼런스 대상']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('강병찬 교수', ARRAY['[ 소속 ] 가천대 명강사 최고위과정 운영교수 한국주니어사관연맹 경기지부 성남지회장', '[ 학력 ] 캐나다 크리스찬대학원 코칭학 석사', '[ 강사 자격 ] 행정안전부 안전교육전문인력강사 행정안전부 민방위교육강사 대한민국육군인증 안전교육강사 학교안전공제중앙회 안전교육전문강사 한국건강증진개발원 흡연음주예방교육강사 한국군사문제연구소 전담강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('강샤론 교수', ARRAY['[ 소속 ] KCDC한국코칭능력개발센터 사무국장 길라잡이입시학원 학원장 청소년아카데미 프로그램매니져 (주)창조경영연구원 실장 국제청소년기자단 단장 더높이목표가있는아이들 원장 매일경제신문 교육자문위원 (사)교육네트워크시선 기획국장']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('고희경 교수', ARRAY['2018년 환경재단 LG생활건강 내츄럴 뷰티크리에이터 / 2018년 미시즈퍼스트뷰티월드 미시즈아오란 상 수상 / 2018년 아시아왕홍슈퍼챌린지 파이널토너먼트 / 2019년 한국관광공사 웰니스관광콘텐츠 기획제작 / 2020년 국립생태원 생태지기 활동 / 2021년 환경재단XGS샵 에코크리에이터 전문가팀 / 2022년 산림복지 국민참여콘텐츠 공무전 장려상 수상 / 2023년 구리시 갈매동 복지특화사업 선정 및 다양한 치유프로그램']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('공유진/심소현 교수', ARRAY['[ 소속 ] ( 공유진 교수 ) 한국강사코칭센터 대표 플레이푸드아트 대표 주) 라비아항공아카데미 교육담당 주) 니카 성공책쓰기플러스 강사교육팀장 한국정리코칭연구소 강사교육자문위원 한국마케팅코칭센터 강사교육분과위원 사) 한국조리사회중앙회 경기도지회 이사임원 ( 심소현 교수 ) 요리쿡아트쿡 대표 한국강사코칭센터 플레이푸드아트센터 총괄실장 사)한국조리사회중앙회 경기도지회 이사회임원 사)한국조리사회중앙회 경기도지회 아동요리/방과후지도자 강사 한국정리코칭연구소 식습관정리코치', '[ 학력 및 전공 ] ( 공유진 교수 ) 경희대 교육대학원 평생교육학전공 ( 심수현 교수 ) 식품가공조리 전공']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('권지선 교수', ARRAY['[ 소속 ] 한국직업능력검정협회 전문강사 동화구연지도 전문가 과정수료 동화구연 직무교육 전임강사) 손유희지도 전문가 손유희지도사 직무교육 전임강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김교옥 교수', ARRAY['[ 소속 ] 한국색채학회 정회원 한국직업능력검정협회 아동미술 전문 강사 디딤에듀원격평생교육원 아동미술 강사 한국민간자격개발원 아동미술, 색채심리 대표강사 및 자격심사위원 JJ컬러리스트 운영 컬리리스트 기사자격취득 아동미술 기사자격취득 전)방배동 수목미술교습소 운영 전)삼성출판사 미술 특기강사 한국유아교사연수원 아동미술 강사 부천인라이프 평새교육원 아동미술 강사 서울교육문화센터 아동미술 강사', '[ 학력 및 전공 ] 홍익대학교 색채전공 석사 대한교육개발평가원 아동미술지도사 과정 교수 한국자격평가협회 아동미술지도사 과정 교수']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김대영 교수', ARRAY['[ 소속 ] 前 광운대학교 외래강사 前 두원공과대학교 겸임교수']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김보미 교수', ARRAY['[ 소속 ] 명강사 경진대회 대상 수상 시니어교육플래너 협동조합 객원교수 대한민국 축복봉사단 설립대표 성공사관학교 자원봉사지도교수 한국자살예방센터 구리남양주 지회장 사)한국저출산협회 중앙회교육국장 구리시지부회장 글로벌 융합복지학회 정회원 2021년 대한민국 문화교육대상', '[ 학력 및 전공 ] 광운대 경영대학원 석사졸업 중앙대 행정대학원 표준고위과정 수료 고려대 평생교육원 명강사 최고위과정수료']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김선주 교수', ARRAY['[ 소속 ] namist 독서/학습코칭센터 자기주도학습, 포트폴리오 강의(학습코칭) 한국진로협회 자기주도학습 강의(자기주도학습지도사1,2급 지도사) 아침교육연구소 입학사정관 포트폴리오 연구 충남 청운대학교 평생교육원 자기주도학습 강의(방과후지도사1,2급 지도사) (주)교원 입학사정관 포트폴리오 멘토링', '[ 학력 및 전공 ] 가천대학교 대학원']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김성구 교수', ARRAY['[ 소속 ] 광주대학교 평생교육원 강사 전라북도 지역 다문화복지상담사 자격연수 부산여자대학교 사회복지재활과 자격연수 전난도립대학교 사회복지학과 자격인수 강원도 고성군청 다문화 자격연수 광신대학교 다문화연구소 자격연수 익산원광자활센터 직원연수 대한신학대학원 대학교 겸임교수', '[ 학력 및 전공 ] 대한신학대학원대학교 철학박사(사회복지학) 초당대학교 산업대학원 행정학 석사(사회복지학과) 초당대학교 행정학사(아동복지학과) 한국복지사이버대학 독도학과(독도전문학사)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김시혜 교수', ARRAY['[ 소속 ] 한국인재능력개발원 전문강사 한국직업능력검정협회 편집총괄 한국직업능력검정협회 컨텐츠개발팀 전 교육과사람들 교육운영위원', '[ 학력 및 전공 ] 천안대학교 Social Welfare Studies 한국방송통신대 교육학과 사회복지사2급 보육교사2급 평생교육사2급 건강가정사 베이비시터 1급']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김유인 교수', ARRAY['[ 소속 ] 한국직업능력검정협회 간병사 강사', '[ 학력 및 전공 ] 숭의여자대학교 Major in Nursing 간호사 Clinical Experience']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김진옥 교수', ARRAY['[ 소속 ] 종이접기 사범 자격취득 색종이접기 지도사범 자격취득 가베월드 교육부 전문 강사 가베월드평생교육원 종이접기 전임강사 노원자활센터 색종이접기 강의 행복미래센터 색종이접기 강의 고양실버인력뱅크 종이접기 강의 도봉자활센터 색종이접기 강의 밀알학교 종이접기 강의 각급 어린이집, 평생교육원, 문화센터 강사', '[ 학력 및 전공 ] 기술경영(MOT) 전공, 박사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김철희 교수', '{}'::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('김태훈 교수', ARRAY['[ 학력 및 전공 ] 자동차학과 전공', '[ 기술 및 경력 ] 광택 복원(스크래치 제거, 페인트 교정) 프리미엄 코팅(세라믹·유리 코팅 시공) PPF 시공 및 관리', '[ 강의분야 ] 자동차 구조 및 기본 원리 엔진·섀시 기초 이해 자동차 안전 및 기본 점검']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('남기희 교수', ARRAY['[ 소속 ] 사)한국청소년 미술협회이사 사)한국미술협회 미술교육위원 광진 미술협회 부회장 한국 모던 아트작가회 명예회장 실버목지 미술연구회 자문위원 동서울대학 평생교육원강사 영등포 여성센터. 동대문 여성센터(아동. 실버, 심리 미술강사) 사) 한국조리사회중앙회 경기도지회 이사임원 힐 감성 미술연구소 대표( Art Director)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('노성신 교수', ARRAY['[ 소속 ] 가천대/세명대/강원대 간호학과 외래교수 성모병원/강원대학교병원/경희의료원 강사', '[ 학력 및 전공 ] 연세대학교 간호학과졸업 연세대학교 간호대학원 석사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('노성운 교수', ARRAY['[ 소속 ] 유튜브크리에이터 강서구청 센터장']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('박성우 교수', ARRAY['[ 소속 ] 내무부 중앙민방위학교, 내무부 지방행정연수원 교수 행정자치부 국립방재교육연구원 교수 (前)국가민방위재난안전교육원 수석교수 호서대학교 외래 및 겸임교수 백석대학교 외래교수 남서울대학교 외래교수 수마와 싸운 사람들(2006)', '[ 학력 및 전공 ] 호서대학교 대학원 철학과 문학석사 원광대학교 대학원 절학과 철학박사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('박수진 교수', ARRAY['[ 소속 ] 송파구재가복지연합회 실무자 교육 마천청소년 수련과 학부모 교육 중앙자활센터 실무자 보수교육 서울사회복지사협의회 보수교육 서울지방경찰청 2기동단, 특전사 교육 동화신경정신과의원 상담교사 용인시 정신보건센터, 송파정신건강증진센터 상담 한양여대, 서일대 강의 출강', '[ 학력 및 전공 ] 서울여자대학교 사회복지 석사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('박신덕 교수', ARRAY['[ 소속 ] 1강 박신덕 강사 전) 기업체 영업교육팀 근무 1강 박신덕 강사 현) 한국인지학습개발원 대표 1강 박신덕 강사 현) 한국시니어교육센터 연구소장 2강 안승종 강사 전) 대한응급구조사협회 인천지회장 2강 안승종 강사 전) 한아름병원 기획실장 2강 안승종 강사 현) 가천대학교 장학재단 이사 2강 안승종 강사 현) 한국심폐소생술교육원 대표 3강 장영미 교수 현) ㈜한국시니어교육센터 대표 3강 장영미 교수 현) 인지 치매 건강 전문 강사 3강 장영미 교수 현) 강사 양성 전문 트레이너 3강 장영미 교수 현) 노인심리 상담사 현 대화기술, 감정 코칭,인인성 전문 강사 3강 장영미 교수 베이비 맘 & 베스트 맘 저자 3강 장영미 교수 전) 유아교육기관 원장 24년 3강 장영미 교수 전) 인천대학교 평생교육원 강사', '[ 학력 및 전공 ] 1강 박신덕 강사 아주대 경영대학원 졸업 2강 안승종 강사 가천길대학 응급구조과 졸업 3강 장영미 교수 인하대학교 교육대학원 석사 졸업 3강 장영미 교수 서울대학교 웰 웨이징 시니어산업과정 수료']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('박영수 교수', ARRAY['[ 소속 ] 現 집합건물관리사 교육원 원장 (3년차) 前 한국종합관리(주) 운영본부장 (15년) 前 서울시 강남구 대형 오피스텔 관리소장 (8년) 총 26년간 집합건물 관리 현장 경험 주택관리사 (건설교통부) 건물관리사 (행정안전부) 시설관리공단 인증 전문강사 집합건물관리 마스터 과정 수료', '[ 전문 분야 ] 오피스텔, 상가, 지식산업센터 관리 실무 집합건물 관련 법령 해석 및 적용 관리단 운영 및 분쟁 조정 관리비 회계 및 세무 처리']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('박주연 교수', ARRAY['[ 소속 ] 정리수납전문가 강의 정리수납 컨설턴트 공간크리에이터/홈스타일링 리빙/생활가전 전문 쇼호스트 정리수납과 심리학 강의 우리집 퍼스널컬러 강의 정리수납 블로그 운영 창업, 창직, 취업면접 강의 음악과 소비심리의 관계', '[ 학력 및 전공 ] 명지대학교 졸업']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('박혜선 교수', ARRAY['[ 소속 ] 대구경북 지역아동센터 지원단 아동복지교사 교육강사 경향신문 문화센터, 안상여성비전센터, 은평건강가정지원센터, KCEM, 부천여성회관 외 다수 강사 이화여자대학교 평생교육원 강사 예원교육심리상담센터 심리상담사 유방암 환우를 위한 힐링 갤러리 Therapist 한국리딩아트 협회 부회장', '[ 학력 및 전공 ] 숙명여자대학교 교육대학원 교육심리 석사 한국외국어대학교 스페인어 전공, 교육학 부전공 학사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('선영학 교수', ARRAY['[ 소속 ] 동양대학교 초빙교수 8년 역임 에듀윌 교육학 강의 서울 노량진, 종로, 영등포, 강남 고시학원 오프라인 강의 (사회, 교육학, 사회복지학, 유통관리사, 직업상담학, 명리학 강의) 교육개발원, 교육닷컴, 한국인재개발원 강의 EBS온라인 강의 에듀피디 공무직 강의', '[ 학력 및 전공 ] 전남대 사범대 졸업 동양대학교 문화,역사,법학 석사', '[선영학 참교육학(개론) Final 동형 실전모의고사] - 한림당', '[Why 교육학 단원별 기출문제집] - 서울곡시각', '[고시연구원 종합교양상식] - 고시연구원']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('안성운 교수', ARRAY['[ 소속 ] 뽀로로 얼음나라 환상 체험전 기획 / 운영 뽀로로 숲 속 마을 축제 기획 / 운영 벅스바이블 어드벤쳐 기획 / 운영 한국인터넷진흥원 ‘좋아요 인터넷!’ 전국 130개 유치원 인형극 공연 웨스틴조선호텔 어린이날 매직컬공연 ‘가스파드&리사_어른들은 몰라요!’ 기획/연출 교원 북캠프 인형극 공연 (교원 도고 연수원 . 교원 경주 연수원) 한국정보화진흥원 ‘바른인터넷유아학교’ 전국 200개 유치원 인형극 공연 강남구 유치원 인형극을 통한 바름 인성교육 ‘노리야기’ 수업 계약 한양여자대학교 아동복지학과 인형극 공연 강사 한국정보화진흥원 ‘바른인터넷유아학교’ 전국 100개 유치원 인형극 공연 현 바름창의인성교육 대표']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('안정미 교수', ARRAY['[ 소속 ] 안정미연구소(화장품기획/제조) 대표 다눔에듀 대표 국민강사교육협회 대표강사 2015 지방기능경기대회 피부미용 금메달리스트 지방기능경기대회 뷰티테라피 심사장 전국기능경기대회 뷰티테라피 심사위원 NCS 일학습병행 헤어/네이아트/피부미용 심사위원 현) 미용교육협회 KOSCA 대전 지사장 현) 아름다움바이오 협동조합 이사장 현) 대전시평생학습원 아로마테라피 전임강사 현) KT 서비스남부센터 사외강사 전) 영뷰티 토탈미용샵 원장', '[ 학력 및 전공 ] 현) 대전대학교평생교육원 교수 충청대 의료미용학 학사 고려대학교대학원 경영학 석사 대전대학교대학원 미용 보건학 박사 과정 중']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('양순주 교수', ARRAY['[ 소속 ] 가천길대학(외래교수) 인하대병원(고객관리, CS강사) 마코스아카데미(강사)', '[ 학력 및 전공 ] 가천의과대학교 병원경영학 석사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('여상준 교수', ARRAY['[ 소속 ] 전) 법무법인 백범 민사사무장 전) 법무법인 선우 경매팀장 전) 주식회사 더코아 대표이사 현) 마믈홀딩스 주식회사, 몸에좋은부동산 대표', '[ 학력 및 전공 ] 한국외국어대학교 법학과 졸업']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('오지현 교수', ARRAY['>', '[ 전공 ] 서울여자대학교 아동교육심리학과) 숙명여자대학교 아동복지학 아동심리치료 석사 숙명여자대학교 아동복지학 아동심리치료 문학박사 한국폴리텍 평생교육원 외래교수 및 그 외 경력 다수']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('오화랑 교수', ARRAY['[ 소속 ] KB금융손해보험/고객지원실 CS강사 산업통상자원부 KOSTI/교육기획실 교육연구원 파트너 강의/방송진행 삼성전자로지텍/인재개발그룹 CS강사 미국 K-RADIO/보도국 아나운서 NH농협중앙회/상호금융마케팅교육팀 삼성전자/B2C강사팀 탑교육문화원/교육팀강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이경미 교수', ARRAY['[ 소속 ] 브레이닝 클래스 보드게임 청주지사 (주)창의와 날개 방과후 학교 청주지사 코리아보드게임즈 모꼬지 협약센터 평생교육사 2급 가정복지사 부모교육책임지도사 게임놀이지도사 2급 보드게임지도사 마스터 창의융합사고력지도사 마스터 실버보드게임 마스터']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이금란 교수', ARRAY['[ 소속 ] CMS 영어교사 자격증 취득 前 한국산업기술대학교 전문강사 前 경인여자대학교 전문강사 前 호서대학교 및 안산시 평생교육원 전문강사 前 서울한영대학교 교수학습센터 연구원 現 강남대학교 교수학습센터 연구원', '[ 학력 및 전공 ] 영국 Manchester 기독교 교육학 학사 졸업 영국 Liverpool 대학원 기독교 교육학 석사 졸업) 아주대학교 일반대학원 교육학 박사 수료']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이기선 교수', ARRAY['[ 소속 ] 숲속아이술루 어린이집 원장 사이버 MBA 보육과정 교강사 유아정책연구소 학부모 대표, 세살마을 연구원', '[ 학력 및 전공 ] 강원대학교 아동학 학사(아동학) 가천대학교 유아교육 석사(유아교육) 가천대학교 유아교육 박사재학(유아교육)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이민태 교수', ARRAY['>', '[ 소속 ] 현 한국직업능력검정협회 기획본부장 현 사단법인 경기해양문화연맹 비서실장', '[ 학력 및 전공 ] 한양대학교 Hanyang University,2003']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이영은 교수', ARRAY['[ 소속 ] 숲속아이술루 어린이집 원장 사이버 MBA 보육과정 교강사 유아정책연구소 학부모 대표, 세살마을 연구원', '[ 학력 및 전공 ] 강원대학교 아동학 학사(아동학) 가천대학교 유아교육 석사(유아교육) 가천대학교 유아교육 박사재학(유아교육) 충남 청운대학교 평생교육원 자기주도학습 강의(방과후지도사1,2급 지도사)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이지혜 교수', ARRAY['>', '[ 소속 ] 한국직업능력검정협회 전문강사 부모상담 전문가 과정수료 부모상담 직무교육 전임강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('이화정 교수', '{}'::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('임미영 교수', ARRAY['[ 소속 ] 어린이 독서교실, 중학 논술교실 운영 Book & Network 콘텐츠기획 1팀 논술교재개발 실장 어린이 독서논술캠프 프로그램 및 창의적 독후활동 프로그램 기획 및 진행', '[ 학력 및 전공 ] 한국사이버대학교(현-숭실사이버대학교) 교육부 학사 서울예술대학교 문예창작 및 교육학 전공']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('장인숙 교수', ARRAY['[ 소속 ] ㈜에듀엔 ㈜교원 ㈜에스티유니타스 ㈜아이스크림에듀 ㈜웅진씽크빅', '[ 학력 및 전공 ] 동국대대학원 교육학 경희대학교 생물학']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('장재범 교수', ARRAY['[ 소속 ] 現 OCU 인공지능융합학과특임교수 現 한국브레인경영연구소 現 ㈜가람팀장 건축계획, 환경 ㈜설계마당연구원BIM(빌딩정보모델링) 경제역사기념재단인공지능 시대 기업가정신 서울벤처대학원인공지능 브레인트레이닝 최고위과정 인천 재능대학교 (과학창의재단 주관) SW AI 교육캠프 하남시 청소년수련관통계와 데이터 분석 전남청년창업사관학교디지털 트랜스포메이션과 기업혁신', '[ 학력 및 전공 ] 국제뇌교육종합대학원대학교박사수료 인하대학교 대학원석사건축대학원 인하대학교 공과대학공학사산업공학과']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('장현수 교수', ARRAY['[ 소속 ] 한국직업능력검정협회 전문강사 미술심리상담사 전문가 과정수료 미술심리상담 직무교육 전임강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('전성완 교수', ARRAY['[ 소속 ] UNIVERSITAT BOCHUM(독일) 호텔경영 밀레니엄 힐튼 호텔 식 음료 지배인 PADISSON EDWARDIAN HOTEL(런던) 총괄 매니저 조선호텔 MICE SALES MANAGER 역임 세계바리스타 챔피언 풀 바셋 공동 강의 진행 키프로스 코리아 총괄이사 역임 現, 경양신문 칼럼리스트 한국음료강사아카데미 대표이사', '[ 학력 및 전공 ] WSER(런던) DIPLOMA 취득 한국조리사관학교 식음료 학과장 역임']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('전유림 교수', ARRAY['[ 학력 및 전공 ] 수원여자대학교(사회복지학 전공) 국가평생교육진흥원(아동.가족전공, 심리학전공) 인천대학교대학원석사(사회복지학 전공) 성덕대학교(유아교유학 전공) 서울한영대학교대학원 박사졸업(사회복지학 전공)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('전현영 교수', ARRAY['[ 소속 ] 생활지원자 지도교수 한국직업능력검정협회 편집부 토브요양보호사 전임강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('전현영교수', ARRAY['[ 소속 ] 생활지원자 지도교수 한국직업능력검정협회 편집부 토브요양보호사 전임강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('정연서 교수', ARRAY['[ 소속 ] 브레이닝 클래스 보드게임 청주지사 (주)창의와 날개 방과후 학교 청주지사 코리아보드게임즈 모꼬지 협약센터 평생교육사 2급 가정복지사 부모교육책임지도사 게임놀이지도사 2급 보드게임지도사 마스터 창의융합사고력지도사 마스터 실버보드게임 마스터']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('정진숙 교수', ARRAY['[ 소속 ] 現 윈아트 대표 K-POP 기브콘서트 외부 미술 팀장 미술대전 심사위원', '[ 학력 및 전공 ] 디자인전공 홍익대 사회교육원 아동미술학과 수료', '[ 경력 ] 미술 실기교사 아동미술 교사자격증 취득 미술학원·유치원·언어스쿨 정교사 및 주임교사 돈암동 미술학원장 역임 퍼포먼스 미술 센터장 겸 놀이학교 원장 역임 유치원·문화센터 영유아 강좌 출강']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('정헌석 교수', ARRAY['[ 소속 ] 前 21세기 산업연구소 총괄팀장 前 세민디지털대학교 겸임교수 前 대구대학교 강사 前 대구공업대학교 강사 前 김천대학교 강사 前 (주)주경야독 인간공학기사/직업상담사/품질경영 강사 前 영남직업능력개발원 직업상담 강사', '[ 학력 및 전공 ] 대구대학교 산업공학과 학사 대구대학교 산업공학 인간공학전공 석사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('정혜숙 교수', ARRAY['[ 소속 ] 한국직업능력검정협회 전문강사 자기주도학습코치협회 협회장 자기주도학습코치 1급 지도자 HSJEONG']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('차주완 교수', ARRAY['[ 소속 ] 한국직업능력검정협회 전문강사 심리상담 전문가 과정수료 직무교육 전임강사 JWCHA']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('최연희 교수', ARRAY['[ 학력 및 전공 ] 수원여자대학교(사회복지학 전공) 국가평생교육진흥원(아동.가족전공, 심리학전공) 인천대학교대학원석사(사회복지학 전공) 성덕대학교(유아교유학 전공) 서울한영대학교대학원 박사졸업(사회복지학 전공)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('최철규 교수', ARRAY['[ 소속 ] 한양대 전기(부전공:안전)공학과 석사 직업훈련개발교사(소방,전기,방재안전분야) 강의경력 22년(강원대학교 외 6대학, (현)동원대학교 소방학과 겸임교수 대형소방학원 6급 안전교사', '[ 학력 및 전공 ] 전기기술사 재난안전지도사 산업안전기사 소방설비기사 대형소방학원 6급 안전교사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('허지영 교수', ARRAY['[ 소속 ] 아이엠 콘텐츠 교육 협동조합 대표 인하공전 생성형AI 자문교수 경기도민 생성형AI 강사 서울대학교 스타트업 숏폼강사 서울시 SBA 인스타그램 강사', '[ 강의 ] 이화여자대학교 인스타그램 릴스 마케팅 문화체육관광부·세종정부청사 삼성 현대해상', '[ 저서 ] 2시간만에 유튜브 크리에이터되기 돈 잘 버는 엄마들의 출근로드 엄마테크 인스타그램 릴스 마케팅 생성형 AI 숏폼 마케팅(출간예정)']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('황다설 교수', ARRAY['[ 소속 ] 現 현대종합동물병원 동물보건사/간호팀장 사단법인 한국동물보건사협회 상임 홍보이사 경복대학교 반려동물학과 겸임교수 前 24시 S동물병원 서울연희실용전문학교 외래교수 혜전대학교 외래교수', '[ 활동 ] 지자체 반려동물 및 코디네이터 실무 특강 연성대학교 동물병원코디네이터 hive사업 동물보건학과 다수 특강 및 동물보건 실무 웨비나 강의', '[ 저서 ] 동물병원코디네이터', '[ 자격 ] 2022 제1회 동물보건사 국가자격증 SMAT/CS/반려동물관리사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();
INSERT INTO public.professors (name, bio) VALUES ('황은실 교수', ARRAY['[ 소속 ] 한국직업교육평가개발원 강사 한국직업능력검정협회 산후관리사 강사']::text[])
  ON CONFLICT (name) WHERE deleted_at IS NULL
  DO UPDATE SET bio = EXCLUDED.bio, updated_at = now();

-- ──────────────────────────── 과정 상세 ────────────────────────────
-- CRS-KH-0001  ESG 경영평가사 1급
UPDATE public.courses SET
  hero_description  = 'ESG 경영평가사(Environment·Social·Governance Evaluator)는 기업이나 기관의 환경(E), 사회(S), 지배구조(G) 요소를 종합적으로 평가하여 조직이 지속가능한 경영을 실현하도록 진단·자문·교육하는 전문가입니다. 단순한 환경평가가 아니라, 환경보호, 사회적 책임, 윤리적 경영, 투명한 지배구조 등 기업의 비재무적 성과를 종합 분석하고, 지속가능경영 보고서 작성과 개선방안을 제시하는 역할을 담당합니다.',
  license_number    = '2024-001226',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '임직원 대상 ESG 의식 개선 및 실천 캠페인 운영', '정부, 지자체의 ESG 정책 사업 참여', '공공기관 ESG 경영평가 수행 및 평가기준 자문', '지역사회 ESG 인증제도·환경정책 연구 참여', 'ESG 보고서, 탄소중립 보고서, 사회책임경영 보고서 작성', '지속가능경영 평가기관 및 회계법인과 협업']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', 'ISO 26000, GRi 표준 기반 평가·인증 자료 관리', 'ESG 컨설팅 회사, 회계법인, 인증평가기관', '대기업 및 공공기관 ESG 담당 부서', '산업단지, 중소기업 지속가능경영 지원센터', '환경·사회적가치 관련 NGO 및 재단', 'ESG 교육강사, 지속가능경영 전문 강연가', '프리랜서 ESG 진단 및 평가 컨설턴트', '프리랜서 평가사, 지속가능경영전문가', 'ESG 교육 강의, 직무연수, 기관 워크숍 강사', 'ESG 콘텐츠 제작, 강연, 연구 분야 전문가']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '선영학 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0001';

-- CRS-KH-0002  ESG인증평가사
UPDATE public.courses SET
  hero_description  = 'ESG인증평가사란 기업의 비재무적 요소인 환경(Environmental), 사회(Social), 지배구조(Governance) 성과를 객관적으로 평가하고, 그 결과가 신뢰할 수 있는지 검증하여 인증을 부여하는 전문가를 말합니다. 과거에는 기업을 ''얼마나 돈을 잘 버는가(재무적 성과)''로만 평가했다면, 이제는 ''얼마나 착하고 투명하게 경영하는가''가 기업의 생존과 직결되는 시대가 되었습니다. ESG인증평가사는 바로 이 ''착한 경영''의 수준을 수치와 지표로 증명해 주는 역할을 합니다.',
  license_number    = '2026-000567',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['ESG·지속가능경영 분야 취업 및 커리어 전환 희망자', '기업 경영·기획·인사·CSR·IR 담당자', '공공기관, 지자체, 공기업 종사자', '컨설턴트, 회계·재무·경영 관련 종사자', 'ESG 트렌드와 미래 유망 직무에 관심 있는 일반인']::text[],
  career_paths      = ARRAY['ESG 펀드 매니저/애널리스트 ,금융권 리스크 심사역', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '제3자 검증 전문가, 공급망 실사 컨설턴트', 'ESG 경영팀/기획팀, IR(투자자 관계) 담당', '공공기관 ESG 평가위원,', '은행 여신 심사역, 자산운용사 ESG 펀드매니저, 증권사 ESG 애널리스트.', '대기업 ESG 경영팀, 수출 기업의 공급망 관리(SCM) 담당자, 지속가능경영 보고서 총괄자.', '회계법인 ESG 인증본부, 법무법인 ESG 센터, ESG 전문 컨설팅 펌의 시니어 컨설턴트.', '기획재정부 산하 공공기관 경영평가단, 지자체 ESG 지원센터 강사 및 심사원, 중소기업기술정보진흥원(TIPA) 컨설턴트.']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '정헌석 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0002';

-- CRS-KH-0003  SNS마케팅전문가
UPDATE public.courses SET
  hero_description  = 'SNS 마케팅 전문가는 인스타그램, 유튜브, 틱톡과 같은 사회관계망서비스(SNS)를 활용해 기업의 브랜드 가치를 높이고 제품 판매를 촉진하는 전략을 세우고 실행하는 전문가입니다. 단순히 게시물을 올리는 것을 넘어, 고객과 직접 소통하며 팬덤을 형성하는 ''브랜드의 얼굴'' 역할을 합니다. AI 기술의 비약적인 발전으로 인해, 전통적인 마케팅을 넘어 데이터 기반의 초개인화 마케팅을 수행하는 능력이 필수적으로 요구되고 있습니다.',
  license_number    = '2019-005119',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '릴스 제작, 위치 기반 타겟 광고', '퍼스널 브랜딩, 정보성 콘텐츠', '소셜 커뮤니케이션, 라이브 커머스, 캐릭터 브랜딩', '데이터 분석, AI 콘텐츠 생성, AI 이미지 생성', '1인 지식 창업가 및 전문직 (강사, 컨설턴트, 변호사 등)']::text[],
  career_paths      = ARRAY['ESG 펀드 매니저/애널리스트 ,금융권 리스크 심사역', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '대기업 마케팅팀, 전문 에이전시, AI 에듀테크 기업.', '이커머스 기업, 패션/뷰티 브랜드, 글로벌 직구 플랫폼.', '게임 회사, 연예 기획사, D2C(소비자 직거래) 브랜드, 멤버십 기반 스타트업.', '마케팅 컨설팅 펌, 데이터 분석 전문 기업, 테크 기반 스타트업.', 'AI 리터러시, 창의적 기획자.유통 감각의 데이터 분석자.']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0003';

-- CRS-KH-0004  가족상담사 1급
UPDATE public.courses SET
  hero_description  = '가족심리상담사는 개인 심리 접근의 한계와 가족의 문제를 해결하기 위해 발달하게 되었다. 가족체계이론 분야에서 훈련을 받는 전문가로 결혼, 부부, 가족체계의 맥락에서 정신장애와 정서장애를 진단하고 치료할 자격을 가진 정신건강전문가이다.',
  license_number    = '2021-001078',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['사회복지 전공자', '보육교사 전공자', '심리상담 이론에 관심 있는 자', '사회복지시설 종사자', '복지기관 종사자', '센터 종사자', '일반인', '학부모', '학생']::text[],
  career_paths      = ARRAY['가족상담사 전문 강사로 진출', '사회복지관 상담원, 사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '가정상담소 및 다양한 지원센터 등에서 가족상담사 전문강사로 진출', '각종 사회복지시설 및 교육기관 강사로 진출']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김성구 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0004';

-- CRS-KH-0005  간병사 1급
UPDATE public.courses SET
  hero_description  = '간병사는 홈케어서비스, 요양시설, 노인전용의료서비스산업,케어하우징,노인유치원 노인보호센터에서 노인을 대상으로 대면관계와 상담을 통해 일상생활의 부적응 문제를 해결하고 안정을 찾아갈 수 있도록 서비스를 제공하는 직무를 수행할 수 있습니다.',
  license_number    = '2012-0043',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['병원이나 요양기관 간병 업무로 취업을 희망하는 분', '가족을 직접 돌보기 위해 전문 간병 지식을 배우고 싶은 분', '요양보호사와 함께 돌봄 분야 자격을 확장하고 싶은 분', '사회복지 분야에서 실무 경험을 넓히고 싶은 예비 종사자', '정년퇴직 후 보람 있는 제2의 직업을 찾는 중장년층']::text[],
  career_paths      = ARRAY['간병사 전문 강사로 진출', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '노인복지관 ,실버타운 , 병원, 요양보호사관련기관, 요양병원, 노인상담센터']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김유인 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '대한자격개발원'),
  updated_at        = now()
WHERE code = 'CRS-KH-0005';

-- CRS-KH-0006  네일아트코디네이터 1급
UPDATE public.courses SET
  hero_description  = '네일아트코디네이터는 단순히 네일 시술만 하는 것이 아니라, 고객의 이미지와 트렌드에 맞는 네일 스타일을 기획·제안하고, 관리 및 운영까지 조율하는 전문가입니다. 네일아티스트의 기술과 더불어 고객 상담, 스타일링 제안, 매장 운영까지 폭넓은 역할을 수행합니다.',
  license_number    = '2019-005118',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '기타 전문직에서 퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '네일아트 제품 회사 관련 분야에 계신 분들', '제품 교육 강사 담당자', '방과 후 교사분', '네일아트에 관심이 많으신분']::text[],
  career_paths      = ARRAY['네일코디네이터, 전문뷰티살롱, 네일제품회사에듀케이터,', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '각급 학교(유치원,초,중,고교 및 대학교 등)', '교육강의, 뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트, 피부미용 컨설턴트', '헤어컨설턴트, 칼라리스트, 칼라테라피스트, 연예인 매니저', '토탈뷰티코디네이터, 화장품회사, 제품기획 및 교육강사, 토탈 뷰티학원강사, 뷰티전문지 기자, 뷰티에디터,', '피부관리실 피부과,에스테티션, 네일살롱, 발건강 관리실, 특수분장사', '이미지컨설턴트, 아로마테라피스트, 웨딩 스튜디오, 개인창업, 네일 제품개발, 뷰티 크리에이터']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0006';

-- CRS-KH-0007  노인돌봄생활지원사 1급
UPDATE public.courses SET
  hero_description  = '장기요양서비스 진입 전 단계의 노인 중 신체, 정신, 사회적으로 스스로 생활 어려운 사람에게 안전확인, 가사, 일상생활, 활동 지원, 서비스 연계 등 노인맞춤돌봄서비스를 제공하고 있습니다. 초고령사회로 진입함에 따라 노인돌봄서비스를 책임져줄 생활지원사가 점점 더 필요로 해지는 전망입니다.',
  license_number    = '2024-005430',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '기타 전문직에서 퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '노인전문 기관 전문 강사로 활동하시는 분', '사회복지사로 일하며 노인 케어에 대한 전문적 지식을 더 쌓고 싶은 분', '노인 봉사에 관심을 있거나 보다 전문적으로 활동하고 싶은 분', '노인돌봄생활지원사에 대한 전반적인 이해가 필요한 분']::text[],
  career_paths      = ARRAY['요양시설, 복지시설, 노인전문병원, 방문요양서비스, 요양보호사', '사설교육기관 강사 및 운영자,자원봉사자, 사회복지사, 노인유치원,정신건강센터 -교육관련 교사, 교육기관 임직원,구민회관, 사회복지관 상담원,노인회관종사자,교정시설 종사자', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '전현영교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0007';

-- CRS-KH-0008  노인심리상담사 1급
UPDATE public.courses SET
  hero_description  = '우리나라는 고령화 사회로 접어들면서 다양한 노인 문제가 발생하고 있습니다. 가장 심각한 노인문제로 빈곤, 질병, 고독, 무의라는 복합적 문제를 겪고 있는 것이 특징입니다. 이러한 문제를 해소하기 위하여 노인 스스로는 할 수 없는 영역들을 함께 풀어가고 도움을 줄 전문적인 인력을 위한 강의라고 할 수 있습니다.',
  license_number    = '2019-005117',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '기타 전문직에서 퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '노인전문 기관 전문 강사로 활동하시는 분', '사회복지사로 일하며 노인 케어에 대한 전문적 지식을 더 쌓고 싶은 분', '노인 봉사에 관심을 있거나 보다 전문적으로 활동하고 싶은 분', '노인심리상담사에 대한 전반적인 이해가 필요한 분']::text[],
  career_paths      = ARRAY['요양시설, 복지시설, 노인전문병원, 방문요양서비스, 요양보호사', '사설교육기관 강사 및 운영자,자원봉사자, 사회복지사, 노인유치원,정신건강센터 -교육관련 교사, 교육기관 임직원,구민회관, 사회복지관 상담원,노인회관종사자,교정시설 종사자', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김철희 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0008';

-- CRS-KH-0009  다문화심리상담사 1급
UPDATE public.courses SET
  hero_description  = '더불어 소통하는 교육을 이끌어 가는 본 교육원에서는 사회 구성원들이 인종적, 계층적, 민족적으로 여러관점의 다양한 구성원의 욕구를 충족시키기 위한 평등(Equality), 다양성 내의 통합(Unity Within Diversity), 정의(Justice for all)를 중시하는 민주주의적인 교육의 실천을 위한 상담과정입니다.',
  license_number    = '2018-000693',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '국가 공인 관련자격(사회복지사, 건강가정사, 임상 심리상담사 등) 검정 제도와 연계 운영하시는분', '사복지시설 및 기관, 종교단체, 병원, 민간단체. 건강가정지원센타 및 다문화가정지원센터', '국가기관, 각지역 민?관 다문화상담사. 상담기관.', '다문화가정시설. 아동상담센터, 외국인노동자인권센터, 아동상담센터, 가정상담센터,', '가정상담소. 심리연구소, 심리상담소. 초.중.고.선생님']::text[],
  career_paths      = ARRAY['다문화 지원 정부기관, 다문화 지원 정부기관, 학교 다문화 연구센터, 지방자치단체 다문화관련부서', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '사회복지시설에서 상담사로 활동', '대학교 다문화. 교환학생 교육센터,민간단체 및 사회봉사단체, 문화교류단체, 병원.종교', '다문화 아동, 다문화 청소년상담센터에서 상담 및 교육담당가로 활동', '학교 내 다문화상담센터,사회복지기관, 건강가정지원센터, 지역아동센터,', '결혼이민자가족지원센터. 이주여성인권센터, 외국인. 다문화상담소.복지시설.다문화가족지원센터', '탈북인권단체, 청소년지원센터. 방과후교실지도사.개인및 합동 다문화가정 방문 프리랜서상담 관리사', '위기가족지원센터, 시.군,구,읍면동 및 문화의 집 등 공공문화시설의 교강사', '주민센터,여성의집. 사회복지시설의 문화전파자.기타 문화예술관련 단체의 프로그램 개발,연구,보급']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김성구 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0009';

-- CRS-KH-0010  데이터라벨러 1급
UPDATE public.courses SET
  hero_description  = '데이터라벨러(Data Labeler)는 AI(인공지능) 모델이 학습할 수 있도록 이미지, 영상, 음성, 텍스트 등 다양한 데이터를 분류·표시·주석(Annotation) 하는 AI데이터 정제 전문가입니다. AI가 세상을 인식하는 기준을 만드는 사람, 데이터의 품질을 통해 인공지능의 정확도를 결정짓는 AI 산업의 기초 설계자(Architect of AI Learning) 입니다.',
  license_number    = '2025-000304',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '텍스트 라벨링 (감정분류, 키워드태깅, 문맥분류 등)', '음성·대화데이터 라벨링 (음성인식, 감정분석, 명령구분 등)', '라벨링 데이터의 정확도 검수(QA)', '오류수정, 일관성 검사, 데이터 보완', 'AI 학습용 데이터 품질평가 보고서 작성', '공공데이터 구축사업 참여 및 팀프로젝트 수행', '초·중급 라벨러 교육 및 품질검수 교육 지도']::text[],
  career_paths      = ARRAY['기업·기관 대상 데이터라벨링 교육 진행', '인공지능(AI) 개발기업, 데이터플랫폼기업', '정부·공공기관 데이터댐 구축사업', '빅데이터 분석기관, AI데이터가공센터', '클라우드소싱 플랫폼 (크라우드웍스, 오피스밸류, 에어클래스 등)', 'AI교육기관, 디지털인재양성사업 강사', '프리랜서 데이터라벨러, 품질검수자, 데이터매니저', '기업의 AI모델 학습데이터 구축 및 품질관리', 'AI개발 전단계 데이터셋 구축 필수 역할 담당', '정부 공공데이터 개방 및 디지털일자리 프로젝트', '지자체 및 공공기관 데이터 표준화·품질관리 업무 수행', '공공데이터 플랫폼 구축 및 관리', 'AI입문, 데이터분류 실습교육 과정 개발 강사', '연구소, 대학, AI기업 연구데이터 구축 실무 담당', '프리랜서 데이터라벨러로 온라인 프로젝트', '데이터가공업체 창업, 플랫폼 협력사업 운영', '원격 근무 및 재택형 디지털 직업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '장재범 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0010';

-- CRS-KH-0011  도시농업전문가 1급
UPDATE public.courses SET
  hero_description  = '도시농업전문가는 삭막한 도시 환경 속에서 농업의 가치를 되살리고, 시민들이 농사 활동에 참여할 수 있도록 돕는 전문가입니다. 이들은 텃밭, 옥상, 베란다 등 도시의 자투리 공간을 활용하여 생명을 키우는 방법을 교육하고, 관련 프로그램을 기획 및 운영하는 역할을 합니다.',
  license_number    = '2025-004857',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '정책·컨설턴트, 지자체·기관의 도시농업 정책 기획 및 자문', '학교 교육(교과 융합형 농업 수업, 자유학기제 체험)', '평생교육원, 문화센터, 주민자치센터 강사, 스마트팜, 수경재배, 실내농업 창업', '노인복지관, 장애인시설, 병원 등에서 원예치유·도시농업 프로그램 운영', '아동·청소년 심리치유, 정서 지원 활동, 도시재생, 친환경 캠페인, 공동체 정원 운영', '지자체 도시농업 정책 기획 및 실무, 도시농업 교육·체험 농장 운영']::text[],
  career_paths      = ARRAY['지자체 도시농업센터, 농업기술센터, 교육기관, 평생교육원, 복지기관', '환경 NGO, 도시재생 프로젝트, 도시농업 교육·체험장, 치유농업 센터 창업', '스마트팜, 실내농업, 친환경 농산물 유통 사업,', '유튜브·온라인 강의 등 1인 도시농업 전문가 활동', '온라인 도시농업 교육 콘텐츠 제작']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0011';

-- CRS-KH-0012  독서논술지도사 1급
UPDATE public.courses SET
  hero_description  = '독서논술지도사는 아동·청소년·성인을 대상으로 독서를 통해 사고력, 비판력, 표현력, 창의력을 길러주는 교육 전문가입니다. ‘책을 읽고 글을 쓰는’ 것이 아니라, 읽기(Reading), 생각하기(Thinking), 표현하기(Writing)의 과정을 체계적으로 지도하여 학습 능력과 인성 발달을 함께 이끄는 종합 사고력 지도 전문가입니다..',
  license_number    = '2019-0057',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '교재 개발 및 창의 글쓰기·토론 프로그램 운영', '성인 독서토론·에세이 글쓰기 강좌 운영', '부모 독서코칭, 독서교육법 프로그램 진행', '독서치료·인문학 독서 모임 지도', '독서 + 토론 + 글쓰기 융합 교육 운영', 'STEAM(융합형 사고력) 교육과 연계한 창의 논술 지도']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '디지털 시대 독서습관·정보활용능력 향상 교육 강사', '초·중·고 방과후학교 및 평생교육기관 강사', '독서논술전문학원, 공부방, 홈스쿨 교사', '문화센터, 도서관, 복지관 독서지도 강사', '독서코칭 전문가, 진로·학습 코디네이터', '프리랜서 독서논술 프로그램 운영자', '교재 개발, 콘텐츠 강의, 온라인 클래스 운영 등 부업·창업', '독서논술 교습소, 독서클럽, 온라인 수업 창업', '인성교육, 정서치유 프로그램 강사', '교과 연계 독서교육, 국어·논술 수업 강사']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '임미영 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0012';

-- CRS-KH-0013  독서심리상담사 1급
UPDATE public.courses SET
  hero_description  = '‘책 한권이 사람의 미래를 바꿉니다.’ ‘올바른 독서습관은 아이의 10년을 좌우합니다.’ 모두 올바른 독서습관에 대한 이야기 입니다. 독서심리상담사는 아동과 청소년의 창조적인 독서 훈련과 올바른 도서 습관 습득에 관한학습상담과 지도를 해주는 상담사입니다. 특히 바른 독서 생활을 통해 아동과 청소년의 심성을 바르게 성장시키고 올바른 가치관으로 성숙한 인성을 갖도록 도와줍니다.',
  license_number    = '2020-003902',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '자기분석을 통해 내적인 성장을 원하는 분분', '유치원 및 어린이집교사,초,중, 고등학교 교사', '지역아동센터 교사,사회복지시설 종사자,복지기관 종사자,센터 종사자,', '초등학교 및 교육관련 학원교사,방과후 교사,일반인, 학부모, 학생', '내 아이의 독서습관교육,학습운영자 및 학습지교사, 방과후 공부방 교사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '독서클럽, 글짓기 교실 등 운영, 독서논술학원 등 일반학원 강사로 활동', '대학교 다문화. 교환학생 교육센터,민간단체 및 사회봉사단체, 문화교류단체, 병원.종교', '구청, 문화터 전문강사, 홈스쿨 창업, 도서대여 업체 지도교사,', '출판관련 업체 연구원, 독서관련단체 연구원 및 전문강사,공공도서관,노인회관 종사하시는 분', '초, 중, 고등학교 독서논술지도사,교육기관, 사회복지기관 등에서 독서논술지도사', '독서교육기관, 문화센터 독서논술 지도사 , 사립 및 국립 도서관,교정시설 종사하시는 분']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '박혜선 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0013';

-- CRS-KH-0014  독서지도사 1급
UPDATE public.courses SET
  hero_description  = '독서지도사는 아동·청소년·성인을 대상으로 독서를 통해 사고력, 표현력, 이해력, 인성 및 창의력을 함양하도록 지도하는 독서교육 전문 지도자입니다. 책을 읽히는 것이 아니라, 독서를 통해 사고를 확장하고,사고를 글과 말로 표현하게 하며, 학습 능력과 인성 발달을 동시에 돕는 독서 코칭 전문가입니다.',
  license_number    = '2020-001735',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '지역 독서문화 확산 캠페인 기획 및 운영', '독서지도 전문학원, 공부방, 독서클럽 교사로 활동', '독서습관 형성, 독후활동, 창의적 사고력 훈련 지도', '교재 개발 및 자체 프로그램 기획 운영', '독서와 글쓰기, 토론, 미술, 연극 등을 융합한 활동 지도', '디지털 독서(전자책·온라인 독서활동) 지도']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '진로 탐색, 자기계발 중심의 독서 프로그램 운영', '평생교육기관, 도서관, 복지관 독서강사', '독서논술학원, 독서클럽, 홈스쿨 교사', '지역 독서문화센터, 공공도서관 프로그램 운영자', '프리랜서 독서코치 및 독서교육 콘텐츠 개발자', '성인·시니어 대상 자기성찰형 독서프로그램 강사', '도서관·복지관·지자체 평생학습사업', '주민자치센터, 시니어대학 등에서도 활동 강사', '교재·워크북 개발, 독서교육 콘텐츠 제작자', '독서지도 교습소, 독서클럽, 독서 코칭센터 창업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '임미영 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0014';

-- CRS-KH-0015  동화구연지도사 1급
UPDATE public.courses SET
  hero_description  = '구연이란 문서에 의하지 않고 입으로 사연을 말하는 것이며 동화구연이란 눈으로 보는 언어를 귀로 듣는 언어로 바꾸어 동화를 감상하는 것이다. 아동에게는 동화를 읽어주는 것보다 구연하여 들려주는 것이 더욱 효과적이기 때문에 아이들과 생활할 때 활용하면 유익하다. 동화구연 지도사과정은 그림책 읽어주기와 매체를 활용한 동화구연 시 동화 속 인물의 목소리, 감정, 느낌표현 등 화술을 집중적으로 다루고 있으며 교구를 활용하는 방법과 수업계획안의 작성, 활용안, 교구제작방법 등 동화구연과 관련된 전문적인 내용을 쉽고 재미있게 풀었으며 다양한 동화구연 교구를 활용하여 교구의 종류와 손유희 표현법 등도 함께 배울 수 있다.',
  license_number    = '2019-005720',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '요양시설등 동화구연 & 손유희 강사, 아이들과 함께 동화책을 읽어주고 싶은 분', '유치원 및 어린이집교사,초,중, 고등학교 교사', '각 교육원, 원격평생교육원 등 동화구연 & 손유희강사,동화구연 & 손유희 강사', '프리랜서강사, 동화구연 & 손유희 강사 자원봉사자, 노인유치원', '초등학교 및 교육관련 학원교사, 방과후 교사, 일반인, 학부모 ,학생유아교육기관']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '원격평생교육원 등 동화구연 & 손유희강사,동화구연 & 손유희 강사 , 프리랜서강사', '동화구연 & 손유희 강사 자원봉사자, 노인유치원', '구청, 문화터 전문강사, 홈스쿨 창업, 사회복지기관등의 동화구연 교사', '유치원 및 어린이집교사,초, 중, 고등학교, 지역아동센터 교사, 프리랜서강사로 활동을 원하는 분', '사회복지시설종사자, 복지기관종사자, 센터종사자,초등학교 및 교육관련 학원교사, 방과후 교사', '일반인, 학부모 ,학생유아교육기관, 사회보지기관등의 동화구연 교사']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '권지선 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0015';

-- CRS-KH-0016  디지털리터러시지도사 1급
UPDATE public.courses SET
  hero_description  = '디지털리터러시지도사는 디지털 사회에서 필요한 정보 활용 능력, 비판적 사고, 윤리적 소통 능력을 교육하고 지도하는 전문가입니다. 컴퓨터나 스마트폰을 사용하는 방법이 아니라, 정보를 찾고(Search), 분석하고(Analyze), 판단하고(Judge), 표현하는(Create) 능력을 길러주는 디지털 시민교육 전문가입니다.',
  license_number    = '2024-005102',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '디지털 정보 격차 해소 및 온라인 생활교육 프로그램 운영', '사내 디지털 전환(DX) 교육 및 협업툴 활용 지도', '정보보안, 온라인 커뮤니케이션, 데이터 윤리 교육', '직원 대상 디지털 생산성 향상 프로그램 기획', '미디어 리터러시, AI 리터러시, 데이터 리터러시 교육', '가짜뉴스, 사이버폭력, 개인정보보호 캠페인 운영']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '온라인 공익콘텐츠 제작, 디지털 시민성 프로젝트 운영', '초·중·고 방과후학교, 평생교육기관 강사', '디지털 문해교육 강사(지자체, 공공기관, 도서관 등)', '미디어교육 전문강사, AI·데이터 리터러시 교육자', '기업 사내 교육강사, 공공기관 디지털 정책교육 담당', '교사, 상담사, 평생교육사, 사회복지사 등의 디지털 역량 전문강사', '학교폭력·사이버폭력 예방교육과 연계 강사', '온라인 윤리 및 개인정보 보호 캠페인 활동 강사', '1인 교육 창업(스마트폰·SNS·AI 기초교육)', '온라인 강의, 유튜브 교육, 블로그 콘텐츠 제작']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '박주연 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0016';

-- CRS-KH-0017  디지털중독예방지도사 1급
UPDATE public.courses SET
  hero_description  = '디지털중독예방지도사는 스마트폰, 인터넷, 게임, SNS 등 디지털 기기의 과의존으로부터 개인의 심리·행동적 균형을 회복하도록 돕고, 건강한 디지털 사용습관을 형성하도록 지도하는 전문가입니다. 즉, 단순한 사용 제한 교육이 아니라 예방 교육 + 심리 이해 + 행동 교정 + 상담 지원 을 종합적으로 다루는 디지털 웰빙(Digital Well-being) 전문 지도사입니다.',
  license_number    = '2023-003469',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '중독 예방 캠프, 디지털 디톡스 워크숍 운영', '지자체·청소년상담복지센터·도서관 등에서 예방 프로그램 운영', '취약계층·시니어 대상 디지털 균형생활 교육', '지역사회 디지털안전 및 미디어윤리 캠페인 기획', '기업 직원 대상 스마트워크·디지털 피로 예방교육', '직장인 디지털 번아웃 예방, 온라인 시간 관리 프로그램 운영']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '온라인 의존 예방을 위한 조직문화 개선 컨설팅', '초·중·고등학교, 청소년상담센터, 지역아동센터', '평생교육기관, 복지관, 도서관, 지자체 교육사업', '중독예방상담사, 심리상담사, 청소년지도사 등 관련 직종 연계', '공공기관·기업체 대상 디지털 웰빙교육 강사', '프리랜서 예방강사 및 캠프 기획자', '학생, 학부모, 교사를 대상으로 한 예방교육 및 사례 지도 강사', '학교폭력·사이버폭력 예방교육과 연계 강사', '중독 예방 및 회복 단계별 상담 지도 강사', '온라인 강의, 유튜브 콘텐츠 제작, 캠프 프로그램 기획']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김보미 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0017';

-- CRS-KH-0018  마케팅기획전문가
UPDATE public.courses SET
  hero_description  = '마케팅기획전문가는 시장과 소비자 분석을 통해 제품이나 서비스의 판매 전략을 수립하고 효과적인 마케팅 활동을 기획·운영하는 전문가를 말합니다. 시장 조사, 브랜드 전략 수립, 홍보 및 광고 기획, 온라인 마케팅 운영 등을 통해 기업의 경쟁력을 높이고 매출 증대와 브랜드 가치를 향상시키는 역할을 수행합니다.',
  license_number    = '2021-001834',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '제품·서비스를 효과적으로 홍보하고 매출을 높이고 싶은 분', '광고, 브랜딩, 고객 유입 전략이 필요한 분', '체계적인 마케팅 기획과 실행 역량을 강화하고 싶은 분', '팔로워 증가와 수익화를 위한 전략을 배우고 싶은 분', '마케팅 직무로 취업하거나 커리어를 확장하고 싶은 분', '시장 분석부터 상품 기획, 브랜딩까지 역량을 키우고 싶은 분']::text[],
  career_paths      = ARRAY['마케팅기획 전문가 (기업/대행사), 디지털 마케팅 전문가 (SNS, 광고 운영 등)', '퍼포먼스 마케터 (광고 데이터 분석 및 최적화), 브랜드 매니저 및 브랜딩 전문가', '콘텐츠 마케터 및 크리에이터, SNS 마케팅 전문가 (인스타, 유튜브 등)', '온라인 쇼핑몰 및 스마트스토어 운영자, 마케팅 컨설턴트 및 전략 기획자', '광고대행사 및 마케팅 에이전시 창업, 스타트업 마케팅 담당자', '기업 홍보(PR) 및 커뮤니케이션 전문가, 데이터 기반 마케팅 분석가', '글로벌 마케팅 및 해외시장 진출 전문가, 인플루언서 및 개인 브랜드 운영자', '마케팅 교육 강사 및 온라인 강의 제작자, 제품 및 서비스 기획자 (PM/기획자)', '이커머스 마케팅 전문가, 이벤트 및 프로모션 기획 전문가', 'CRM(고객관리) 및 고객경험(CX) 전문가, AI 기반 마케팅 및 자동화 전문가']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0018';

-- CRS-KH-0019  메이크업코디네이터 1급
UPDATE public.courses SET
  hero_description  = '메이크업코디네이터는 고객의 얼굴형, 피부톤, 이미지, 목적(웨딩, 방송, 면접 등)에 맞춰 맞춤형 메이크업을 기획하고 연출하며, 스타일링 전반을 조율하는 전문가입니다. 단순히 화장을 해주는 메이크업 아티스트를 넘어 이미지 분석, 제품 선택, 상담, 서비스 운영까지 폭넓게 관여합니다.',
  license_number    = '2019-005116',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트, 피부미용 컨설턴트', '헤어컨설턴트, 칼라리스트, 칼라테라피스트, 연예인 매니저, 토탈뷰티코디네이터', '화장품회사, 제품기획 및 교육강사, 토탈 뷰티학원강사', '뷰티전문지 기자, 뷰티에디터, 피부관리실 피부과, 에스테티션, 네일살롱, 발건강 관리실', '특수분장사, 이미지컨설턴트,아로마테라피스트, 웨딩 스튜디오, 개인창업,']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트, 피부미용 컨설턴트', '뷰티에디터, 피부관리실 피부과, 에스테티션, 발건강 관리실, 특수분장사, 유튜브 메이크업크레이터', '헤어컨설턴트, 칼라리스트, 칼라테라피스트, 연예인 매니저, 토탈뷰티코디네이터, 네일살롱', '화장품회사, 제품기획 및 교육강사, 토탈 뷰티학원강사, 뷰티전문지 기자', '이미지컨설턴트,아로마테라피스트, 웨딩 스튜디오, 개인창업,']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0019';

-- CRS-KH-0020  명리심리상담사 1급
UPDATE public.courses SET
  hero_description  = '명리심리상담사(命理心理相談士)는 사주명리학(四柱命理學)의 원리를 기반으로 개인의 성향·심리·인생경향을 분석하고, 이를 토대로 심리적 안정, 자기이해, 대인관계 개선, 진로 탐색 등을 상담·지도하는 전문가입니다. 운세를 보는 명리학자가 아니라, 명리학과 현대 심리학을 접목하여 심리적 통찰과 현실적 조언을 함께 제공하는 상담 전문가입니다.',
  license_number    = '2025-002294',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '청소년·성인 대상 진로설계 및 자기개발 상담', '부부궁합, 가족 관계성 분석 및 의사소통 코칭', '부모·자녀 관계 상담, 양육스타일 분석', '조직 내 인간관계 및 성향 분석 워크숍 운영', '평생교육원, 문화센터, 복지기관 명리심리 강의', '일반인 대상 자기이해·인간관계 심리 특강']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '명리학 기초, 사주분석, 심리상담 융합교육 운영', '명리심리상담소, 사주·심리상담센터 운영', '평생교육기관, 문화센터 명리심리 강사', '진로·직업상담사, 인생코칭 전문가', '복지관, 상담기관, 청소년상담센터 보조강사', '정서적 불안·대인관계 문제·진로혼란 등 다각도 상담사', '‘명리+심리+라이프코칭’ 융합형 1인 창업', '상담 프로그램, 진로코칭, 온라인 강사', '직장 내 팀 성향분석, 리더십 코칭, 소통 개선 프로그램 개발자', '일반인 대상 ‘자기이해·관계심리’ 특강 강사']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '선영학 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0020';

-- CRS-KH-0021  미술심리상담사 1급
UPDATE public.courses SET
  hero_description  = '미술심리상담지도사는 미술 활동을 통해 감정이나 내면 세계를 표현하고 기분의 이완과 감정적 스트레스를 완화시키는 방법입니다. 심리적 충격을 안겨주는 사건을 경험한 아동들이나 말로써 자신의 어려움을 표현하는 것을 꺼려하는 어른들에게 유용한 매개체가 될 수 있습니다. 미술심리상담 지도사는 아이들 또는 어른의 문제행동지도 및 전인 발달을 지원하는 역할을 하는 담당자로 이론 위주와 풍부한 사례 연구의 전문적인수업을 통해 미술치료사로서의 자질을 향상시킬 수 있는 과정입니다.',
  license_number    = '2019-005115',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '사회복지학 관련학과 전공자 및 재학생, 아동학 관련학과 전공자 및 재학생', '유아 교육 기관의 원장 및 교사, 심리상담 이론에 관심이 있는자, 유치원 및 어린이집 교사', '복지기관, 종사자, 센터 종사자, 초, 중, 고등학교, 지역아동센터 교사사회복지시설, 학생', '복지기관, 센터 종사자초등학교 및 교육관련 학원 교사, 방과후 교사, 일반인, 학부모', '자기분석을 통해 내적인성장을 원하는 분']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '교육관련 교사, 교육기관 임직원, 구민회관, 사회복지관 상담원, 노인회관 종사자, 교정시설 종사자', '노인심리상담센터, 지자체상담시설, 교회 등 종교시설상담소, 실버타운, 부부상담클리닉', '가정폭력상담소, 문화센터, 도서관,건강가정지원센터, 평생교육원, 사회복지관, 가정복지관', '노인복지관, 다문화가족지원센터, 재가복지센터, 데이케어센터, 노인요양시설,', '지역마을회관, 가정상담소, 위기가족지원센터, 자원봉사센터, NGO단체', '심리상담소, 아동보호소, 심리연구소, 어린이집, 실용음악/미술학원,', '자원봉사센터. 이혼가정돌봄센타. 가정교육을 하는 지자체, 기타 가정문제 예방상담소운영 및 프리랜서', '미술심리상담자 혹은 자원봉사자, 강사. 우울증이 있는 주부상담 및 쉼터, 위기가족지원센타', '한부모가정지원센터, 특수학교 아동지도교사, 청소년상담소, 정신요양소. 유치원, 아동상담센터,']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '장현수 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0021';

-- CRS-KH-0022  바리스타 1급
UPDATE public.courses SET
  hero_description  = '바리스타는 커피 전문가로 에스프레소 커피를 중심으로 하는 높은 수준의 커피에 대한 경험과 커피의 종류와 에스프레소, 품질, 종류, 로스팅 정도, 장비의 관리, 라떼 아트 등의 커피에 대한 지식을 바탕으로 숙련된 커피를 만들어 내는 사람을 말한다.',
  license_number    = '2019-005352',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '바리스타, 커피에 관심 있는 분', '커피 전문점으로 취업 희망하는 분', '개인 공방 등의 소자본 창업을 희망하는 분', '일반인, 학부모, 학생']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '로스터. 커퍼. 프랜차이즈. 카페컨설턴트. 바리스타트레이너', '머신엔지니어. 창업.ㆍ 커피 전문점 취업 및 운영, 개인 공방 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '전성완 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0022';

-- CRS-KH-0023  반려동물관리사
UPDATE public.courses SET
  hero_description  = '반려동물관리사는 개, 고양이 등 반려동물의 건강, 위생, 행동 관리 및 생활 전반을 체계적으로 관리하는 전문가를 말합니다. 반려동물의 특성과 습성을 이해하고 올바른 사육 방법, 위생 관리, 기본 훈련, 안전 관리 등을 통해 반려동물이 건강하고 안정적인 환경에서 생활할 수 있도록 돕는 역할을 수행합니다.',
  license_number    = '2019-004810',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '반려동물 건강관리, 행동 이해, 올바른 양육법을 배우고 싶은 분', '펫샵, 펫케어, 위탁관리 등 사업을 준비하는 분', '전문 지식과 실무 역량을 함께 키우고 싶은 분', '동물매개 프로그램 및 정서 지원 활동을 운영하는 분, 부담 없이 시작 가능한 안정적인 직업을 원하는 분', '반려동물 돌봄 서비스를 통해 추가 수익을 원하는 분, 동물병원, 펫샵, 펫호텔 취업을 준비하는 분']::text[],
  career_paths      = ARRAY['반려동물관리사 전문직 활동, 펫시터(방문 돌봄 서비스) 활동', '반려동물 산책 대행 서비스 창업, 펫시터(반려동물 돌봄 서비스) 활동', '반려동물 위탁관리 및 호텔 운영, 펫샵 및 반려동물 용품 매장 운영', '동물병원 코디네이터 및 보조 인력, 애견 유치원 및 데이케어 센터 근무', '반려동물 행동관리 및 교정 보조 전문가, 반려동물 건강관리 및 영양관리 전문가', '반려동물 관련 교육 강사 및 지도자, 반려동물 커뮤니티 및 플랫폼 운영', '반려동물 관련 유튜브 및 SNS 콘텐츠 제작자, 펫 관련 스타트업 창업', '반려동물 행사 및 체험 프로그램 기획자, 동물보호센터 및 유기동물 보호시설 근무', '반려동물 복지 및 정책 관련 활동, 반려동물 용품 브랜드 마케팅 및 홍보', '해외 펫케어 서비스 및 글로벌 진출, 반려동물 산업 전문 컨설턴트']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0023';

-- CRS-KH-0024  반려동물행동상담지도사 1급
UPDATE public.courses SET
  hero_description  = '반려동물행동상담지도사는 반려동물의 행동적 문제(짖음, 공격성, 분리불안, 배변 문제 등)를 과학적 근거에 따라 분석하고, 훈련·심리·환경 개선을 통해 반려동물과 보호자의 관계를 회복시키는 전문 상담가입니다. ‘훈련사’가 아니라 동물행동학 + 심리상담 + 보호자 교육을 융합하여 반려동물의 감정과 행동을 이해하고 문제행동을 교정하는 반려심리·행동 전문가입니다.',
  license_number    = '2021-003022',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '훈육법, 교감법, 사회화 훈련 지도', '반려가정 내 스트레스 완화, 유대감 증진 프로그램 운영', '평생교육원, 문화센터, 복지기관 반려동물 행동강의', '반려예절교육, 아동대상 반려안전교육 강의', '반려동물행동상담사 양성과정 교육강사']::text[],
  career_paths      = ARRAY['반려동물 행동치료 및 감정치유 보조', '유기동물 보호소, 쉼터 내 사회화 프로그램 운영', '반려동물 매개치료, 동물교감 프로그램 기획', '반려동물행동상담센터, 동물병원, 반려동물훈련소', '평생교육기관, 문화센터, 반려동물아카데미 강사', '유기동물 보호소, 동물복지기관, 펫케어 서비스업체', '반려동물 용품회사·훈련제품 기획 및 컨설턴트', '프리랜서 행동상담가, 1인 반려행동코칭 창업자', '반려동물 관련 창업(훈련소, 상담센터, 케어샵 등)', '유기동물 보호교육 및 지역사회 봉사활동', '1인 반려상담 코칭센터, 온라인 강의, SNS 콘텐츠 운영', '반려행동 교육 유튜브·블로그 크리에이터 활동', '반려동물 훈련·상담·용품 기획 등 융합형 창업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0024';

-- CRS-KH-0025  방과후돌봄교실지도사 1급
UPDATE public.courses SET
  hero_description  = '학교 정규 교육과정이 끝난 이후 방과 후에 운영되는 돌봄교실 전담교사의 업무를 알고 이해해가는 교육과정입니다. 아이들을 맡아서 안전한 돌봄의 기대와 돌봄프로그램에 따른 교육을 펼침으로써 부모님들이 안심하고 생업에 집중할 수 있게 하며, 사교육비 지출 또한 줄여주는 효과를 거둘 수 있도록 방과 후 돌봄을 지도 할 수 있는 자를 방과후돌봄교실지도사라고 합니다.',
  license_number    = '2019-004805',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '평생지도사, 사회복지사, 유아교육학과, 보육교사', '직무능력 강화, 내 아이 교육, 초등학교, 중등학교, 아동복지시설', '학습교사, 공부방, 지역사회 문화센터, 학원', '방과후 선생님을 준비하시는 분, 평생지도사, 사회복지사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '학원강사 및 공부방교사, 학습지교사 등 홈스쿨교사, 지자체 및 종교시설상담소', '아동청소년복지센터, 부모교육강사,다문화가족지원센터,학교생활지원센터, 건강가정지원센터', '이혼가정돌봄센터, 한부모가정지원센터, 청소년활동시설, 학생문제 예방상담소, 지역아동센터', '아동청소년상담센터, 학습클리닉센터, 방과후학교 및 돌봄교실, 어린이집 및 유치원', '특수학교 및 장애아동통합학급,초등학교 방과후선생님']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김선주 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0025';

-- CRS-KH-0026  방과후수학지도사&스토리텔링수학지도사 1급
UPDATE public.courses SET
  hero_description  = '스토리텔링수학은 내가 발견한 수학, 놀이로 만나는 수학, 현실 속에서 만나는 수학 등으로 수학을 공부하고 흥미를 높이며 창의적인 사고력을 키워주는 교수방법입니다.수학은 원리를 아는 것도 중요하지만, 익숙해질때까지 연습해야하는 부분도 많습니다. 이럴 때 놀이는 아주 좋은 방법입니다. 스토리텔링수학 과정에서는 이야기와 재미있는 놀이를 통해 수학적인 재미와 자신감을 키울 수 있는 방법을 배우게 됩니다.',
  license_number    = '2019-004804',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '평생지도사, 사회복지사, 유아교육학과, 보육교사', '직무능력 강화, 내 아이 교육, 초등학교, 중등학교, 아동복지시설', '학습교사, 공부방, 지역사회 문화센터, 학원', '방과후 선생님을 준비하시는 분, 평생지도사, 사회복지사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '학원강사 및 공부방교사, 학습지교사 등 홈스쿨교사, 지자체 및 종교시설상담소', '아동청소년복지센터, 부모교육강사,다문화가족지원센터,학교생활지원센터, 건강가정지원센터', '이혼가정돌봄센터, 한부모가정지원센터, 청소년활동시설, 지역아동센터', '아동청소년상담센터, 학습클리닉센터, 방과후학교 및 돌봄교실, 어린이집 및 유치원', '특수학교 및 장애아동통합학급,초등학교 방과후선생님']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김선주 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0026';

-- CRS-KH-0027  방과후아동지도사 1급
UPDATE public.courses SET
  hero_description  = '방과후아동지도사는 사회의 전반적인 추세에 따라 부모의 역할을 대신하여 영,유,아동기에 있는 어린이들이 안락한 공간에서 필요로 하는 활동을 할 수 있도록 지원합니다. 방과후아동지도는 아동이 정규수업을 끝내고 집에 갔을 때 보살펴 줄 보모나 성인이 없는 아동을 위해 시작되었으며 아동을 보호하고 교육하는 방과후 교사의 필요성이 점점 중요해지면서 이제는 나아가 아동이 학교나 가정의 틀을 넘어 지역사회의 구성원으로 어울릴 수 있는 환경을 마련해 주는데 의의가 있습니다.',
  license_number    = '2020-002966',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '평생지도사, 사회복지사, 유아교육학과, 보육교사', '직무능력 강화, 내 아이 교육, 초등학교, 중등학교, 아동복지시설', '학습교사, 공부방, 지역사회 문화센터, 학원', '방과후 선생님을 준비하시는 분, 평생지도사, 사회복지사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '학원강사 및 공부방교사, 학습지교사 등 홈스쿨교사, 지자체 및 종교시설상담소', '아동청소년복지센터, 부모교육강사,다문화가족지원센터,학교생활지원센터, 건강가정지원센터', '이혼가정돌봄센터, 한부모가정지원센터, 청소년활동시설, 지역아동센터', '아동청소년상담센터, 학습클리닉센터, 방과후학교 및 돌봄교실, 어린이집 및 유치원', '특수학교 및 장애아동통합학급,초등학교 방과후선생님']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이영은 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0027';

-- CRS-KH-0028  방과후학교지도사 1급
UPDATE public.courses SET
  hero_description  = '방과후지도사는 학교를 마친 후 보호자가 부재한 학령기 아동을 위하여 학기중 방학 중의 일과운영을 통해 아동을 보호하고 교육시키는 일련의 활동입니다. 방과후의 일과시간동안 자녀 양육기능과 돌봄기능을 대행하고 적절한 교육 프로그램을 제공하여 학교생활과 가정 및 지역사회 적응을 원활하게 수행할 수 있도록 돕는 과정입니다. 이 프로그램을 통해 아동들이 전인적 발달을 도모 할 수있도록 교육생활에 도움이 될 수 있게 하며 아동이 안전하고 전문화된 즐거운 삶을 영위할 수 있도록 합니다. 최근 방과후 과정을 필수로 진행하는 학교가 증가되는 추세로 최고 유망자격증으로 각광받고 있습니다.',
  license_number    = '2019-004802',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '평생지도사, 사회복지사, 유아교육학과, 보육교사', '직무능력 강화, 내 아이 교육, 초등학교, 중등학교, 아동복지시설', '학습교사, 공부방, 지역사회 문화센터, 학원', '방과후 선생님을 준비하시는 분, 평생지도사, 사회복지사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '학원강사 및 공부방교사, 학습지교사 등 홈스쿨교사, 지자체 및 종교시설상담소', '아동청소년복지센터, 부모교육강사,다문화가족지원센터,학교생활지원센터, 건강가정지원센터', '이혼가정돌봄센터, 한부모가정지원센터, 청소년활동시설, 지역아동센터', '아동청소년상담센터, 학습클리닉센터, 방과후학교 및 돌봄교실, 어린이집 및 유치원', '특수학교 및 장애아동통합학급,초등학교 방과후선생님, 보육원, 재활시설, 요양시설']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이금란 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0028';

-- CRS-KH-0029  방역관리사 1급
UPDATE public.courses SET
  hero_description  = '방역관리사는 감염병, 해충, 미생물 등으로 인한 위해를 예방하고, 위생·안전한 생활환경을 관리하는 전문인력을 말합니다. 주요 역할은 질병 확산과 환경 오염을 막기 위한 방역·소독·위생 관리 업무를 체계적으로 수행하는 것입니다.',
  license_number    = '2017-002024',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '전국 지부 및 전문센터 운영자, 지자체 및 공공기관 위탁 방역 사업 참여', '주민자율 방역을 통한 자율 방역소독 전개, 각 기업의 사업장별 방역관리인', '요양원, 노인유치원.방역관리자. 각 지방단체, 유치원, 초,중 고등학교 학교보완관,']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '각 기업의 사업장별 방역관리인', '각 지역 방역소독관리자, 예방을 목적으로 가정, 회사, 식품접객업소, 숙박업소', '공공장소 등에 위생해충에 대하여 정확한 파악을 하고 현장상황에 맞는 약품사용 및 작업내용용', '현장관리 등의 업무를 제공하고 교육기관, 기업, 단체 등']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '최철규 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0029';

-- CRS-KH-0030  베이비시터 1급
UPDATE public.courses SET
  hero_description  = '베이비시터는 부모를 대신하여 영유아와 아동을 돌보는 전문 직업인으로, 아이들의 안전과 건강을 책임지고 발달 단계에 적합한 돌봄과 교육을 제공합니다. 이들은 영아기, 유아기, 아동기의 특성을 이해하고, 아이의 신체적, 정서적, 사회적 발달을 돕는 역할을 합니다.',
  license_number    = '2013-2700',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '베이비플래너센터, 프리랜서, 산후조리원, 산후도우미', '산모교실강사, 건강가정지원센터, 아동보호기관, 아동복지시설']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '개인 가정 베이비시터 활동 (파트타임, 전일제, 방문형)', '베이비플래너센터, 프리랜서, 산후조리원, 산후도우미', '아이돌봄서비스, 돌봄센터 등 공공기관 취업', '산산후조리원, 아동발달센터, 복지관 등 활동, 프리랜서 활동 또는 베이비시터 매칭 플랫폼 연계', '산모교실강사, 건강가정지원센터, 아동보호기관, 아동복지시설']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0030';

-- CRS-KH-0031  병원동행매니저 1급
UPDATE public.courses SET
  hero_description  = '병원동행의 전문적인 이해와 실무능력을 바탕으로, 내원 전 환자의 이동 동선 설계 및 안전관리, 병원 내 진료 및 검사 처치 전반에 동행, 환자의 육체적 심리적 지원, 진료 후 약국방문, 안전귀가까지의 전과정을 돕고, 진료내용에 대한 안내와 서비스 보고를 보호자에게 제공, 진료에 대한 바른 의사결정과 효율에 기여할 수 있도록 토탈서비스 제공의 직무를 수행한다.',
  license_number    = '2024-003546',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '간병·돌봄 분야 취업 희망자', '사회복지사, 간호조무사, 요양보호사 등 관련 전공 및 자격 보유자', '돌봄 서비스 기관 종사자', '고령층·장애인 복지에 관심 있는 일반인', '재취업을 희망하는 경력단절여성']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '병원동행 전문 서비스 업체 취업, 노인복지관, 장애인복지센터 등 복지기관 활동', '요양원·재가복지 서비스와 연계, 프리랜서(개인 매칭 서비스) 활동', '의료 보조 기관, 가정의료 서비스 회사', '요양병원 및 요양시설, 대형 의료기관, 종합병원']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '박신덕 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0031';

-- CRS-KH-0032  병원원무행정전문가 1급
UPDATE public.courses SET
  hero_description  = '병원원무행정전문가는 병원 내의 행정업무, 진료비 청구, 환자 관리, 보험 청구 등 의료기관의 운영과 행정 전반을 담당하는 의료행정 전문인력입니다. 단순 사무직이 아니라, 의료지식 + 행정능력 + 고객응대 서비스를 함께 수행하는 역할을 합니다.',
  license_number    = '2025-005095',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '환자 개인정보 보호 및 전산 시스템 입력', '병원 내·외부 행정 민원 응대, 인사, 회계, 물품관리 등 병원운영 지원', '병원 행정직에서 병원 경영·보험심사·행정관리자로 승진', '병원 경영분석 및 행정 효율화 기획', '의료보험, 청구, 고객응대 등 다방면의 업무역량 강화']::text[],
  career_paths      = ARRAY['종합병원, 대학병원, 개인의원, 한의원, 치과병원 원무과 직원', '요양병원, 재활병원, 산재·보험 병원 행정 담당자', '건강보험심사평가원, 국민건강보험공단, 보험회사 의료심사 부서', '산재·자동차보험 청구 및 행정 보조', '병원행정 실무 강사, 의료보험 청구 교육 강사', '병원 컨설팅 회사, 의료행정 아웃소싱 기업', '의료행정 대행·청구 서비스 창업', '병원 사무·행정 컨설팅, 의료청구 프리랜서', '병원행정 전문인력, 요양병원·재활센터 등 행정직', '의료행정 대행·청구 서비스 창업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '장인숙 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0032';

-- CRS-KH-0033  병원코디네이터 1급
UPDATE public.courses SET
  hero_description  = '병원의 생존 전략 중 가장 중요한 차별화된 의료서비스를 제공하는 역할을 담당하는 병원서비스 코디네이터는 수많은 병, 의원이 경쟁하고 있는 의료계의 환경변화와 의료서비스에 대안 요구만큼 없어서는 안 될 중요한 존재로 각광 받고 있습니다. 이미 의료서비스의 퀄리티를 관리하고 있는 선진국은 물론 국내 유수의 병의원에서도 전문적인 서비스 관리를 위해 꼭 필요로 하는 역할 중 하나입니다.',
  license_number    = '2019-005114',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '병원·의료기관 취업 희망자 (간호조무사, 행정직 등)', '의료 서비스 관리자로 커리어를 희망하는 사람', '병원 서비스, 환자 상담 업무에 관심 있는 일반인', '관련학과(보건행정, 간호, 의료경영 등) 전공자', '재취업을 희망하는 경력단절여성, 대학병원CS관리팀']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자, 의료 관련 교육 강사, 병원 서비스 컨설턴트', '교육 프로그램 개발을 필요로 하는 직업군', '병·의원(치과, 피부과, 안과, 산부인과 등) 상담 및 안내직', '종합병원 환자 서비스실, 고객 관리실, 병원 마케팅·홍보팀', '의료 보조 기관, 가정의료 서비스 회사', '의료관광 코디네이터, 외국인 환자 안내']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '양순주 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0033';

-- CRS-KH-0034  부동산권리분석사 1급
UPDATE public.courses SET
  hero_description  = '부동산 거래와 관련해서 나올 수 있는 제반사고를 예방하기 위하여 부동산거래의 종류별, 단계별로 숨어있는 법률, 사실상의 하자를 조사, 발견하는 직무를 수행하여 부동산거래의 안정성으로 보장하는 역할을 한다.',
  license_number    = '2023-004255',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '부동산에 관심있는 분, 자산운용업계에 종사하는분', '기업체 및 건설업계, 부동산 중개업 종사자 (공인중개사, 중개보조원 등)', '경·공매 투자자 및 부동산 투자 관심자, 법무사, 세무사 등 부동산 관련 전문직 종사자', '부동산 경영·컨설팅 업계 취업 희망자, 일반인(안전한 부동산 거래를 위해 학습하려는 사람)', '컨설팅 회사에 종사하는분 등']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '공인중개사 사무소, 부동산 컨설팅 회사, 법무사·세무사·회계법인 협업 전문가', '금융기관(부동산 담보 대출 관련 심사 부서), 부동산 경매·공매 전문 업체', '프리랜서 권리분석 컨설턴트, 자산운용업계, 컨설팅 회사', '부동산 업계, 자산운용업계']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '여상준 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0034';

-- CRS-KH-0035  부모교육상담사 1급
UPDATE public.courses SET
  hero_description  = '부모교육이란 부모로 하여금 자녀교육의 책임을 인지하고, 주어진 책임을 수행하는데 필요한 지식과 기능을 습득하여 부모에게 요구되는 기본적인 태도를 지니도록 하기 위해 의도적으로 주어지는 교육의 과정을 의미합니다. 자녀에 대한 발달 및 성공적인 성장을 위하여 부모 역할을 효과적으로 수행할수 있도록 체계적인 교육을 실시하여 부모교육에 도움을 주며, 학부모에게 효율적으로 자녀를 양육하는데 필요한 기술을 가르치고 알게 하여 가정교육에 연계되어야 합니다. 이 수업을 통해 부모교육의 이론과 연구동향을 살펴보고 이를 바탕으로 현장 적용에 필요한 교수학습방법을 모색하여 부모교육의 중요성을 인식하고, 사례중심으로 학부모 상담을 위한 상담법을 익혀 전문적인 상담을 실시할 수 있습니다.',
  license_number    = '2019-004660',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '유아교육기관 종사자, 사회복지시설 종사자, 복지기관 종사자, 센터 종사자', '초, 중, 고등학교 교사, 교육관련 학원교사, 문화센터, 평생교육기관 강사', '프리랜서 강사로 활동을 원하는 자, 자녀양육에 도움을 받고 싶은 학부모', '학생, 일반인, 심리상담 이론에 관심이 있는 자, 상담센터 취업 희망자', '유아교육기관의 부모교육 상담사 및 강사, 사회복지사, 평생교육사 등 강사 및 상담사, 의료기관, 종교기관의 부모상담사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '아동상담센터, 청소년상담복지센터, 지역아동센터, 건강가정지원센터, 다문화가족지원센터', '학교 및 방과후 프로그램 상담사, 사회복지관, 평생학습관, 부모교육 전문 강사', '프리랜서 부모교육 상담가, 온라인 교육 콘텐츠 제작, 돌봄지도사, 방문교육지도사, 아동복지시설,', '여성인력개발센터, 건강가정지원센터에서 채용, 기관에서의 심리상담사. 프리랜서 상담사', '구민회관, 사회복지관 상담원, 교정시설 종사자, 사설교육기관 강사 및 운영자']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이지혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0035';

-- CRS-KH-0036  산모신생아건강관리사 1급
UPDATE public.courses SET
  hero_description  = '산모신생아건강관리사는 출산 직후의 산모와 신생아를 위해 가정으로 파견되어 산후조리를 돕는 전문가입니다. 흔히 ''산후도우미''로 더 잘 알려져 있으며, 산모의 건강 회복과 신생아의 양육을 전문적으로 지원하여 출산 가정이 안정적인 첫걸음을 내디딜 수 있도록 돕는 중요한 역할을 합니다.',
  license_number    = '2025-003597',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '산후 관리 및 아기 돌봄에 관심 있는 학부모', '보육교사, 아동 관련 학과 전공자', '요양보호사, 간호조무사, 사회복지사 등 돌봄 관련 자격 보유자', '경력단절여성, 재취업 희망자', '산모·신생아 돌봄 관련 취업을 희망하는 일반인']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자, 교육 프로그램 개발을 필요로 하는 직업', '산후도우미 전문 업체 취업, 산후조리원, 산부인과 병원 등 근무', '개인 맞춤형 방문 돌봄 서비스 제공, 프리랜서 산후관리 전문가', '사회복지시설, 케어센터, 가정간호서비스, 병·의원, 산후조리원.']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '황은실 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0036';

-- CRS-KH-0037  산후관리사 1급
UPDATE public.courses SET
  hero_description  = '산후관리사는 출산 후 산모의 회복과 신생아의 건강관리를 돕기 위해 가정으로 파견되는 전문가입니다. 전문 교육을 이수하여 산모와 아기에게 꼭 필요한 돌봄 서비스를 제공하고, 출산 가정이 새로운 환경에 안정적으로 적응하도록 돕는 든든한 지원군 역할을 합니다.',
  license_number    = '2024-005426',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '산후 관리 및 아기 돌봄에 관심 있는 학부모', '보육교사, 아동 관련 학과 전공자', '요양보호사, 간호조무사, 사회복지사 등 돌봄 관련 자격 보유자', '경력단절여성, 재취업 희망자', '산모·신생아 돌봄 관련 취업을 희망하는 일반인']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자, 교육 프로그램 개발을 필요로 하는 직업', '산후도우미 전문 업체 취업, 산후조리원, 산부인과 병원 등 근무', '개인 맞춤형 방문 돌봄 서비스 제공, 프리랜서 산후관리 전문가', '사회복지시설, 케어센터, 가정간호서비스, 병·의원, 산후조리원.']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '황은실 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0037';

-- CRS-KH-0038  생활지원사 1급
UPDATE public.courses SET
  hero_description  = '장기요양서비스 진입 전 단계의 노인 중 신체, 정신, 사회적으로 스스로 생활 어려운 사람에게 안전확인, 가사, 일상생활, 활동 지원, 서비스 연계 등 노인맞춤돌봄서비스를 제공하고 있습니다 초고령사회로 진입함에 따라 노인돌봄서비스를 책임져줄 생활지원사가 점점 더 필요로 해지는 전망입니다.',
  license_number    = '2024-005425',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '노인생활돌봄에 대한 전반적인 이해가 필요한 분', '사회복지사로 일하며 노인 케어에 대한 전문적 지식을 더 쌓고 싶은 분', '재취업을 희망하는 경력단절 여성,어르신 돌봄 봉사나 사회서비스에 관심 있는 일반인', '퇴직 후 지역사회 공익 활동을 희망하는 중·장년층']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '노인맞춤돌봄서비스 생활지원사 (지자체 및 수행기관), 방문 돌봄 서비스 업체', '향후 요양보호사·노인상담사 등으로 확장 가능, 사회복지관, 노인복지센터, 재가복지서비스 기관', '노인전문병원, 복지시설']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '전현영 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0038';

-- CRS-KH-0039  손유희지도사 1급
UPDATE public.courses SET
  hero_description  = '손유희란 손을 움직여 감정, 사물, 여러 가지 자연 현상 등을 표현하는 것으로서, 유아들의 교육활동 중 산만하거나 지루한 분위기를 주의집중, 흥미유발, 전이활동 방법으로 전환시키며, 사물을 이해시키고 여러 가지 개념 형성을 도와 인지 기능의 기초를 다질 수 있는 과정입니다. 손유희 지도사과정은 아이들에게 가장 인기있는 손유희를 신학기에 적절한 손유희, 분위기를 차분하게 만드는 손유희, 분위기를 돋우는 손유희, 부모님과 함께 할 수 있는 손유희, 숫자를 세어보는 손유희, 신나게 노래하는 손유희롤 분류하여 교사들이 실제로 활용하기 편리하게 배울 수 있는 장점이 있다.',
  license_number    = '2019-005719',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '요양시설등 동화구연 & 손유희 강사, 백화점 등에서의 강사, 문화센터 등에서의 강사', '유치원 및 어린이집교사,초,중, 고등학교 교사', '각 교육원, 원격평생교육원 등 동화구연 & 손유희강사,동화구연 & 손유희 강사', '프리랜서강사, 동화구연 & 손유희 강사 자원봉사자, 노인유치원', '초등학교 및 교육관련 학원교사, 방과후 교사, 일반인, 학부모 ,학생유아교육기관']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '원격평생교육원 등 동화구연 & 손유희강사,동화구연 & 손유희 강사 , 프리랜서강사', '동화구연 & 손유희 강사 자원봉사자, 노인유치원, 백화점 등에서의강사, 문화센터 등에서의강사', '구청, 문화터 전문강사, 홈스쿨 창업, 사회복지기관등의 동화구연 교사', '유치원 및 어린이집교사,초, 중, 고등학교, 지역아동센터 교사, 프리랜서강사로 활동을 원하는 분', '사회복지시설종사자, 복지기관종사자, 센터종사자,초등학교 및 교육관련 학원교사, 방과후 교사', '일반인, 학부모 ,학생유아교육기관, 사회보지기관등의 동화구연 교사']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '권지선 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0039';

-- CRS-KH-0040  실버보드게임지도사 1급
UPDATE public.courses SET
  hero_description  = '치매예방을 위한 인지프로그램분야는 전문적인 교육프로그램이 아직은 일반화 되어 있지 않아, 종이접기나 레크레이션 등 간단한 신체적 활동 프로그램이 실시되고 있습니다. 따라서 치매예방 및 경증치매환자들을 위하여 뇌와 손의 협응을 이끌어 낼 수 있는 전문적인 치매예방을 위한 인지프로그램의 공급이 필요합니다. 노인의 인지기능퇴화의 지연 및 협응력을 높여줄 수 있도록 손을 지속적으로 사용하며 좌뇌 및 우뇌를 골고루 사용할 수 있는 공간블럭을 활용한 인지프로그램 및 사고 및 뇌의 노화방지를 도와주는 사고력게임을 통하여 활발한 뇌의 사용과 신체활동을 통하여 동료들과의 유대감형성 및 즐겁 게 뇌를 계속 사용함으로써 치매를 예방할 수 있도록 지도한다.',
  license_number    = '2020-005455',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '지역문화센터·도서관에서 노인 대상 여가문화 교육', '치매안심센터에서 두뇌훈련 및 예방 활동 보조', '시니어 아카데미 프로그램 운영', '노인전문병원에서 환자 재활 및 정서적 지원', '건강증진센터, 복지병원에서 치유형 프로그램 운영', '복지시설, 요양시설, 평생교육기관, 치매안심센터 등', '공공기관 및 지자체 운영 프로그램 강사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자, 노인복지관, 실버타운, 노인주-단기센터, 노인대학', '교육 프로그램 개발을 필요로 하는 직업군', '국공립노인교육관, 요양보호사관련, 주야간보호센터, 인지활동, 지역센터, 노인유치원', '사회복지학과, 교육학과, 평생지도사, 치매예방강사지원, 정신건강센터']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '정연서 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0040';

-- CRS-KH-0041  실버인지활동지도사 1급
UPDATE public.courses SET
  hero_description  = '노인의 신체능력과 인지활동 놀이의 특성을 활용하여 다양한 교구, 교재, 체조 등 신체활동의 즐거움을 통하여 정서적안정, 긍정적 생각으로 건강한생활을 유지될 수 있도록 도움을 주는 업무를 수행하며 노인복지센터, 문화센터, 요양원 등에서 해당분야 교육프로그램 개발 및 기획과 지도하는 직무를 수행',
  license_number    = '2024-003062',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '복지관 및 요양시설, 공공기관 및 지자체', '의료·재활 관련 기관, 창업·프리랜서 분야', '시니어 아카데미 프로그램 운영', '실버 세대(노인)를 대상으로 인지 활동 프로그램을 기획·운영·지도하는 전문 인력', '두뇌 자극, 정서적 교류, 사회적 참여 확대를 통해 치매 예방과 건강한 노후를 지원', '노인의 자기 효능감, 자존감 회복을 위한 활동 지도사', '초고령 사회 진입으로 인지 저하 예방 프로그램 강사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자, 노인복지관, 실버타운, 노인주-단기센터, 노인대학', '교육 프로그램 개발을 필요로 하는 직업군', '국공립노인교육관, 요양보호사관련, 주야간보호센터, 인지활동, 지역센터, 노인유치원', '사회복지학과, 교육학과, 평생지도사, 치매예방강사지원, 정신건강센터', '방문형 인지활동 지도 서비스 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이경미 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0041';

-- CRS-KH-0042  실버케어지도사 1급
UPDATE public.courses SET
  hero_description  = '실버케어지도사는 노인의 신체적·정신적·사회적 요구를 이해하고, 다양한 케어 프로그램과 복지 서비스를 통해 노인의 삶의 질을 향상시키는 전문가이며, 단순히 간병이나 돌봄에 머무르지 않고, 상담·복지 연계·인지 활동·여가 지도까지 지도하는 역할을 수행합니다.',
  license_number    = '2020-003515',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '실버(노인)의 신체적, 정신적, 사회적 문제를 상담하고 적절한 복지 서비스를 연계·지원하는 전문가', '노인의 삶의 질 향상을 위해 상담, 돌봄, 복지 네트워크를 아우르는 역할 수행', '초고령 사회 진입으로 노인복지·돌봄·상담 전문', '치매, 우울증, 고독사 등 노인문제가 심화됨에 따라 맞춤형 복지 상담', '노인의 삶의 질 향상을 위해 상담, 돌봄, 복지 네트워크를 아우르는 역할 수행', '노인의 자기 효능감, 자존감 회복을 위한 활동 지도사', '지역사회 복지 자원과의 연계를 통해 종합적인 지원']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '노인종합복지관, 경로당, 노인대학 등에서 상담 및 프로그램 운영', '요양원, 주간보호센터에서 생활·정서 지원 상담', '데이케어센터, 노인돌봄서비스와 연계한 사례 관리', '사회복지사, 간호사, 작업치료사 등과 협력하여 다학제적 지원', '치매안심센터, 보건소에서 노인 상담 및 복지 서비스 연계', '지자체 노인돌봄 정책 참여 및 행정 지원', '고령 친화 프로그램의 상담·코디네이터 역할', '노인전문병원, 요양병원에서 환자·가족 상담 지원', '건강증진센터, 재활기관에서 생활복지 상담']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '전유림 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0042';

-- CRS-KH-0043  심리분석사 1급
UPDATE public.courses SET
  hero_description  = '심리적 고통이나 해결되지 못한 원인과 문제로 힘들어 하는 개인에게 심리학적 전문지식과 심리분석을 통해 문제를 해결하고 삶의질을 향상시킬 수 있도록 도와주는 역할을 수행한다.',
  license_number    = '2019-005112',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '현대인의 정신건강 수요 증가로 심리분석 전문가', '심리학, 상담학, 코칭과 접목된 새로운 직업군', '학교, 청소년상담복지센터에서 학생 심리 이해 및 진로 상담', '학습 태도, 성격 분석을 통한 맞춤형 지도', '사회복지관, 심리상담센터, 평생교육원에서 심리분석 및 상담 지원', '가족, 부부, 노인 대상 심리 분석을 통한 관계 개선', '인사·채용 시 적성 및 성격 분석을 통한 인재 선발 보조']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '청소년상담사, 진로지도사, 심리상담사와 연계한 활동', '복지관, 평생교육원, 상담센터, 기업 교육팀 등', '심리검사 및 상담 전문기관, 개인 심리분석 센터 운영', '사회복지사, 간호사, 작업치료사 등과 협력하여 다학제적 지원', '심리검사 프로그램 개발 및 온라인 강의, 자기계발, 커리어 코칭 분야 확장', '심리상담센터. 사회복지시설. 문화센터. 아동복지시설. 학교. 교육기관', '병원서비스매니저, MBTI 강사', '가정상담소 및 다양한 지원센터, 심리분석사, 심리상담사, 진로코칭 종사자', '건강증진센터, 재활기관에서 생활복지 상담']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '최연희 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0043';

-- CRS-KH-0044  심리상담사 1급
UPDATE public.courses SET
  hero_description  = '심리상담사는 유아, 아동 및 청소년, 가정, 노인 등 사회에서 여러 가지 갈등과 문제로 인해 고통받고 있는 사람들을 대상으로 건강하고 바른 생활을 할 수 있도록 돕는 업무를 담당하는 전문가를 말합니다. 심리검사는 현재 특별한 부적응 문제를 보이지 않더라도 자기이해 및 잠재력, 진로탐색 등의 목적과 부적응 문제의 예방 목적을 위해서 언제든지 누구나 받아볼 수 있으며 특히, 아동 및 청소년에게 인지적, 사회적, 심리적으로 중요한 변화가 일어나는 시기에는 원만한 학교생활의 적응은 물론 학업 능력의 향상, 잠재력 개발, 진로 선택 등을 위해 심리검사를 받아보는 것이 필수적이라고 할 수 있습니다. 심리상담사 과정은 상담심리학, 심리학 개론, 이상심리학의 3과정으로 분류되며, 인간의 내면에 있는 갈등과 고민들을 해결할 수 있도록 전문적인 상담의 기술을 제공하는 전문 인력 양성과정입니다.',
  license_number    = '2016-005140',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '현대인의 정신건강 수요 증가로 심리상담 전문가', '심리학, 상담학, 코칭과 접목된 새로운 직업군', '학교 내 상담실, 청소년상담복지센터에서 학생 진로·학습·심리 상담', '또래관계, 학교적응, 시험불안 해소 지원', '사회복지관, 평생교육원, 종합상담센터에서 다양한 연령층 상담', '가정폭력, 중독, 부부·가족 갈등 상담', '직장 내 스트레스 관리, 조직 갈등 조정, 직무 적응 상담']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '청소년상담사, 진로지도사, 심리상담사 연계한 활동', '학교·청소년상담센터, 복지관, 공공기관, 병원', '심리검사 및 상담 전문기관, 민간 상담센터, 기업 상담실', '사회복지사, 간호사, 작업치료사 등과 협력하여 다학제적 지원', '각종 상담 관련 프로그램 강사, 개인 심리상담센터 운영', '심리상담센터. 사회복지시설. 문화센터. 아동복지시설. 학교. 교육기관', '온라인 화상 상담 플랫폼 활용, 특화 상담 서비스(부부, 아동, 노인, 중독 등)', '가정상담소 및 다양한 지원센터, 심리분석사, 진로코칭 종사자', '건강증진센터, 재활기관에서 생활복지 상담']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '차주완 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0044';

-- CRS-KH-0045  아동공예지도자 [8종] 1급
UPDATE public.courses SET
  hero_description  = '아동공예지도자는 아동의 발달단계에 맞춰 창의력과 표현력을 길러주는 예술·체험 중심의 공예교육 전문가입니다. 공예활동을 통해 정서안정·집중력 향상·자존감 형성을 돕고, 학교·복지시설·평생교육기관 등에서 아동 창의예술교육을 지도하는 전문강사입니다.',
  license_number    = '2019-004799',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '장애아동·다문화가정·저소득층 아동 대상 치유형 공예지도', '평생교육기관, 주민자치센터 창의공예 클래스 운영', '공예체험전, 지역축제, 문화센터 체험부스 운영', '공공기관, 도서관, 캠프 등 찾아가는 공예교육', '부모·자녀가 함께하는 가족공예 프로그램 기획']::text[],
  career_paths      = ARRAY['미술심리·놀이치료 프로그램과 연계한 공예활동', '집중력 향상, 감정표현, 정서안정 프로그램 구성', '아동상담·특수교육 영역에서 공예치유 활용', '초·중·고 방과후학교, 유치원, 어린이집', '복지관, 지역아동센터, 평생교육기관, 문화센터', '공예학원, 공예체험교실, 창의미술교실', '미술치유·놀이치료센터, 복지기관 강사', '프리랜서 아동공예강사, 1인 공방 창업자', '지자체 문화행사, 체험전, 축제 프로그램 운영', '도서관, 마을학교, 지역복지센터에서 교육', '가족·세대 간 공감형 공예체험 프로그램 개발', '아동의 인지·정서·사회성 발달을 돕는 창의교육', '1인 공방, 공예클래스, 홈스쿨 창업 가능', '온라인(유튜브·클래스101 등) 공예강의 콘텐츠 제작', '재료판매·DIY키트 개발 등 부가 수익 창출 가이드']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '남기희 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0045';

-- CRS-KH-0046  아동미술심리상담사 & 아동미술지도사 1급
UPDATE public.courses SET
  hero_description  = '미술교육의 기초이론 및 아동에 대한 발달적, 정서적, 심리학적 이해를 바탕으로 미술활동의 표현방법과 미술작품에 대한 이해력을 갖춰 아동들이 개방된 미술경험을 통해 자기표현과 의사소통 능력을 기르게하고 아동 개개인의 개성과 창의력을 신장시켜 바람직한 인격을 만들 수 있도록 지도하는 전문가이다.',
  license_number    = '2019-005110',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '유치원, 초등학교 방과후 교실, 미술학원', '심리학, 상담학, 코칭과 접목된 새로운 직업군', '문화센터, 평생교육원, 지역아동센터', '또래관계, 학교적응, 시험불안 해소 지원', '사회복지관, 평생교육원, 종합상담센터에서 다양한 아동상담', '아동 창의성·예술교육 프로그램 운영', '사회복지학 관련학과 전공자 및 재학생, 아동학 관련학과 전공자 및 재학생']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '심리상담센터, 아동청소년상담센터, 부녀 및 모자복지상담소,', '종교시설 상담소, 학생문제 예방상담소, 가정상담소', '심리검사 및 상담 전문기관, 민간 상담센터, 기업 상담실', '사회복지사, 간호사, 작업치료사 등과 협력하여 다학제적 지원', '각종 상담 관련 프로그램 강사, 개인 심리상담센터 운영', '사회복지시설, 지역아동센터, 위기가족지원센터, 어린이집 등 영유아보육시설', '학습전문컨설턴트, 건강가정지원센터, 이혼가정돌봄센터, 한부모가정지원센터, 드림스타트', '특수학교 및 장애아동통합학급, 방과후 돌봄교실, 다문화가족지원센터, 각 학교의 Wee센터, 방과후활동,', '건강증진센터, 재활기관에서 생활복지 상담, 복지·병원·심리센터']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김교옥 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0046';

-- CRS-KH-0047  아동미술지도사 1급
UPDATE public.courses SET
  hero_description  = '아동미술지도사는 아동의 발달 단계에 대한 이해를 바탕으로 미술 활동을 통해 아이들의 창의력, 표현력, 정서적 안정감을 키울 수 있도록 돕는 교육 전문가입니다. 단순히 그림 그리는 기술을 가르치는 것을 넘어, 미술이라는 매개를 통해 아이들이 자신의 생각과 감정을 자유롭게 표현하고 건강한 인격체로 성장하도록 이끄는 중요한 역할을 수행합니다.',
  license_number    = '2019-005718',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '아동·청소년 상담센터, 복지관, 지역아동센터', '학교 상담실, 심리상담소, 발달센터, 병원·재활기관(아동 정신건강 지원)', '문화센터, 평생교육원, 지역아동센터', '또래관계, 학교적응, 시험불안 해소 지원', '사회복지관, 평생교육원, 종합상담센터에서 다양한 아동상담', '아동 창의성·예술교육 프로그램 운영', '사회복지학 관련학과 전공자 및 재학생, 아동학 관련학과 전공자 및 재학생']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '심리상담센터, 아동청소년상담센터, 부녀 및 모자복지상담소,', '종교시설 상담소, 학생문제 예방상담소, 가정상담소', '심리검사 및 상담 전문기관, 민간 상담센터, 기업 상담실', '사회복지사, 간호사, 작업치료사 등과 협력하여 다학제적 지원', '각종 상담 관련 프로그램 강사, 개인 심리상담센터 운영', '사회복지시설, 지역아동센터, 위기가족지원센터, 어린이집 등 영유아보육시설', '학습전문컨설턴트, 건강가정지원센터, 이혼가정돌봄센터, 한부모가정지원센터, 드림스타트', '특수학교 및 장애아동통합학급, 방과후 돌봄교실, 다문화가족지원센터, 각 학교의 Wee센터, 방과후활동,', '건강증진센터, 재활기관에서 생활복지 상담, 복지·병원·심리센터']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김교옥 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0047';

-- CRS-KH-0048  아동심리상담사
UPDATE public.courses SET
  hero_description  = '아동심리상담사는 아동의 정서, 행동, 발달 특성을 이해하고 심리 상담과 다양한 활동을 통해 아동의 건강한 성장과 정서 안정을 돕는 전문가를 말합니다. 놀이, 미술, 대화 등 다양한 상담 기법을 활용하여 아동의 스트레스, 불안, 또래 관계 문제 등을 파악하고 긍정적인 발달을 지원하는 역할을 합니다.',
  license_number    = '2018-001104',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '아동의 정서와 행동을 이해하고 지도하고 싶은 분', '아동 상담 및 정서 지원 역량을 강화하고 싶은 분', '자녀의 심리와 행동 문제를 올바르게 이해하고 싶은 분', '학생 상담 및 생활지도 능력을 향상시키고 싶은 분', '전문 상담 분야로 진출하고 싶은 분', '아동 상담 및 부모 교육 강의를 진행하고 싶은 분', '전문성과 보람을 동시에 갖춘 직업을 원하는 분']::text[],
  career_paths      = ARRAY['아동심리상담사 및 상담 전문가, 아동 상담센터 및 심리센터 근무', '유치원·어린이집 상담 및 정서 지도, 학교 상담 보조 및 학생 상담 활동', '사회복지기관 및 아동복지시설 근무, 놀이치료 및 미술치료 보조 전문가', '부모 교육 및 양육 상담 강사, 아동 행동 문제 개선 상담 전문가', '청소년 상담 및 정서 지원 전문가, 발달 및 정서 평가 보조 전문가', '상담 프로그램 기획 및 운영자, 심리교육 강사 및 콘텐츠 제작자', '온라인 상담 및 비대면 상담 서비스, 아동 관련 교육기관 창업', '심리 관련 자격증 연계 진로 확장, 지역사회 아동 지원 프로그램 운영', '상담 및 코칭 프리랜서 활동, 아동·가족 상담 전문가로 성장', '공공기관 및 복지기관 취업, 심리·상담 분야 전문직으로 장기 성장']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '오지현 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국평생학습개발원'),
  updated_at        = now()
WHERE code = 'CRS-KH-0048';

-- CRS-KH-0049  아동요리지도사 1급
UPDATE public.courses SET
  hero_description  = '문화, 과학, 미술, 식습관, 동화, 수학 등의 요리테마를 가지고 분야별 접근을 통해 상상력과 사고력을 키워주며 식품군의 이해와 균형잡힌 영양섭취로 식습관 개선에 도움을 주는 역할을 합니다. 스스로 직접 요리를 만들며 오감체험의 통합적 두뇌활동과 자유로운 생각을 표현 할 수 있도록 아동요리교육에 대한 프로그램 개발, 적용, 평가를 진행하는 전문가를 말합니다.',
  license_number    = '2019-004809',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '유치원, 초등학교 방과후 교실, 대안학교에서 요리 체험 수업 운영', '자유학기제·체험학습 프로그램 강사 활동', '부모-자녀 체험 요리교실 운영, 쿠킹 클래스, 아동체험 요리학원 창업', '주민자치센터, 평생학습관, 문화센터 강사 활동', '방학 특강·체험학습 프로그램 기획', '온라인 요리 교육 콘텐츠 제작', '진로 체험 캠프 및 교육 프로그램 운영']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '방과후 학교 요리강사, 아동복지관·문화센터·평생교육기관 강사', '진로체험·자립교육 프로그램 전문강사, 아동요리체험관, 쿠킹스튜디오 운영', '온라인·유튜브 아동요리 교육 채널 운영, 체험학습·캠프 전문 프로그램 기획', '위탁경영 : 해당과목관련 프로그램 진행이 어렵거나 강사가 필요한곳에 위탁경영도 가능', '디자인아트공예 지도사과정위탁경영도 가능', '홈스쿨링/홈클래스 : 소규모 홈스쿨링을 운영하는 것, 자녀가 어려서 외부활동에 한계가 있는 주부들의 활발한 활동', '방과후선생님 커리큘럼에 수업방식이 필요하신 선생님', '학원창업 : 아동요리를 진행하는 학원, 창업, 방과후학교, 유치원, 지역아동센터 등']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '공유진/심소현 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0049';

-- CRS-KH-0072  안전관리사/안전교육지도사(접수반)
UPDATE public.courses SET
  hero_description  = '각종 산업·시설·생활 현장에서 발생할 수 있는 위험 요소를 사전에 점검·관리하고, 사고 예방과 안전 문화 정착을 위해 체계적인 안전관리 업무를 수행하는 전문 인력입니다.',
  license_number    = '2020-004934 / 2020-001737',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['산업·시설·현장 안전관리 업무 종사자', '건설·제조·물류·서비스 분야 종사자', '안전 관련 자격 취득 및 직무 역량 강화를 원하는 직장인', '중·장년층 재취업 및 제2의 직업을 준비하는 분', '생활·산업 전반의 안전 전문성을 갖추고 싶은 일반인']::text[],
  career_paths      = ARRAY['사업장·시설·행사 현장의 위험 요소 점검 및 안전 관리', '산업재해·생활사고 예방을 위한 안전 계획 수립', '안전교육 및 매뉴얼 제작·운영 지원', '사고 발생 시 초기 대응 및 재발 방지 대책 마련', '법정 안전 기준 및 안전관리 체계 이행 관리']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0072';

-- CRS-KH-0050  영농형태양광전문가
UPDATE public.courses SET
  hero_description  = '영농형태양광전문가는 농지 위에 태양광 발전 설비를 설치하여 농업 생산과 전력 생산을 동시에 운영할 수 있도록 계획하고 관리하는 전문가를 말합니다. 농작물 재배 환경을 고려한 태양광 설비 배치, 발전 시스템 관리, 농업과 에너지의 융합 운영 등을 통해 농가 소득 증대와 친환경 에너지 활용을 지원하는 역할을 수행합니다.',
  license_number    = '2024-005425',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '농업 소득과 태양광 발전 수익을 동시에 창출하고 싶은 분', '유휴 농지 또는 저수익 농지를 효율적으로 활용하고 싶은 분', '태양광 발전과 친환경 에너지 산업에 진출하고 싶은 분', '미래형 융합 산업으로 새로운 사업을 시작하려는 분', '농업 정책 및 에너지 사업을 기획·운영하는 분', '첨단 농업과 에너지 기술을 접목하고 싶은 분', '탄소중립 및 친환경 프로젝트를 추진하는 분, 안정적인 장기 수익 모델을 찾고 싶은 분']::text[],
  career_paths      = ARRAY['영농형 태양광 설치 및 운영 전문가, 농업 + 태양광 융합 사업 창업자', '신재생에너지 기업 및 태양광 업체 취업, 농지 활용 컨설팅 전문가', '태양광 발전 사업 기획 및 운영자, 스마트팜 및 에너지 융합 농업 전문가', '지자체 에너지 정책 및 사업 담당자, 농업기술센터 및 관련 기관 근무', '태양광 설계 및 시공 관리 전문가, 에너지 컨설턴트 및 기술 자문 전문가', '농가 대상 교육 및 강의 전문가, ESG 및 친환경 프로젝트 기획자', '농업·에너지 융합 스타트업 창업, 농촌형 수익모델 개발 전문가', '발전소 운영 및 유지관리(O&M) 전문가, 탄소중립 및 기후변화 대응 분야 진출', '농업 기반 투자 및 자산관리 전문가, 해외 태양광 및 농업 프로젝트 진출', '에너지 관련 공기업 및 공공기관 취업, 미래형 융합 산업 전문가로 성장 (농업+에너지+기술)']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0050';

-- CRS-KH-0074  영어동화구연지도사(접수반)
UPDATE public.courses SET
  hero_description  = NULL,
  license_number    = NULL,
  target_audience   = '{}'::text[],
  career_paths      = '{}'::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이화정 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = NULL),
  updated_at        = now()
WHERE code = 'CRS-KH-0074';

-- CRS-KH-0051  운동처방전문가 1급
UPDATE public.courses SET
  hero_description  = '운동처방전문가(Exercise Prescription Specialist)는 운동생리학, 해부학, 체력측정, 건강평가 이론을 기반으로 개인의 체력, 연령, 질병 유무, 생활습관을 분석하여 맞춤형 운동 프로그램을 처방하고 지도하는 전문가입니다. 의학적 지식 + 운동과학 + 재활·건강관리 능력을 융합한 과학적 운동지도의 전문가(Health Exercise Consultant) 입니다.',
  license_number    = '2025-000302',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '기업체, 복지관, 학교, 스포츠센터 등 현장운동 지도', '병원·재활센터에서 질병 후 회복기 운동처방 수행', '물리치료사, 간호사, 영양사와 협업한 통합건강관리', '근골격계·심폐기능 회복 중심의 운동재활 지도', '공공기관·학교·군·기업체 건강운동교육 강의', '운동·헬스케어 프로그램 기획 및 컨설팅', '운동처방 교재 개발, 피트니스 강사 교육']::text[],
  career_paths      = ARRAY['피트니스센터, 헬스클럽, PT센터, 스포츠센터', '병원·재활의학과·보건소 운동처방실', '학교·군·공공기관 체력관리 담당', '기업체 건강증진센터, 복지관, 노인건강센터', '프리랜서 운동컨설턴트, 온라인 트레이너, 강사', '체력측정 및 개인별 운동 프로그램 설계', '다이어트, 체형교정, 근력강화, 심폐운동 지도', '헬스센터, 기업체, 학교, 병원 등 다양한 현장 강사', '질병예방·만성질환 관리·재활운동 프로그램 운영', '물리치료, 임상운동, 건강검진센터', '운동과 의학의 연계로 새로운 전문직 영역', '학교 체육교육, 공공운동프로그램 지도', '노인건강·직장인 스트레스관리 교육', '지자체 국민체력인증센터, 건강증진사업', '개인 피트니스센터·운동클리닉 창업', '온라인 운동처방 콘텐츠 제작 및 강의', '헬스케어앱, 웨어러블 기반 원격운동 코칭']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '오화랑 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0051';

-- CRS-KH-0052  유튜브크리에이터 1급
UPDATE public.courses SET
  hero_description  = '유튜브크리에이터에 관한 이해를 바탕으로 다양하고 창의적인 미디어 콘텐츠를 기획, 제작, 편집하여 유튜브 영상과 콘텐츠를 업로드 하여 디지털 정보를 제공하고 전문가를 양성하는 업무를 수행한다.',
  license_number    = '2021-001717',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '취미, 특기, 전문성을 바탕으로 콘텐츠 제작', '자기 표현과 팬덤 형성을 통한 브랜드 가치 상승', '온라인 강의, 튜토리얼, 학습 콘텐츠 제작', '자기계발·자격증·취미교육 채널 운영', '기업·자영업자 홍보 채널 기획·운영영', '게임, 음악, 일상 브이로그, 여행, 푸드 등 다양한 분야 활동', '제품 리뷰, 광고·협찬을 통한 마케팅 활동']::text[],
  career_paths      = ARRAY['팬 소통, 문화 콘텐츠 제작, 유튜브 크리에이터 및 MCN 소속 활동', '기업 홍보·마케팅팀 영상 담당, 교육기관·지자체 유튜브 채널 운영자', '1인 유튜브 채널 운영 및 수익화, 콘텐츠 제작 대행, 편집 아웃소싱, 애니메이션제작,', '유튜브 강사, 크리에이터 교육 코치, 아프리카TV, 홍보용 광고디자인,신문방송', '카카오TV와 같은 플랫폼들을 통해 다양한 미디어 분야에서의 활동동', 'CJ E&M, 다이아 TV, 다양한 미디어 기관으로의 취업. 인스타그래머, SNS활용으로 홍보적용', '케이블TV와도 같이 기업들과 협엽하여 다양하고 새로운 대중화된 새로운 영상 콘텐츠를 구성하여 활동', '많은 구독자를 가진 창작자를 희망하는 특수 전문인력 양성교육', '마케터활동, SNS강사, 티톡TV. 사운드스튜디오, 1인미디어콘텐츠 사업, 영상편집실, 외주 제작사', '독립 프로덕션, 매스미디어, 언론, 커포지터, 영상편집학원강사, 방송부야, 영상편집자.']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '노성운 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0052';

-- CRS-KH-0053  은퇴설계전문가
UPDATE public.courses SET
  hero_description  = '은퇴설계전문가는 직장 생활을 마친 퇴직 예정자나 이미 은퇴한 분들이 ''제2의 인생''을 경제적·심리적·사회적으로 성공적으로 안착할 수 있도록 돕는 종합 컨설턴트를 말합니다. 과거에는 단순히 ''노후 자금 준비''에만 치중했다면, 최근에는 돈(재무)은 물론 시간 관리, 관계, 건강, 경력 전환까지 아우르는 5가지 영역을 통합적으로 설계합니다.',
  license_number    = '2025-006879',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '평생교육기관·복지기관 은퇴 준비 과정 강의', '노후 생활 안정 및 재사회화 프로그램 기획·운영', '노후 주거 안전&웰니스 맞춤 컨설팅', '은퇴 후 ''건강 자산'' 관리 코칭']::text[],
  career_paths      = ARRAY['시니어 재취업 ''안전 직무'' 멘토링, 기업체 임직원 ''안전한 은퇴'' 워크숍강사', '공공기관 ''시니어 안전 리더'' 양성강사, 요양 시설 종사자 ''통합 웰니스'' 직무강사', '''Safety & Wellness'' 시니어 아카데미 운영, 온라인 라이브 ''안전 웰니스'' 클래스', '금융권 ''은퇴 설계 센터'' 전문 상담, 기업 전직지원 서비스(Outplacement) 강사', '공공기관 생애 설계 자문위원, 중장년 내일센터 및 재취업 지원 전문가', '독립적 자산관리 및 생애 설계 컨설팅(FA/FP), 시니어 커뮤니티 및 평생학습관 전임 강사', '실버 비즈니스 전략 컨설턴트, 은퇴 설계 콘텐츠 크리에이터', '기업 사내 복지 전담 라이프 코치, 시니어 창업 및 귀농·귀촌 어드바이저']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '강민석 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0053';

-- CRS-KH-0054  인형극공연지도사 1급
UPDATE public.courses SET
  hero_description  = '어린이집, 유치원, 단체기관등 어린이들을 대상으로 마리오네트 줄인형 및 다양한 인형을 조작하여 인형극화 할 수 있는 능력을 기르고 구전동화, 창작동화, 등의 내용을 인형극 형태로 재구성하여 동화주제에 대한 활용도를 높일 수 있는 인형극지도사를 양성하는 과정이다.',
  license_number    = '2020-001736',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '유치원, 초등학교 방과후 교실에서 인형극 교육', '자유학기제 체험 수업 및 학교 행사 공연 지도', '아동복지관, 지역아동센터, 청소년수련관에서 인형극 체험 프로그램 운영', '도서관·문화센터에서 독서 연계 인형극 공연,', '어린이극단, 아동극·인형극 전문단체에서 기획 및 연출', '지역 축제, 문화 행사에서 인형극 공연 진행', '아동 심리상담, 장애 아동 교육에서 치료적 도구 활용', '노인 대상 치매 예방·정서 지원 프로그램']::text[],
  career_paths      = ARRAY['인형극 교육 스튜디오 창업, 인형극 콘텐츠 제작(유튜브·온라인 교육 활용)', '기관·학교와 연계한 출장 공연 기획, 학교, 유치원, 방과후 교실 강사', '복지관, 도서관, 문화센터 강사, 아동극·인형극 단체, 공연 예술 분야', '인형극 공연단 창업, 체험형 인형극 교실 운영, 온라인 인형극 콘텐츠 제작', '아동교육·심리치유·문화예술이 융합된 전문가, 정부·지자체의 문화예술교육 지도자자', '인형극과 스토리텔링·미디어·치유 프로그램 담당자, 프랜차이즈 교육원창업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '안성운 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0054';

-- CRS-KH-0055  자기주도학습지도사 1급
UPDATE public.courses SET
  hero_description  = '자기주도학습이란 학습자가 스스로 행하는 학습활동을 지칭하는 것으로, 학습자가 스스로 목표를 설정하고 이를 수행한 뒤 평가하는 학습과정을 말합니다. 본 강의는 청소년들의 자기주도학습 능력 배양 및 강화를 위하여 부모나 학습 코치가 해야 할 역할을 알고, 학습 코치로서의 역할을 어떻게 수행 할 수 있도록 하는지에 대한 해답을 찾아가는 과정으로 코치가 답을 가르쳐주는 것이 아니라 아이의 타고난 능력을 최대한 발휘하여 스스로 자기 문제에 대한 해결 방법을 찾고 살아가는 모든 면에서 근본적인 변화와 성과를 발휘하도록 지지하는 교육 프로그램입니다. 자기주도학습코칭은 자기주도학습코치 전문 지도사를 양성하는 과정으로 방과후 학교 강사로 파견을 나갈 수 있으며, 자기주도학습 능력을 배양하는 학습관을 운영할 수 있습니다.',
  license_number    = '2019-004795',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '초·중·고 방과후 교실, 자유학기제 프로그램', '학교 학습 코칭, 학습 멘토링 활동', '공부법 전문 학원, 학습 코칭 센터에서 지도사 활동', '자기주도학습 프로그램 개발 및 강의', '청소년수련관, 아동복지관, 지역아동센터에서 학습 지도', '성인 학습자 대상 평생학습 프로그램 운영', '1:1 학습 코칭, 학부모 교육, 진로·학습 상담', '온라인 학습법 강의, 유튜브·콘텐츠 제작']::text[],
  career_paths      = ARRAY['학교, 학원, 교육기관의 자기주도학습 프로그램 강사', '평생교육원, 청소년센터, 복지관 강사', '학습코칭 기업, 진로·학습 컨설팅 회사', '자기주도학습 전문 코칭센터 창업, 온라인 학습법 강의, 교재 개발', '1인 멘토링·컨설팅 서비스 운영, 특수학교 및 장애아동통합학급', '아동청소년복지시설, 건강가정지원센터, 각 학교의 Wee센터, 청소년활동시설']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '정혜숙 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0055';

-- CRS-KH-0056  자원봉사지도사 1급
UPDATE public.courses SET
  hero_description  = '자원봉사 지도사 양성과정을 통해 체계화된 교육제도를 확립하여 자원봉사영역의 전문성 강화 및 자원봉사 영역을 활성화하고 자원봉사영역에 필요한 자원활동가들을 확보하기 위한 전문가 과정',
  license_number    = '2020-003930',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '자원봉사 기획 : 지역사회 수요 조사, 봉사 프로그램 개발', '봉사자 모집 및 교육 : 봉사자 발굴, 기본 교육 및 심화 교육 진행', '배치 및 운영 : 봉사활동 장소·내용 매칭, 안전 관리', '성과 평가 및 관리 : 활동 효과 분석, 봉사자 인증·인센티브 관리', '네트워크 구축 : 공공기관·NGO·기업과 연계해 봉사 활동 확산', '성인 학습자 대상 평생학습 프로그램 운영']::text[],
  career_paths      = ARRAY['지자체 자원봉사센터, 주민자치센터, 청소년수련관, 평생교육원, 대학 사회봉사부서', '사회복지협의회, 청소년활동센터, 자원봉사센터, 사회복지기관, 공공기관 봉사 담당자', '사회복지관, 노인복지관, 지역아동센터 등에서 자원봉사 관리, NGO, 국제기구에서 봉사 프로젝트 관리', '아동·노인·장애인 지원 프로그램 기획, 학교 봉사활동 프로그램 운영·관리', '대학 사회봉사 교과목 운영 지원, 기업 CSR(사회공헌) 활동 기획 및 봉사 프로그램 운영', '자원봉사 교육·컨설팅 센터 설립, 봉사 프로그램 개발 및 강의 활동, 국제 자원봉사 프로젝트 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '박수진 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0056';

-- CRS-KH-0057  자원순환관리사
UPDATE public.courses SET
  hero_description  = '자원순환관리사는 기후 위기와 자원 고갈이 심화되는 2026년 현재, 단순히 쓰레기를 치우는 단계를 넘어 폐기물의 발생을 억제하고 발생된 폐기물을 적정하게 재활용하여 자원으로 되돌리는 ''자원순환(Circular Economy)'' 전 과정을 관리하는 전문가입니다. 과거에는 쓰레기를 어떻게 ''잘 버릴까''를 고민했다면, 자원순환관리사는 쓰레기를 어떻게 다시 ''원료''로 바꿀 것인가를 설계하는 역할을 합니다.',
  license_number    = '2025-003246',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['환경·자원·ESG 분야 취업 및 직무 전환 희망자', '공공기관·지자체·환경 관련 종사자', '기업 환경·안전·시설·총무 담당자', '자원순환·재활용 사업 및 창업을 준비하는 분', '지속가능한 환경 실천과 전문성을 갖추고 싶은 일반인']::text[],
  career_paths      = ARRAY['ESG 공시 및 탄소회계사, 순환 구매 전문가', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '도시광산 공정 설계사, AI 선별 시스템 운영자', '지자체 자원순환 해설사, 순환경제 특구 기획관', '디지털 제품 여권(DPP) 관리자, 에코 디자인 컨설턴트', '역물류(Reverse Logistics) 매니저, 구독 및 재사용 서비스 기획자']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0057';

-- CRS-KH-0058  정원관리사 1급
UPDATE public.courses SET
  hero_description  = '정원관리사는 정원을 아름답고 건강하게 만들고 유지하는 전문가입니다. 단순히 식물을 심고 가꾸는 것을 넘어, 디자인 감각과 식물에 대한 전문 지식을 바탕으로 공간의 특성과 목적에 맞는 정원을 기획, 조성, 관리하는 모든 과정을 책임집니다.',
  license_number    = '2025-004041',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '정원 설계·시공 회사, 조경업체, 원예농원', '아파트 단지, 공원, 기업 사옥의 정원 관리', '평생교육원, 문화센터, 주민자치센터 강사', '정원 체험학습, 원예치유 프로그램 지도', '병원, 요양시설, 복지관의 치유정원 관리', '장애인·노인 대상 원예치유 프로그램 운영']::text[],
  career_paths      = ARRAY['정원·텃밭 조성 창업(가정정원, 옥상정원, 커뮤니티 가든)', '온라인 정원 교육, 유튜브 원예 크리에이터, 가드닝샵, 정원 용품·식물 판매', '조경·원예 회사, 정원관리 전문업체, 지자체·공공기관 녹지관리부서, 정원박람회', '교육기관, 복지기관, 원예치유센터, 정원 디자인·시공 창업', '치유정원·도시농업 프로그램 운영, 정원 용품 판매·가드닝 클래스 운영', '환경교육 강사, 연구원, 업사이클링 브랜드 창업, 자원순환 교육·컨설팅 센터 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0058';

-- CRS-KH-0059  조향사[향수디자이너] 1급
UPDATE public.courses SET
  hero_description  = '조향사(Perfumer)는 다양한 향료를 조합하여 새로운 향을 창조하는 전문가를 말합니다. 향수 디자이너(Perfume Designer)라고도 불리며, 단순히 향을 만드는 기술자를 넘어 예술가적인 감성과 과학적 지식을 동시에 갖춰야 하는 직업입니다. 이들은 향수뿐만 아니라 화장품, 생활용품(세제, 방향제), 식품 등 향이 사용되는 모든 제품의 ''후각적 경험''을 디자인하는 역할을 담당합니다.',
  license_number    = '2025-000580',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '공간·브랜드 향기 디자인연출, 호텔·카페·매장·전시관 등 브랜드 맞춤형 향기 연출', '아로마·치유 향 개발자, 스트레스 완화, 수면 개선, 집중력 향상 등 기능성 향기 연구자', '향수 브랜드, 화장품·뷰티 회사의 향기 기획자', '패션쇼, 행사용 향기 연출자자', '호텔, 카페, 백화점, 자동차 브랜드의 시그니처 향 개발자자', '공간 연출, 향기 마케팅 컨설턴트', '아로마테라피, 심리치유용 향기 개발자자', '힐링 프로그램, 심리상담·요가·명상 연계자자', '향수 공방, 조향 스튜디오 창업자자', '교육·강사, 조향 기법·향수 제작 클래스 운영']::text[],
  career_paths      = ARRAY['문화센터, 평생교육원 강사,온라인 향수 DIY 키트·콘텐츠 제작자자', '향수·화장품 회사, 뷰티 브랜드, 공간·브랜드 마케팅 기업', '아로마·치유 산업 관련 기관, 향수 공방, 퍼스널 향기 컨설팅 창업', '온라인 퍼스널 향수 제작 클래스 운영, 브랜드 맞춤형 향기 디자인 프리랜서']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '안정미 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0059';

-- CRS-KH-0060  종이접기지도사 1급
UPDATE public.courses SET
  hero_description  = '종이접기지도사(Paper Folding Instructor)는 종이를 활용하여 다양한 형태를 만들며, 아동·청소년·성인에게 창의력, 집중력, 협동심, 정서안정을 키워주는 창의예술교육 전문가입니다. 예술교육 + 심리치유 + 창의교육을 결합하여 교육·복지·치료·문화 분야에서 활동하는 감성형 예술지도사입니다.',
  license_number    = '2019-004638',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '미술치료, 놀이치료, 정서안정 프로그램과 융합 가능', '도서관, 주민센터, 문화센터 등에서 종이접기 교실 운영', '지역 축제, 체험행사, 공예캠프에서 체험프로그램 진행', '공공기관 ‘창의체험·예술교육’ 위탁 프로그램 지도', '종이접기 교재·교구 개발, DIY 키트 제작', '온라인 종이접기 강의, 유튜브 콘텐츠 제작', '홈스쿨, 공방, 문화교육 창업 및 프리랜서 강의']::text[],
  career_paths      = ARRAY['유치원·어린이집·초등학교 방과후 강사', '복지관, 요양원, 지역아동센터, 문화센터 강사', '미술치료센터, 창의교육기관, 평생교육원 강사', '종이공예교구 제작자, 공예체험교육 운영자', '프리랜서 예술강사, 1인 공방 창업자', '창의미술, 표현활동, 창의체험학습 수업 운영', '교사·강사 대상 창의교육 역량강화 연수 참여', '아동발달, 미술교육, 감정표현 지도', '아동·노인 대상 손작업 중심 치유활동 운영', '미술치료, 인지치료, 놀이치료 연계 프로그램 개발', '사회복지사, 요양보호사 등과 협업', '지자체 문화행사, 지역축제 체험부스 운영', '도서관, 문화센터 창의공예교실 진행', '공공예술교육 지원사업, DIY키트, 교재 개발 및 판매', '종이공예 공방, 홈스쿨, 문화클래스 창업', '온라인 클래스(클래스101, 유튜브, 인스타 등) 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김진옥 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0060';

-- CRS-KH-0061  지역아동교육지도사사 1급
UPDATE public.courses SET
  hero_description  = '아동의 안전과 발달을 위한 지역아동교육과 아동 교육에 대한 지식을 바탕으로 아동의 연령 및 발달수준을 고려하여 신체, 인지, 정서적 부분에 대한 향상을 돕는 지도 방법을 학습합니다. 지도 방법 학습과 교육 프로그램 기획, 개발, 운영 등의 직무를 수행합니다.',
  license_number    = '2019-004798',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '아동 정서·사회성 발달 지원을 통한 학교폭력 예방·자존감 회복', '정서 지원, 상담, 놀이, 독서지도를 통한 심리·정서적 안정 지원', '인성·사회성 교육 : 인성교육, 협동심, 공동체 의식 지도자자', '체험 활동 운영 : 독서, 미술, 음악, 요리, 환경 체험 등 다양한 프로그램 기획자자', '지역 연계 활동 : 복지관, 도서관, 지역사회 자원과 연계한 아동 교육 운영자자', '지역아동센터, 방과후 학습·정서 지도사, 사회복지기관, 온라인 교육 콘텐츠 제작', '아동복지관, 청소년수련관 등에서 교육 프로그램 운영, 프리랜서·창업', '교육기관, 초등학교 방과후 교실, 자유학기제 체험수업 강사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '평생교육기관, 주민자치센터, 평생학습관 아동 프로그램 지도자자', '지역아동센터, 사회복지관, 청소년상담복지센터, 부모교육·가정연계 프로그램 강사', '초·중학교 방과후 프로그램 강사, 지자체·공공기관 아동 돌봄·교육 프로그램 강사', '아동 교육·체험 전문 센터 창업, 온라인 강의·교재 제작, 유튜브 아동교육 채널 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김교옥 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0061';

-- CRS-KH-0062  진로적성상담사 & 진로직업상담사
UPDATE public.courses SET
  hero_description  = '다양한 개인의 진로문제에 관한 검사, 진단, 문제분류, 문제 구체화, 문제해결 등의 단계를 거쳐 진로상담 대상별로 생애진로의 측면에서 국내에 적응할 수 있는 상담을 하는 자격으로서 학교생활, 사회생활, 문화생활에 작 적응할 수 있도록 변화시키고 자신의 학업이나 진로적성검사를 통한 잠재력개발 및 진로상담교육, 학습코치, 특기적성 교육등 dldstod의 심리적 문제를 해결하는데 도움을 주어 다양한 문화가 공존하는 더불어 사는 사회로 성장하는 사회문화 형성에 이바지하는 전문적인 진로 활동을 담당하고 있는 상담사 자격이다.',
  license_number    = '2019-004794',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '학습 스타일, 잠재능력 파악, 진학 상담(중·고·대학 학과 선택 지도)', '장래 직업군 탐색 지원, 직업·직무 탐색, 노동시장 정보 제공', '중장년 퇴직자의 재취업·전직 상담, 경력개발, 평생직업 설계 지원', '학교 진로교실, 자유학기제 프로그램, 청소년수련관, 지역아동센터, 학원', '학부모 대상 진로 상담, 코칭 프로그램,고용센터, 취업지원센터, 직업훈련기관', '대학 취업지원센터, 평생교육기관, 기업 HR팀, 진로·취업 컨설팅 회사', '진로장애를 겪는 개인 혹은 집단에 대한 진단평가 및 전문상담가', '상담기관에서 진로 및 문화 적응 상담관련 업무수행']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '초·중·고 자유학기제, 방과후학교 강사, 대학 진로교양과목 강사, 진로체험캠프 지도자', '청소년수련관, 지역아동센터 진로 프로그램 지도사, 청소년상담복지센터 상담사, 아동복지기관의 진로·적성 프로그램 운영자', '평생교육원, 문화센터 강사, 진로적성 검사 전문 학원, 진로 코칭센터 운영, 학부모 대상 진로 교육 컨설턴트', '고용노동부 고용센터, 취업지원센터 상담사, 지자체 일자리센터 직업상담사, 공공 취업·전직 프로그램 운영자', '대학 취업지원센터 취업코치, 직업훈련기관, 직업전문학교 강사, 평생교육기관 직업상담 프로그램 강사', '기업 HR 부서 채용·경력개발 담당자, 민간 취업컨설팅 회사, 헤드헌팅 업체 상담사, 이력서·면접 코칭 프리랜서', '온라인 취업 코치, 진로·직업 전문 코치, 자기계발 강사, 진로적성검사 프로그램 개발, 온라인 강의·유튜브 채널 운영', '진로교육 정책 연구원, 직업상담 연구원']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '강샤론 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0062';

-- CRS-KH-0063  집합건물관리사 1급
UPDATE public.courses SET
  hero_description  = '공동주택법이 적용되지 않는 오피스텔, 지식산업센터, 상업용건물, 근린시설 등 집합건물의 관리 관련 소유자 및 임차인의 권익을 보호하기 위하여 집합건물의 행정, 회계, 관리 등을 실시하고 공용부분과 부대시설 및 안전관리를 실시하는 등 집합건물 관리 업무를 수행',
  license_number    = '2021-005235',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '전문 관리자를 통해 관리비 절감, 건물 가치 상승, 생활 안전 확보', '건물 관리 업무를 표준화·전문화하여 신뢰성 있는 커리어 형성', '노후 건물·공동주택의 관리 문제를 해소하고, 주거 안정과 지역사회 발전에 기여', '에너지 절약, 친환경 관리로 비용 절감 및 ESG 경영 기여', '부동산에 관심있는 분, 자산운용업계에 종사하는분', '기업체 및 건설업계, 컨설팅 회사에 종사하는분 등']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '지자체 공동주택관리지원센터, 한국감정원, LH공사 등 공공기관', '집합건물 관련 행정 지원·자문 역할, 아파트, 오피스텔, 상가 등 주택관리·위탁관리 회사', '빌딩·상가 관리 전문기업, 시설관리업체, 관리비 회계·예산 전문가, 분쟁 조정 전문가', '집합건물관리사 자격을 활용해 관리소장, 관리사무소장, 빌딩 매니저로 활동', '건물 안전진단·관리 컨설팅, 관리규약, 회계, 분쟁 관련 법률 컨설팅', '프리랜서 형태의 교육 강사, 건물관리 자문가, 건물관리 용역·청소·보안·시설관리 서비스 업체 창업', '공동주택 관리 교육센터 운영, 스마트빌딩 관리, IoT 기반 관리 시스템 도입 서비스']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '박영수 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0063';

-- CRS-KH-0064  초등돌봄전담사 1급
UPDATE public.courses SET
  hero_description  = '초등돌봄전담사는 사회의 전반적인 추세에 따라 부모의 역할을 대신하여 영,유,아동기에 있는 어린이들이 안락한 공간에서 필요로 하는 활동을 할 수 있도록 지원합니다. 아동이 정규수업을 끝내고 집에 갔을 때 보살펴 줄 보모나 성인이 없는 아동을 위해 시작되었으며 아동을 보호하고 교육하는 방과후 교사의 필요성이 점점 중요해지면서 이제는 나아가 아동이 학교나 가정의 틀을 넘어 지역사회의 구성원으로 어울릴 수 있는 환경을 마련해 주는데 의의가 있습니다.',
  license_number    = '2024-005850',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '가정 연계, 학부모 상담, 아동 생활 정보 제공, 학교-가정 연결', '방과 후 안전한 돌봄 공간 제공, 학습·정서·놀이 균형 발달', '맞벌이·한부모 가정의 양육 부담 완화, 안심 돌봄 서비스 제공', '학교폭력·방임 예방, 교육격차 해소, 지역사회 아동 보호망 강화', '안정적 근무 환경, 방학 중 돌봄 수요 등으로 꾸준한 활동 가능', '돌봄 관련 직종을 취업하고자 하는 자, 학교 방과후돌봄교실 보조교사 또는 돌봄전담사가 되고자 하는 자']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '초등학교 돌봄교실 전담사, 방과후학교 프로그램 지도사, 교육청·지자체 아동 돌봄 사업 참여', '지역아동센터, 아동복지관, 청소년수련관, 드림스타트, 다문화가정 지원센터', '아동 학습·체험 프로그램 강사, 방과후 돌봄 위탁기관 강사 및 관리자, 학원·문화센터에서 창의·놀이 지도', '돌봄교실 연계형 학습·놀이 프로그램 창업, 온라인 아동 돌봄·교육 콘텐츠 제작, 부모 대상 아동 교육·상담 서비스 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이영은 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0064';

-- CRS-KH-0065  코딩지도사 1급
UPDATE public.courses SET
  hero_description  = '언플러그드 활동, 스크래치 및 엔트리와 같은 교육용 프로그래밍 언어를 활용하여 소프트웨어 코딩 기초 학습과정 및 프로그래밍에 대한 이해와 응용력을 가질 수 있게 하며, 이를 기반으로 교육 커리큘럼을 이해하여 방과후학교, 돌봄교실, 문화센터, 평생교육원 등에서 SW 전문강사로서의 역할을 수행할 수 있게 하는 양성과정입니다.',
  license_number    = '2024-005850',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '인공지능·빅데이터 기초 교육, 코딩 + 수학, 과학 융합 수업 기획', '코딩 캠프, 방학 특강, 체험학습 프로그램 운영, 게임 제작, 앱 개발, 웹사이트 제작 실습 지도', '화상 강의, 온라인 코딩 콘텐츠 제작, 유튜브, 교육 플랫폼 강의 제공', '단순 암기식 학습에서 벗어나 창의력·논리적 사고·문제해결력 강화', '4차 산업혁명 시대 필수 역량인 코딩 리터러시 확보, 자녀의 진로·학업 경쟁력 강화, 입시·SW특기 활용 가능', '미래형 인재 양성을 통한 국가 경쟁력 강화,교육기관·기업·프리랜서 등 다양한 활동 기회']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '디지털 콘텐츠 제작 및 온라인 강의, 초·중·고 방과후학교 코딩 강사', '자유학기제·고교학점제 SW교육 강사, 대학 평생교육원, 코딩 캠프 강사', '코딩 학원 강사, 학원 운영자, 로봇·메이커·AI 융합 학원 창업', '주민자치센터, 평생학습관 코딩 프로그램 지도, 청소년수련관, 지역아동센터 코딩 교육', 'IT기업 교육 강사, 사내직원 SW교육, 에듀테크 기업, 교육콘텐츠 제작 전문가', '온라인 강의(유튜브, 인강 플랫폼) 제작, 앱·웹·게임 개발 교육 창업, 1인 코딩교육 스튜디오, 캠프 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김선주 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0065';

-- CRS-KH-0073  클레이아트지도사(접수반)
UPDATE public.courses SET
  hero_description  = '클레이는 칼라믹스의 단점을 보완하여 나온 점토로 손에 잘 묻어나지 않으며 탄력성이 좋고 자연적으로 굳히기 때문에 따로 열처리를 할 필요 없는 수용성 합성수지를 이용하였으며 무독성 재료로 만들어져 누구나 쉽게 만들 수 있는 공예재료입니다. 클레이를 사용하면 소근육 활동이 왕성해지기 때문에 아이들은 물론 노인복지기관에서도 많이 활용되고 있습니다.',
  license_number    = '2017-001418',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['사회복지학 관련학과 전공자 및 재학생', '아동학 관련학과 전공자 및 재학생', '유아교육기관 교사 또는 취업희망자', '등학교 및 교육관련 학원교사', '지역아동센터 또는 방과후 교사', '문화센터, 평생교육기관 강사', '프리랜서 강사로 활동을 원하는 자', '개인 공방 등의 소자본 창업을 희망하는 자', '홈스쿨링', '일반인', '학부모', '학생']::text[],
  career_paths      = ARRAY['초등 방과 후 학교 및 특기 적성 교육강사', '문화센터 교사', '유아교육기관 강사', '인력개발원 등 각종 교육기관 강사', '홈스쿨', '공방 등 창업', '본인 자녀의 홈스테이 교육']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '정진숙 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0073';

-- CRS-KH-0066  타로심리상담사 1급
UPDATE public.courses SET
  hero_description  = '타로카드를 통하여 질문자가 궁금해 하는 모든 일들에 대하여 상담을 하고 78장의 길흉 화복, 심리적인 내용을 담아 심리적 안정과 힐링이 될수 있는 방법을 제시하는 전문가입니다.타로상담사는 내담자의 질문 의도를 정확히 파악하여 그에 따른 적절한 상담을 해줘야 합니다. 정확한 타로카드 해석과 리딩도 중요하지만 많은 타로상담사들 사이에서 실력을 가릴 수 있는 포인트는 질문자와 얼마나 심적인 교감을 했는가와 얼만큼 답변에 심리적인 요소를 담아 안정시켜주었는가 입니다. 타로상담전문가 과정을 통해 78장의 타로카드에 대해 학습하며, 각 카드와 상황에 맞는 실전리딩법을 배울 수 있습니다.',
  license_number    = '2019-005109',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '선택의 방향성을 찾도록 돕는 코칭 역할', '평생교육원, 문화센터에서 타로 심리상담 강좌 개설', '상담사 양성과정, 타로 심리치유 워크숍 운영', '유튜브, 블로그, SNS에서 심리타로 콘텐츠 제작', '비대면 타로심리상담 서비스 운영(온라인 1:1 상담)', '내담자 자기 내면을 이해하고, 갈등·불안을 표현할 기회를 제공']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '청소년·MZ세대에게 친숙한 문화적 상담사, 심리상담센터, 힐링카페, 타로상담실 상담사', '평생교육원, 문화센터 타로심리상담 강사, 청소년상담복지센터, 지역아동센터(진로·심리 지원 프로그램)', '기업·학교 워크숍, 자기성장 프로그램 강사, 축제·행사·체험 프로그램 상담 활동', '온라인 비대면 타로심리상담 서비스 제공, 심리·타로 관련 온라인 강의, 교재 제작', '타로심리상담 스튜디오·카페 창업, 1인 상담소 운영, 프리랜서 상담사로 활동', '타로 + 미술치료, 타로 + 음악치유 등 융합 프로그램 개발']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이기선 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0066';

-- CRS-KH-0067  피부미용코디네이터 1급
UPDATE public.courses SET
  hero_description  = '피부미용코디네이터는 고객의 피부 상태를 분석하고, 그에 맞는 피부 관리 프로그램을 기획·제안·조정하는 전문가입니다. 단순한 피부 시술자가 아니라 고객 상담, 맞춤형 관리 플랜 구성, 서비스 안내 등 미용 현장의 관리자이자 고객 중심 상담가 역할을 수행합니다.',
  license_number    = '2019-005111',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트, 피부미용 컨설턴트', '제품기획 및 교육강사, 토탈 뷰티학원강사, 뷰티전문지 기자, 뷰티에디터, 피부관리실 피부과', '헤어컨설턴트, 칼라리스트, 칼라테라피스트, 연예인 매니저, 토탈뷰티코디네이터, 화장품회사', '에스테티션, 네일살롱, 발건강 관리실, 특수분장사, 이미지컨설턴트', '아로마테라피스트, 웨딩 스튜디오, 개인창업']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트, 피부미용 컨설턴트, 헤어컨설턴트', '칼라리스트, 칼라테라피스트, 연예인 매니저, 토탈뷰티코디네이터, 화장품회사', '제품기획 및 교육강사, 토탈 뷰티학원강사, 뷰티전문지 기자, 뷰티에디터, 피부관리실 피부과', '에스테티션, 네일살롱, 발건강 관리실, 특수분장사, 이미지컨설턴트,아로마테라피스트', '웨딩 스튜디오, 개인창업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0067';

-- CRS-KH-0068  학교안전지도사 1급
UPDATE public.courses SET
  hero_description  = '학교안전지도사는 학교 내외에서 발생할 수 있는 각종 안전사고(화재, 재난, 폭력, 감염병, 교통 등)를 예방하고, 안전교육을 기획·지도·평가하는 전문가입니다. 즉, 학생·교직원·학부모를 대상으로 안전문화 확산과 생명존중 교육을 실천하는 안전교육 전문 인력입니다.',
  license_number    = '2019-004793',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '교직원 대상 안전관리 역량 강화 교육', '교육청·지자체·소방서·경찰서 등과 협력한 공동 안전교육 실시', '청소년 보호·학교폭력예방 캠페인 참여', '지역사회 안전문화 확산 활동 참여', '학교·기관별 맞춤형 안전교육 콘텐츠 기획', '학부모 대상 가정안전·디지털안전 교육 진행', '재난안전지도사·청소년지도사 등 타 자격과 융합 교육 운영']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '초·중·고등학교 안전교육 강사', '교육청·지자체 안전교육센터 및 안전체험관 강사', '청소년시설·복지관 안전지도 프로그램 운영자', '재난안전 전문 교육기관, 안전문화센터 취업', '프리랜서 안전교육 강사 및 프로그램 개발자', '교육부·지자체 중심의 안전전문가 및 외부 강사', '학교폭력, 재난, 성폭력, 감염병 등 복합 안전이슈 증가로 전문 강사', '국가인증 안전교육기관 안전체험관, 소방안전체험장 등 공공기관 강사', '교직·상담·복지 등 다양한 직무 전문 강사', '교육 강사, 안전 컨설턴트, 공공기관 안전교육 전문 강사, 각 지역 아동지키미, 학교보완관']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '박성우 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0068';

-- CRS-KH-0069  학교폭력예방상담사 1급
UPDATE public.courses SET
  hero_description  = '학교폭력의 예방과 대책에 필요한 교육과 상담을 전문적으로 할 수 있는 상담사를 양성하기 위한 과정입니다. 가해 및 피해 학생들을 상담하고 심리치료합니다. 또한, 사회적 자원을 동원하여 도움을 주고 무엇보다 학교폭력 예방에 도움을 주는 청소년 전문가 입니다. 해당 과정에서는 학교폭력 청소년 문제와 실태와 대책, 학고폭력 예방을 위한 다양한 방법들에 대해 학습하실 수 있습니다.',
  license_number    = '2019-004792',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '학교보안관, 아동지킴이, 어린이집, 유치원, 초등학교, 중등학교, 아동복지시설', '지역사회문화센터,안전교육이 필요한 어린이, 아동청소년 및 지역 주민들과 관련된 기관', '산업안전공단. 각 기업회사 직원분. 소상인 자영업자분들. 각지역 아동지키미 근무 원하시는분', '수련 시설 강사, 단체, 기관, 회사 안전 교육 담당자, 프리랜서 강사로 활동을 원하는 분', '학교폭력예방에 대한 교육, 학교폭력예방에 대한 강사 및 상담사, 단체, 기관, 회사 안전 교육 담당자']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '안전지킴이 및 안전관리사, 시설안전관리사, 유치원, 초등학교, 중등학교, 아동복지시설, 학습교사', '공부방, 문화센터, 지역아동센터, 학원, 홈스쿨, 프리랜서, 자원봉사자, 방과후교실, 어린이집', '은퇴를 준비하는 분들, 직장인, 복지분야 종사자, 취업준비생,,구청, 문화센터, 도서관등 특기적성 강사', '초, 중, 고 방과후학교, 특기적성 강사,각종 사회복지시설 및 교육기관 진출', '가정상담소 및 다양한 지원센터 등에서 교육, 교육 프로그램 개발을 필요로 하는 직업군', '취업희망자, 이직예정자, 직무능력 강화, 봉사 및 취미활동', '학교의 Wee센터, 드림스타트, 다문화가족지원센터, 위기가족지원센터, 사회복지관. 각지역 아동지키미', '학교폭력예방교육 강사·상담사, 청소년단체의 상담사, 학교폭력상담소운영, 학교폭력담당경찰']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '최철규 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0069';

-- CRS-KH-0070  헤어코디네이터 1급
UPDATE public.courses SET
  hero_description  = '헤어코디네이터란, 고객의 얼굴형, 이미지, 스타일, 퍼스널 컬러 등을 분석하여 가장 잘 어울리는 헤어스타일을 제안하고 연출해주는 전문가입니다. 단순히 머리를 자르거나 염색하는 기술자에 머무르지 않고, 고객 맞춤형 이미지 메이킹 전문가로 활동하는 것이 특징입니다.',
  license_number    = '2018-001181',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트', '헤어컨설턴트, 칼라리스트, 칼라테라피스트, 연예인 매니저, 토탈뷰티코디네이터', '미용실, 헤어샵, 헤어숍 창업,웨딩·행사 전문 스타일리스트', '방송·연예인 스타일링 팀, 이미지 컨설턴트, 뷰티 크리에이터(유튜브, SNS 활동)', '헤어 제품 브랜드(샴푸·염색약·스타일링 제품) 마케팅/홍보, 뷰티 아카데미 강사']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사, 초등학교 방과후 특기적성 교사', '사설교육기관 강사 및 운영자', '교육 프로그램 개발을 필요로 하는 직업군', '뷰티 컨설턴트, 코디네이터, 뷰티 스타일리스트, 메이크업아티스트, 피부미용 컨설턴트, 헤어컨설턴트', '미용실, 헤어샵, 헤어숍 창업, 웨딩·행사 전문 스타일리스트, 바버샵 실장', '방송·연예인 스타일링 팀, 뷰티 아카데미 강사,바버샵커트 지도사. 바벼샵 인터, 미용실 인턴', '이미지 컨설턴트, 뷰티 크리에이터(유튜브, SNS 활동), 뷰티전문지 기자자', '헤어 제품 브랜드(샴푸·염색약·스타일링 제품) 마케팅/홍보']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0070';

-- CRS-KH-0071  환경관리전문가 1급
UPDATE public.courses SET
  hero_description  = '환경관리전문가는 환경오염을 예방하고 지속가능한 생태환경을 조성하기 위해, 환경보전·관리·교육을 수행하는 전문가입니다. 대기·수질·폐기물·토양·에너지 등 다양한 환경 요소를 체계적으로 관리하고, 기업·학교·지역사회에서 환경정책을 실천하고 지도하는 역할을 담당합니다.',
  license_number    = '2021-002464',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '산업현장의 환경안전 관리 및 법규 준수 점검', '교육청·지자체·소방서·경찰서 등과 협력한 공동 안전교육 실시', '환경보고서 작성 및 관리 계획 수립 지원', '지자체 환경정책 참여 및 공공 캠페인 운영', '환경 관련 공모사업, 연구용역 참여', '공공기관, NGO와 연계한 환경 실천 프로그램 진행']::text[],
  career_paths      = ARRAY['프로그램을 운영하는 일반 교육서비스 제공기업 교사', '환경 관련 공공기관 (환경청, 지자체 환경과 등)', '환경컨설팅회사, 환경기술인협회, ESG 전문기관', '학교·복지관·평생교육기관 환경교육 강사', '프리랜서 환경교육 강사 및 캠페인 기획자', '환경 NGO, 사회적기업, 지역 환경단체', '산업현장 환경안전 담당자', '초·중·고 및 대학 환경교육, 체험학습 강사', '생태교육, 기후변화교육, 환경동아리 지도자', '기업의 환경안전관리자, ESG 실무자, 녹색경영 담당자', '폐기물 감축, 에너지 절약, 환경 인증 등 기업 운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '노성신 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0071';

-- CRS-KH-0075  AI프롬프트엔지니어
UPDATE public.courses SET
  hero_description  = '프롬프트엔지니어는 인공지능(AI)이 원하는 결과를 정확하게 생성하도록 질문과 명령어(프롬프트)를 설계하고 최적화하는 전문가를 말합니다. 다양한 AI 도구를 활용하여 텍스트, 이미지, 코드, 데이터 분석 등 원하는 결과를 효과적으로 얻을 수 있도록 프롬프트를 작성하고 관리하며, 기업이나 개인의 업무 효율을 높이는 역할을 합니다.',
  license_number    = '2025-003853',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['인공지능(AI) 활용 능력을 업무에 적용하고 싶은 직장인', 'AI 콘텐츠 제작 및 온라인 콘텐츠 활동을 준비하는 사람', '마케팅, 기획, 콘텐츠 분야 종사자 및 예비 종사자', 'AI 기술을 활용한 업무 자동화에 관심 있는 사람', 'IT 및 디지털 분야 신기술을 배우고 싶은 사람', '유튜브, 블로그 등 AI 콘텐츠 제작에 관심 있는 사람', '프리랜서 및 AI 관련 새로운 직업을 찾는 사람', '인공지능 활용 능력을 통해 취업 경쟁력을 높이고 싶은 사람']::text[],
  career_paths      = ARRAY['기업의 AI 활용 업무 자동화 및 콘텐츠 생성 담당자', '마케팅 및 광고 분야의 AI 콘텐츠 제작 전문가', '교육기관 및 기업의 AI 활용 교육 강사', 'IT 기업 및 스타트업의 AI 서비스 운영 및 기획 업무', '블로그, 유튜브 등 AI 기반 콘텐츠 제작 활동', '기업의 데이터 분석 및 문서 작성 자동화 업무', 'AI 기반 서비스의 챗봇 및 대화 설계 담당자', '프리랜서로 AI 활용 컨설팅 및 업무 지원']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김대영 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0075';

-- CRS-KH-0076  강아지산책전문가
UPDATE public.courses SET
  hero_description  = '강아지산책전문가는 반려견의 건강과 행동 특성을 고려하여 안전하고 올바른 산책을 지도하고 관리하는 전문가를 말합니다. 반려견의 운동량 조절, 사회화 훈련, 안전관리 등을 통해 반려견의 신체 건강과 정서 안정에 도움을 주며 보호자가 바쁜 경우 산책 서비스를 제공하거나 올바른 산책 방법을 안내하는 역할을 합니다.',
  license_number    = '2024-005431',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['반려견 산책 및 돌봄 전문가로 활동하고 싶은 사람', '반려동물 관련 창업을 준비하는 사람', '반려견 행동 및 관리 방법을 전문적으로 배우고 싶은 사람', '펫시터, 애견유치원 등 반려동물 산업 종사자', '반려견을 보다 안전하고 올바르게 관리하고 싶은 보호자', '반려동물 관련 취업을 준비하는 사람', '반려동물 활동 프로그램 지도에 관심 있는 사람', '반려동물 산업 분야에서 전문성을 높이고 싶은 사람']::text[],
  career_paths      = ARRAY['반려견 산책 서비스 및 펫시터 활동', '반려동물 돌봄센터 및 펫케어 서비스 업체 근무', '애견 유치원 및 반려견 운동·산책 프로그램 운영', '반려동물 훈련소 및 행동 교정 보조 활동', '반려동물 호텔 및 산책 관리 담당자', '반려동물 관련 방문 돌봄 서비스 제공', '반려동물 문화센터 및 산책 교육 프로그램 강사', '반려견 산책 서비스 창업 및 개인 활동']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0076';

-- CRS-KH-0077  교통안전지도사
UPDATE public.courses SET
  hero_description  = '교통안전지도사는 교통안전에 대한 전문 지식을 갖추고 안전 운전에 대한 중요성을 인식시키며 교통사고 예방을 위한 안전 지도와 일반인을 대상으로 안전의식을 높일 수 있도록 전문적으로 교육하고 지도하는 직무를 수행한다.',
  license_number    = '2024-005852',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['일반인', '교통안전 관련 분야에 계신 분들', '취업을 원하시는 분들', '단체,기관,회사 안전교육 담당자', '학생 등 교통안전에 관심 있는 분', '사회경력자로서 새로운 분야에 도전하고자 하시는 분', '자기계발을 통하여 스스로 능력을 향상 시키고자 하시는 분', '기타 전문직에서 퇴직 후 안정적이며 보람있는 직무를 찾고 계시는 분']::text[],
  career_paths      = ARRAY['초등 학교보안관이나 학교안전지킴이', '각급 학교(유치원,초,중,고교 및 대학교 등)', '안전 관련 업무 분야', '교통안전 관련 기업체, 단체 모든 사회 분야', '도로교통현장(학교앞, 사거리 등)등 에서 보행자 보호 활동', '차량운송 사업체, 기업체']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '강병찬 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0077';

-- CRS-KH-0078  동물병원코디네이터
UPDATE public.courses SET
  hero_description  = '▶반려동물과 보호자를 잇는 커뮤니케이션 전문가◀ 동물병원코디네이터는 진료 전·후 접수 및 예약 관리, 보호자 응대, 진료 보조, 동물의 기본 상태 체크, 병원 환경 정비 등 병원 운영 전반에 걸쳐 중요한 역할을 수행하는 직무입니다. 이 과정에서는 반려동물에 대한 기본 지식부터 고객응대 커뮤니케이션, 의료서비스 이해, 진료 시스템 운영 이해 등 실제 동물병원에서 필요한 핵심 역량을 체계적으로 학습할 수 있습니다. 동물병원 수요가 증가함에 따라 전문 코디네이터에 대한 채용 수요도 빠르게 증가하고 있으며, 현장에서 바로 활용 가능한 실무 중심 커리큘럼으로 초보자도 취업을 목표로 준비할 수 있는 실용적인 과정입니다.',
  license_number    = '2024-005376',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['동물병원 취업을 준비하는 예비 종사자', '반려동물 분야에 관심 있는 전공자 및 일반인', '동물 관련 자격증을 활용해 실무 진출을 원하는 분', '반려동물 산업 관련 진로를 탐색 중인 청년층', '서비스 직무 경험을 반려동물 분야에 접목하고 싶은 분']::text[],
  career_paths      = ARRAY['동물병원에서 접수·예약 관리 및 고객 상담 코디네이터로 활동', '진료 전후 보호자 안내 및 병원 서비스 관리 업무 수행', '반려동물 병원에서 진료 보조 및 환자 관리 지원 역할', '동물병원 마케팅 및 고객관리(CS) 담당자로 활동', '반려동물 관련 펫샵·펫케어센터 상담 및 관리 업무', '동물병원 병원 운영 및 행정 관리 보조', '반려동물 관련 기업의 고객 상담 및 서비스 담당자', '반려동물 교육기관 및 문화센터 펫케어 관련 강의 활동', '동물병원 창업 시 병원 서비스 관리 및 운영 지원 역할', '반려동물 산업 분야의 상담 및 코디네이션 전문가로 활동']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '황다설 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국엔씨에스자격개발원'),
  updated_at        = now()
WHERE code = 'CRS-KH-0078';

-- CRS-KH-0079  등하원보호사
UPDATE public.courses SET
  hero_description  = '등하원돌봄지원사는 어린이집이나 유치원, 학교에 다니는 아동의 등하원 과정을 안전하게 지원하고 보호하는 역할을 수행하는 전문 인력입니다. 맞벌이 가정 증가와 돌봄 공백 문제로 인해 등하원돌봄지원사의 필요성과 수요는 꾸준히 증가하고 있습니다. 등하원돌봄지원사 자격증은 아동의 등하원 동행, 안전 지도, 생활 관리, 보호자 소통 등 다양한 업무에 활용되며 돌봄 서비스 기관, 지역 돌봄센터, 교육기관 연계 서비스 등에서 활용도가 높은 자격증입니다. 특히 등하원돌봄지원사는 아동의 안전을 책임지는 역할을 수행하기 때문에 기본적인 아동 이해와 안전 관리 능력이 중요한 분야입니다. 등하원돌봄지원사 자격증을 취득하면 아동 돌봄 서비스, 방과후 돌봄, 지역 커뮤니티 돌봄 활동 등 다양한 분야로의 진출 준비에 활용될 수 있으며 아동 관련 직무 수행에 필요한 기초 역량을 갖추는 데 도움이 될 수 있습니다. 본 과정은 아동 발달 이해부터 안전 관리, 등하원 동행 방법, 상황별 대응 방법까지 실무 중심으로 구성되어 있으며 단기간 내 이론 학습 후 자격증 취득이 가능하도록 설계되었습니다.',
  license_number    = '2026-001440',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['아이들의 등하원 동행 및 돌봄 서비스를 준비하는 분', '베이비시터 및 아동돌봄 분야 취업을 희망하는 분', '방과후 돌봄교실 및 돌봄센터 취업을 준비하는 분', '맞벌이 가정 아동 돌봄 서비스에 관심 있는 분', '아이 돌봄 관련 제2의 직업을 찾는 중장년층']::text[],
  career_paths      = ARRAY['어린이 등하원 동행 보호 활동', '통학로 안전지도 및 위험요소 관리 활동', '아동 대상 생활예절 및 안전교육 보조 활동', '학교·학원 연계 보호 서비스 활동', '보호자 요청 기반 맞춤형 돌봄 지원 활동']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국엔씨에스자격개발원'),
  updated_at        = now()
WHERE code = 'CRS-KH-0079';

-- CRS-KH-0080  디지털튜터
UPDATE public.courses SET
  hero_description  = '▶디지털 환경 속 학습을 돕는 새로운 교육 전문가◀ 디지털튜터는 비대면 학습 환경에서 노인들이 온라인 콘텐츠를 잘 이해하고 스스로 학습을 지속할 수 있도록 돕는 "디지털 학습 지원자" 입니다. 온라인 수업이 일상이 된 요즘, 교사와 학생 간의 간극을 메워주는 디지털 교육 보조자로 주목받고 있으며, 학습 자료 안내, 과제 관리, 참여 유도 등 실질적인 학습 지원 업무를 수행합니다.',
  license_number    = '2026-000973',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['비대면 시대, 교육 현장에 적응하고 싶은 중장년층', '온라인 튜터링이나 화상학습 보조업무로 N잡을 찾는 분', '교육청·학교 비대면 수업 지원 인력으로 취업하고 싶은 분', '에듀테크 교육 분야로 커리어 전환을 고려 중인 분', '디지털 리터러시 기반의 교육직에 관심 있는 경력단절자']::text[],
  career_paths      = ARRAY['초·중·고 학생을 대상으로 디지털 기초교육 및 코딩 기초 지도 활동', '노인·성인을 위한 스마트폰, 키오스크 등 디지털 문해 교육 강사', '지역 평생교육원 및 주민센터 디지털 교육 프로그램 강사', '학교 및 교육기관의 온라인 학습 지원 튜터 활동', '기업이나 기관의 디지털 역량 강화 교육 보조 강사', '도서관, 복지관 등에서 디지털 활용 교육 지도사', '유튜브·블로그 등 콘텐츠 제작 교육 지도', '청소년 대상 AI·메타버스·디지털 기초 체험 프로그램 운영', '공공기관 및 지자체의 디지털 배움터 강사', '방과후학교 및 교육센터 디지털 교육 지도 활동']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '허지영 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국엔씨에스자격개발원'),
  updated_at        = now()
WHERE code = 'CRS-KH-0080';

-- CRS-KH-0081  보험심사관리사
UPDATE public.courses SET
  hero_description  = '헤어코디네이터란, 고객의 얼굴형, 이미지, 스타일, 퍼스널 컬러 등을 분석하여 가장 잘 어울리는 헤어스타일을 제안하고 연출해주는 전문가입니다. 단순히 머리를 자르거나 염색하는 기술자에 머무르지 않고, 고객 맞춤형 이미지 메이킹 전문가로 활동하는 것이 특징입니다.',
  license_number    = '2024-004991',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['미용업계 종사자', '미용학과 전공자 및 취업 준비생', '개인 뷰티샵 창업 희망자', '이미지 메이킹 및 스타일링에 관심 있는 일반인', '웨딩/방송/화보 스타일리스트 지망생']::text[],
  career_paths      = ARRAY['미용실, 헤어샵', '웨딩 및 화보 촬영 현장', '방송 및 연예인 스타일링', '이미지 컨설팅 및 퍼스널컬러 전문가와 협업']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '고희경 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0081';

-- CRS-KH-0082  세차관리사
UPDATE public.courses SET
  hero_description  = '세차관리사는 자동차의 외장과 내장을 청결하게 유지하고 차량의 상태를 관리하는 전문 인력을 말합니다. 차량 외부의 오염물 제거, 휠과 타이어 관리, 실내 청소, 광택 및 코팅 관리 등을 통해 차량의 미관을 유지하고 차량의 수명을 보호하는 역할을 합니다. 또한 차량 관리 방법을 안내하고 올바른 세차 방법과 관리 요령을 제공하여 차량을 보다 깨끗하고 안전하게 유지하도록 돕는 전문가입니다.',
  license_number    = '2026-001013',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['일반인, 학생, 주부등 특정 전공이나 경력 제한 없이 수강 가능', '차량 관리를 스스로 하고자 하는 일반 운전자', '세차 및 차량 관리에 관심은 있으나 체계적인 학습 경험이 없는 분', '취미 수준의 관리 활동을 정리된 이론으로 익히고 싶은 분', '차량 관리 관련 기본 지식을 정립하고 싶은 분', '소규모 차량 관리 활동에 대한 기초 이해가 필요한 분']::text[],
  career_paths      = ARRAY['세차 관련 업종 보조 업무', '주차장 및 시설 관리 연계 분야', '소규모 차량 관리 활동 준비 분야', '개인 차량 외장 및 내장 관리 활동', '가족 및 지인 차량 관리 지원 활동', '생활 밀착형 차량 관리 보조 활동', '차량 관리 과정 전반에 대한 기초 실무 이해', '소규모 차량 관리 활동을 위한 준비 단계 이해']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김태훈 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국엔씨에스자격개발원'),
  updated_at        = now()
WHERE code = 'CRS-KH-0082';

-- CRS-KH-0083  유품정리사
UPDATE public.courses SET
  hero_description  = '유품정리사는 고인의 유품을 정리·분류·처리하며, 남겨진 가족의 정서적 부담을 덜어주고 위생·안전까지 고려해 공간을 정리하는 전문 인력입니다. 단순 정리 서비스가 아니라 심리적 배려 + 전문 작업이 결합된 직무입니다.',
  license_number    = '2025-005559',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['중·장년층 재취업 희망자', '요양보호사, 사회복지사, 간병인', '정리수납전문가, 청소·시설관리 종사자', '장례지도사, 상조회사 종사자', '1인 창업 또는 부업을 고려하는 분', '고독사·복지 분야에 관심 있는 일반인', '사회적 가치가 있는 직업을 찾는 분']::text[],
  career_paths      = ARRAY['복지·공공기관 연계', '지자체 고독사 예방·사후관리 사업', '사회복지관, 노인복지시설 연계 활동', '1인 창업·프리랜서', '지역 기반 유품정리 서비스 운영', '정리·청소·특수청소와 병행 가능', '정리수납·청소 관련 직무 확장', '정리수납전문가, 특수청소업 종사자의 전문성 강화']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0083';

-- CRS-KH-0084  음악심리상담사
UPDATE public.courses SET
  hero_description  = '음악을 매개로 개인의 정서·행동·심리 상태를 이해하고, 치유와 성장, 정서 안정과 회복을 돕는 심리상담 전문 인력입니다.',
  license_number    = '2020-000354',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['심리상담·음악치료 분야 취업 및 역량 강화를 원하는 분', '교사·상담사·사회복지사·요양보호사 등 돌봄 종사자', '음악 전공자 또는 음악 활용 상담에 관심 있는 분', '아동·청소년·노인 대상 프로그램 운영자', '치유·힐링·상담 분야로 진출을 희망하는 일반인']::text[],
  career_paths      = ARRAY['아동·청소년 정서 지원 및 심리 안정 프로그램 운영', '노인·치매·발달장애 대상 음악 기반 정서 치유 활동', '스트레스·불안·우울 완화를 위한 개인·집단 상담', '학교·복지기관·의료기관 연계 음악치료 프로그램 진행', '예방 중심의 정서관리 및 힐링 프로그램 기획·운영']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '이민태 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0084';

-- CRS-KH-0085  치과병원코디네이터
UPDATE public.courses SET
  hero_description  = '치과병원코디네이터는 치과를 방문하는 환자의 예약, 접수, 상담, 진료 안내, 고객관리 및 병원 서비스 운영을 지원하는 전문 인력입니다. 환자와 의료진 사이의 원활한 소통을 돕고, 환자가 편안하게 진료를 받을 수 있도록 전반적인 고객 서비스를 제공하는 역할을 수행합니다.',
  license_number    = '2026-003111',
  lecture_format    = '이론 중심, 사례 안내',
  certificate_fee   = 100000,
  target_audience   = ARRAY['치과 취업을 준비하는 분', '병원 코디네이터로 활동하고 싶은 분', '고객상담 분야에 관심 있는 분', '병원 서비스 직무를 희망하는 분', '치과·병원 행정 업무를 배우고 싶은 분', '의료서비스 분야 취업을 준비하는 분', '재취업을 준비하는 경력단절 여성', '서비스 및 CS 역량을 향상시키고 싶은 분', '병원 마케팅 및 고객관리에 관심 있는 분', '안정적인 의료기관 근무를 희망하는 분']::text[],
  career_paths      = ARRAY['치과 접수 및 예약관리 업무', '환자 상담 및 진료 안내 업무', '고객 응대 및 서비스 관리 업무', '치료계획 설명 및 상담 지원 업무', '병원 고객만족도 관리 업무', '재방문 및 고객관리 프로그램 운영', '병원 마케팅 및 홍보 지원 업무', '치과 행정 및 원무 업무 지원', '불만 고객 응대 및 서비스 개선 업무', '병원 이미지 및 고객경험 관리 업무']::text[],
  professor_id      = (SELECT id FROM public.professors WHERE name = '김시혜 교수' AND deleted_at IS NULL),
  issuing_agency_id = (SELECT id FROM public.issuing_agencies WHERE name = '한국직업능력검정협회'),
  updated_at        = now()
WHERE code = 'CRS-KH-0085';

