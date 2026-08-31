"use server";

import { isBabyAdmin } from "@/lib/admin/current-admin";
import {
  getGradeDetail,
  updateGradeAttendance,
  updateGradeExam,
} from "@/features/grades/services/grade-detail.service";
import type {
  GradeAttendanceUpdateInput,
  GradeAttendanceUpdateResult,
  GradeExamUpdateInput,
  GradeExamUpdateResult,
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
  // 아기관리자는 조회 전용 — 진도율을 고칠 수 없습니다
  if (await isBabyAdmin()) {
    return { success: false, message: "조회 전용 계정이라 수정할 수 없습니다." };
  }
  return updateGradeAttendance(enrollmentId, input);
}

export async function updateGradeExamAction(
  enrollmentId: string,
  input: GradeExamUpdateInput,
): Promise<GradeExamUpdateResult> {
  // 아기관리자는 조회 전용 — 시험점수를 고칠 수 없습니다
  if (await isBabyAdmin()) {
    return { success: false, message: "조회 전용 계정이라 수정할 수 없습니다." };
  }
  return updateGradeExam(enrollmentId, input);
}
