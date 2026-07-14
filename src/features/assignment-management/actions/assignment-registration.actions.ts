"use server";

import { createAssignment } from "@/features/assignment-management/services/assignment-registration.service";
import type {
  AssignmentRegistrationInput,
  AssignmentRegistrationResult,
} from "@/features/assignment-management/types/assignment.types";

export async function createAssignmentAction(
  input: AssignmentRegistrationInput,
): Promise<AssignmentRegistrationResult> {
  return createAssignment(input);
}
