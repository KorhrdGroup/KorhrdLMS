"use server";

import {
  createProfessor,
  deleteProfessor,
  updateProfessor,
} from "@/features/professors/services/professor.service";
import type {
  ProfessorDeleteResult,
  ProfessorFormInput,
  ProfessorMutationResult,
} from "@/features/professors/types/professor.types";

export async function createProfessorAction(
  input: ProfessorFormInput,
): Promise<ProfessorMutationResult> {
  return createProfessor(input);
}

export async function updateProfessorAction(
  id: string,
  input: ProfessorFormInput,
): Promise<ProfessorMutationResult> {
  return updateProfessor(id, input);
}

export async function deleteProfessorAction(id: string): Promise<ProfessorDeleteResult> {
  return deleteProfessor(id);
}
