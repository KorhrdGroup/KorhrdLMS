/**
 * 관리자 자료실(/admin/learning-materials) 타입 정의입니다.
 *
 * Supabase `learning_materials` 테이블(courses.id 연결)을 사용합니다.
 * `courseId`가 null이면 "전체 공통" 자료로 간주해 모든 학생에게 노출됩니다.
 * 파일 자체는 아직 Storage 업로드가 연결되지 않아 파일명/용량/종류만 저장하며,
 * `fileUrl`은 관리자가 직접 입력하는 외부 다운로드 링크(선택)입니다.
 *
 * 학생 학습강의실 '학습자료실'(`src/components/classroom/data/material-data.ts`의
 * `CourseMaterial` 타입)과 필드 의미를 최대한 맞춰 매핑이 쉬운 구조로 구성했습니다:
 * title↔title, description↔content, fileName↔fileName, createdAt↔createdAt.
 */
import type { MaterialFileType } from "@/types/database.types";

export type { MaterialFileType };

export type Material = {
  id: string;
  courseId: string | null;
  courseName: string;
  title: string;
  description: string;
  fileType: MaterialFileType;
  fileName: string;
  fileSizeLabel: string;
  fileUrl: string | null;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
};

export type MaterialListItem = {
  id: string;
  courseId: string | null;
  courseName: string;
  title: string;
  fileType: MaterialFileType;
  isPublished: boolean;
  createdAt: string;
};

export type MaterialCourseOption = {
  id: string;
  name: string;
  code: string;
};

export type MaterialFilterOptions = {
  courses: MaterialCourseOption[];
};

export type MaterialPublishFilter = "" | "published" | "unpublished";

export type MaterialFileTypeFilter = "" | MaterialFileType;

export type MaterialListQuery = {
  page: number;
  pageSize: number;
  search: string;
  courseId: string;
  fileType: MaterialFileTypeFilter;
  publish: MaterialPublishFilter;
};

export type MaterialFileInput = {
  fileName: string;
  fileType: MaterialFileType;
  fileSizeLabel: string;
};

export type MaterialRegistrationInput = {
  /** 실제 course id, "" (미선택) 또는 COMMON_MATERIAL_OPTION_VALUE(전체 공통) */
  courseId: string;
  title: string;
  description: string;
  file: MaterialFileInput | null;
  fileUrl: string;
  isPublished: boolean;
};

export type MaterialRegistrationResult =
  | { success: true; materialId: string; message: string }
  | {
      success: false;
      message: string;
      field?: keyof MaterialRegistrationInput;
    };

export type MaterialEditInput = MaterialRegistrationInput;

export type MaterialEditDetail = {
  id: string;
  courseId: string | null;
  courseName: string;
  title: string;
  description: string;
  fileType: MaterialFileType;
  fileName: string;
  fileSizeLabel: string;
  fileUrl: string | null;
  isPublished: boolean;
};

export type MaterialEditResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof MaterialEditInput };

export type GetMaterialForEditResult =
  | { success: true; material: MaterialEditDetail }
  | { success: false; message: string };

export type MaterialDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };
