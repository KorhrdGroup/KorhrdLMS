import { COMMON_MATERIAL_OPTION_VALUE } from "@/features/learning-materials/constants";
import { createMaterialRecord } from "@/features/learning-materials/repositories/material.repository";
import type {
  Material,
  MaterialFileInput,
  MaterialRegistrationInput,
  MaterialRegistrationResult,
} from "@/features/learning-materials/types/material.types";
import { createClient } from "@/lib/supabase/server";

function normalize(value: string) {
  return value.trim();
}

export type ParsedMaterialInput = {
  /** null이면 "전체 공통" 자료입니다. */
  courseId: string | null;
  title: string;
  description: string;
  file: MaterialFileInput;
  fileUrl: string | null;
  isPublished: boolean;
};

export function validateMaterialInput(
  input: MaterialRegistrationInput,
  options: { requireFile: boolean } = { requireFile: true },
): { field: keyof MaterialRegistrationInput; message: string } | ParsedMaterialInput {
  if (!normalize(input.courseId)) {
    return { field: "courseId", message: "연결 과정을 선택해주세요." };
  }

  if (!normalize(input.title)) {
    return { field: "title", message: "제목을 입력해주세요." };
  }

  if (!normalize(input.description)) {
    return { field: "description", message: "설명을 입력해주세요." };
  }

  if (!input.file) {
    if (options.requireFile) {
      return { field: "file", message: "파일을 선택해주세요." };
    }
  }

  const courseId =
    input.courseId === COMMON_MATERIAL_OPTION_VALUE ? null : normalize(input.courseId);

  return {
    courseId,
    title: normalize(input.title),
    description: normalize(input.description),
    file: input.file as MaterialFileInput,
    fileUrl: normalize(input.fileUrl ?? "") || null,
    isPublished: input.isPublished,
  };
}

async function findCourseOption(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function createMaterial(
  input: MaterialRegistrationInput,
): Promise<MaterialRegistrationResult> {
  const parsed = validateMaterialInput(input, { requireFile: true });

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  if (parsed.courseId) {
    const course = await findCourseOption(parsed.courseId);
    if (!course) {
      return {
        success: false,
        message: "선택한 과정을 찾을 수 없습니다.",
        field: "courseId",
      };
    }
  }

  const material: Material = await createMaterialRecord({
    courseId: parsed.courseId,
    title: parsed.title,
    description: parsed.description,
    fileType: parsed.file.fileType,
    fileName: parsed.file.fileName,
    fileSizeLabel: parsed.file.fileSizeLabel,
    fileUrl: parsed.fileUrl,
    isPublished: parsed.isPublished,
  });

  return {
    success: true,
    materialId: material.id,
    message: `"${material.title}" 자료가 등록되었습니다.`,
  };
}
