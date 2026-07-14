"use server";

import {
  checkCourseNameAvailability,
  createCourse,
} from "@/features/courses/services/course-registration.service";
import type {
  CourseNameCheckResult,
  CourseRegistrationInput,
  CourseRegistrationResult,
} from "@/features/courses/types/course.types";

export async function checkCourseNameDuplicateAction(
  name: string,
): Promise<CourseNameCheckResult> {
  return checkCourseNameAvailability(name);
}

export async function createCourseAction(
  input: CourseRegistrationInput,
  nameVerified: boolean,
): Promise<CourseRegistrationResult> {
  return createCourse(input, nameVerified);
}
