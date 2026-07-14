/**
 * 과제관리(/admin/assignments) Mock 데이터 타입 정의입니다.
 *
 * 추후 Supabase 연동 시 아래 구조를 기준으로 다음 테이블에 매핑할 수 있도록 설계했습니다.
 * - Assignment           → online_assignments (courses.id 연결)
 * - AssignmentSubmission → online_assignment_submissions (student, file, score, feedback)
 *
 * `src/features/assignment-management/repositories/assignment.repository.ts`의 함수
 * 시그니처만 유지한 채 내부 구현을 Mock 배열 → Supabase 쿼리로 교체하면,
 * 서비스/액션/컴포넌트 레이어는 변경하지 않아도 되도록 설계했습니다.
 *
 * 참고: 이 모듈은 기존 `/admin/exams/assignments`(과정/분반별 실제 Supabase 연동)와는
 * 별도의 온라인 제출·채점용 과제 관리 기능입니다.
 */
export type SubmissionStatus = "submitted" | "graded";

export type AssignmentSubmission = {
  id: string;
  studentName: string;
  studentEmail: string;
  submittedAt: string;
  fileName: string | null;
  status: SubmissionStatus;
  score: number | null;
  feedback: string | null;
};

export type Assignment = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  description: string;
  submissionStart: string;
  submissionEnd: string;
  allowAttachment: boolean;
  maxUploadSizeMb: number;
  isPublished: boolean;
  createdAt: string;
  submissions: AssignmentSubmission[];
};

export type AssignmentListItem = {
  id: string;
  courseId: string;
  courseName: string;
  title: string;
  submissionStart: string;
  submissionEnd: string;
  isPublished: boolean;
  submissionCount: number;
  gradedCount: number;
  createdAt: string;
};

export type AssignmentCourseOption = {
  id: string;
  name: string;
  code: string;
};

export type AssignmentFilterOptions = {
  courses: AssignmentCourseOption[];
};

export type AssignmentPublishFilter = "" | "published" | "unpublished";

export type AssignmentListQuery = {
  page: number;
  pageSize: number;
  search: string;
  courseId: string;
  publish: AssignmentPublishFilter;
};

export type AssignmentRegistrationInput = {
  courseId: string;
  title: string;
  description: string;
  submissionStart: string;
  submissionEnd: string;
  allowAttachment: boolean;
  maxUploadSizeMb: string;
  isPublished: boolean;
};

export type AssignmentRegistrationResult =
  | { success: true; assignmentId: string; message: string }
  | {
      success: false;
      message: string;
      field?: keyof AssignmentRegistrationInput;
    };

export type AssignmentEditInput = AssignmentRegistrationInput;

export type AssignmentEditDetail = AssignmentEditInput & {
  id: string;
  courseName: string;
};

export type AssignmentEditResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof AssignmentEditInput };

export type GetAssignmentForEditResult =
  | { success: true; assignment: AssignmentEditDetail }
  | { success: false; message: string };

export type AssignmentDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
