import type { CourseStatus } from "@/types/database.types";

export const COURSE_EDIT_SELECT =
  "id, code, name, category, category_id, default_duration_days, completion_attendance_rate, completion_exam_score, price, status, description, professor_name, study_method, lecture_time, supervising_agency, is_deadline_soon, regular_price, display_price, is_free_course, thumbnail_url" as const;

export type CourseEditInput = {
  name: string;
  code: string;
  /** course_categories.id. 빈 문자열이면 미분류로 저장됩니다. */
  categoryId: string;
  defaultDurationDays: string;
  completionAttendanceRate: string;
  completionExamScore: string;
  /** 수강료(원). 미입력 시 0(수강료 미정)으로 저장됩니다. */
  price: string;
  status: CourseStatus;
  description: string;
  /** 담당교수명. 학생 수강신청 과정 카드의 "담당교수"에 노출됩니다. */
  professorName: string;
  /** 수업방식(예: 온라인 강의). 학생 수강신청 과정 카드에 노출됩니다. */
  studyMethod: string;
  /** 강의시간 안내 문구(예: 전체 약 20시간). 학생 수강신청 과정 카드에 노출됩니다. */
  lectureTime: string;
  /** 주무관청(예: 보건복지부). 학생 수강신청 과정 카드에 노출됩니다. */
  supervisingAgency: string;
  /** "마감임박" 배지 노출 여부. 학생 수강신청 과정 카드에 반영됩니다. */
  isDeadlineSoon: boolean;
  /** 정가(원). 학생 카드에 취소선으로 표시됩니다. 미입력 시 400,000원. */
  regularPrice: string;
  /** 표시가(원). 학생 카드에 강조 표시됩니다. 미입력 시 0원(무료수강). */
  displayPrice: string;
  /** 무료수강 과정 여부. */
  isFreeCourse: boolean;
  /** 과정 카드 썸네일 이미지 공개 URL(course-thumbnails 버킷 업로드 결과). 빈 문자열이면 기본 이미지 사용. */
  thumbnailUrl: string;
};

export type CourseEditDetail = CourseEditInput & {
  id: string;
};

export type CourseEditResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof CourseEditInput };

export type GetCourseForEditResult =
  | { success: true; course: CourseEditDetail }
  | { success: false; message: string };

export type CourseDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
