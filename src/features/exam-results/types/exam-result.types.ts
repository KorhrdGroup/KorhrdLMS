/**
 * 평가관리 > 성적관리(/admin/exam-results) 화면에서 사용하는 타입입니다.
 *
 * 과정관리 > 시험관리(exams)와 달리, 이 화면은 학생이 실제로 응시한 시험
 * 결과(Supabase `exam_submissions`)를 조회하고 재시험 허용 여부를 관리합니다.
 */

export type ExamResultListItem = {
  /** exam_submissions.id */
  id: string;
  member: {
    id: string;
    name: string;
    loginId: string;
  };
  course: {
    id: string;
    name: string;
  };
  exam: {
    id: string;
    name: string;
  };
  submittedAt: string;
  score: number;
  totalScore: number;
  /** 채점 기준(pass_score)이 없는 시험이면 null입니다. */
  isPassed: boolean | null;
  retakeAllowed: boolean;
  retakeAllowedAt: string | null;
};

export type ExamResultSearchField = "all" | "member_name" | "login_id" | "course_name" | "exam_name";

export type ExamResultPassFilter = "all" | "passed" | "failed";

export type ExamResultListQuery = {
  page: number;
  pageSize: number;
  search: string;
  field: ExamResultSearchField;
  pass: ExamResultPassFilter;
};

export type ExamResultListResult = {
  data: ExamResultListItem[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

export type AllowExamRetakeResult =
  | { success: true }
  | { success: false; message: string };
