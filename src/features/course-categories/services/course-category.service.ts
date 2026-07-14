import {
  countCoursesByCategoryId,
  deleteCourseCategory as deleteCourseCategoryRow,
  findCourseCategoryById,
  findCourseCategoryBySlug,
  insertCourseCategory,
  listCourseCategories,
  updateCourseCategory as updateCourseCategoryRow,
  type CourseCategoryRow,
} from "@/features/course-categories/repositories/course-category.repository";
import type {
  CourseCategoryDeleteResult,
  CourseCategoryFormInput,
  CourseCategoryListItem,
  CourseCategoryMoveDirection,
  CourseCategoryMutationResult,
  CourseCategoryOption,
  CourseCategoryReorderResult,
  CourseCategoryToggleResult,
} from "@/features/course-categories/types/course-category.types";
import { createClient } from "@/lib/supabase/server";

function normalize(value: string) {
  return value.trim();
}

function normalizeSlug(value: string) {
  return value.trim().toLowerCase();
}

function toListItem(row: CourseCategoryRow, courseCount: number): CourseCategoryListItem {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    sortOrder: row.sort_order,
    isActive: row.is_active,
    courseCount,
    createdAt: row.created_at,
  };
}

export async function getCourseCategoryList(): Promise<CourseCategoryListItem[]> {
  const [rows, counts] = await Promise.all([listCourseCategories(), countCoursesByCategoryId()]);

  return rows.map((row) => toListItem(row, counts.get(row.id) ?? 0));
}

/** 과정등록/수정 화면의 카테고리 select 옵션입니다. is_active=true인 카테고리만 반환합니다. */
export async function getActiveCourseCategoryOptions(): Promise<CourseCategoryOption[]> {
  const rows = await listCourseCategories();
  return rows
    .filter((row) => row.is_active)
    .map((row) => ({ id: row.id, name: row.name }));
}

function validateForm(input: CourseCategoryFormInput): CourseCategoryMutationResult | null {
  if (!normalize(input.name)) {
    return { success: false, message: "카테고리명을 입력해주세요.", field: "name" };
  }

  const slug = normalizeSlug(input.slug);
  if (slug && !/^[a-z0-9-]{2,50}$/.test(slug)) {
    return {
      success: false,
      message: "슬러그는 2~50자의 영문 소문자, 숫자, - 만 사용할 수 있습니다.",
      field: "slug",
    };
  }

  return null;
}

export async function createCourseCategory(
  input: CourseCategoryFormInput,
): Promise<CourseCategoryMutationResult> {
  const invalid = validateForm(input);
  if (invalid) {
    return invalid;
  }

  const supabase = await createClient();
  const slug = normalizeSlug(input.slug) || null;

  if (slug) {
    const existing = await findCourseCategoryBySlug(supabase, slug);
    if (existing) {
      return { success: false, message: "이미 사용 중인 슬러그입니다.", field: "slug" };
    }
  }

  const rows = await listCourseCategories();
  const maxSortOrder = rows.reduce((max, row) => Math.max(max, row.sort_order), 0);

  await insertCourseCategory(supabase, {
    name: normalize(input.name),
    slug,
    description: normalize(input.description) || null,
    sort_order: maxSortOrder + 10,
    is_active: true,
  });

  return { success: true, message: "카테고리가 등록되었습니다." };
}

export async function updateCourseCategory(
  id: string,
  input: CourseCategoryFormInput,
): Promise<CourseCategoryMutationResult> {
  if (!id.trim()) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  const invalid = validateForm(input);
  if (invalid) {
    return invalid;
  }

  const supabase = await createClient();
  const slug = normalizeSlug(input.slug) || null;

  if (slug) {
    const existing = await findCourseCategoryBySlug(supabase, slug, id);
    if (existing) {
      return { success: false, message: "이미 사용 중인 슬러그입니다.", field: "slug" };
    }
  }

  const updated = await updateCourseCategoryRow(supabase, id, {
    name: normalize(input.name),
    slug,
    description: normalize(input.description) || null,
  });

  if (!updated) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  return { success: true, message: "카테고리가 수정되었습니다." };
}

export async function setCourseCategoryActive(
  id: string,
  isActive: boolean,
): Promise<CourseCategoryToggleResult> {
  if (!id.trim()) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  const supabase = await createClient();
  const updated = await updateCourseCategoryRow(supabase, id, { is_active: isActive });

  if (!updated) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  return { success: true, isActive: updated.is_active };
}

export async function moveCourseCategory(
  id: string,
  direction: CourseCategoryMoveDirection,
): Promise<CourseCategoryReorderResult> {
  const rows = await listCourseCategories();
  const index = rows.findIndex((row) => row.id === id);

  if (index === -1) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= rows.length) {
    return { success: true };
  }

  const current = rows[index];
  const target = rows[targetIndex];

  const supabase = await createClient();
  await Promise.all([
    updateCourseCategoryRow(supabase, current.id, { sort_order: target.sort_order }),
    updateCourseCategoryRow(supabase, target.id, { sort_order: current.sort_order }),
  ]);

  return { success: true };
}

export async function deleteCourseCategory(id: string): Promise<CourseCategoryDeleteResult> {
  if (!id.trim()) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  const supabase = await createClient();

  const category = await findCourseCategoryById(supabase, id);
  if (!category) {
    return { success: false, message: "카테고리를 찾을 수 없습니다." };
  }

  const counts = await countCoursesByCategoryId();
  const usedCount = counts.get(id) ?? 0;

  if (usedCount > 0) {
    return {
      success: false,
      message: `이 카테고리를 사용 중인 과정이 ${usedCount}건 있어 삭제할 수 없습니다. 먼저 해당 과정의 분류를 변경하거나, 카테고리를 "사용안함"으로 비활성화해주세요.`,
    };
  }

  try {
    await deleteCourseCategoryRow(supabase, id);
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("foreign key") || message.includes("violates")) {
      return {
        success: false,
        message: "이 카테고리를 사용 중인 과정이 있어 삭제할 수 없습니다. 비활성화를 이용해주세요.",
      };
    }
    throw error;
  }

  return { success: true, message: `"${category.name}" 카테고리가 삭제되었습니다.` };
}
