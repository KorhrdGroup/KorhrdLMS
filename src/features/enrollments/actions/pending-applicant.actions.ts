"use server";

import { confirmPendingApplicants } from "@/features/enrollments/services/pending-applicant-confirm.service";
import { getPendingApplicantDetail } from "@/features/enrollments/services/pending-applicant-detail.service";
import {
  softDeletePendingApplicant,
  softDeletePendingApplicants,
} from "@/features/enrollments/services/pending-applicant-delete.service";

export async function getPendingApplicantDetailAction(enrollmentId: string) {
  return getPendingApplicantDetail(enrollmentId);
}

export async function confirmPendingApplicantsAction(enrollmentIds: string[]) {
  return confirmPendingApplicants(enrollmentIds);
}

export async function softDeletePendingApplicantsAction(enrollmentIds: string[]) {
  return softDeletePendingApplicants(enrollmentIds);
}

export async function softDeletePendingApplicantAction(enrollmentId: string) {
  return softDeletePendingApplicant(enrollmentId);
}
