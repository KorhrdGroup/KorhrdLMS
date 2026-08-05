import type { LiveRow } from '@/features/korhrd/components/home/LiveTicker';

/**
 * 메인 "수강생들의 한 걸음 더 성장한 순간" 티커 데이터.
 * 실서비스에서는 최근 수강완료·발급완료 내역을 서버에서 받아 같은 모양으로 넘기세요.
 * 이름은 저장 시점에 이미 마스킹된 형태로 둡니다.
 */
export const LIVE_FEED: LiveRow[] = [
  { state: 'done',   name: '김*숙', course: '병원동행매니저',       date: '26-04-17' },
  { state: 'done',   name: '박*희', course: '생활지원사',           date: '26-04-17' },
  { state: 'issued', name: '최*영', course: '방과후돌봄교실지도사', date: '26-04-16' },
  { state: 'issued', name: '정*선', course: '심리상담사 1급',       date: '26-04-16' },
  { state: 'issued', name: '한*미', course: '실버인지활동지도사',   date: '26-04-15' },
  { state: 'done',   name: '오*정', course: '반려동물관리사',       date: '26-04-15' },
  { state: 'issued', name: '김*영', course: '바리스타 1급',         date: '26-04-14' },
  { state: 'done',   name: '신*경', course: 'SNS마케팅전문가',      date: '26-04-14' },
  { state: 'issued', name: '권*주', course: '유튜브크리에이터',     date: '26-04-13' },
  { state: 'done',   name: '윤*정', course: '네일아트코디네이터',   date: '26-04-13' },
  { state: 'issued', name: '장*미', course: '아동미술지도사',       date: '26-04-12' },
  { state: 'done',   name: '임*희', course: '독서논술지도사',       date: '26-04-12' },
  { state: 'issued', name: '김*람', course: '코딩지도사',           date: '26-04-11' },
  { state: 'done',   name: '배*진', course: '미술심리상담사',       date: '26-04-11' },
  { state: 'issued', name: '백*선', course: '노인심리상담사',       date: '26-04-10' },
  { state: 'done',   name: '문*정', course: '실버케어지도사',       date: '26-04-10' },
  { state: 'issued', name: '남*희', course: '병원원무행정전문가',   date: '26-04-09' },
  { state: 'done',   name: '차*영', course: '산모신생아건강관리사', date: '26-04-09' },
  { state: 'issued', name: '류*진', course: '방과후수학지도사',     date: '26-04-08' },
  { state: 'done',   name: '강*희', course: '클레이아트지도사',     date: '26-04-08' },
  { state: 'issued', name: '송*영', course: '종이접기지도사',       date: '26-04-07' },
  { state: 'issued', name: '황*미', course: '조향사[향수디자이너] 1급', date: '26-04-07' },
  { state: 'done',   name: '안*희', course: '부동산권리분석사',     date: '26-04-06' },
  { state: 'issued', name: '전*영', course: '안전관리사',           date: '26-04-05' },
  { state: 'done',   name: '홍*진', course: '자원봉사지도사',       date: '26-04-05' },
  { state: 'issued', name: '정*필', course: '환경관리전문가',       date: '26-04-04' },
  { state: 'done',   name: '하*미', course: '반려동물행동상담지도사', date: '26-04-04' },
  { state: 'issued', name: '민*영', course: '디지털리터러시지도사', date: '26-04-03' },
];
