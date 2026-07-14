"use server";

import {
  getGradeDetail,
  updateGradeAttendance,
} from "@/features/grades/services/grade-detail.service";
import type {
  GradeAttendanceUpdateInput,
  GradeAttendanceUpdateResult,
  GetGradeDetailResult,
} from "@/features/grades/types/grade.types";

export async function getGradeDetailAction(
  enrollmentId: string,
): Promise<GetGradeDetailResult> {
  return getGradeDetail(enrollmentId);
}

export async function updateGradeAttendanceAction(
  enrollmentId: string,
  input: GradeAttendanceUpdateInput,
): Promise<GradeAttendanceUpdateResult> {
  return updateGradeAttendance(enrollmentId, input);
}
