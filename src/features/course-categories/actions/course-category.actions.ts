"use server";

import {
  createCourseCategory,
  deleteCourseCategory,
  moveCourseCategory,
  setCourseCategoryActive,
  updateCourseCategory,
} from "@/features/course-categories/services/course-category.service";
import type {
  CourseCategoryDeleteResult,
  CourseCategoryFormInput,
  CourseCategoryMoveDirection,
  CourseCategoryMutationResult,
  CourseCategoryReorderResult,
  CourseCategoryToggleResult,
} from "@/features/course-categories/types/course-category.types";

export async function createCourseCategoryAction(
  input: CourseCategoryFormInput,
): Promise<CourseCategoryMutationResult> {
  return createCourseCategory(input);
}

export async function updateCourseCategoryAction(
  id: string,
  input: CourseCategoryFormInput,
): Promise<CourseCategoryMutationResult> {
  return updateCourseCategory(id, input);
}

export async function setCourseCategoryActiveAction(
  id: string,
  isActive: boolean,
): Promise<CourseCategoryToggleResult> {
  return setCourseCategoryActive(id, isActive);
}

export async function moveCourseCategoryAction(
  id: string,
  direction: CourseCategoryMoveDirection,
): Promise<CourseCategoryReorderResult> {
  return moveCourseCategory(id, direction);
}

export async function deleteCourseCategoryAction(id: string): Promise<CourseCategoryDeleteResult> {
  return deleteCourseCategory(id);
}
