"use server";

import { createPendingApplicantRegistration } from "@/features/enrollments/services/pending-applicant-registration.service";
import { getPendingApplicantRegistrationOptions } from "@/features/enrollments/services/pending-applicant-registration.service";
import type {
  PendingApplicantRegistrationInput,
  PendingApplicantRegistrationOptions,
  PendingApplicantRegistrationResult,
} from "@/features/enrollments/types/pending-applicant-registration.types";

export async function getPendingApplicantRegistrationOptionsAction(): Promise<PendingApplicantRegistrationOptions> {
  return getPendingApplicantRegistrationOptions();
}

export async function createPendingApplicantRegistrationAction(
  input: PendingApplicantRegistrationInput,
): Promise<PendingApplicantRegistrationResult> {
  return createPendingApplicantRegistration(input);
}
