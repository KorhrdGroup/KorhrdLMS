"use server";

import { createEnrollment } from "@/features/enrollments/services/enrollment-registration.service";
import { getEnrollmentRegistrationOptions } from "@/features/enrollments/services/enrollment-list.service";
import type {
  EnrollmentRegistrationInput,
  EnrollmentRegistrationOptions,
  EnrollmentRegistrationResult,
} from "@/features/enrollments/types/enrollment.types";

export async function getEnrollmentRegistrationOptionsAction(): Promise<EnrollmentRegistrationOptions> {
  return getEnrollmentRegistrationOptions();
}

export async function createEnrollmentAction(
  input: EnrollmentRegistrationInput,
): Promise<EnrollmentRegistrationResult> {
  return createEnrollment(input);
}
