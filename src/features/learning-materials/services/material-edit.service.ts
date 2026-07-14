import {
  deleteMaterialRecord,
  findMaterialById,
  updateMaterialRecord,
} from "@/features/learning-materials/repositories/material.repository";
import { validateMaterialInput } from "@/features/learning-materials/services/material-registration.service";
import type {
  MaterialDeleteResult,
  MaterialEditInput,
  MaterialEditResult,
  GetMaterialForEditResult,
} from "@/features/learning-materials/types/material.types";
import { createClient } from "@/lib/supabase/server";

export async function getMaterialForEdit(
  materialId: string,
): Promise<GetMaterialForEditResult> {
  const material = await findMaterialById(materialId);

  if (!material) {
    return { success: false, message: "자료 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    material: {
      id: material.id,
      courseId: material.courseId,
      courseName: material.courseName,
      title: material.title,
      description: material.description,
      fileType: material.fileType,
      fileName: material.fileName,
      fileSizeLabel: material.fileSizeLabel,
      fileUrl: material.fileUrl,
      isPublished: material.isPublished,
    },
  };
}

export async function updateMaterial(
  materialId: string,
  input: MaterialEditInput,
): Promise<MaterialEditResult> {
  const existing = await findMaterialById(materialId);
  if (!existing) {
    return { success: false, message: "자료 정보를 찾을 수 없습니다." };
  }

  // 파일 교체는 선택 사항입니다 — 새 파일을 고르지 않으면 기존 파일 정보를 유지합니다.
  const parsed = validateMaterialInput(input, { requireFile: false });

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  if (parsed.courseId) {
    const supabase = await createClient();
    const { data: course, error } = await supabase
      .from("courses")
      .select("id, name")
      .eq("id", parsed.courseId)
      .is("deleted_at", null)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!course) {
      return {
        success: false,
        message: "선택한 과정을 찾을 수 없습니다.",
        field: "courseId",
      };
    }
  }

  const file = input.file ?? {
    fileName: existing.fileName,
    fileType: existing.fileType,
    fileSizeLabel: existing.fileSizeLabel,
  };

  const updated = await updateMaterialRecord(materialId, {
    courseId: parsed.courseId,
    title: parsed.title,
    description: parsed.description,
    fileType: file.fileType,
    fileName: file.fileName,
    fileSizeLabel: file.fileSizeLabel,
    fileUrl: parsed.fileUrl,
    isPublished: parsed.isPublished,
  });

  if (!updated) {
    return { success: false, message: "자료 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${updated.title}" 자료가 수정되었습니다.` };
}

export async function deleteMaterial(materialId: string): Promise<MaterialDeleteResult> {
  const material = await findMaterialById(materialId);

  if (!material) {
    return { success: false, message: "삭제할 자료를 찾을 수 없습니다." };
  }

  await deleteMaterialRecord(materialId);

  return { success: true, message: `"${material.title}" 자료가 삭제되었습니다.` };
}
