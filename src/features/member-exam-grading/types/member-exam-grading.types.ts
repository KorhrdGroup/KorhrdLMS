import type { Database } from "@/types/database.types";

export type ExamQuestionType = Database["public"]["Enums"]["exam_question_type"];

/** 회원 상세 > 시험관리 탭 한 줄 — 수강 과정별 수료시험 응시 상태 */
export type MemberExamListItem = {
  enrollmentId: string;
  courseName: string;
  examName: string | null;
  /** submitted=제출됨(채점 가능) · not_taken=미응시 · no_exam=과정에 수료시험 미등록 */
  status: "submitted" | "not_taken" | "no_exam";
  submissionId: string | null;
  /** YYYY-MM-DD */
  submittedAt: string | null;
  score: number | null;
  passScore: number | null;
  isPassed: boolean | null;
  /** 관리자가 정답 처리한 문제 수 — 0이면 순수 자동 채점 결과 */
  manualCount: number;
};

export type GradingChoice = { id: string; text: string };

/** 채점 화면의 문제 한 개 */
export type GradingQuestion = {
  id: string;
  order: number;
  questionType: ExamQuestionType;
  question: string;
  choices: GradingChoice[];
  /** 정답 원문 — 복수정답은 "2,4" */
  answer: string;
  score: number;
  /** 학생이 고른 답 원문 (미응답이면 null) */
  studentAnswer: string | null;
  /** 자동 채점으로 이미 맞은 문제 — 화면에서 토글을 잠급니다 */
  autoCorrect: boolean;
};

/** 채점 화면 전체 데이터 */
export type ExamGradingSheet = {
  memberId: string;
  memberName: string;
  memberLoginId: string;
  courseName: string;
  examName: string;
  submissionId: string;
  passScore: number;
  /** ISO — 학생이 제출한 시각 */
  submittedAt: string;
  questions: GradingQuestion[];
  /** 저장돼 있는 관리자 정답 처리 문제ID (현재 문제에 존재하고 자동정답이 아닌 것만) */
  manualGrades: string[];
  /** 저장돼 있었지만 문제가 바뀌어 더 이상 맞지 않는 문제ID — 재확인 안내용 */
  staleManualIds: string[];
  lastGradedBy: string | null;
  lastGradedAt: string | null;
};

export type SaveExamGradingResult =
  | { success: true; score: number; totalScore: number; isPassed: boolean; message: string }
  | { success: false; message: string };
