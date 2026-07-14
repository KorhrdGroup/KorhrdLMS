import {
  deleteAssignmentRecord,
  findAssignmentById,
  updateAssignmentRecord,
} from "@/features/assignment-management/repositories/assignment.repository";
import { validateAssignmentInput } from "@/features/assignment-management/services/assignment-registration.service";
import type {
  AssignmentDeleteResult,
  AssignmentEditInput,
  AssignmentEditResult,
  GetAssignmentForEditResult,
} from "@/features/assignment-management/types/assignment.types";
import { createClient } from "@/lib/supabase/server";

export async function getAssignmentForEdit(
  assignmentId: string,
): Promise<GetAssignmentForEditResult> {
  const assignment = findAssignmentById(assignmentId);

  if (!assignment) {
    return { success: false, message: "과제 정보를 찾을 수 없습니다." };
  }

  return {
    success: true,
    assignment: {
      id: assignment.id,
      courseId: assignment.courseId,
      courseName: assignment.courseName,
      title: assignment.title,
      description: assignment.description,
      submissionStart: assignment.submissionStart,
      submissionEnd: assignment.submissionEnd,
      allowAttachment: assignment.allowAttachment,
      maxUploadSizeMb: String(assignment.maxUploadSizeMb),
      isPublished: assignment.isPublished,
    },
  };
}

export async function updateAssignment(
  assignmentId: string,
  input: AssignmentEditInput,
): Promise<AssignmentEditResult> {
  const parsed = validateAssignmentInput(input);

  if ("message" in parsed) {
    return { success: false, message: parsed.message, field: parsed.field };
  }

  const supabase = await createClient();
  const { data: course, error } = await supabase
    .from("courses")
    .select("id, name")
    .eq("id", parsed.courseId)
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

  const updated = updateAssignmentRecord(assignmentId, {
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

  if (!updated) {
    return { success: false, message: "과제 정보를 찾을 수 없습니다." };
  }

  return { success: true, message: `"${updated.title}" 과제가 수정되었습니다.` };
}

export async function deleteAssignment(
  assignmentId: string,
): Promise<AssignmentDeleteResult> {
  const assignment = findAssignmentById(assignmentId);

  if (!assignment) {
    return { success: false, message: "삭제할 과제를 찾을 수 없습니다." };
  }

  deleteAssignmentRecord(assignmentId);

  return { success: true, message: `"${assignment.title}" 과제가 삭제되었습니다.` };
}
