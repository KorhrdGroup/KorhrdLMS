"use server";

import {
  getEnrollmentRecordForEdit,
  updateEnrollmentRecord,
} from "@/features/enrollments/services/enrollment-record-edit.service";
import { deleteEnrollmentRecord } from "@/features/enrollments/services/enrollment-record-delete.service";
import type {
  EnrollmentRecordDeleteResult,
  EnrollmentRecordEditInput,
  EnrollmentRecordEditResult,
  GetEnrollmentRecordForEditResult,
} from "@/features/enrollments/types/enrollment.types";

export async function getEnrollmentRecordForEditAction(
  enrollmentId: string,
): Promise<GetEnrollmentRecordForEditResult> {
  return getEnrollmentRecordForEdit(enrollmentId);
}

export async function updateEnrollmentRecordAction(
  enrollmentId: string,
  input: EnrollmentRecordEditInput,
): Promise<EnrollmentRecordEditResult> {
  return updateEnrollmentRecord(enrollmentId, input);
}

export async function deleteEnrollmentRecordAction(
  enrollmentId: string,
): Promise<EnrollmentRecordDeleteResult> {
  return deleteEnrollmentRecord(enrollmentId);
}
