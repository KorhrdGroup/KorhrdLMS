"use client";

import { createClient } from "@/lib/supabase/client";

export const NOTICE_ATTACHMENT_BUCKET = "notice-attachments";

/**
 * 공지사항 첨부파일을 브라우저에서 Supabase Storage로 직접 업로드하고,
 * 저장에 필요한 공개 URL과 오브젝트 경로를 반환합니다.
 */
export async function uploadNoticeAttachment(
  file: File,
): Promise<{ url: string; path: string }> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error } = await supabase.storage
    .from(NOTICE_ATTACHMENT_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "application/octet-stream",
    });

  if (error) {
    throw new Error(`첨부파일 업로드에 실패했습니다: ${error.message}`);
  }

  const { data } = supabase.storage.from(NOTICE_ATTACHMENT_BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}
