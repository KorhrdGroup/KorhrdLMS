import { createClient } from "@/lib/supabase/server";
import { sendAlimtalk, type AlimtalkTemplateKey } from "@/lib/aligo/alimtalk";

/**
 * 회원관리 알림톡 일괄 발송.
 *
 * 대상 고르는 법 세 가지:
 *   selected      — 목록에서 체크한 회원들
 *   progress_over — 수강률 60% 이상인 과정을 하나라도 가진 회원 (시험 안내)
 *   progress_under— 확정 수강이 있고 모든 과정이 60% 미만인 회원 (수강 독려)
 *
 * 수강률 = 완료 차시 수 ÷ 게시 차시 수 (회원목록 "수강완료 100%" 와 같은 계산).
 * 템플릿 변수는 #{고객명} 하나라 회원 이름으로 채워 한 명씩 보냅니다.
 */

export type AlimtalkTargetMode = "selected" | "progress_over" | "progress_under";

export type BulkAlimtalkResult = {
  success: boolean;
  message: string;
  sent: number;
  failed: number;
  /** 전화번호가 없어 건너뛴 수 */
  skipped: number;
};

const BULK_LIMIT = 300;

type TargetMember = { id: string; name: string; phone: string | null };

async function resolveTargets(
  mode: AlimtalkTargetMode,
  memberIds: string[],
  source: "" | "office" | "general",
): Promise<TargetMember[]> {
  const supabase = await createClient();

  if (mode === "selected") {
    if (memberIds.length === 0) return [];
    const { data, error } = await supabase
      .from("members")
      .select("id, name, phone")
      .in("id", memberIds.slice(0, BULK_LIMIT))
      .is("deleted_at", null);
    if (error) throw new Error(error.message);
    return (data ?? []) as TargetMember[];
  }

  /* ---------- 수강률 기준 — 회원별 과정 진도 계산 ---------- */
  // 1) 확정 수강 (탈퇴·삭제 회원 제외)
  const todayKst = new Date(Date.now() + 9 * 3600_000).toISOString().slice(0, 10);
  let enrollmentQuery = supabase
    .from("enrollments")
    .select("id, member_id, course_id, member:members!inner ( id, name, phone, deleted_at, status, join_path )")
    .eq("status", "confirmed")
    .is("deleted_at", null)
    // 수강기간이 끝난 과정은 제외 — 기간 지난 분에게 매주 독려가 가면 안 됩니다
    .gte("end_date", todayKst)
    .is("member.deleted_at", null)
    .eq("member.status", "active");

  if (source === "office") {
    enrollmentQuery = enrollmentQuery.eq("member.join_path", "학점연계 자동발급");
  } else if (source === "general") {
    enrollmentQuery = enrollmentQuery.or(
      "join_path.is.null,join_path.neq.학점연계 자동발급",
      { referencedTable: "member" },
    );
  }

  const { data: enrollmentRows, error: enrollmentError } = await enrollmentQuery;
  if (enrollmentError) throw new Error(enrollmentError.message);

  type EnrollmentRow = {
    id: string;
    member_id: string;
    course_id: string;
    member: { id: string; name: string; phone: string | null };
  };
  const enrollments = (enrollmentRows ?? []) as unknown as EnrollmentRow[];
  if (enrollments.length === 0) return [];

  // 2) 과정별 게시 차시 수
  const courseIds = Array.from(new Set(enrollments.map((row) => row.course_id)));
  const { data: lectureRows, error: lectureError } = await supabase
    .from("course_lectures")
    .select("course_id, sessions:lecture_sessions ( id )")
    .in("course_id", courseIds)
    .eq("is_published", true)
    .is("deleted_at", null)
    .is("sessions.deleted_at", null);
  if (lectureError) throw new Error(lectureError.message);

  const sessionCountByCourse = new Map<string, number>();
  for (const lecture of (lectureRows ?? []) as unknown as {
    course_id: string;
    sessions: { id: string }[];
  }[]) {
    sessionCountByCourse.set(
      lecture.course_id,
      (sessionCountByCourse.get(lecture.course_id) ?? 0) + (lecture.sessions?.length ?? 0),
    );
  }

  // 3) 수강별 완료 차시 수
  const { data: progressRows, error: progressError } = await supabase
    .from("lecture_progress")
    .select("enrollment_id")
    .eq("attendance_status", "completed")
    .in("enrollment_id", enrollments.map((row) => row.id));
  if (progressError) throw new Error(progressError.message);

  const completedByEnrollment = new Map<string, number>();
  for (const row of (progressRows ?? []) as { enrollment_id: string }[]) {
    completedByEnrollment.set(
      row.enrollment_id,
      (completedByEnrollment.get(row.enrollment_id) ?? 0) + 1,
    );
  }

  // 4) 회원별 최대 진도율로 분류
  const bestRateByMember = new Map<string, number>();
  const memberById = new Map<string, TargetMember>();
  for (const row of enrollments) {
    const total = sessionCountByCourse.get(row.course_id) ?? 0;
    if (total === 0) continue;
    const rate = Math.round(((completedByEnrollment.get(row.id) ?? 0) / total) * 100);
    memberById.set(row.member_id, row.member);
    bestRateByMember.set(row.member_id, Math.max(bestRateByMember.get(row.member_id) ?? 0, rate));
  }

  const targets: TargetMember[] = [];
  for (const [memberId, best] of bestRateByMember) {
    // 이미 수료(100%)만 있는 회원에게 독려·시험 안내를 또 보내지 않습니다
    if (mode === "progress_over" && best >= 60 && best < 100) {
      targets.push(memberById.get(memberId)!);
    }
    if (mode === "progress_under" && best < 60) {
      targets.push(memberById.get(memberId)!);
    }
  }
  return targets.slice(0, BULK_LIMIT);
}

export async function bulkSendMemberAlimtalk(input: {
  template: AlimtalkTemplateKey;
  mode: AlimtalkTargetMode;
  memberIds: string[];
  source: "" | "office" | "general";
}): Promise<BulkAlimtalkResult> {
  const targets = await resolveTargets(input.mode, input.memberIds, input.source);

  if (targets.length === 0) {
    return { success: false, message: "발송 대상이 없습니다.", sent: 0, failed: 0, skipped: 0 };
  }

  let sent = 0;
  let failed = 0;
  let skipped = 0;

  // 변수(#{고객명})가 사람마다 달라 한 명씩 보냅니다.
  for (const target of targets) {
    if (!target.phone || target.phone.replace(/\D/g, "").length < 10) {
      skipped += 1;
      continue;
    }
    const result = await sendAlimtalk({
      receivers: target.phone,
      template: input.template,
      vars: { 고객명: target.name },
    });
    if (result.success) sent += 1;
    else failed += 1;
  }

  return {
    success: sent > 0,
    message: `발송 ${sent}명 · 실패 ${failed}명 · 번호없음 ${skipped}명`,
    sent,
    failed,
    skipped,
  };
}

/** 발송 전 대상 수 미리보기 — 실제 보내기 전에 몇 명인지 보여줍니다 */
export async function countMemberAlimtalkTargets(input: {
  mode: AlimtalkTargetMode;
  memberIds: string[];
  source: "" | "office" | "general";
}): Promise<number> {
  const targets = await resolveTargets(input.mode, input.memberIds, input.source);
  return targets.length;
}
