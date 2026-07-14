import type { ExamQuestionType } from "@/types/database.types";

export type ExamQuestionViewSummary = {
  examId: string;
  examName: string;
  courseName: string;
  examPeriod: string;
  examDuration: string;
  totalQuestionCount: number;
};

export type ExamQuestionViewItem = {
  id: string;
  number: number;
  questionType: ExamQuestionType;
  question: string;
  choice1: string | null;
  choice2: string | null;
  choice3: string | null;
  choice4: string | null;
  choice5: string | null;
  answer: string;
  score: number;
  sortOrder: number;
};

export type ExamQuestionViewTotals = {
  totalQuestionCount: number;
  totalScore: number;
};

export type GetExamQuestionViewPageResult =
  | {
      success: true;
      summary: ExamQuestionViewSummary;
      questions: ExamQuestionViewItem[];
      totals: ExamQuestionViewTotals;
    }
  | { success: false; message: string };
