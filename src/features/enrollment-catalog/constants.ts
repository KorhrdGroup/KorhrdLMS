export const ENROLLMENT_CATALOG_COURSE_SELECT =
  "id, code, name, category, category_id, description, default_duration_days, price, status, created_at, professor_name, study_method, lecture_time, supervising_agency, is_deadline_soon, regular_price, display_price, is_free_course, thumbnail_url" as const;

/** 수강신청 사이드바 카테고리 목록 조회용(course_categories). is_active=true만 대상입니다. */
export const ENROLLMENT_CATALOG_CATEGORY_SELECT = "id, name, sort_order" as const;

export const ENROLLMENT_CATALOG_CLASS_SELECT =
  "id, course_id, year, name, manager_name, application_start, application_end, enrollment_start, enrollment_end" as const;

export const ENROLLMENT_CATALOG_ALL_CATEGORY_ID = "all";

/**
 * 수강신청 시 courses.default_duration_days가 비어 있을 때 사용할 기본 수강기간(일).
 * 민간자격증 LMS는 반(class) 없이 신청 즉시 확정되므로, 수강 종료일(end_date)을
 * 신청일 기준으로 바로 계산하는 데 사용합니다.
 */
export const DEFAULT_ENROLLMENT_DURATION_DAYS = 30;

export const ENROLLMENT_CATALOG_UNCATEGORIZED_LABEL = "미분류";

/**
 * 과정별 이미지 데이터가 courses 테이블에 없어 카드 썸네일은 사이트 공용 이미지를 사용합니다.
 * (특정 과정을 흉내 낸 새 mock 데이터가 아닌, 기존에 배포된 사이트 이미지를 재사용합니다.)
 */
export const ENROLLMENT_CATALOG_DEFAULT_IMAGE = "/images/home/kllc_101.jpg";
