import { fetchAllRows } from "@/lib/shared/fetch-all-rows";
import { createClient } from "@/lib/supabase/server";

/**
 * 과정별 자격증 신청 · 발급 순위 — 후납 (2026-10-16).
 *
 * 오피스 「민간자격증 › 통계 › 과정별」이 파트너 API(/api/partner/course-stats)로 부릅니다.
 * 학점연계는 오피스 신청이 원본이라 여기서는 후납만 셉니다 — 오피스 자동 발급이 만든 신청(메모 "학점연계 자동발급 (오피스)")과
 * 자동 발급으로 가입한 회원(join_path "학점연계 자동발급")의 신청은 뺍니다. 이미 있던 회원을 자동 발급이 재사용하면
 * 회원 가입 경로는 원래 값이라 메모로도 거릅니다(메모가 생기기 전 자동 발급 건은 가입 경로로). 옛 시스템 이관 신청(회원 연결 없음)은 후납으로 셉니다.
 *
 *   신청 = 취소 · 환불 · 삭제되지 않은 자격증 발급신청
 *   발급 = 그중 발급비 결제가 끝난 건(결제완료 · 선납) — 결제가 되어야 발급이 진행됩니다
 * 기간은 신청일(applied_at, KST 날짜) 기준입니다.
 */

export type CourseStatsQuery = { startDate: string; endDate: string };

export type CourseStatsRow = { name: string; applications: number; issued: number };

const OFFICE_JOIN_PATH = "학점연계 자동발급";

export async function computePostpaidCourseStats(query: CourseStatsQuery): Promise<CourseStatsRow[]> {
  const supabase = await createClient();

  type ApplicationRow = {
    id: string;
    certificate_name: string | null;
    payment_status: string;
    memo: string | null;
    member: { join_path: string | null } | null;
  };

  const applications = await fetchAllRows<ApplicationRow>((from, to) => {
    let builder = supabase
      .from("certificate_applications")
      .select("id, certificate_name, payment_status, memo, member:members ( join_path )")
      .is("deleted_at", null)
      .neq("delivery_status", "canceled")
      .not("payment_status", "in", "(canceled,refunded)");
    if (query.startDate) builder = builder.gte("applied_at", query.startDate);
    if (query.endDate) builder = builder.lte("applied_at", query.endDate);
    return builder.order("id", { ascending: true }).range(from, to) as unknown as PromiseLike<{
      data: ApplicationRow[] | null;
      error: { message: string } | null;
    }>;
  });

  const rows = new Map<string, CourseStatsRow>();
  for (const application of applications) {
    if (application.member?.join_path === OFFICE_JOIN_PATH || application.memo?.startsWith(OFFICE_JOIN_PATH)) continue;
    const name = application.certificate_name?.normalize("NFC").trim();
    if (!name) continue;
    const row = rows.get(name) ?? { name, applications: 0, issued: 0 };
    row.applications += 1;
    if (application.payment_status === "paid" || application.payment_status === "prepaid") row.issued += 1;
    rows.set(name, row);
  }

  return Array.from(rows.values()).sort((a, b) => b.applications - a.applications || b.issued - a.issued);
}
