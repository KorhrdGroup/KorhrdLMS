import type { LiveRow } from "@/features/korhrd/components/home/LiveTicker";
import { LIVE_FEED } from "@/features/korhrd/data/liveFeed";
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

/** "2026-04-17T…" → "26-04-17" (티커 표기) */
const shortDate = (iso: string) => iso.slice(2, 10);

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
      date: shortDate(row.learning_completed_at),
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
      date: shortDate(row.issued_at),
      at: row.issued_at,
    });
  }

  const real = rows
    .sort((a, b) => (a.at < b.at ? 1 : -1))
    .slice(0, MAX_ROWS)
    .map(({ at: _at, ...row }) => row);

  // 실데이터가 아직 적으면 더미(운영 지정 목록)로 뒤를 채웁니다.
  return [...real, ...LIVE_FEED].slice(0, MAX_ROWS);
}
