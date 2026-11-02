/** 수강신청이 어느 버튼에서 왔는지 (enrollments.source) */
export type EnrollmentSource = "job" | "job_course_detail" | "course_detail" | "cart";

export type EnrollmentApplicationInput = {
  memberId: string;
  courseId: string;
  source?: EnrollmentSource;
};

export type EnrollmentApplicationErrorCode =
  | "unauthenticated"
  | "member_not_found"
  | "course_not_found"
  | "duplicate"
  | "unknown";

export type EnrollmentApplicationResult =
  | { success: true; enrollmentId: string }
  | { success: false; code: EnrollmentApplicationErrorCode; message: string };
