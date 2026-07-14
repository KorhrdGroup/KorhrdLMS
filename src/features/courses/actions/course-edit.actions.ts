"use server";

import { deleteCourse } from "@/features/courses/services/course-delete.service";
import {
  getCourseForEdit,
  updateCourse,
} from "@/features/courses/services/course-edit.service";
import type {
  CourseDeleteResult,
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
