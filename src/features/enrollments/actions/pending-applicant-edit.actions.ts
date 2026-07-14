"use server";

import { updatePendingApplicant } from "@/features/enrollments/services/pending-applicant-edit.service";
import type { PendingApplicantEditInput } from "@/features/enrollments/types/pending-applicant-edit.types";

export async function updatePendingApplicantAction(
  enrollmentId: string,
  input: PendingApplicantEditInput,
) {
  return updatePendingApplicant(enrollmentId, input);
}
