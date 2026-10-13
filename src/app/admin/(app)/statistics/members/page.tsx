import type { Metadata } from "next";

import { ReferralStatsView } from "@/features/statistics/components/referral-stats-view";
import { getReferralStats } from "@/features/statistics/services/referral-stats.service";
import { todayInKst } from "@/lib/shared/kst-date";

export const metadata: Metadata = {
  title: "유입경로 통계 | 통계",
};

type MemberStatisticsPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

/** 실제로 있는 날짜(YYYY-MM-DD)만 받습니다 — 2026-02-31 같은 값은 무시 */
const pickDate = (value: string | string[] | undefined) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return "";
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value ? value : "";
};

/** 빠른 기간 버튼 — KST 오늘 기준 이번 달 · 지난 달 · 최근 3개월 */
function buildPeriods(today: string) {
  const [year, month] = today.split("-").map(Number);
  const ymd = (y: number, m: number, d: number) => {
    const date = new Date(Date.UTC(y, m - 1, d));
    return date.toISOString().slice(0, 10);
  };
  return [
    { label: "이번 달", startDate: ymd(year, month, 1), endDate: today },
    { label: "지난 달", startDate: ymd(year, month - 1, 1), endDate: ymd(year, month, 0) },
    { label: "최근 3개월", startDate: ymd(year, month - 2, 1), endDate: today },
  ];
}

export default async function MemberStatisticsPage({ searchParams }: MemberStatisticsPageProps) {
  const params = await searchParams;
  let query = { startDate: pickDate(params.startDate), endDate: pickDate(params.endDate) };
  // 시작이 종료보다 늦으면 뒤바꿔 줍니다
  if (query.startDate && query.endDate && query.startDate > query.endDate) {
    query = { startDate: query.endDate, endDate: query.startDate };
  }

  let rows: Awaited<ReturnType<typeof getReferralStats>> | null = null;
  let errorMessage = "";
  try {
    rows = await getReferralStats(query);
  } catch (error) {
    errorMessage = error instanceof Error ? error.message : "유입경로 통계를 불러오지 못했습니다.";
  }

  if (!rows) {
    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">유입경로 통계</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{errorMessage}</p>
      </div>
    );
  }

  // key — 뒤로가기 등으로 기간이 바뀌면 날짜 입력칸·펼친 줄도 새로 맞춥니다
  return <ReferralStatsView key={`${query.startDate}~${query.endDate}`} rows={rows} query={query} periods={buildPeriods(todayInKst())} />;
}
