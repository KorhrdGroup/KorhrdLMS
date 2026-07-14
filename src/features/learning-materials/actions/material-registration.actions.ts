"use server";

import { createMaterial } from "@/features/learning-materials/services/material-registration.service";
import type {
  MaterialRegistrationInput,
  MaterialRegistrationResult,
} from "@/features/learning-materials/types/material.types";

export async function createMaterialAction(
  input: MaterialRegistrationInput,
): Promise<MaterialRegistrationResult> {
  return createMaterial(input);
}
