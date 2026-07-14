"use server";

import { getEnrollmentRecordsForCourse } from "@/features/enrollments/services/enrollment-record-list.service";
import type { EnrollmentRecordListItem } from "@/features/enrollments/types/enrollment.types";

export async function getCourseEnrolledStudentsAction(
  courseId: string,
): Promise<EnrollmentRecordListItem[]> {
  return getEnrollmentRecordsForCourse(courseId);
}
