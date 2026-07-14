"use server";

import { getConfirmedStudentDetail } from "@/features/enrollments/services/confirmed-student-detail.service";

export async function getConfirmedStudentDetailAction(enrollmentId: string) {
  return getConfirmedStudentDetail(enrollmentId);
}
