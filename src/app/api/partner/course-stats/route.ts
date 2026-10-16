import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { computePostpaidCourseStats } from "@/features/statistics/services/course-stats.service";

/**
 * 한평생 오피스 → 한직훈 과정별 자격증 신청 · 발급 (후납) (2026-10-16).
 *
 * 오피스 「민간자격증 › 통계 › 과정별」 화면이 서버끼리 부릅니다(computePostpaidCourseStats).
 * 유입경로 통계와 같은 비밀키(x-partner-key = PARTNER_AUTO_ISSUE_KEY)가 없으면 받지 않습니다.
 *
 *   GET /api/partner/course-stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD  (둘 다 비우면 전체 기간, 신청일 기준)
 */
export const dynamic = "force-dynamic";

/** 비밀키 비교 — 글자 하나씩 걸리는 시간으로 키를 추측하지 못하게 상수 시간으로 */
const sameKey = (given: string | null | undefined, expected: string) => {
  const a = Buffer.from(given?.trim() ?? "");
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

/** 실제로 있는 날짜(YYYY-MM-DD)만 받습니다 — 2026-02-31 같은 값은 무시 */
const pickDate = (value: string | null) => {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
};

export async function GET(request: Request) {
  const expected = process.env.PARTNER_AUTO_ISSUE_KEY?.trim();
  if (!expected) {
    return NextResponse.json(
      { success: false, message: "PARTNER_AUTO_ISSUE_KEY 가 설정되지 않았습니다." },
      { status: 503 },
    );
  }
  if (!sameKey(request.headers.get("x-partner-key"), expected)) {
    return NextResponse.json({ success: false, message: "인증 실패" }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  let query = { startDate: pickDate(params.get("startDate")), endDate: pickDate(params.get("endDate")) };
  if (query.startDate && query.endDate && query.startDate > query.endDate) {
    query = { startDate: query.endDate, endDate: query.startDate };
  }

  try {
    const rows = await computePostpaidCourseStats(query);
    return NextResponse.json({ success: true, query, rows });
  } catch (error) {
    console.error("[partner/course-stats] 실패:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "과정별 통계를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
