import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";
import { StatisticsSubNav } from "@/features/statistics/components/statistics-sub-nav";

export const metadata: Metadata = {
  title: "수강통계 | 통계",
};

export default function EnrollmentStatisticsPage() {
  return (
    <AdminComingSoon
      title="수강통계"
      description="수강신청/수료율 등 수강 통계 기능은 준비 중입니다."
      subNav={<StatisticsSubNav />}
    />
  );
}
