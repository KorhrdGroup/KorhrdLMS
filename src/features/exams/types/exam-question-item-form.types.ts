import type { ExamQuestionType } from "@/types/database.types";

export type ExamQuestionItemInput = {
  questionType: ExamQuestionType;
  question: string;
  choice1: string;
  choice2: string;
  choice3: string;
  choice4: string;
  choice5: string;
  answer: string;
  score: string;
};

export type ExamQuestionItemMutationResult =
  | { success: true; questionId: string; message: string }
  | {
      success: false;
      message: string;
      field?: keyof ExamQuestionItemInput;
    };

export type ExamQuestionItemDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };

export type GetExamQuestionItemResult =
  | { success: true; question: ExamQuestionItemInput & { id: string } }
  | { success: false; message: string };
