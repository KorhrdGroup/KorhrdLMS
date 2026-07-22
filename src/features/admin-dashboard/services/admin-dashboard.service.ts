import { createClient } from "@/lib/supabase/server";

/**
 * 어드민 대시보드(관리자 홈)에 표시할 실데이터를 조회합니다.
 * 화이트톤 대시보드 디자인이 필요로 하는 형태로 가공해 반환합니다.
 */

export type DashboardItem = { title: string; date: string };
export type DashboardConsultItem = DashboardItem & { answered: boolean };
export type DashboardExamItem = { kind: "시험" | "과제"; title: string; date: string };
export type DashboardKpi = { label: string; value: string; sub?: string; accent?: boolean };
export type DashboardStatRow = { label: string; value: string; hot?: boolean };
export type DashboardCalendar = {
  label: string;
  todayLabel: string;
  todayDay: number;
  firstWeekday: number;
  daysInMonth: number;
};

export type AdminDashboardData = {
  kpis: DashboardKpi[];
  notices: DashboardItem[];
  consultations: DashboardConsultItem[];
  consultationUnanswered: number;
  questions: DashboardItem[];
  examsTasks: DashboardExamItem[];
  newStatus: DashboardStatRow[];
  tuition: DashboardStatRow[];
  calendar: DashboardCalendar;
};

function daysAgoIso(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function monthRange(offset: number) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() - offset + 1, 1);
  return { start: start.toISOString(), end: end.toISOString() };
}

function formatWon(amount: number) {
  return `${amount.toLocaleString("en-US")}원`;
}

function shortDate(value: string | null) {
  return value ? value.slice(5, 10) : "";
}

function fullDate(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const supabase = await createClient();
  const since30 = daysAgoIso(30);
  const today = new Date().toISOString().slice(0, 10);

  const [
    totalMembers,
    newMembers,
    withdrawnMembers,
    newCourses,
    totalEnrollments,
    newEnrollments,
  ] = await Promise.all([
    supabase.from("members").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("members").select("id", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", since30),
    supabase.from("members").select("id", { count: "exact", head: true }).not("deleted_at", "is", null),
    supabase.from("courses").select("id", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", since30),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabase.from("enrollments").select("id", { count: "exact", head: true }).is("deleted_at", null).gte("created_at", since30),
  ]);

  // 수강료(당월/전월/전전월)
  const paymentSums: number[] = [];
  for (let offset = 0; offset < 3; offset++) {
    const { start, end } = monthRange(offset);
    const { data } = await supabase
      .from("course_payments")
      .select("amount")
      .is("deleted_at", null)
      .gte("payment_date", start)
      .lt("payment_date", end);
    paymentSums.push((data ?? []).reduce((acc, row) => acc + (row.amount ?? 0), 0));
  }

  // 게시판: 공지 / 1:1 상담(답변 여부) / 자유게시판
  const [noticeRows, consultRows, freeRows] = await Promise.all([
    supabase.from("notices").select("title, created_at").eq("is_published", true).is("deleted_at", null).order("created_at", { ascending: false }).limit(3),
    supabase.from("board_posts").select("id, title, created_at").eq("board_type", "consultation").is("parent_id", null).is("deleted_at", null).order("created_at", { ascending: false }).limit(4),
    supabase.from("board_posts").select("title, created_at").eq("board_type", "free").is("parent_id", null).is("deleted_at", null).order("created_at", { ascending: false }).limit(3),
  ]);

  // 상담 답변 여부: 자식 글(parent_id)이 있으면 답변완료
  const consultIds = (consultRows.data ?? []).map((r) => r.id);
  const answeredSet = new Set<string>();
  if (consultIds.length > 0) {
    const { data: replies } = await supabase
      .from("board_posts")
      .select("parent_id")
      .in("parent_id", consultIds)
      .is("deleted_at", null);
    for (const r of replies ?? []) {
      if (r.parent_id) answeredSet.add(r.parent_id);
    }
  }

  const consultations: DashboardConsultItem[] = (consultRows.data ?? []).map((r) => ({
    title: r.title,
    date: shortDate(r.created_at),
    answered: answeredSet.has(r.id),
  }));
  const consultationUnanswered = consultations.filter((c) => !c.answered).length;

  const notices: DashboardItem[] = (noticeRows.data ?? []).map((r) => ({
    title: r.title,
    date: shortDate(r.created_at),
  }));
  const questions: DashboardItem[] = (freeRows.data ?? []).map((r) => ({
    title: r.title,
    date: shortDate(r.created_at),
  }));

  // 시험/과제 현황(진행중)
  const [examRows, assignmentRows] = await Promise.all([
    supabase.from("exams").select("name, exam_end").is("deleted_at", null).gte("exam_end", today).order("exam_start", { ascending: true }).limit(3),
    supabase.from("assignments").select("name, submission_end").is("deleted_at", null).gte("submission_end", today).order("submission_start", { ascending: true }).limit(3),
  ]);

  const examsTasks: DashboardExamItem[] = [
    ...(examRows.data ?? []).map((e) => ({ kind: "시험" as const, title: e.name, date: `~${shortDate(e.exam_end)}` })),
    ...(assignmentRows.data ?? []).map((a) => ({ kind: "과제" as const, title: a.name, date: `~${shortDate(a.submission_end)}` })),
  ];

  const kpis: DashboardKpi[] = [
    { label: "신규 가입 (30일)", value: `${newMembers.count ?? 0}`, sub: "최근 30일" },
    { label: "전체 회원", value: `${totalMembers.count ?? 0}`, sub: `탈퇴 ${withdrawnMembers.count ?? 0}` },
    { label: "전체 수강신청", value: `${totalEnrollments.count ?? 0}`, accent: true, sub: `신규 ${newEnrollments.count ?? 0}` },
    { label: "당월 수강료", value: formatWon(paymentSums[0]), sub: `전월 ${formatWon(paymentSums[1])}` },
  ];

  const newStatus: DashboardStatRow[] = [
    { label: "신규 가입", value: `${newMembers.count ?? 0}` },
    { label: "신규 과정 개설", value: `${newCourses.count ?? 0}` },
    { label: "전체 수강신청", value: `${totalEnrollments.count ?? 0}`, hot: true },
    { label: "탈퇴", value: `${withdrawnMembers.count ?? 0}` },
  ];

  const tuition: DashboardStatRow[] = [
    { label: "당월", value: formatWon(paymentSums[0]) },
    { label: "전월", value: formatWon(paymentSums[1]) },
    { label: "전전월", value: formatWon(paymentSums[2]) },
  ];

  const now = new Date();
  const calendar: DashboardCalendar = {
    label: `${now.getFullYear()}년 ${now.getMonth() + 1}월`,
    todayLabel: `오늘 ${now.getDate()}일`,
    todayDay: now.getDate(),
    firstWeekday: new Date(now.getFullYear(), now.getMonth(), 1).getDay(),
    daysInMonth: new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate(),
  };

  return {
    kpis,
    notices,
    consultations,
    consultationUnanswered,
    questions,
    examsTasks,
    newStatus,
    tuition,
    calendar,
  };
}

export function todayFullLabel() {
  const now = new Date();
  const week = ["일", "월", "화", "수", "목", "금", "토"][now.getDay()];
  return `${now.getFullYear()}년 ${now.getMonth() + 1}월 ${now.getDate()}일 ${week}요일`;
}

export { fullDate };
