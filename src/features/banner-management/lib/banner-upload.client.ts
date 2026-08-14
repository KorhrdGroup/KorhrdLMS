"use client";

import { createClient } from "@/lib/supabase/client";

export const HOME_BANNER_BUCKET = "home-banners";
export const BANNER_ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
export const BANNER_MAX_BYTES = 5 * 1024 * 1024;

/** 배너 이미지를 Supabase Storage(home-banners)에 올리고 공개 URL을 반환합니다 */
export async function uploadHomeBannerImage(file: File): Promise<string> {
  if (!BANNER_ACCEPTED_TYPES.includes(file.type)) {
    throw new Error("JPG·PNG·WebP 이미지만 올릴 수 있습니다.");
  }
  if (file.size > BANNER_MAX_BYTES) {
    throw new Error("이미지는 5MB 이하로 올려주세요.");
  }

  const supabase = createClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from(HOME_BANNER_BUCKET).upload(path, file, {
    cacheControl: "3600",
    contentType: file.type,
  });
  if (error) throw new Error(`이미지 업로드에 실패했습니다: ${error.message}`);

  return supabase.storage.from(HOME_BANNER_BUCKET).getPublicUrl(path).data.publicUrl;
}
