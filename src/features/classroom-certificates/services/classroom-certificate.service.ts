import { resolveClassroomAccess } from "@/features/classroom-lectures/services/classroom-lecture.service";
import { computeCompletionEligibility } from "@/features/completion-certificates/lib/completion-eligibility";
import { getCertificateRecord } from "@/features/completion-certificates/repositories/completion-certificate.repository";
import type { ClassroomCertificateStatus } from "@/features/classroom-certificates/types/classroom-certificate.types";
import { createClient } from "@/lib/supabase/server";
import type { EnrollmentStatus } from "@/types/database.types";

type EnrollmentDetailRow = {
  status: EnrollmentStatus;
  end_date: string;
};

/**
 * 학생 학습강의실 '수료증' 화면을 위한 상태를 조회합니다.
 *
 * `resolveClassroomAccess`로 로그인한 학생이 해당 과정에 confirmed 상태로
 * 수강신청했는지 확인한 뒤에만 본인 수료 현황/수료증을 반환합니다(승인되지
 * 않은 과정, 타 학생 수료증, 존재하지 않는 과정은 조회 불가).
 */
export async function getClassroomCertificateStatus(
  memberId: string,
  courseCode: string,
  studentName: string,
): Promise<ClassroomCertificateStatus | null> {
  if (!memberId.trim() || !courseCode.trim()) {
    return null;
  }

  const supabase = await createClient();
  const access = await resolveClassroomAccess(supabase, memberId, courseCode);

  if (!access) {
    return null;
  }

  const { data: enrollmentRow, error } = await supabase
    .from("enrollments")
    .select("status, end_date")
    .eq("id", access.enrollmentId)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!enrollmentRow) {
    return null;
  }

  const row = enrollmentRow as EnrollmentDetailRow;

  const [eligibility, certificate] = await Promise.all([
    computeCompletionEligibility(access.enrollmentId, access.course.id, row.status, row.end_date),
    getCertificateRecord(access.enrollmentId),
  ]);

  return {
    courseTitle: access.course.name,
    studentName,
    progressRate: eligibility.progressRate,
    examPercent: eligibility.examPercent,
    isPassed: eligibility.isPassed,
    isCompleted: eligibility.isCompleted,
    certificate,
  };
}
