import type { CourseStatus } from "@/types/database.types";

export type { CourseStatus };

export const COURSE_STATUS_LABELS: Record<CourseStatus, string> = {
  active: "운영중",
  hidden: "숨김",
  closed: "종료",
};

export const COURSE_LIST_SELECT =
  "id, code, name, category, category_id, default_duration_days, completion_attendance_rate, completion_exam_score, price, status, created_at" as const;

/** 신규 과정 등록 시 기본값(DB 컬럼 기본값과 동일하게 맞춥니다). */
export const COURSE_STUDY_METHOD_DEFAULT = "온라인 강의";
export const COURSE_LECTURE_TIME_DEFAULT = "전체 약 20시간";
export const COURSE_SUPERVISING_AGENCY_DEFAULT = "보건복지부";
/** 학생 카드에 취소선으로 표시되는 정가 기본값(원). */
export const COURSE_REGULAR_PRICE_DEFAULT = 400000;
/** 학생 카드에 강조 표시되는 표시가 기본값(원). 0원 = 무료수강. */
export const COURSE_DISPLAY_PRICE_DEFAULT = 0;

/** 과정 썸네일 이미지 업로드용 Storage 버킷명. */
export const COURSE_THUMBNAIL_BUCKET = "course-thumbnails";

export const COURSE_SEARCH_FIELD_LABELS = {
  all: "전체",
  name: "과정명",
  code: "과정코드",
  category: "과정분류",
} as const;

export type CourseSearchField = keyof typeof COURSE_SEARCH_FIELD_LABELS;
