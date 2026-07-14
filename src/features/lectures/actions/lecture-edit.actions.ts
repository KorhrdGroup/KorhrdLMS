"use server";

import {
  deleteLecture,
  getLectureForEdit,
  updateLecture,
} from "@/features/lectures/services/lecture-edit.service";
import type {
  GetLectureForEditResult,
  LectureDeleteResult,
  LectureEditInput,
  LectureEditResult,
} from "@/features/lectures/types/lecture.types";

export async function getLectureForEditAction(
  lectureId: string,
): Promise<GetLectureForEditResult> {
  return getLectureForEdit(lectureId);
}

export async function updateLectureAction(
  lectureId: string,
  input: LectureEditInput,
): Promise<LectureEditResult> {
  return updateLecture(lectureId, input);
}

export async function deleteLectureAction(
  lectureId: string,
): Promise<LectureDeleteResult> {
  return deleteLecture(lectureId);
}
