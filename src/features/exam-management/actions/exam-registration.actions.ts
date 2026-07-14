"use server";

import { createExam } from "@/features/exam-management/services/exam-registration.service";
import type {
  ExamRegistrationInput,
  ExamRegistrationResult,
} from "@/features/exam-management/types/exam.types";

export async function createExamAction(
  input: ExamRegistrationInput,
): Promise<ExamRegistrationResult> {
  return createExam(input);
}
