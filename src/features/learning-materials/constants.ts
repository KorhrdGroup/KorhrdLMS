import type { MaterialFileType } from "@/features/learning-materials/types/material.types";

/** 자료등록/수정 폼의 연결 과정 select에서 "전체 공통" 선택 시 사용하는 sentinel 값. */
export const COMMON_MATERIAL_OPTION_VALUE = "__common__";

/** 연결 과정이 없는(courseId=null) 자료의 표시명. */
export const COMMON_MATERIAL_COURSE_NAME = "전체 공통";

export function getMaterialPublishLabel(isPublished: boolean) {
  return isPublished ? "공개" : "비공개";
}

export const MATERIAL_PUBLISH_FILTER_LABELS: Record<"published" | "unpublished", string> = {
  published: "공개",
  unpublished: "비공개",
};

export const MATERIAL_FILE_TYPES: MaterialFileType[] = ["PDF", "DOCX", "PPT", "ZIP", "기타"];

export const MATERIAL_FILE_TYPE_COLORS: Record<MaterialFileType, string> = {
  PDF: "bg-[#FEF2F2] text-[#DC2626]",
  DOCX: "bg-[#EFF6FF] text-[#2563EB]",
  PPT: "bg-[#FFF7ED] text-[#EA580C]",
  ZIP: "bg-[#F5F3FF] text-[#7C3AED]",
  기타: "bg-[#F3F4F6] text-[#4B5563]",
};

const EXTENSION_FILE_TYPE_MAP: Record<string, MaterialFileType> = {
  pdf: "PDF",
  doc: "DOCX",
  docx: "DOCX",
  ppt: "PPT",
  pptx: "PPT",
  zip: "ZIP",
  rar: "ZIP",
  "7z": "ZIP",
};

export function detectMaterialFileType(fileName: string): MaterialFileType {
  const ext = fileName.split(".").pop()?.toLowerCase() ?? "";
  return EXTENSION_FILE_TYPE_MAP[ext] ?? "기타";
}

export function formatFileSizeLabel(bytes: number): string {
  if (bytes <= 0) return "0KB";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.max(1, Math.round(kb))}KB`;
  return `${(kb / 1024).toFixed(1)}MB`;
}
