"use client";

import { COURSE_THUMBNAIL_BUCKET } from "@/features/courses/constants";
import { createClient } from "@/lib/supabase/client";

/**
 * 과정등록/과정수정 화면에서 선택한 썸네일 이미지를 Supabase Storage에 업로드하고
 * 공개 URL을 반환합니다. `courses.thumbnail_url`에 저장할 값으로 그대로 사용합니다.
 */
export async function uploadCourseThumbnailFile(file: File): Promise<string> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(COURSE_THUMBNAIL_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(toFriendlyUploadErrorMessage(uploadError.message));
  }

  const { data } = supabase.storage.from(COURSE_THUMBNAIL_BUCKET).getPublicUrl(path);

  return data.publicUrl;
}

/**
 * "Bucket not found"는 원인(버킷 미생성)을 바로 알기 어려우므로, 관리자가 바로 조치할 수
 * 있도록 버킷명과 대응 방법을 함께 안내하는 메시지로 바꿔줍니다.
 */
function toFriendlyUploadErrorMessage(rawMessage: string): string {
  if (/bucket not found/i.test(rawMessage)) {
    return `"${COURSE_THUMBNAIL_BUCKET}" Storage 버킷이 없습니다. Supabase Storage에서 해당 버킷을 생성(Public)한 뒤 다시 시도해주세요.`;
  }

  return rawMessage;
}
