"use server";

import { professorPhotoKey } from "@/features/professors/lib/professor-photo-key";
import {
  createProfessor,
  deleteProfessor,
  updateProfessor,
} from "@/features/professors/services/professor.service";
import type {
  ProfessorDeleteResult,
  ProfessorFormInput,
  ProfessorMutationResult,
} from "@/features/professors/types/professor.types";
import { uploadToR2 } from "@/lib/r2/upload";

const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const ALLOWED_PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProfessorPhotoUploadResult =
  | { success: true; url: string }
  | { success: false; message: string };

/**
 * 교수 사진을 R2에 올립니다.
 *
 * 강의 영상과 같은 버킷을 쓰기 위해 서버에서 업로드합니다.
 * (R2는 브라우저에서 직접 올릴 수 없습니다 — 자격증명이 노출됩니다)
 */
export async function uploadProfessorPhotoAction(
  formData: FormData,
): Promise<ProfessorPhotoUploadResult> {
  const file = formData.get("file");
  const professorName = String(formData.get("name") ?? "");

  if (!(file instanceof File) || file.size === 0) {
    return { success: false, message: "업로드할 파일을 선택해주세요." };
  }
  if (file.size > MAX_PHOTO_BYTES) {
    return { success: false, message: "사진은 8MB 이하로 올려주세요." };
  }
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return { success: false, message: "JPG, PNG, WEBP 이미지만 올릴 수 있습니다." };
  }

  try {
    const url = await uploadToR2({
      prefix: "professors",
      baseName: professorName ? professorPhotoKey(professorName) : "professor",
      contentType: file.type,
      body: new Uint8Array(await file.arrayBuffer()),
      fileName: file.name,
    });
    return { success: true, url };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "사진 업로드에 실패했습니다.",
    };
  }
}

export async function createProfessorAction(
  input: ProfessorFormInput,
): Promise<ProfessorMutationResult> {
  return createProfessor(input);
}

export async function updateProfessorAction(
  id: string,
  input: ProfessorFormInput,
): Promise<ProfessorMutationResult> {
  return updateProfessor(id, input);
}

export async function deleteProfessorAction(id: string): Promise<ProfessorDeleteResult> {
  return deleteProfessor(id);
}
