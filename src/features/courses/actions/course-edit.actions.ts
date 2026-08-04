"use server";

import { deleteCourse } from "@/features/courses/services/course-delete.service";
import {
  getCourseDetailEditOptions,
  getCourseForEdit,
  updateCourse,
} from "@/features/courses/services/course-edit.service";
import type {
  CourseDeleteResult,
  CourseDetailEditOptions,
  CourseEditInput,
  CourseEditResult,
  GetCourseForEditResult,
} from "@/features/courses/types/course-edit.types";

export async function getCourseForEditAction(
  courseId: string,
): Promise<GetCourseForEditResult> {
  return getCourseForEdit(courseId);
}

export async function updateCourseAction(
  courseId: string,
  input: CourseEditInput,
): Promise<CourseEditResult> {
  return updateCourse(courseId, input);
}

export async function deleteCourseAction(
  courseId: string,
): Promise<CourseDeleteResult> {
  return deleteCourse(courseId);
}

export async function getCourseDetailEditOptionsAction(): Promise<CourseDetailEditOptions> {
  return getCourseDetailEditOptions();
}
