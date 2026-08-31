import type { Metadata } from "next";

import { ReviewManagementView } from "@/features/review-management/components/review-management-view";
import {
  listAdminCourseReviews,
  listReviewCourseOptions,
} from "@/features/review-management/services/review-management.service";

export const metadata: Metadata = {
  title: "합격후기 | 게시판관리",
};

export default async function AdminReviewsPage() {
  let reviews;
  let courseOptions;
  try {
    [reviews, courseOptions] = await Promise.all([
      listAdminCourseReviews(),
      listReviewCourseOptions(),
    ]);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "후기 목록을 불러오지 못했습니다.";

    return (
      <div className="rounded-xl border border-[#E5E7EB] bg-white p-8 text-center shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <h1 className="text-lg font-bold text-[#111827]">합격후기</h1>
        <p className="mt-2 text-sm text-[#EF4444]">{message}</p>
      </div>
    );
  }

  return <ReviewManagementView reviews={reviews} courseOptions={courseOptions} />;
}
