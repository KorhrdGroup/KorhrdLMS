/**
 * 화면이 의존하는 데이터 타입 정의.
 *
 * 지금은 data/*.ts 의 정적 배열이 이 타입을 만족합니다.
 * API 연동 시 응답을 이 타입으로 매핑하면 화면 코드는 그대로 두어도 됩니다.
 */

/** 목적 — 메인 "어떤 목적으로 자격증을 찾으세요?" · 수강신청 사이드바 */
export type Purpose =
  | '취업 준비'
  | '이직·전직'
  | '부업·창업'
  | '자기계발'
  | '심리상담'
  | '아동·교육';

/** 추천 연령대 */
export type AgeBand = '20~30대' | '40~50대' | '60대 이상';

/**
 * 분야 — 수강신청 사이드바의 '과정별' 필터 값입니다.
 *
 * 취업 길찾기의 직업군과 같은 분류를 씁니다. 다만 표기는 다릅니다.
 *   여기(필터)  '복지·돌봄'      — 좁은 칸에 들어가야 해서 붙여 씁니다
 *   직업군 카드  '복지 · 돌봄'    — 읽기 좋게 띄어 씁니다
 * 문자열로 비교하지 말고 JobGroup.cat 으로 연결하세요.
 * '기타'는 어느 직업군에도 속하지 않는 과정을 담는 필터 전용 값입니다.
 */
export type Category =
  | '복지·돌봄'
  | '교육·아동'
  | '상담'
  | '병원·의료'
  | '반려동물'
  | '뷰티'
  | '마케팅·사무'
  | 'ESG·환경'
  | 'IT·디지털'
  | '창업·취미'
  | '기타';

export interface Course {
  /** 과정명 (고유 키로 쓰입니다) */
  n: string;
  /** 주무부처 — public/ministry-logo/{g}.svg, {g}-white.svg 파일명과 일치해야 합니다 */
  g: string;
  /** 담당교수 */
  prof: string;
  /** 총 강의시간(시간) */
  hours: number;
  /** 정가(원) — 화면에는 취소선으로 노출되고 실제 결제는 0원입니다 */
  price: number;
  /** 자격증 발급비(원) */
  fee: number;
  /** 민간자격 등록번호 */
  reg: string;
  /** 내부 과정 코드 */
  code: string;
  /** 등록연도 — 2025 이상이면 '신규' 배지 */
  year: number;
  /** 차시 수 */
  lessons: number;
  /** 인기순위 (0 = 순위 밖, 1~3 이면 '인기' 배지) */
  rank: number;
  /** 목적 (복수) */
  p: Purpose[];
  /** 추천 연령대 (복수) */
  a: AgeBand[];
  /** 대표 추천 연령대 — 반드시 a 안에 포함되어야 합니다 */
  ap: AgeBand;
  /** 분야 — 현재 1개씩 부여됩니다 */
  c: Category[];
  /** 관리자가 체크한 마감임박 과정 — 수강신청 목록에서만 배지가 붙습니다 */
  closing?: boolean;
  /** 과정 썸네일 URL — 어드민 과정관리에서 올린 이미지(courses.thumbnail_url) */
  thumb?: string;
}

export interface JobGroup {
  /** URL 파라미터로 쓰는 키 (예: /jobs?g=welfare) */
  key: string;
  /** 화면에 보이는 이름 — 가운뎃점 앞뒤를 띄어 씁니다 */
  name: string;
  /** 카드 아래 한 줄 설명 */
  desc: string;
  /** 대응하는 수강신청 '과정별' 필터 값 — /courses?cat= 로 넘길 때 씁니다 */
  cat: Category;
}

export interface Job {
  /** 소속 직업군 key */
  g: string;
  /** 직업명 */
  name: string;
  /** 이 직업에 필요한 과정명 — Course.n 과 일치해야 합니다 */
  course: string;
  /** 카드 한 줄 소개 */
  summary: string;
  /** 하는 일 */
  tasks: string[];
  /** 이런 분에게 추천 */
  recommend: string[];
  /** 주로 근무하는 곳 */
  workplaces: string[];
  /** 채용공고 검색 키워드 */
  keywords: string[];
}

/** 합격후기 */
export interface Review {
  id: string;
  title: string;
  body: string;
  /** 작성자 (마스킹된 형태로 저장) */
  author: string;
  /** 작성일 YYYY-MM-DD */
  date: string;
  /** 대표 과정 — 목록 필터·과정 상세 노출의 기준입니다 */
  course: string;
  /** 함께 수강한 과정 — 카드에 태그로만 표시되고 필터에는 잡히지 않습니다 */
  alsoCourses: string[];
  /** 도움됐어요 수 */
  helpful: number;
  /** 내가 눌렀는지 */
  helpfulByMe?: boolean;
  /** 자격증 실물 사진 (1:1). 없으면 자리표시가 숨겨집니다 */
  photo?: string;
}

/** 나의 강의실 — 수강 상태 */
export type EnrollmentStatus =
  | 'learning' // 학습중
  | 'ready' // 시험 응시 가능
  | 'pass' // 합격
  | 'fail' // 불합격
  | 'issued' // 발급 신청 완료
  | 'expired'; // 수강기간 만료

export interface Enrollment {
  course: string;
  status: EnrollmentStatus;
  /** 진도율 0~100 */
  progress: number;
  startDate: string;
  endDate: string;
  /** 시험 점수 (응시했다면) */
  score?: number;
  /** 합격일 — 합격후기 목록에 '○○ 합격'으로 표시됩니다 */
  passedAt?: string;
  /** 자격증 발급 신청 기한 */
  issueDeadline?: string;
}
