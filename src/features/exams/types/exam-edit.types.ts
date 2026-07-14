import type { ExamKind, ExamStatus, ExamType } from "@/types/database.types";

export type ExamEditInput = {
  name: string;
  examStart: string;
  examEnd: string;
  questionCount: string;
  examDurationMinutes: string;
  status: ExamStatus;
  memo: string;
};

export type ExamEditDetail = {
  id: string;
  year: number;
  courseName: string;
  examKind: ExamKind;
  examType: ExamType;
  name: string;
  examStart: string;
  examEnd: string;
  questionCount: number;
  examDurationMinutes: number;
  status: ExamStatus;
  memo: string | null;
};

export type ExamEditResult =
  | { success: true; message: string }
  | {
      success: false;
      message: string;
      field?: keyof ExamEditInput;
    };

export type GetExamForEditResult =
  | { success: true; exam: ExamEditDetail }
  | { success: false; message: string };

export type ExamPrintUpdateResult =
  | { success: true; message: string }
  | { success: false; message: string };
