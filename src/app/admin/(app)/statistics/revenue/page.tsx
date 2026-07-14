import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";
import { StatisticsSubNav } from "@/features/statistics/components/statistics-sub-nav";

export const metadata: Metadata = {
  title: "매출통계 | 통계",
};

export default function RevenueStatisticsPage() {
  return (
    <AdminComingSoon
      title="매출통계"
      description="결제/환불 기반 매출 통계 기능은 준비 중입니다."
      subNav={<StatisticsSubNav />}
    />
  );
}
