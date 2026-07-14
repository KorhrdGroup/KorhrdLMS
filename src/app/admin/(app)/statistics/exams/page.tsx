import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";
import { StatisticsSubNav } from "@/features/statistics/components/statistics-sub-nav";

export const metadata: Metadata = {
  title: "시험통계 | 통계",
};

export default function ExamStatisticsPage() {
  return (
    <AdminComingSoon
      title="시험통계"
      description="시험 응시/합격률 등 시험 통계 기능은 준비 중입니다."
      subNav={<StatisticsSubNav />}
    />
  );
}
