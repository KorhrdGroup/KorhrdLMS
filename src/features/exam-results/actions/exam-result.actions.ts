"use server";

import { allowExamRetake } from "@/features/classroom-exams/services/classroom-exam.service";
import type { AllowExamRetakeResult } from "@/features/exam-results/types/exam-result.types";

export async function allowExamRetakeAction(submissionId: string): Promise<AllowExamRetakeResult> {
  return allowExamRetake(submissionId);
}
