export type EnrollmentApplicationInput = {
  memberId: string;
  courseId: string;
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
