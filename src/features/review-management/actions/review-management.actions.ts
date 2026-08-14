"use server";

import { revalidatePath } from "next/cache";

import {
  deleteAdminCourseReview,
  updateAdminCourseReview,
  type AdminReviewMutationResult,
} from "@/features/review-management/services/review-management.service";

export async function updateAdminCourseReviewAction(
  reviewId: string,
  input: { title: string; body: string; isPublished: boolean },
): Promise<AdminReviewMutationResult> {
  const result = await updateAdminCourseReview(reviewId, input);
  if (result.success) {
    revalidatePath("/admin/boards/reviews");
    revalidatePath("/reviews");
  }
  return result;
}

export async function deleteAdminCourseReviewAction(
  reviewId: string,
): Promise<AdminReviewMutationResult> {
  const result = await deleteAdminCourseReview(reviewId);
  if (result.success) {
    revalidatePath("/admin/boards/reviews");
    revalidatePath("/reviews");
  }
  return result;
}
