"use server";

import { revalidatePath } from "next/cache";

import {
  createHomeBanner,
  deleteHomeBanner,
  moveHomeBanner,
  updateHomeBanner,
  type BannerMutationResult,
} from "@/features/banner-management/services/banner-management.service";

function revalidateBannerPages() {
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function createHomeBannerAction(input: {
  imageUrl: string;
  alt: string;
  linkUrl: string | null;
}): Promise<BannerMutationResult> {
  const result = await createHomeBanner(input);
  if (result.success) revalidateBannerPages();
  return result;
}

export async function updateHomeBannerAction(
  bannerId: string,
  input: { alt?: string; linkUrl?: string | null; isPublished?: boolean },
): Promise<BannerMutationResult> {
  const result = await updateHomeBanner(bannerId, input);
  if (result.success) revalidateBannerPages();
  return result;
}

export async function deleteHomeBannerAction(
  bannerId: string,
): Promise<BannerMutationResult> {
  const result = await deleteHomeBanner(bannerId);
  if (result.success) revalidateBannerPages();
  return result;
}

export async function moveHomeBannerAction(
  bannerId: string,
  direction: "up" | "down",
): Promise<BannerMutationResult> {
  const result = await moveHomeBanner(bannerId, direction);
  if (result.success) revalidateBannerPages();
  return result;
}
