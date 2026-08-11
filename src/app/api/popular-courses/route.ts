import { NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

/**
 * 인기 자격증 TOP 10 — 검색 오버레이에서 씁니다.
 *
 * 1차 기준은 실제 수강신청 수(enrollments, confirmed)입니다.
 * 아직 신청이 적은 초반에는 10개가 안 채워지므로, 클라이언트가 갖고 있는
 * 하드코딩 순위(rank)로 나머지를 채웁니다 — 여기서는 DB 순위만 내려줍니다.
 * (나중에 검색횟수 기반으로 바꿀 때 이 라우트의 집계만 갈아끼우면 됩니다.)
 */
export const revalidate = 3600; // 1시간 캐시 — 순위가 실시간일 필요는 없습니다

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("enrollments")
    .select("course_id, course:courses!inner ( name, status )")
    .eq("status", "confirmed")
    .is("deleted_at", null);

  if (error) {
    return NextResponse.json({ names: [] }, { status: 200 });
  }

  const rows = (data ?? []) as unknown as {
    course_id: string;
    course: { name: string; status: string };
  }[];

  // 노출 중(active)인 과정만 집계합니다 — 내려간 과정이 순위에 나오면 곤란합니다.
  const countByName = new Map<string, number>();
  for (const row of rows) {
    if (row.course?.status !== "active") continue;
    countByName.set(row.course.name, (countByName.get(row.course.name) ?? 0) + 1);
  }

  const names = [...countByName.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name]) => name);

  return NextResponse.json({ names });
}
