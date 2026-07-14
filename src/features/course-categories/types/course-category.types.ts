export type CourseCategoryListItem = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  courseCount: number;
  createdAt: string;
};

/** 과정등록/수정 화면의 카테고리 select 옵션. is_active=true인 카테고리만 내려갑니다. */
export type CourseCategoryOption = {
  id: string;
  name: string;
};

export type CourseCategoryFormInput = {
  name: string;
  slug: string;
  description: string;
};

export type CourseCategoryMutationResult =
  | { success: true; message: string }
  | { success: false; message: string; field?: keyof CourseCategoryFormInput };

export type CourseCategoryToggleResult =
  | { success: true; isActive: boolean }
  | { success: false; message: string };

export type CourseCategoryReorderResult =
  | { success: true }
  | { success: false; message: string };

export type CourseCategoryDeleteResult =
  | { success: true; message: string }
  | { success: false; message: string };

export type CourseCategoryMoveDirection = "up" | "down";
