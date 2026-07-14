"use server";

import {
  createClassRegistration,
  getClassRegistrationOptions,
} from "@/features/enrollments/services/class-registration.service";
import type {
  ClassRegistrationInput,
  ClassRegistrationOptions,
  ClassRegistrationResult,
} from "@/features/enrollments/types/class-registration.types";

export async function getClassRegistrationOptionsAction(): Promise<ClassRegistrationOptions> {
  return getClassRegistrationOptions();
}

export async function createClassRegistrationAction(
  input: ClassRegistrationInput,
): Promise<ClassRegistrationResult> {
  return createClassRegistration(input);
}
