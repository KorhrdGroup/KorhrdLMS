"use server";

import { createLecture } from "@/features/lectures/services/lecture-registration.service";
import type {
  LectureRegistrationInput,
  LectureRegistrationResult,
} from "@/features/lectures/types/lecture.types";

export async function createLectureAction(
  input: LectureRegistrationInput,
): Promise<LectureRegistrationResult> {
  return createLecture(input);
}
