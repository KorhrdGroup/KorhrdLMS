import { getCertificateRecordsByEnrollmentIds } from "@/features/completion-certificates/repositories/completion-certificate.repository";
import { getClassroomCourseProgressRate } from "@/features/classroom-lectures/services/classroom-lecture.service";
import { ACTIVE_ENROLLMENT_STATUSES } from "@/features/enrollments/constants";
import type { MemberCourseSummaryItem } from "@/features/members/types/member-course-summary.types";
import { createClient } from "@/lib/supabase/server";

type EnrollmentCourseRow = {
  id: string;
  member_id: string;
  course_id: string;
  course: { id: string; name: string };
};

function buildStatusLabel(progressRate: number, certificateIssued: boolean) {
  if (certificateIssued) {
    return "발급완료";
  }

  if (progressRate >= 100) {
    return "수강완료 100%";
  }

  return `진행중 ${progressRate}%`;
}

/**
 * 회원목록 "수강과정" 컬럼용으로, 여러 회원의 수강신청(확정) 이력을 한 번에
 * 조회해 회원별 과정 요약 목록(Map)으로 반환합니다.
 * 과거에 100% 수강완료했거나 수료증이 발급된 과정도 회원 이력이므로 기간에
 * 상관없이 유효한(ACTIVE_ENROLLMENT_STATUSES) 모든 수강신청을 대상으로 합니다(취소/삭제 건 제외).
 * 수강신청은 신청 즉시 confirmed로 저장되므로, 신청 직후 바로 이 목록에 표시됩니다.
 */
export async function getMemberCourseSummaries(
  memberIds: string[],
): Promise<Map<string, MemberCourseSummaryItem[]>> {
  const uniqueMemberIds = Array.from(new Set(memberIds));

  if (uniqueMemberIds.length === 0) {
    return new Map();
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select(
      `
        id,
        member_id,
        course_id,
        course:courses!inner ( id, name )
      `,
    )
    .in("member_id", uniqueMemberIds)
    .in("status", ACTIVE_ENROLLMENT_STATUSES)
    .is("deleted_at", null)
    .order("start_date", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const rows = (data ?? []) as unknown as EnrollmentCourseRow[];

  if (rows.length === 0) {
    return new Map();
  }

  const certificateMap = await getCertificateRecordsByEnrollmentIds(
    rows.map((row) => row.id),
  );

  const progressRates = await Promise.all(
    rows.map((row) => getClassroomCourseProgressRate(row.id, row.course_id)),
  );

  const summaryByMember = new Map<string, MemberCourseSummaryItem[]>();

  rows.forEach((row, index) => {
    const progressRate = progressRates[index];
    const certificateIssued = certificateMap.has(row.id);

    const item: MemberCourseSummaryItem = {
      enrollmentId: row.id,
      courseId: row.course.id,
      courseName: row.course.name,
      progressRate,
      certificateIssued,
      statusLabel: buildStatusLabel(progressRate, certificateIssued),
    };

    const existing = summaryByMember.get(row.member_id);
    if (existing) {
      existing.push(item);
    } else {
      summaryByMember.set(row.member_id, [item]);
    }
  });

  return summaryByMember;
}
