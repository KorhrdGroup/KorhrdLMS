import type { ExamQuestion, ExamQuestionAnswer } from "@/features/exam-management/types/exam.types";

export type ExamQuestionInput = {
  question: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  answer: ExamQuestionAnswer | "";
  score: string;
};

export type ExamQuestionSummary = {
  examId: string;
  examTitle: string;
  courseName: string;
  isPublished: boolean;
  questionCount: number;
  totalScore: number;
};

export type GetExamQuestionsResult =
  | { success: true; summary: ExamQuestionSummary; questions: ExamQuestion[] }
  | { success: false; message: string };

export type GetExamQuestionResult =
  | { success: true; question: ExamQuestion }
  | { success: false; message: string };

export type ExamQuestionActionResult =
  | { success: true; message: string; field?: keyof ExamQuestionInput }
  | { success: false; message: string; field?: keyof ExamQuestionInput };

export type ExamQuestionMoveDirection = "up" | "down";
