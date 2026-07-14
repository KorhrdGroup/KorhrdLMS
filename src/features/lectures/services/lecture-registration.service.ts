import { createLectureRecord } from "@/features/lectures/repositories/lecture.repository";
import type {
  LectureRegistrationInput,
  LectureRegistrationResult,
} from "@/features/lectures/types/lecture.types";
import { createClient } from "@/lib/supabase/server";

function normalize(value: string) {
  return value.trim();
}

function emptyToNull(value: string) {
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

async function findCourseOption(courseId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", courseId)
    .is("deleted_at", null)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export function validateLectureRegistrationInput(
  input: LectureRegistrationInput,
): LectureRegistrationResult | null {
  if (!normalize(input.courseId)) {
    return { success: false, message: "연결 과정을 선택해주세요.", field: "courseId" };
  }

  if (!normalize(input.title)) {
    return { success: false, message: "강의명을 입력해주세요.", field: "title" };
  }

  return null;
}

export async function createLecture(
  input: LectureRegistrationInput,
): Promise<LectureRegistrationResult> {
  const validationError = validateLectureRegistrationInput(input);
  if (validationError) {
    return validationError;
  }

  const course = await findCourseOption(input.courseId);
  if (!course) {
    return {
      success: false,
      message: "선택한 과정을 찾을 수 없습니다.",
      field: "courseId",
    };
  }

  const lecture = await createLectureRecord({
    courseId: course.id,
    courseName: course.name,
    title: normalize(input.title),
    description: normalize(input.description),
    thumbnailFileName: emptyToNull(input.thumbnailFileName),
    isPublished: input.isPublished,
  });

  return {
    success: true,
    lectureId: lecture.id,
    message: `"${lecture.title}" 강의가 등록되었습니다.`,
  };
}
