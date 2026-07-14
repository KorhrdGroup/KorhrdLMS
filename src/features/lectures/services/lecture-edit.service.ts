import {
  deleteLectureRecord,
  findLectureById,
  updateLectureRecord,
} from "@/features/lectures/repositories/lecture.repository";
import type {
  GetLectureForEditResult,
  LectureDeleteResult,
  LectureEditInput,
  LectureEditResult,
} from "@/features/lectures/types/lecture.types";
import { createClient } from "@/lib/supabase/server";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function getLectureForEdit(
  lectureId: string,
): Promise<GetLectureForEditResult> {
  const lecture = await findLectureById(lectureId);

  if (!lecture) {
    return { success: false, message: "강의 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    lecture: {
      id: lecture.id,
      courseId: lecture.courseId,
      courseName: lecture.courseName,
      title: lecture.title,
      description: lecture.description,
      thumbnailFileName: lecture.thumbnailFileName ?? "",
      isPublished: lecture.isPublished,
    },
  };
}

export async function updateLecture(
  lectureId: string,
  input: LectureEditInput,
): Promise<LectureEditResult> {
  if (!normalize(input.courseId)) {
    return { success: false, message: "연결 과정을 선택해주세요.", field: "courseId" };
  }

  if (!normalize(input.title)) {
    return { success: false, message: "강의명을 입력해주세요.", field: "title" };
  }

  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", input.courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!course) {
    return {
      success: false,
      message: "선택한 과정을 찾을 수 없습니다.",
      field: "courseId",
    };
  }

  const updated = await updateLectureRecord(lectureId, {
    courseId: course.id,
    courseName: course.name,
    title: normalize(input.title),
    description: normalize(input.description),
    thumbnailFileName: emptyToNull(input.thumbnailFileName),
    isPublished: input.isPublished,
  });

  if (!updated) {
    return { success: false, message: "강의 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    message: `"${updated.title}" 강의가 수정되었습니다.`,
  };
}

export async function deleteLecture(lectureId: string): Promise<LectureDeleteResult> {
  const lecture = await findLectureById(lectureId);

  if (!lecture) {
    return { success: false, message: "삭제할 강의를 찾을 수 없습니다." };
  }

  await deleteLectureRecord(lectureId);

  return {
    success: true,
    message: `"${lecture.title}" 강의가 삭제되었습니다.`,
  };
}
