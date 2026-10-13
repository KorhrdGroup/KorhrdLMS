import { getCurrentAdminRole } from "@/lib/admin/current-admin";
import { isModuleAllowed } from "@/lib/admin/navigation";
import { chunk } from "@/lib/shared/chunk";
import { fetchAllRows } from "@/lib/shared/fetch-all-rows";
import { createClient } from "@/lib/supabase/server";

/**
 * 유입경로별 통계 — 회원가입 → 수강신청 → 자격증신청 전환 (2026-10-13).
 *
 * 유입경로는 가입 때 남긴 members.referral_source(?from=·utm, "대분류_소분류")이고,
 * 파트너스 코드(STAR 등)가 있는 회원은 그 코드로 묶습니다. 기간은 "가입일" 기준이라
 * 그 기간에 가입한 회원이 이후 수강·신청까지 갔는지를 봅니다.
 * 회원 연결이 없는 신청(옛 이관·관리자 비회원 추가)은 유입경로를 알 수 없어 빠집니다.
 */

export type ReferralStatsQuery = { startDate: string; endDate: string };

export type ReferralStudent = {
  id: string;
  name: string;
  loginId: string;
  phone: string | null;
  joinedAt: string;
  courseNames: string[];
  certificates: { name: string; paid: boolean; appliedAt: string }[];
};

export type ReferralStatsRow = {
  key: string;
  label: string;
  signups: number;
  enrolledMembers: number;
  certificateMembers: number;
  certificateApplications: number;
  paidApplications: number;
  /** 자격증신청한 회원 ÷ 가입 회원 (%) */
  conversionRate: number;
  students: ReferralStudent[];
  /** true 면 students 에 자격증신청한 학생만 담겼습니다 (경로 없음 — 수천 명이라 전체는 안 보냄) */
  studentsAppliedOnly: boolean;
};

const NO_SOURCE_KEY = "__none__";

function channelOf(member: { referral_source: string | null; partner_code: string | null }) {
  if (member.partner_code) {
    const code = member.partner_code.trim();
    return { key: `partner:${code}`, label: code === "STAR" ? "스타 (파트너스 STAR)" : `파트너스 ${code}` };
  }
  const source = member.referral_source?.trim();
  if (!source) return { key: NO_SOURCE_KEY, label: "경로 없음 (직접 가입·추적 전)" };
  return { key: `ref:${source}`, label: source.replaceAll("_", " › ") };
}

/** KST 날짜(YYYY-MM-DD) → 그 날 0시(KST)의 UTC ISO */
const kstStart = (date: string) => new Date(`${date}T00:00:00+09:00`).toISOString();
const kstNextDay = (date: string) => new Date(new Date(`${date}T00:00:00+09:00`).getTime() + 86_400_000).toISOString();

/** 회원이 이만큼 넘으면 id 묶음 조회 대신 수강·신청을 통째로 받아 걸러냅니다 (왕복 수 줄이기) */
const BULK_THRESHOLD = 1500;

export async function getReferralStats(query: ReferralStatsQuery): Promise<ReferralStatsRow[]> {
  // 회원 개인정보(이름·휴대폰)가 담기므로 통계 메뉴 권한이 있는 관리자만 — 아기관리자 등은 URL 로 와도 거부
  if (!isModuleAllowed(await getCurrentAdminRole(), "statistics")) {
    throw new Error("유입경로 통계를 볼 권한이 없습니다.");
  }

  const supabase = await createClient();

  const members = await fetchAllRows<{
    id: string;
    name: string;
    login_id: string;
    phone: string | null;
    created_at: string;
    referral_source: string | null;
    partner_code: string | null;
  }>((from, to) => {
    let builder = supabase
      .from("members")
      .select("id, name, login_id, phone, created_at, referral_source, partner_code")
      .is("deleted_at", null);
    if (query.startDate) builder = builder.gte("created_at", kstStart(query.startDate));
    if (query.endDate) builder = builder.lt("created_at", kstNextDay(query.endDate));
    return builder.order("id", { ascending: true }).range(from, to);
  });

  const memberIds = members.map((member) => member.id);
  const coursesByMember = new Map<string, string[]>();
  const certsByMember = new Map<string, ReferralStudent["certificates"]>();

  type EnrollmentRow = { id: string; member_id: string; course: { name: string } | null };
  type ApplicationRow = {
    id: string;
    member_id: string;
    certificate_name: string;
    payment_status: string;
    applied_at: string;
  };

  const loadEnrollments = (ids: string[] | null) =>
    fetchAllRows<EnrollmentRow>((from, to) => {
      let builder = supabase
        .from("enrollments")
        .select("id, member_id, course:courses ( name )")
        .eq("status", "confirmed")
        .is("deleted_at", null);
      builder = ids ? builder.in("member_id", ids) : builder.not("member_id", "is", null);
      return builder.order("id", { ascending: true }).range(from, to) as unknown as PromiseLike<{
        data: EnrollmentRow[] | null;
        error: { message: string } | null;
      }>;
    });
  const loadApplications = (ids: string[] | null) =>
    fetchAllRows<ApplicationRow>((from, to) => {
      let builder = supabase
        .from("certificate_applications")
        .select("id, member_id, certificate_name, payment_status, applied_at")
        .is("deleted_at", null)
        .neq("delivery_status", "canceled");
      builder = ids ? builder.in("member_id", ids) : builder.not("member_id", "is", null);
      return builder.order("id", { ascending: true }).range(from, to) as unknown as PromiseLike<{
        data: ApplicationRow[] | null;
        error: { message: string } | null;
      }>;
    });

  const enrollments: EnrollmentRow[] = [];
  const applications: ApplicationRow[] = [];
  if (memberIds.length > BULK_THRESHOLD) {
    // 회원이 많으면 통째로 받아 아래에서 걸러냅니다 — 묶음 조회는 수십 번 왕복이라 느립니다
    const [allEnrollments, allApplications] = await Promise.all([loadEnrollments(null), loadApplications(null)]);
    enrollments.push(...allEnrollments);
    applications.push(...allApplications);
  } else {
    // 회원 id 가 많으면 URL 이 길어져 400 — 묶음으로 나눠 조회합니다 (lib/shared/chunk)
    for (const ids of chunk(memberIds)) {
      const [part, appPart] = await Promise.all([loadEnrollments(ids), loadApplications(ids)]);
      enrollments.push(...part);
      applications.push(...appPart);
    }
  }

  for (const row of enrollments) {
    const list = coursesByMember.get(row.member_id) ?? [];
    if (row.course?.name && !list.includes(row.course.name)) list.push(row.course.name);
    coursesByMember.set(row.member_id, list);
  }
  for (const row of applications) {
    const list = certsByMember.get(row.member_id) ?? [];
    list.push({
      name: row.certificate_name,
      paid: row.payment_status === "paid" || row.payment_status === "prepaid",
      appliedAt: row.applied_at,
    });
    certsByMember.set(row.member_id, list);
  }

  const rows = new Map<string, ReferralStatsRow>();
  for (const member of members) {
    const channel = channelOf(member);
    const row =
      rows.get(channel.key) ??
      ({
        key: channel.key,
        label: channel.label,
        signups: 0,
        enrolledMembers: 0,
        certificateMembers: 0,
        certificateApplications: 0,
        paidApplications: 0,
        conversionRate: 0,
        students: [],
        studentsAppliedOnly: channel.key === NO_SOURCE_KEY,
      } satisfies ReferralStatsRow);

    const courseNames = coursesByMember.get(member.id) ?? [];
    const certificates = certsByMember.get(member.id) ?? [];

    row.signups += 1;
    if (courseNames.length > 0) row.enrolledMembers += 1;
    if (certificates.length > 0) row.certificateMembers += 1;
    row.certificateApplications += certificates.length;
    row.paidApplications += certificates.filter((cert) => cert.paid).length;
    // 경로 없음은 회원 이관 뒤 수천 명이라 화면에 넘길 학생은 신청한 사람만
    if (!row.studentsAppliedOnly || certificates.length > 0) row.students.push({
      id: member.id,
      name: member.name,
      loginId: member.login_id,
      phone: member.phone,
      joinedAt: member.created_at,
      courseNames,
      certificates,
    });
    rows.set(channel.key, row);
  }

  for (const row of rows.values()) {
    row.conversionRate = row.signups > 0 ? Math.round((row.certificateMembers / row.signups) * 1000) / 10 : 0;
    // 상세 목록은 자격증신청 → 수강 → 최근 가입 순으로, 실제 신청한 학생이 위에 오게
    row.students.sort(
      (a, b) =>
        b.certificates.length - a.certificates.length ||
        b.courseNames.length - a.courseNames.length ||
        b.joinedAt.localeCompare(a.joinedAt),
    );
  }

  // 경로 없음은 맨 아래, 나머지는 가입 많은 순
  return Array.from(rows.values()).sort((a, b) => {
    if (a.key === NO_SOURCE_KEY) return 1;
    if (b.key === NO_SOURCE_KEY) return -1;
    return b.signups - a.signups || b.certificateMembers - a.certificateMembers;
  });
}
