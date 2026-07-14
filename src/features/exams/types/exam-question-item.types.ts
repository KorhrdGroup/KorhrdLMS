import type { ExamQuestionType } from "@/types/database.types";

export type ExamQuestionManageSummary = {
  examId: string;
  examName: string;
  courseName: string;
  totalQuestionCount: number;
  registeredQuestionCount: number;
};

export type ExamQuestionItem = {
  id: string;
  number: number;
  questionType: ExamQuestionType;
  question: string;
  choiceCount: number;
  answer: string;
  score: number;
  sortOrder: number;
};

export type GetExamQuestionManagePageResult =
  | {
      success: true;
      summary: ExamQuestionManageSummary;
      questions: ExamQuestionItem[];
    }
  | { success: false; message: string };
