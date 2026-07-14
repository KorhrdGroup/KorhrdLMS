import { createAssignmentRecord } from "@/features/assignment-management/repositories/assignment.repository";
import type {
  Assignment,
  AssignmentRegistrationInput,
  AssignmentRegistrationResult,
} from "@/features/assignment-management/types/assignment.types";
import { createClient } from "@/lib/supabase/server";

function normalize(value: string) {
  return value.trim();
}

export type ParsedAssignmentInput = {
  courseId: string;
  title: string;
  description: string;
  submissionStart: string;
  submissionEnd: string;
  allowAttachment: boolean;
  maxUploadSizeMb: number;
  isPublished: boolean;
};

export function validateAssignmentInput(
  input: AssignmentRegistrationInput,
): { field: keyof AssignmentRegistrationInput; message: string } | ParsedAssignmentInput {
  if (!normalize(input.courseId)) {
    return { field: "courseId", message: "연결 과정을 선택해주세요." };
  }

  if (!normalize(input.title)) {
    return { field: "title", message: "과제명을 입력해주세요." };
  }

  if (!normalize(input.description)) {
    return { field: "description", message: "과제 설명을 입력해주세요." };
  }

  if (!normalize(input.submissionStart) || !normalize(input.submissionEnd)) {
    return { field: "submissionStart", message: "제출기간(시작일/종료일)을 입력해주세요." };
  }

  if (input.submissionStart > input.submissionEnd) {
    return { field: "submissionEnd", message: "제출 종료일은 시작일보다 빠를 수 없습니다." };
  }

  let maxUploadSizeMb = 0;
  if (input.allowAttachment) {
    maxUploadSizeMb = Number(input.maxUploadSizeMb);
    if (!Number.isFinite(maxUploadSizeMb) || maxUploadSizeMb <= 0) {
      return {
        field: "maxUploadSizeMb",
        message: "최대 업로드 용량을 올바르게 입력해주세요.",
      };
    }
  }

  return {
    courseId: normalize(input.courseId),
    title: normalize(input.title),
    description: normalize(input.description),
    submissionStart: normalize(input.submissionStart),
    submissionEnd: normalize(input.submissionEnd),
    allowAttachment: input.allowAttachment,
    maxUploadSizeMb,
    isPublished: input.isPublished,
  };
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

export async function createAssignment(
  input: AssignmentRegistrationInput,
): Promise<AssignmentRegistrationResult> {
  const parsed = validateAssignmentInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const course = await findCourseOption(parsed.courseId);
  if (!course) {
    return {
      success: false,
      message: "선택한 과정을 찾을 수 없습니다.",
      field: "courseId",
    };
  }

  const assignment: Assignment = createAssignmentRecord({
    courseId: course.id,
    courseName: course.name,
    title: parsed.title,
    description: parsed.description,
    submissionStart: parsed.submissionStart,
    submissionEnd: parsed.submissionEnd,
    allowAttachment: parsed.allowAttachment,
    maxUploadSizeMb: parsed.maxUploadSizeMb,
    isPublished: parsed.isPublished,
  });

  return {
    success: true,
    assignmentId: assignment.id,
    message: `"${assignment.title}" 과제가 등록되었습니다.`,
  };
}
