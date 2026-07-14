import type { ExamKind, ExamQuestionType } from "@/types/database.types";

/**
 * 학생 학습강의실 시험(시험보기) 화면에서 사용하는 타입입니다.
 *
 * 관리자 시험관리(`/admin/exams`)에서 등록한 Supabase `exams` / `exam_questions`
 * 테이블을 그대로 조회합니다. 정답(answer)은 서버(services)에서만 다루고,
 * 학생에게 내려가는 타입에는 포함하지 않습니다.
 */

export type ClassroomExamStatus =
  | "locked" // 진도율 미달 — 응시 불가
  | "upcoming" // 수강기간 시작 전
  | "available" // 응시 가능
  | "submitted" // 이미 제출 완료
  | "closed"; // 수강기간 종료(미제출)

export type ClassroomExamListItem = {
  id: string;
  title: string;
  examKind: ExamKind;
  durationMinutes: number;
  questionCount: number;
  passScore: number | null;
  status: ClassroomExamStatus;
  score: number | null;
  totalScore: number | null;
  isPassed: boolean | null;
};

export type ClassroomExamList = {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  progressRate: number;
  eligibilityThreshold: number;
  eligible: boolean;
  /** 시험 응시 가능 기간 = 수강기간(enrollments.start_date ~ end_date). */
  enrollmentStartDate: string;
  enrollmentEndDate: string;
  exams: ClassroomExamListItem[];
};

export type ClassroomExamChoice = {
  id: "1" | "2" | "3" | "4" | "5";
  text: string;
};

export type ClassroomExamQuestion = {
  id: string;
  order: number;
  questionType: ExamQuestionType;
  question: string;
  choices: ClassroomExamChoice[];
  score: number;
};

export type ClassroomExamSubmittedResult = {
  score: number;
  totalScore: number;
  isPassed: boolean | null;
  submittedAt: string;
};

export type ClassroomExamTaking = {
  examId: string;
  courseCode: string;
  title: string;
  examKind: ExamKind;
  durationMinutes: number;
  passScore: number | null;
  totalScore: number;
  questions: ClassroomExamQuestion[];
  /** 이미 제출한 경우 채점 결과. 있으면 문제 화면 대신 결과 화면을 보여줍니다. */
  submittedResult: ClassroomExamSubmittedResult | null;
};

export type GetClassroomExamTakingResult =
  | { success: true; exam: ClassroomExamTaking }
  | { success: false; message: string };

export type SubmitClassroomExamResult =
  | { success: true; result: ClassroomExamSubmittedResult; correctCount: number; totalQuestions: number }
  | { success: false; message: string };
