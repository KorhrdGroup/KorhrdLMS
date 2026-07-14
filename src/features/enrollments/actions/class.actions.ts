"use server";

import { getClassDetail } from "@/features/enrollments/services/class-detail.service";
import { softDeleteClass } from "@/features/enrollments/services/class-delete.service";

export async function getClassDetailAction(classId: string) {
  return getClassDetail(classId);
}

export async function softDeleteClassAction(classId: string) {
  return softDeleteClass(classId);
}
