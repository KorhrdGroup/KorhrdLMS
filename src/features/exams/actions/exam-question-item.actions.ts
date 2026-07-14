"use server";

import { getExamQuestionManagePage } from "@/features/exams/services/exam-question-item-list.service";
import {
  createExamQuestionItem,
  getExamQuestionItem,
  softDeleteExamQuestionItem,
  updateExamQuestionItem,
} from "@/features/exams/services/exam-question-item.service";
import type { ExamQuestionItemInput } from "@/features/exams/types/exam-question-item-form.types";

export async function getExamQuestionManagePageAction(examId: string) {
  return getExamQuestionManagePage(examId);
}

export async function getExamQuestionItemAction(questionId: string) {
  return getExamQuestionItem(questionId);
}

export async function createExamQuestionItemAction(
  examId: string,
  input: ExamQuestionItemInput,
) {
  return createExamQuestionItem(examId, input);
}

export async function updateExamQuestionItemAction(
  questionId: string,
  input: ExamQuestionItemInput,
) {
  return updateExamQuestionItem(questionId, input);
}

export async function softDeleteExamQuestionItemAction(questionId: string) {
  return softDeleteExamQuestionItem(questionId);
}
