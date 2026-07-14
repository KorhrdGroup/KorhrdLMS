"use client";

import {
  CERTIFICATE_PHOTO_ACCEPTED_TYPES,
  CERTIFICATE_PHOTO_BUCKET,
  CERTIFICATE_PHOTO_MAX_BYTES,
} from "@/features/certificate-applications/constants";
import { createClient } from "@/lib/supabase/client";

/** 자격증발급신청 화면에서 선택한 증명사진 파일의 형식/용량을 검증합니다(선택 항목). */
export function validateCertificatePhotoFile(file: File): string | null {
  if (!CERTIFICATE_PHOTO_ACCEPTED_TYPES.includes(file.type as (typeof CERTIFICATE_PHOTO_ACCEPTED_TYPES)[number])) {
    return "JPG, JPEG, PNG 형식의 이미지만 첨부할 수 있습니다.";
  }

  if (file.size > CERTIFICATE_PHOTO_MAX_BYTES) {
    return "사진 파일은 2MB 이하만 첨부할 수 있습니다.";
  }

  return null;
}

/**
 * 증명사진을 Supabase Storage(`certificate-photos` 버킷)에 업로드하고 공개 URL을 반환합니다.
 * 사진 첨부는 선택사항이므로, 이 함수는 사용자가 파일을 선택했을 때만 호출됩니다.
 */
export async function uploadCertificatePhotoFile(file: File): Promise<string> {
  const supabase = createClient();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `${Date.now()}-${safeName}`;

  const { error: uploadError } = await supabase.storage
    .from(CERTIFICATE_PHOTO_BUCKET)
    .upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || "image/jpeg",
    });

  if (uploadError) {
    throw new Error(toFriendlyUploadErrorMessage(uploadError.message));
  }

  const { data } = supabase.storage.from(CERTIFICATE_PHOTO_BUCKET).getPublicUrl(path);

  return data.publicUrl;
}

function toFriendlyUploadErrorMessage(rawMessage: string): string {
  if (/bucket not found/i.test(rawMessage)) {
    return `"${CERTIFICATE_PHOTO_BUCKET}" Storage 버킷이 없습니다. Supabase Storage에서 해당 버킷을 생성(Public)한 뒤 다시 시도해주세요.`;
  }

  return rawMessage;
}
