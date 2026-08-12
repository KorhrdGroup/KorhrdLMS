import type { LiveRow } from "@/features/korhrd/components/home/LiveTicker";
import { createClient } from "@/lib/supabase/server";

/**
 * 메인 "수강생들의 한 걸음 더 성장한 순간" 티커 데이터.
 *
 * 최근 수강완료(learning_completed_at)와 자격증 발급완료(issued_at)를 모아
 * 최신순으로 내려줍니다. 이름은 여기서 마스킹합니다.
 */
const MAX_ROWS = 30;

function maskName(name: string): string {
  const trimmed = (name ?? "").trim();
  if (trimmed.length <= 1) return trimmed || "수강생";
  if (trimmed.length === 2) return `${trimmed[0]}*`;
  return `${trimmed[0]}${"*".repeat(trimmed.length - 2)}${trimmed.at(-1)}`;
}

/**
 * 티커에 찍는 날짜 — 실제 완료·발급일이 아니라 **오늘**입니다 (2026-08-12, 디자인 요청).
 * 티커가 늘 최신으로 보이게 해달라는 요청이라, 표시용으로만 오늘로 덮습니다.
 * 정렬은 그대로 실제 시각(at)으로 하므로 최신순 차례는 유지됩니다.
 *
 * ⚠ 화면에 나오는 날짜가 기록의 실제 날짜와 다릅니다. 서로 다른 날 발급된 건들이
 *   전부 같은 날짜로 보입니다. 되돌리려면 이 함수를 iso.slice(2, 10) 로 바꾸세요.
 *
 * 홈은 요청마다 서버에서 그려지는 화면(ƒ)이라 날짜가 굳지 않습니다.
 * 서버 시간대가 UTC 여도 한국 날짜가 나오도록 Asia/Seoul 로 잡습니다
 * (en-CA 로케일이 YYYY-MM-DD 로 내줍니다).
 */
const todayShort = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Seoul" }).format(new Date()).slice(2);

export async function getLiveFeed(): Promise<LiveRow[]> {
  const supabase = await createClient();

  const [{ data: completed }, { data: issued }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("learning_completed_at, member:members!inner ( name ), course:courses!inner ( name )")
      .not("learning_completed_at", "is", null)
      .is("deleted_at", null)
      .order("learning_completed_at", { ascending: false })
      .limit(MAX_ROWS),
    supabase
      .from("certificate_applications")
      .select("issued_at, certificate_name, member:members!inner ( name )")
      .not("issued_at", "is", null)
      .order("issued_at", { ascending: false })
      .limit(MAX_ROWS),
  ]);

  const rows: (LiveRow & { at: string })[] = [];

  for (const row of (completed ?? []) as unknown as {
    learning_completed_at: string;
    member: { name: string } | null;
    course: { name: string } | null;
  }[]) {
    rows.push({
      state: "done",
      name: maskName(row.member?.name ?? ""),
      course: row.course?.name ?? "",
      date: todayShort(),
      at: row.learning_completed_at,
    });
  }

  for (const row of (issued ?? []) as unknown as {
    issued_at: string;
    certificate_name: string;
    member: { name: string } | null;
  }[]) {
    rows.push({
      state: "issued",
      name: maskName(row.member?.name ?? ""),
      course: row.certificate_name,
      date: todayShort(),
      at: row.issued_at,
    });
  }

  return rows
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, MAX_ROWS)
    .map(({ at: _at, ...row }) => row);
}
