export type EnrollmentCatalogBadgeTone = "urgent";

/** 과정관리 > 과정등록/수정의 "마감임박 표시" 스위치(courses.is_deadline_soon)로 ON/OFF됩니다. */
export type EnrollmentCatalogBadge = {
  label: string;
  tone: EnrollmentCatalogBadgeTone;
};

/** 관리자 반관리(classes)에서 등록한, 현재 신청 가능한 수강반 1건 */
export type EnrollmentCatalogClass = {
  id: string;
  year: number;
  name: string;
  managerName: string | null;
  applicationStart: string | null;
  applicationEnd: string | null;
  enrollmentStart: string;
  enrollmentEnd: string;
};

/**
 * 학생 수강신청 화면에 노출되는 과정 1건.
 * `courses` 테이블 + 신청 가능한 `classes` 레코드(course_id 기준 연결)를 조합해서 만듭니다.
 */
export type EnrollmentCatalogCourse = {
  id: string;
  /** 과정 코드(courses.code). 상세 페이지 링크 및 초기 선택(select 쿼리) 매칭에 사용됩니다. */
  slug: string;
  title: string;
  /** 가장 마감이 임박한 수강반 정보로 만든 부제, 예: "(2026년 1기)" */
  suffix: string;
  /** null이면 배지 미표시(과정관리 > 마감임박 표시 OFF). */
  badge: EnrollmentCatalogBadge | null;
  categoryId: string;
  categoryLabel: string;
  /** 담당교수명(courses.professor_name). 과정관리 > 과정수정 화면에서 직접 입력합니다. */
  professorName: string | null;
  durationLabel: string;
  /** 수업방식(courses.study_method). 예: 온라인 강의 */
  studyMethod: string;
  /** 강의시간 안내 문구(courses.lecture_time). 예: 전체 약 20시간 */
  lectureTime: string;
  /** 주무관청(courses.supervising_agency). 예: 보건복지부 */
  supervisingAgency: string;
  /** 수강료(원). courses.price. 자격증 발급비 결제 등 별도 결제 플로우에서 사용합니다. */
  price: number;
  /**
   * 과정 카드에 취소선으로 표시되는 정가(courses.regular_price). 기본값 400,000원.
   * 민간자격증 LMS는 선결제가 아닌 "무료수강 → 학습 → 자격증 발급비 결제" 구조이므로
   * 정가는 실제 청구 금액이 아니라 카드에 노출되는 안내용 정가입니다.
   */
  regularPrice: number;
  /** 과정 카드에 강조 표시되는 실제 표시가(courses.display_price). 기본값 0원(무료수강). */
  displayPrice: number;
  /** 무료수강 과정 여부(courses.is_free_course). 기본값 true. */
  isFreeCourse: boolean;
  /** 과정 카드 썸네일 이미지 공개 URL(courses.thumbnail_url). null이면 기본 이미지를 사용합니다. */
  thumbnailUrl: string | null;
  /** 신청 가능(접수기간 이내)한 수강반 목록. 비어 있으면 신청 시 안내 메시지로 막습니다. */
  classes: EnrollmentCatalogClass[];
};

export type EnrollmentCatalogCategory = {
  id: string;
  label: string;
};
