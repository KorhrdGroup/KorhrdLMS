import type { Metadata } from "next";

import { AdminComingSoon } from "@/components/admin/pages/admin-coming-soon";
import { OthersSubNav } from "@/features/others/components/others-sub-nav";

export const metadata: Metadata = {
  title: "배너관리 | 운영관리",
};

export default function BannerManagementPage() {
  return (
    <AdminComingSoon
      title="배너관리"
      description="메인/서브 페이지 배너를 등록하고 노출 순서를 관리하는 기능은 준비 중입니다."
      subNav={<OthersSubNav />}
    />
  );
}
