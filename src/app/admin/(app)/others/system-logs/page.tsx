import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";
import { OthersSubNav } from "@/features/others/components/others-sub-nav";

export const metadata: Metadata = {
  title: "시스템로그 | 운영관리",
};

export default function SystemLogsPage() {
  return (
    <AdminComingSoon
      title="시스템로그"
      description="관리자 작업 이력 및 시스템 이벤트 로그 조회 기능은 준비 중입니다."
      subNav={<OthersSubNav />}
    />
  );
}
