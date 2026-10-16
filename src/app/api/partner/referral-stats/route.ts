import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { computeReferralStats } from "@/features/statistics/services/referral-stats.service";

/**
 * 한평생 오피스 → 한직훈 유입경로 통계 (2026-10-14).
 *
 * 오피스 「민간자격증 › 통계 › 유입경로」 화면이 서버끼리 부릅니다. 어드민 「통계 › 유입경로 통계」와 같은 집계
 * (computeReferralStats)를 돌려줍니다. 회원 이름·아이디·연락처가 담기므로 자동 발급과 같은
 * 비밀키(x-partner-key = PARTNER_AUTO_ISSUE_KEY)가 없으면 받지 않습니다. 브라우저에서 직접 부르는 API가 아닙니다.
 *
 *   GET /api/partner/referral-stats?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD  (둘 다 비우면 전체 기간, 가입일 기준)
 *       &excludeCreditLink=1 이면 학점연계 학생(자동 발급 가입 · 자동 발급 신청 회원)을 뺀다
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
  /* excludeCreditLink=1 — 학점연계 학생(오피스 등록학생) 빼고 센다 (2026-10-16 오피스 DB 자산 현황) */
  const excludeCreditLink = params.get("excludeCreditLink") === "1";

  try {
    const rows = await computeReferralStats({ ...query, excludeCreditLink });
    return NextResponse.json({ success: true, query, rows });
  } catch (error) {
    console.error("[partner/referral-stats] 실패:", error);
    return NextResponse.json(
      { success: false, message: error instanceof Error ? error.message : "유입경로 통계를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
