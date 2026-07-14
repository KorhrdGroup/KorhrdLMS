import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";
import { StatisticsSubNav } from "@/features/statistics/components/statistics-sub-nav";

export const metadata: Metadata = {
  title: "회원통계 | 통계",
};

export default function MemberStatisticsPage() {
  return (
    <AdminComingSoon
      title="회원통계"
      description="가입/탈퇴/휴면 추이 등 회원 통계 기능은 준비 중입니다."
      subNav={<StatisticsSubNav />}
    />
  );
}
