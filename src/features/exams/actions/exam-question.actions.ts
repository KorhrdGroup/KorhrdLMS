"use server";

import {
  getExamForEdit,
  updateExam,
} from "@/features/exams/services/exam-edit.service";
import { updateExamPrintEnabled } from "@/features/exams/services/exam-print.service";
import type { ExamEditInput } from "@/features/exams/types/exam-edit.types";

export async function getExamForEditAction(examId: string) {
  return getExamForEdit(examId);
}

export async function updateExamAction(examId: string, input: ExamEditInput) {
  return updateExam(examId, input);
}

export async function updateExamPrintEnabledAction(
  examId: string,
  printEnabled: boolean,
) {
  return updateExamPrintEnabled(examId, printEnabled);
}
