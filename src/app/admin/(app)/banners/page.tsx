import type { Metadata } from "next";

import { BannerManagementView } from "@/features/banner-management/components/banner-management-view";
import { listAdminHomeBanners } from "@/features/banner-management/services/banner-management.service";

export const metadata: Metadata = {
  title: "배너관리",
};

export default async function AdminBannersPage() {
  let banners;
  try {
    banners = await listAdminHomeBanners();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "배너 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">배너관리</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
      </div>
    );
  }

  return <BannerManagementView banners={banners} />;
}
