import type { CourseStatus } from "@/types/database.types";

export type CourseRegistrationInput = {
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

export type CourseRegistrationResult =
  | { success: true; courseId: string; message: string }
  | { success: false; message: string; field?: keyof CourseRegistrationInput };

export type CourseNameCheckResult =
  | { available: true; message: string }
  | { available: false; message: string };

export type CourseListItem = {
  id: string;
  code: string;
  name: string;
  category: string | null;
  category_id: string | null;
  /** course_categories.name. 목록 조회 시 category_id로 조인해 채워집니다. */
  categoryName?: string | null;
  default_duration_days: number | null;
  completion_attendance_rate: number | null;
  completion_exam_score: number | null;
  price: number;
  status: CourseStatus;
  created_at: string;
};
