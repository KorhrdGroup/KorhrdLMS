"use server";

import {
  addExamQuestion,
  deleteExamQuestion,
  getExamQuestion,
  moveExamQuestion,
  updateExamQuestion,
} from "@/features/exam-management/services/exam-question.service";
import type {
  ExamQuestionActionResult,
  ExamQuestionInput,
  ExamQuestionMoveDirection,
  GetExamQuestionResult,
} from "@/features/exam-management/types/exam-question-form.types";

export async function getExamQuestionAction(
  examId: string,
  questionId: string,
): Promise<GetExamQuestionResult> {
  return getExamQuestion(examId, questionId);
}

export async function addExamQuestionAction(
  examId: string,
  input: ExamQuestionInput,
): Promise<ExamQuestionActionResult> {
  return addExamQuestion(examId, input);
}

export async function updateExamQuestionAction(
  examId: string,
  questionId: string,
  input: ExamQuestionInput,
): Promise<ExamQuestionActionResult> {
  return updateExamQuestion(examId, questionId, input);
}

export async function deleteExamQuestionAction(
  examId: string,
  questionId: string,
): Promise<ExamQuestionActionResult> {
  return deleteExamQuestion(examId, questionId);
}

export async function moveExamQuestionAction(
  examId: string,
  questionId: string,
  direction: ExamQuestionMoveDirection,
): Promise<ExamQuestionActionResult> {
  return moveExamQuestion(examId, questionId, direction);
}
