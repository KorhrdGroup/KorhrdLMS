"use server";

import {
  deleteExam,
  getExamForEdit,
  updateExam,
} from "@/features/exam-management/services/exam-edit.service";
import type {
  ExamDeleteResult,
  ExamEditInput,
  ExamEditResult,
  GetExamForEditResult,
} from "@/features/exam-management/types/exam.types";

export async function getExamForEditAction(examId: string): Promise<GetExamForEditResult> {
  return getExamForEdit(examId);
}

export async function updateExamAction(
  examId: string,
  input: ExamEditInput,
): Promise<ExamEditResult> {
  return updateExam(examId, input);
}

export async function deleteExamAction(examId: string): Promise<ExamDeleteResult> {
  return deleteExam(examId);
}
