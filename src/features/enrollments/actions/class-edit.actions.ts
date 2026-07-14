"use server";

import { updateClass } from "@/features/enrollments/services/class-edit.service";
import type { ClassEditInput } from "@/features/enrollments/types/class-edit.types";

export async function updateClassAction(classId: string, input: ClassEditInput) {
  return updateClass(classId, input);
}
